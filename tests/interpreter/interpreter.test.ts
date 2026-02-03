import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTokenStream } from '../../src/tokenizer/index';
import { parse } from '../../src/parser/index';
import { interpret } from '../../src/interpreter/index';
import { mkNumber, mkBool, mkString } from '../../src/interpreter/values';

function run(code: string) {
    const stream = createTokenStream(code);
    const ast = parse(stream);
    return interpret(ast);
}

test('Interpreter: Basic Arithmetic', () => {
    const result = run('number x = 1 + 2 * 3;');
    assert.deepEqual(result, mkNumber(7));
});

test('Interpreter: Boolean Logic', () => {
    const result = run('bool b = true && false || true;');
    assert.deepEqual(result, mkBool(true));
});

test('Interpreter: Function Definition & Call (Simple)', () => {
    const code = `
        <number, number> double(x) = x * 2;
        number res = double(21);
    `;
    const result = run(code);
    assert.deepEqual(result, mkNumber(42));
});

test('Interpreter: Match Expression (Factorial)', () => {
    const code = `
        <number, number> fact = match(n) {
            when n <= 1 -> 1;
            otherwise -> n * fact(n - 1);
        };
        number res = fact(5);
    `;
    const result = run(code);
    assert.deepEqual(result, mkNumber(120));
});

test('Interpreter: Recursion (Fibonacci)', () => {
    const code = `
        <number, number> fib = match(n) {
            when n <= 0 -> 0;
            when n == 1 -> 1;
            otherwise -> fib(n - 1) + fib(n - 2);
        };
        number res = fib(10);
    `;
    const result = run(code);
    assert.deepEqual(result, mkNumber(55));
});

test('Interpreter: Multiple Parameters', () => {
    const code = `
        <number, number, number> add(a, b) = a + b;
        number res = add(10, 20);
    `;
    const result = run(code);
    assert.deepEqual(result, mkNumber(30));
});
