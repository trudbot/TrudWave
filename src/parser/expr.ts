import { TokenCursor } from "./cursor";
import { createBinaryExpression, createUnaryExpression } from "./ast/expr";
import type {Expr, MatchExpression, MatchCase, Identifier} from './ast/expr';

/**
 * Expression parser entry point
 */
export function parseExpression(cursor: TokenCursor): Expr {
    return parseLogicalOr(cursor);
}

/**
 * Precedence: 0 
 * Logic OR: ||
 */
function parseLogicalOr(cursor: TokenCursor): Expr {
    let expr = parseLogicalAnd(cursor);
    while (cursor.match(['LOGIC_OP']) && cursor.peek?.value === '||') {
        const operator = cursor.consume();
        const right = parseLogicalAnd(cursor);
        expr = createBinaryExpression(expr, operator.value!, right);
    }
    return expr;
}

/**
 * Precedence: 1
 * Logic AND: && 
 */
function parseLogicalAnd(cursor: TokenCursor): Expr {
    let expr = parseEquality(cursor);
    while (cursor.match(['LOGIC_OP']) && cursor.peek?.value === '&&') {
        const operator = cursor.consume();
        const right = parseEquality(cursor);
        expr = createBinaryExpression(expr, operator.value!, right);
    }
    return expr;
}

/**
 * Precedence: 2
 * Equality: == 
 */
function parseEquality(cursor: TokenCursor): Expr {
    let expr = parseComparison(cursor);
    while (cursor.match(['COMPARE_OP']) && cursor.peek?.value === '==') {
        const operator = cursor.consume();
        const right = parseComparison(cursor);
        expr = createBinaryExpression(expr, operator.value, right);
    }
    return expr;
}

/**
 * Precedence: 2
 * Comparison: < > <= >=
 */
function parseComparison(cursor: TokenCursor): Expr {
    let expr = parseTerm(cursor);
    while (cursor.match(['COMPARE_OP'])) {
        const operator = cursor.consume();
        const right = parseTerm(cursor);
        expr = createBinaryExpression(expr, operator.value!, right);
    }
    return expr;
}

/**
 * Precedence: 3
 * Term: + -
 */
function parseTerm(cursor: TokenCursor): Expr {
    let expr = parseFactor(cursor);
    while (cursor.match(['ARITH_OP']) && ['+', '-'].includes(cursor.peek?.value || '')) {
        const operator = cursor.consume();
        const right = parseFactor(cursor);
        expr = createBinaryExpression(expr, operator.value, right);
    }
    return expr;
}

/**
 * Precedence: 4
 * Factor: * /
 */
function parseFactor(cursor: TokenCursor): Expr {
    let expr = parseUnary(cursor);
    while (cursor.match(['ARITH_OP']) && ['*', '/'].includes(cursor.peek?.value!)) {
        const operator = cursor.consume();
        const right = parseUnary(cursor);
        expr = createBinaryExpression(expr, operator.value!, right);
    }
    return expr;
}

/**
 * Precedence: 5
 * Unary: ! -
 */
function parseUnary(cursor: TokenCursor): Expr {
    if (cursor.match(['LOGIC_OP']) && cursor.peek?.value === '!') {
        const operator = cursor.consume();
        const right = parseUnary(cursor); // Recursive for !!x
        return createUnaryExpression(operator.value!, right);
    }
    if (cursor.match(['ARITH_OP']) && cursor.peek?.value === '-') {
        const operator = cursor.consume();
        const right = parseUnary(cursor);
        return createUnaryExpression(operator.value!, right);
    }
    return parseCall(cursor);
}

/**
 * Precedence: 6
 * Call: expr(args)
 */
function parseCall(cursor: TokenCursor): Expr {
    let expr = parsePrimary(cursor);
    while (cursor.match(['LPAREN'])) {
        cursor.consume();
        const args: Expr[] = [];
        if (!cursor.match(['RPAREN'])) {
            do {
                args.push(parseExpression(cursor));
            } while (cursor.match(['COMMA']) && cursor.consume());
        }
        cursor.expect('RPAREN', "Expected )");
        expr = {
            type: 'FunctionCall',
            callee: expr,
            args
        };
    }
    return expr;
}

