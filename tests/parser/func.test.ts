import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getStmtAST } from '../test-utils';
import type { FunctionDeclaration, VariableDeclaration } from '../../src/parser/ast/stmt';
import type { MatchExpression, BinaryExpression, FunctionCall } from '../../src/parser/ast/expr';

test('Parser: Function Declaration (Sugar style)', () => {
    const stmt = getStmtAST('<number, number, number> add(a, b) = a + b;') as FunctionDeclaration;
    assert.equal(stmt.type, 'FunctionDeclaration');
    assert.equal(stmt.name, 'add');
    assert.deepEqual(stmt.params, ['a', 'b']);
    assert.deepEqual(stmt.paramTypes, ['number', 'number']);
    assert.equal(stmt.returnType, 'number');

    const body = stmt.body as MatchExpression;
    
    // Check if body is converted to MatchExpression
    assert.equal(body.type, 'MatchExpression');
    
    // Check params in MatchExpression
    assert.equal(body.params.length, 2);
    assert.equal(body.params[0].name, 'a');
    assert.equal(body.params[1].name, 'b');
    
    // Check cases
    assert.equal(body.cases.length, 1);
    // condition should be undefined (otherwise)
    assert.equal(body.cases[0].condition, undefined);
    
    // Check actual body expression
    const caseBody = body.cases[0].body as BinaryExpression;
    assert.equal(caseBody.type, 'BinaryExpression');
    assert.equal(caseBody.operator, '+');
});

test('Parser: Function Declaration (Match style)', () => {
    const code = `<number, number> fib = match n {
        when n <= 0 -> 0;
        otherwise -> fib(n - 1) + fib(n - 2);
    };`;
    const stmt = getStmtAST(code) as FunctionDeclaration;

    assert.equal(stmt.type, 'FunctionDeclaration');
    assert.equal(stmt.name, 'fib');
    assert.deepEqual(stmt.params, ['n']); // Extracted from match n
    assert.equal(stmt.returnType, 'number');
    
    const body = stmt.body as MatchExpression;
    assert.equal(body.type, 'MatchExpression');
    assert.equal(body.cases.length, 2);
});

test('Parser: Function Declaration (Match style multiple params)', () => {
    const code = `<number, number, number> sum = match(a, b) {
        when _ -> a + b;
    };`;
    const stmt = getStmtAST(code) as FunctionDeclaration;

    assert.equal(stmt.type, 'FunctionDeclaration');
    assert.deepEqual(stmt.params, ['a', 'b']);
    
    const body = stmt.body as MatchExpression;
    assert.equal(body.type, 'MatchExpression');
});

test('Parser: Function Call', () => {
    const varStmt = getStmtAST('number res = fib(10);') as VariableDeclaration;
    
    assert.equal(varStmt.type, 'VariableDeclaration');
    const init = varStmt.initializer as FunctionCall;
    assert.equal(init.type, 'FunctionCall'); 
    
    // init.callee is Expr, likely Identifier
    // We need to cast it or check it if we want to access .name
    const callee = init.callee as any; // Or specific Identifier type
    assert.equal(callee.name, 'fib');
    
    // args[0] is Expr, likely NumericLiteral
    const arg0 = init.args[0] as any;
    assert.equal(arg0.value, 10);
});
