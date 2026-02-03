import './style.css'
// 相对路径引用，Vite 会自动解析
import { createTokenStream } from '../../src/tokenizer/index';
import { parse } from '../../src/parser/index';
import defaultCode from './primes.tw?raw';

// DOM Elements
const inputCode = document.getElementById('input-code') as HTMLTextAreaElement;
const outputDisplay = document.getElementById('output-display') as HTMLDivElement;
const btnAst = document.getElementById('btn-ast') as HTMLButtonElement;
const btnTokens = document.getElementById('btn-tokens') as HTMLButtonElement;
const outputTitle = document.getElementById('output-title') as HTMLSpanElement;

let currentMode: 'AST' | 'TOKENS' = 'AST';

// Set default code
inputCode.value = defaultCode;

// --- AST Custom Renderer Logic ---

function createASTNode(data: any, keyName?: string): HTMLElement {
    const container = document.createElement('div');

    // 1. Primitive Values
    if (data === null) {
        return createPrimitive('null', 'null');
    }
    if (typeof data !== 'object') {
        const type = typeof data;
        let displayStr = String(data);
        if (type === 'string') displayStr = `"${displayStr}"`;
        return createPrimitive(displayStr, type);
    }

    // 2. Arrays
    if (Array.isArray(data)) {
        container.className = 'ast-array';
        if (data.length === 0) {
            container.innerHTML = '<span style="color:#999">[]</span>';
            return container;
        }
        data.forEach((item, index) => {
            const row = document.createElement('div');
            row.className = 'ast-field';
            // Array items usually don't need keys unless debugging, but let's just show index if needed
            // For cleaner AST, we might just append Children directly.
            // But to keep structure, let's wrap.
            row.appendChild(createASTNode(item)); 
            container.appendChild(row);
        });
        return container;
    }

    // 3. Objects (AST Nodes)
    const nodeType = data?.type || data?.kind;
    const isASTNode = data && typeof nodeType === 'string';
    
    // Check if it's a simple leaf node that can be rendered inline
    const isSimpleLeaf = ['NumericLiteral', 'StringLiteral', 'BooleanLiteral', 'Identifier'].includes(nodeType);
    
    // 如果是 AST Node，使用 Card 样式
    if (isASTNode) {
        // Simple leaf nodes: compact inline display
        if (isSimpleLeaf) {
            container.className = `ast-node-inline type-${nodeType}`;
            let displayValue = '';
            if (data.value !== undefined) {
                displayValue = typeof data.value === 'string' ? `"${data.value}"` : String(data.value);
            } else if (data.name !== undefined) {
                displayValue = data.name;
            }
            container.innerHTML = `<span class="inline-type">${nodeType}</span><span class="inline-value">${displayValue}</span>`;
            return container;
        }
        
        // Complex nodes: full card display
        container.className = `ast-node type-${nodeType}`;
        
        // Header
        const header = document.createElement('div');
        header.className = 'ast-header';
        
        let preview = '';
        if (typeof data.name === 'string') preview += ` <span class="ast-preview-name">${data.name}</span>`;
        if (data.value !== undefined && typeof data.value !== 'object') preview += ` <span class="ast-preview-value">${data.value}</span>`;
        if (typeof data.operator === 'string') preview += ` <span class="ast-preview-op">${data.operator}</span>`;

        header.innerHTML = `<span class="ast-type-label">${nodeType}</span>${preview}`;
        
        // Body (Hidden by default or not?)
        const body = document.createElement('div');
        body.className = 'ast-body';

        // Toggle Logic
        header.addEventListener('click', (e) => {
            e.stopPropagation();
            container.classList.toggle('expanded');
        });

        // Populate Body
        Object.keys(data).forEach(key => {
            if (key === 'type' || key === 'kind') return; // Skip type/kind repeated in body
            if (data[key] === undefined) return;


            const field = document.createElement('div');
            field.className = 'ast-field';

            const keyEl = document.createElement('span');
            keyEl.className = 'ast-key';
            keyEl.textContent = key + ':';
            
            const valEl = createASTNode(data[key], key);

            field.appendChild(keyEl);
            field.appendChild(valEl);
            body.appendChild(field);
        });

        container.appendChild(header);
        container.appendChild(body);
        
        // Default expand for all nodes except Comment
        if (nodeType !== 'Comment') {
            container.classList.add('expanded');
        }
        
        return container;
    } 
    
    // 4. Plain Objects (not AST nodes, e.g. location info)
    // Render similar to AST node but simpler style
    container.className = 'ast-object';
    const braceOpen = document.createElement('div');
    braceOpen.textContent = '{';
    container.appendChild(braceOpen);
    
    const body = document.createElement('div');
    body.style.paddingLeft = '10px';
    Object.keys(data).forEach(key => {
        const field = document.createElement('div');
        field.className = 'ast-field';
        field.innerHTML = `<span class="ast-key">${key}:</span>`;
        field.appendChild(createASTNode(data[key]));
        body.appendChild(field);
    });
    container.appendChild(body);
    container.appendChild(document.createTextNode('}'));

    return container;
}

