import { evaluateProgram } from "./evaluator";
import type { Program } from "../parser/ast/stmt";
import type { RuntimeValue } from "./values";

export function interpret(program: Program): RuntimeValue {
    return evaluateProgram(program);
}

export * from "./values";
export * from "./errors";
export * from "./environment";
