import type { Expr } from "../parser/ast/expr";

export type ValueType = 'number' | 'string' | 'bool' | 'function' | 'null' | 'tuple';

export interface NumberValue {
    type: 'number';
    value: number;
}

export interface StringValue {
    type: 'string';
    value: string;
}

export interface BooleanValue {
    type: 'bool';
    value: boolean;
}

export interface NullValue {
    type: 'null';
    value: null;
}

export interface FunctionValue {
    type: 'function';
    name: string;
    params: string[];
    body: Expr; 
    // note: no closure enviroment needed as per design
}

export interface TupleValue {
    type: 'tuple';
    elements: RuntimeValue[];
}

export type RuntimeValue = NumberValue | StringValue | BooleanValue | NullValue | FunctionValue | TupleValue;

export function mkNumber(n: number = 0): NumberValue {
    return { type: 'number', value: n };
}

export function mkString(s: string = ""): StringValue {
    return { type: 'string', value: s };
}

export function mkBool(b: boolean = false): BooleanValue {
    return { type: 'bool', value: b };
}

export function mkNull(): NullValue {
    return { type: 'null', value: null };
}

export function mkTuple(elements: RuntimeValue[]): TupleValue {
    return { type: 'tuple', elements };
}