/**
 * Precedence: 7
 * Primary: (expr), number, identifier...
 */
function parsePrimary(cursor: TokenCursor): Expr {
    if (cursor.match(['KEYWORD']) && cursor.peek?.value === 'match') {
        return parseMatch(cursor);
    }

    if (cursor.match(['NUMBER_LITERAL'])) {
        const token = cursor.consume();
        return {
            type: 'NumericLiteral',
            value: Number(token.value),
            raw: token.value!
        };
    }

    if (cursor.match(['STRING_LITERAL'])) {
        const token = cursor.consume();
        // remove quotes
        const raw = token.value!;
        const value = raw.slice(1, -1); 
        return {
            type: 'StringLiteral',
            value: value,
            raw: raw
        };
    }

    if (cursor.match(['BOOLEAN_LITERAL'])) {
        const token = cursor.consume();
        return {
            type: 'BooleanLiteral',
            value: token.value === 'true',
            raw: token.value!
        };
    }
    
    if (cursor.match(['LPAREN'])) {
        cursor.consume();
        const expr = parseExpression(cursor);
        if (!cursor.match(['RPAREN'])) {
            throw new Error("Expected )");
        }
        cursor.consume();
        return expr;
    }
    
    // Fallback or Identifier
    if (cursor.match(['IDENTIFIER'])) {
        const token = cursor.consume();
        return {
            type: 'Identifier',
            name: token.value!
        };
    }

    throw new Error(`Unexpected token: ${cursor.peek?.type} ${cursor.peek?.value}`);
}

function parseMatch(cursor: TokenCursor): MatchExpression {
    cursor.consume(); // match
    
    const params: Identifier[] = [];
    if (cursor.match(['LPAREN'])) {
        cursor.consume();
        if (!cursor.match(['RPAREN'])) {
            do {
                const id = cursor.expect('IDENTIFIER', "Expected param name");
                params.push({ type: 'Identifier', name: id.value! });
            } while (cursor.match(['COMMA']) && cursor.consume());
        }
        cursor.expect('RPAREN', "Expected )");
    } else {
        // match n
        const id = cursor.expect('IDENTIFIER', "Expected param name");
        params.push({ type: 'Identifier', name: id.value! });
    }
    
    cursor.expect('LBRACE', "Expected {");
    
    const cases: MatchCase[] = [];
    // when ... -> ...
    while (!cursor.match(['RBRACE'])) {
        // Skip comments inside match block
        if (cursor.match(['COMMENT'])) {
            cursor.consume(); // Just consume and ignore comments in match block for now
            continue;
        }

        let condition: Expr | undefined;
        if (cursor.match(['KEYWORD']) && cursor.peek?.value === 'when') {
            cursor.consume();
            // when _ or when expr
            // @ts-ignore: TS doesn't know consume() updates peek
            if (cursor.match(['IDENTIFIER']) && cursor.peek?.value === '_') {
                cursor.consume();
                condition = undefined; 
            } else {
                condition = parseExpression(cursor);
            }
        } else if (cursor.match(['KEYWORD']) && cursor.peek?.value === 'otherwise') {
            cursor.consume();
            condition = undefined; // otherwise
        } else {
            // Check if } exists, loop condition handles it but peek might be useful
            if (cursor.match(['RBRACE'])) break; 
            throw new Error(`Expected 'when' or 'otherwise', got ${cursor.peek?.type} ${cursor.peek?.value}`);
        }
        
        cursor.expect('ARROW', "Expected ->");
        const body = parseExpression(cursor);
        cursor.expect('SEMICOLON', "Expected ;");
        
        cases.push({ condition, body });
    }
    
    cursor.consume(); // }
    
    return {
        type: 'MatchExpression',
        params,
        cases
    };
}

