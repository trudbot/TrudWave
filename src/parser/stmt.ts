import { TokenCursor } from "./cursor";
import type { Statement, VariableDeclaration, FunctionDeclaration, ExpressionStatement, Comment } from "./ast/stmt";
import { parseExpression } from "./expr";

export function parseStatement(cursor: TokenCursor): Statement {
    // Comment
    if (cursor.match(['COMMENT'])) {
        return parseComment(cursor);
    }
    
    // Function Declaration
    if (cursor.match(['COMPARE_OP']) && cursor.peek?.value === '<') {
        return parseFunctionDeclaration(cursor);
    }

    // Variable Declaration
    if (cursor.match(['TYPE_NAME'])) {
        return parseVariableDeclaration(cursor);
    }
    
    // Default: Expression Statement
    return parseExpressionStatement(cursor);
}

function parseFunctionDeclaration(cursor: TokenCursor): FunctionDeclaration {
    cursor.consume(); // <
    
    const types: string[] = [];
    do {
        if (cursor.match(['TYPE_NAME', 'IDENTIFIER'])) {
            types.push(cursor.consume().value!);
        } else {
            throw new Error("Expected type name");
        }
    } while (cursor.match(['COMMA']) && cursor.consume());
    
    const gtToken = cursor.expect('COMPARE_OP', "Expected >");
    if (gtToken.value !== '>') {
         throw new Error("Expected >");
    }
    
    const returnType = types.pop();
    const paramTypes = types;
    
    if (!returnType) {
        throw new Error("Function definition must specify return type");
    }
    
    const nameToken = cursor.expect('IDENTIFIER', "Expected function name");
    
    let params: string[] = [];
    let body: any; 
    
    if (cursor.match(['LPAREN'])) {
        // Sugar: func(a, b) = expr
        cursor.consume();
        if (!cursor.match(['RPAREN'])) {
            do {
                const p = cursor.expect('IDENTIFIER', "Expected param name");
                params.push(p.value!);
            } while (cursor.match(['COMMA']) && cursor.consume());
        }
        cursor.expect('RPAREN', "Expected )");
        
        cursor.expect('ASSIGN', "Expected =");
        const expr = parseExpression(cursor);
        cursor.expect('SEMICOLON', "Expected ;");

        // Convert to MatchExpression
        body = {
            type: 'MatchExpression',
            params: params.map(p => ({ type: 'Identifier', name: p })),
            cases: [{
                condition: undefined, // otherwise
                body: expr
            }]
        };
        
    } else {
        // Match style: func = match...
        cursor.expect('ASSIGN', "Expected =");
        body = parseExpression(cursor);
        cursor.expect('SEMICOLON', "Expected ;");
        
        if (body.type === 'MatchExpression') {
             params = body.params.map((p: any) => p.name);
        }
    }
    
    return {
        type: 'FunctionDeclaration',
        name: nameToken.value!,
        paramTypes,
        returnType,
        params,
        body
    };
}

function parseComment(cursor: TokenCursor): Comment {
    const token = cursor.consume();
    return {
        type: "Comment",
        value: token.value!
    };
}

function parseVariableDeclaration(cursor: TokenCursor): VariableDeclaration {
    const typeToken = cursor.consume(); // number
    
    const nameToken = cursor.expect('IDENTIFIER', "Expected variable name");
    
    cursor.expect('ASSIGN', "Expected = after variable name");
    
    const initializer = parseExpression(cursor);
    
    cursor.expect('SEMICOLON', "Expected ; after variable declaration");
    
    return {
        type: "VariableDeclaration",
        varType: typeToken.value!,
        name: nameToken.value!,
        initializer
    };
}

function parseExpressionStatement(cursor: TokenCursor): ExpressionStatement {
    const expr = parseExpression(cursor);
    
    cursor.expect('SEMICOLON', "Expected ; after expression");
    
    return {
        type: "ExpressionStatement",
        expression: expr
    };
}
