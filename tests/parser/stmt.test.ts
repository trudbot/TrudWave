import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getStmtAST } from '../test-utils';
import type { Comment, VariableDeclaration } from '../../src/parser/ast/stmt';

test('Parser: Comment Statement', () => {
    const stmt = getStmtAST('// This is a comment') as Comment;
    assert.equal(stmt.type, 'Comment');
    assert.equal(stmt.value, '// This is a comment');
});

test('Parser: Variable Declaration', () => {
    const stmt = getStmtAST('number x = 42;') as VariableDeclaration;
    assert.equal(stmt.type, 'VariableDeclaration');
    assert.equal(stmt.name, 'x');
    assert.equal(stmt.varType, 'number');
});

test('Parser: Mixed Comment and Statement', () => {
    // Note: parseStatement only parses one statement.
    const stmt1 = getStmtAST('// Just a comment') as Comment;
    assert.equal(stmt1.type, 'Comment');
});
