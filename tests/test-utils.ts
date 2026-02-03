import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTokenStream } from '../src/tokenizer/index';
import { TokenCursor } from '../src/parser/cursor';
import { parseExpression } from '../src/parser/expr';
import { parseStatement } from '../src/parser/stmt';

export function getExprAST(code: string) {
    const stream = createTokenStream(code);
    const cursor = new TokenCursor(stream);
    return parseExpression(cursor);
}

export function getStmtAST(code: string) {
    const stream = createTokenStream(code);
    const cursor = new TokenCursor(stream);
    return parseStatement(cursor);
}

/**
 * Tokenizer 测试简写函数
 * @param desc 测试描述
 * @param code 源代码
 * @param expectedTokens 期望的 Token 列表 (type 和 value)
 */
export function testTokenizer(desc: string, code: string, expectedTokens: { type: string, value: string }[]) {
    test(`Tokenizer[${desc}]: "${code.length > 20 ? code.slice(0, 20) + '...' : code}"`, () => {
        const stream = createTokenStream(code);
        const actualTokens = Array.from(stream).map(t => ({
            type: t.type!,
            value: t.value
        }));

        try {
            assert.deepStrictEqual(actualTokens, expectedTokens);
        } catch (e) {
            console.log('\n❌ Tokenizer Test Failed for code:', code);
            console.log('Expected:');
            console.dir(expectedTokens, { depth: null, colors: true });
            console.log('Actual:');
            console.dir(actualTokens, { depth: null, colors: true });
            throw e;
        }
    });
}

