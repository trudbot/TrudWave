import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTokenStream } from '../../src/tokenizer/index';
import { parse } from '../../src/parser/index';
import { interpret } from '../../src/interpreter/index';
import { mkNumber, mkBool } from '../../src/interpreter/values';

function run(code: string) {
    const stream = createTokenStream(code);
    const ast = parse(stream);
    return interpret(ast);
}

test('Interpreter: Custom Modulo Function', () => {
    const code = `
        <number, number, number> mod = match (n, d) {
            when n < d -> n;
            otherwise -> mod(n - d, d);
        };
        mod(10, 3);
    `;
    const result = run(code);
    assert.deepEqual(result, mkNumber(1));
});

test('Interpreter: GCD Algorithm', () => {
    const code = `
        <number, number, number> mod = match (n, d) {
            when n < d -> n;
            otherwise -> mod(n - d, d);
        };
        
        <number, number, number> gcd = match (a, b) {
            when b == 0 -> a;
            otherwise -> gcd(b, mod(a, b));
        };
        
        gcd(48, 18);
    `;
    const result = run(code);
    assert.deepEqual(result, mkNumber(6));
});

test('Interpreter: Ackermann Function', () => {
    // A(1, 2) -> 4
    // A(2, 1) -> 5
    // A(2, 2) is a bit deeper, = A(1, A(2, 1)) = A(1, 5) = 7
    // Keeping it small to avoid stack overflow in test environment if implementation is heavy
    
    const code = `
        <number, number, number> ack = match (m, n) {
            when m == 0 -> n + 1;
            when n == 0 -> ack(m - 1, 1);
            otherwise   -> ack(m - 1, ack(m, n - 1));
        };
        ack(2, 2);
    `;
    const result = run(code);
    assert.deepEqual(result, mkNumber(7));
});

test('Interpreter: Verify Logic Combination', () => {
    const code = `
        <number, number> abs = match n {
             when n < 0 -> 0 - n;
             otherwise -> n;
        };
        
        <bool, bool> verify = match dummy {
            when (abs(0 - 5) == 5) && (abs(10) == 10) -> true;
            otherwise -> false;
        };
        
        verify(true);
    `;
    const result = run(code);
    assert.deepEqual(result, mkBool(true));
});
