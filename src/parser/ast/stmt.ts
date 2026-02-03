import type { Node } from "./base";
import type { Expr } from "./expr";

// 程序根节点
export type Program = Node<"Program", {
    body: Statement[];
}>;

// 这是一个联合类型，未来会有 IfStatement, WhileStatement 等
export type Statement = VariableDeclaration | FunctionDeclaration | ExpressionStatement | Comment;

/**
 * 注释语句
 */
export type Comment = Node<"Comment", {
    value: string;
}>;

/**
 * 函数定义语句
 * <number, number> fib = match n { ... }
 */
export type FunctionDeclaration = Node<"FunctionDeclaration", {
    name: string;
    paramTypes: string[];
    returnType: string;
    params: string[]; // Parameter names
    body: Expr;
}>;

// 类型定义
export type TypeNode = PrimitiveType | TupleType;

export interface PrimitiveType {
    kind: 'Primitive';
    name: string;
}

export interface TupleType {
    kind: 'Tuple';
    elements: TypeNode[];
}

/**
 * 变量声明语句
 * 例如: number a = 1;
 */
export type VariableDeclaration = Node<"VariableDeclaration", {
    varType: TypeNode;
    name: string;
    initializer: Expr;
}>;


/**
 * 表达式语句
 * 例如: a = 1; 或 foo();
 */
export type ExpressionStatement = Node<"ExpressionStatement", {
    expression: Expr;
}>;
