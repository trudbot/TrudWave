import type { TToken } from "../tokenizer/index";
import { TokenCursor } from "./cursor";
import type { Program } from "./ast/stmt";
import { parseStatement } from "./stmt";

export function parse(tokenStream: Generator<TToken>): Program {
    const cursor = new TokenCursor(tokenStream);
    const body = [];
    
    while (cursor.peek) {
        
        body.push(parseStatement(cursor));
    }
    
    return {
        type: "Program",
        body
    };
}

export { TokenCursor };
