import { RuntimeError } from "./errors";
import type { RuntimeValue } from "./values";

export class Environment {
    private globalScope: Map<string, RuntimeValue>;
    private localScope?: Map<string, RuntimeValue>;

    constructor(parentGlobal?: Map<string, RuntimeValue>) {
        this.globalScope = parentGlobal || new Map();
    }

    // Generate a new environment for function calls (sharing globals, new locals)
    // Note: In this simple model, we assume we just create a new Environment wrapping the SAME global map
    // but with new locals.
    public extend(locals: Map<string, RuntimeValue>): Environment {
        const env = new Environment(this.globalScope);
        env.localScope = locals;
        return env;
    }

    public defineGlobal(name: string, value: RuntimeValue) {
        if (this.globalScope.has(name)) {
            // Re-definition allowed? For now, yes, or throw error.
            // Strict functional usually means immutable declarations, but let's allow overwrite for top-level stmt execution flow
        }
        this.globalScope.set(name, value);
    }
    
    // Used for define local vars? TrudWave currently only has function params as locals in this design?
    // Oh wait, match expressions introduce bindings? "match n". 'n' is local.
    // So locals are params.
    
    public lookup(name: string): RuntimeValue {
        if (this.localScope && this.localScope.has(name)) {
            return this.localScope.get(name)!;
        }
        if (this.globalScope.has(name)) {
            return this.globalScope.get(name)!;
        }
        throw new RuntimeError(`Variable or function "${name}" not found.`);
    }
}
