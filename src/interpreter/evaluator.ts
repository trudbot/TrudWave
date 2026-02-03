import { Environment } from "./environment";
import { RuntimeError } from "./errors";
import { 
    mkBool, mkNull, mkNumber, mkString, mkTuple,
    type FunctionValue, type RuntimeValue 
} from "./values";
import type { Program, Statement } from "../parser/ast/stmt";
import type { 
    Expr, BinaryExpression, UnaryExpression, 
    MatchExpression, FunctionCall 
} from "../parser/ast/expr";

export function evaluateProgram(program: Program): RuntimeValue {
    const env = new Environment();
    let lastEvaluated: RuntimeValue = mkNull();
    
    for (const stmt of program.body) {
        lastEvaluated = evaluateStatement(stmt, env);
    }
    
    return lastEvaluated;
}

function evaluateStatement(stmt: Statement, env: Environment): RuntimeValue {
    switch (stmt.type) {
        case 'VariableDeclaration': {
            const value = evaluate(stmt.initializer, env);
            env.defineGlobal(stmt.name, value);
            return value;
        }
        case 'FunctionDeclaration': {
            const fnValue: FunctionValue = {
                type: 'function',
                name: stmt.name,
                params: stmt.params,
                body: stmt.body
            };
            env.defineGlobal(stmt.name, fnValue);
            return fnValue;
        }
        case 'ExpressionStatement':
            return evaluate(stmt.expression, env);
        case 'Comment':
            return mkNull();
        default:
            throw new RuntimeError(`Unknown statement type: ${(stmt as any).type}`);
    }
}

export function evaluate(expr: Expr, env: Environment): RuntimeValue {
    switch (expr.type) {
        case 'NumericLiteral':
            return mkNumber(expr.value);
        case 'StringLiteral':
            return mkString(expr.value);
        case 'BooleanLiteral':
            return mkBool(expr.value);
        case 'TupleLiteral': {
            const elements = expr.elements.map(e => evaluate(e, env));
            return mkTuple(elements);
        }
        case 'Identifier':
            return env.lookup(expr.name);
        case 'BinaryExpression':
            return evaluateBinaryExpr(expr, env);
        case 'UnaryExpression':
            return evaluateUnaryExpr(expr, env);
        case 'FunctionCall':
            return evaluateCallExpr(expr, env);
        case 'MatchExpression':
            // Match expressions typically need arguments to evaluate against?
            // Actually, in TrudWave:
            // "match n { ... }" constructs a Function-like structure if used in definition?
            // Wait, looking at AST:
            // MatchExpression has params and cases.
            // If it appears as an expression (e.g. right side of assignment), it creates a function?
            // Or is it evaluated immediately?
            // The grammar says: <type> name = match(n) { ... }
            // So 'match' constructs a function definition in TrudWave.
            // However, the parser produces MatchExpression which IS an Expr.
            // If we see a MatchExpression during evaluation (inline?), it should probably result in a FunctionValue?
            // Or is it only valid inside a FunctionDeclaration?
            // Let's assume it evaluates to a FunctionValue (anonymous / lambda-like, though TrudWave doesn't really have anonymous functions passed around, but effectively it is one).
            
            return {
                type: 'function',
                name: '<anonymous>',
                params: expr.params.map(p => p.name),
                body: expr // The MatchExpression IS the body roughly? 
                           // Wait, MatchExpression IS the function logic.
                           // Actually, MatchExpression inside AST has `cases`.
                           // If we treat MatchExpression as just a value, it is a function.
                           // But wait, `evaluateCallExpr` expects to execute something.
                           // If I call `fib(10)`, `fib` is a Global FunctionValue. 
                           // Its body is a MatchExpression.
                           // So `evaluateCallExpr` will receive the Body (MatchExpression) and must execute it.
            } as FunctionValue; 
            
            // Wait this logic is slightly circular.
            // If `FunctionDeclaration` body is `MatchExpression`, then when we call it, we must `evaluateMatch`?
            // YES.
            
        default:
            throw new RuntimeError(`Unknown expression type: ${(expr as any).type}`);
    }
}