function createPrimitive(text: string, type: string): HTMLElement {
    const el = document.createElement('span');
    el.className = `ast-val-primitive val-${type}`;
    el.textContent = text;
    return el;
}


// --- Main Logic ---

let lastSelection: { start: number, end: number } | null = null;

function highlightRange(start: number, count: number) {
    if (!lastSelection && document.activeElement === inputCode) {
        lastSelection = {
            start: inputCode.selectionStart,
            end: inputCode.selectionEnd
        };
    }
    inputCode.focus();
    inputCode.setSelectionRange(start, start + count);
}

function restoreSelection() {
    if (lastSelection) {
        inputCode.setSelectionRange(lastSelection.start, lastSelection.end);
        lastSelection = null;
    } else {
        inputCode.setSelectionRange(0, 0); 
        inputCode.blur();
    }
}

function escapeHtml(unsafe: string) {
    if (!unsafe) return '';
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 }

function render() {
    const code = inputCode.value;
    outputDisplay.innerHTML = ''; // Clear

    try {
        if (currentMode === 'TOKENS') {
             // Token Mode
            const stream = createTokenStream(code);
            const tokens = Array.from(stream).map(t => ({ 
                type: t.type,
                value: t.value,
                offset: t.offset,
                length: t.value.length
            }));
            
            outputDisplay.classList.remove('ast-tree'); 
            
            tokens.forEach(t => {
                const el = document.createElement('div');
                el.className = 'token-item';
                el.innerHTML = `<span class="token-type">${t.type}</span><span class="token-val">${escapeHtml(t.value)}</span>`;
                el.addEventListener('mouseenter', () => highlightRange(t.offset, t.length));
                el.addEventListener('mouseleave', () => restoreSelection());
                outputDisplay.appendChild(el);
            });
            
        } else {
            // AST Mode
            outputDisplay.classList.add('ast-tree');
            
            const stream = createTokenStream(code);
            const ast = parse(stream);
            
            // 使用自定义 Renderer
            const astView = createASTNode(ast);
            outputDisplay.appendChild(astView);
        }
    } catch (err: any) {
        outputDisplay.innerHTML = `<span style="color: var(--color-red); font-weight: bold;">ERROR: ${err.message}</span>`;
        if (err.location) { 
             outputDisplay.innerHTML += `<br><span style="color: var(--color-ink); font-size: 0.8em;">At line ${err.location.start.line}, col ${err.location.start.column}</span>`;
        }
        console.error(err);
    }
}

// Event Listeners
inputCode.addEventListener('input', render);

btnAst.addEventListener('click', () => {
    currentMode = 'AST';
    btnAst.classList.add('active');
    btnTokens.classList.remove('active');
    outputTitle.textContent = 'OUTPUT // AST';
    render();
});

btnTokens.addEventListener('click', () => {
    currentMode = 'TOKENS';
    btnTokens.classList.add('active');
    btnAst.classList.remove('active');
    outputTitle.textContent = 'OUTPUT // TOKENS';
    render();
});

// Initial render
render();
