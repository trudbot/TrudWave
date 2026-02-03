import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getStmtAST } from '../test-utils';
import type { FunctionDeclaration } from '../../src/parser/ast/stmt';
import type { MatchExpression } from '../../src/parser/ast/expr';

test('Parser: Match Expression with Comments', () => {
    const code = `<number, number> fib = match n {
        // Base case 1
        when n <= 0 -> 0;
        // Base case 2
        when n == 1 -> 1;
        // Recursive step
        otherwise -> fib(n - 1) + fib(n - 2);
    };`;
    const stmt = getStmtAST(code) as FunctionDeclaration;

    assert.equal(stmt.type, 'FunctionDeclaration');
    const body = stmt.body as MatchExpression;
    assert.equal(body.type, 'MatchExpression');
    assert.equal(body.cases.length, 3);
});
