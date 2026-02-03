import type { Node } from "./base";

export type Expr = 
    | BinaryExpression 
    | UnaryExpression
    | Identifier
    | NumericLiteral
    | StringLiteral
    | BooleanLiteral
    | TupleLiteral
    | MatchExpression
    | FunctionCall; // Need FunctionCall for fib(n-1)

export type TupleLiteral = Node<"TupleLiteral", {
    elements: Expr[];
}>;

export type BinaryExpression = Node<"BinaryExpression", {
    left: Expr;
    operator: string;
    right: Expr;
}>; 

export type UnaryExpression = Node<"UnaryExpression", {
    operator: string;
    right: Expr;
}>;

export type Identifier = Node<"Identifier", {
    name: string;
}>;

export type NumericLiteral = Node<"NumericLiteral", {
    value: number;
    raw: string;
}>;

export type StringLiteral = Node<"StringLiteral", {
    value: string;
    raw: string;
}>;

export type BooleanLiteral = Node<"BooleanLiteral", {
    value: boolean;
    raw: string;
}>;

export type MatchExpression = Node<"MatchExpression", {
    params: Identifier[];
    cases: MatchCase[];
}>;

export type MatchCase = {
    condition: Expr | undefined; // undefined for otherwise
    body: Expr;
};

export type FunctionCall = Node<"FunctionCall", {
    callee: Expr;
    args: Expr[];
}>;

export function createBinaryExpression(
    left: Expr,
    operator: string,
    right: Expr
): Expr {
    return {
        type: "BinaryExpression",
        left,
        operator,
        right
    };
}

export function createUnaryExpression(
    operator: string,
    right: Expr
): Expr {
    return {
        type: "UnaryExpression",
        operator,
        right
    };
}