// Special function to evaluate a Match structure given an environment with arguments bound
function evaluateMatch(matchExpr: MatchExpression, env: Environment): RuntimeValue {
    for (const kase of matchExpr.cases) {
        // Evaluate condition
        // If condition is undefined, it is 'otherwise' -> distinct match
        if (!kase.condition) {
            return evaluate(kase.body, env);
        }
        
        // condition is an Expression (e.g. n < 2)
        // It relies on 'n' being in 'env'
        const conditionResult = evaluate(kase.condition, env);
        
        if (conditionResult.type !== 'bool') {
            throw new RuntimeError(`Match condition must evaluate to bool, got ${conditionResult.type}`);
        }
        
        if (conditionResult.value) {
            return evaluate(kase.body, env);
        }
    }
    
    throw new RuntimeError("No match case matched.");
}

function evaluateBinaryExpr(expr: BinaryExpression, env: Environment): RuntimeValue {
    const lhs = evaluate(expr.left, env);
    const rhs = evaluate(expr.right, env);
    
    // Number operations
    if (lhs.type === 'number' && rhs.type === 'number') {
        switch (expr.operator) {
            case '+': return mkNumber(lhs.value + rhs.value);
            case '-': return mkNumber(lhs.value - rhs.value);
            case '*': return mkNumber(lhs.value * rhs.value);
            case '/': return mkNumber(lhs.value / rhs.value);
            case '%': return mkNumber(lhs.value % rhs.value); // If supported
            case '<': return mkBool(lhs.value < rhs.value);
            case '>': return mkBool(lhs.value > rhs.value);
            case '<=': return mkBool(lhs.value <= rhs.value);
            case '>=': return mkBool(lhs.value >= rhs.value);
            case '==': return mkBool(lhs.value === rhs.value);
            // != not in parser?
        }
    }
    
    // Boolean operations
    if (lhs.type === 'bool' && rhs.type === 'bool') {
        switch (expr.operator) {
            case '&&': return mkBool(lhs.value && rhs.value);
            case '||': return mkBool(lhs.value || rhs.value);
            case '==': return mkBool(lhs.value === rhs.value);
        }
    }

    // String operations
    if (lhs.type === 'string' && rhs.type === 'string') {
        switch (expr.operator) {
            case '+': return mkString(lhs.value + rhs.value);
            case '==': return mkBool(lhs.value === rhs.value);
        }
    }

    throw new RuntimeError(`Binary operator "${expr.operator}" not defined for types ${lhs.type} and ${rhs.type}`);
}

function evaluateUnaryExpr(expr: UnaryExpression, env: Environment): RuntimeValue {
    const operand = evaluate(expr.right, env);
    
    if (expr.operator === '!' && operand.type === 'bool') {
        return mkBool(!operand.value);
    }
    if (expr.operator === '-' && operand.type === 'number') {
        return mkNumber(-operand.value);
    }
    
    throw new RuntimeError(`Unary operator "${expr.operator}" not defined for type ${operand.type}`);
}

function evaluateCallExpr(expr: FunctionCall, env: Environment): RuntimeValue {
    // 1. Evaluate the callee
    const fn = evaluate(expr.callee, env);
    
    if (fn.type !== 'function') {
        throw new RuntimeError(`Cannot call non-function type ${fn.type}`);
    }
    
    // 2. Evaluate arguments
    const args = expr.args.map(arg => evaluate(arg, env));

    // 3. Match arguments to params
    if (args.length !== fn.params.length) {
        throw new RuntimeError(`Function "${fn.name}" expects ${fn.params.length} arguments, got ${args.length}`);
    }
    
    const locals = new Map<string, RuntimeValue>();
    for (let i = 0; i < fn.params.length; i++) {
        locals.set(fn.params[i], args[i]);
    }
    
    // 4. Create new environment
    const callEnv = env.extend(locals);
    
    // 5. Execute body
    let result: RuntimeValue;
    
    if (fn.body.type === 'MatchExpression') {
        result = evaluateMatch(fn.body, callEnv);
    } else {
        result = evaluate(fn.body, callEnv);
    }
    return result;
}
