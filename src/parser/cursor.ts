import type { TToken } from "../tokenizer/index";

export class TokenCursor {
    private iterator: Iterator<TToken>;
    private currentToken: TToken | undefined;
    
    constructor(tokenStream: Generator<TToken>) {
        this.iterator = tokenStream;
        this.advance();
    }

    private advance() {
        const { value, done } = this.iterator.next();
        this.currentToken = done ? undefined : value;
    }

    get peek() {
        return this.currentToken;
    }

    consume() {
        const token = this.currentToken;
        if (token) {
            this.advance();
        }
        return token!;
    }

    match(types: (TToken['type'])[]) {
        const token = this.peek;
        if (token && types.includes(token.type)) {
            return true;
        }
        return false;
    }

    expect(type: TToken['type'], message?: string) {
        if (!this.match([type])) {
            throw new Error(message || `Expected token type ${type}, but got ${this.peek?.type}`);
        }
        return this.consume();
    }
}
