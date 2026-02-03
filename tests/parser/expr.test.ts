import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getExprAST } from '../test-utils';
import type { BinaryExpression } from '../../src/parser/ast/expr';

test('Parser: Logical AND', () => {
    const ast = getExprAST('true && false') as BinaryExpression;
    assert.equal(ast.type, 'BinaryExpression');
    assert.equal(ast.operator, '&&');
});

test('Parser: Logical OR', () => {
    const ast = getExprAST('true || false') as BinaryExpression;
    assert.equal(ast.type, 'BinaryExpression');
    assert.equal(ast.operator, '||');
});

test('Parser: Precedence && over ||', () => {
    const ast = getExprAST('true || false && true') as BinaryExpression;
    
    // Should be true || (false && true)
    assert.equal(ast.type, 'BinaryExpression');
    assert.equal(ast.operator, '||');
    
    const right = ast.right as BinaryExpression;
    assert.equal(right.type, 'BinaryExpression');
    assert.equal(right.operator, '&&');
});
