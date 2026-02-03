import moo from "moo";
import type { Token, Rules } from "moo";

const { compile } = moo;

export type TokenName = 'COMMENT' | 'STRING_LITERAL' | 'KEYWORD' | 'TYPE_NAME' | 'BOOLEAN_LITERAL' | 'NUMBER_LITERAL' | 'IDENTIFIER' | 'ARROW' | 'COMPARE_OP' | 'LOGIC_OP' | 'ARITH_OP' | 'ASSIGN' | 'LPAREN' | 'RPAREN' | 'LBRACKET' | 'RBRACKET' | 'LBRACE' | 'RBRACE' | 'COMMA' | 'SEMICOLON' | 'WHITESPACE';
export type Specs = {
    [key in TokenName]: Rules[string];
}
const tokenSpecs: Specs = {
  // 注释：单行注释，不匹配换行
  'COMMENT': /\/\/[^\n]*/,

  // 字符串字面量：支持转义字符，换行不允许
  'STRING_LITERAL': /"(?:[^"\\\n]|\\.)*"/,

  // 关键字
  'KEYWORD': /\b(?:match|when|otherwise)\b/,

  // 内置类型
  'TYPE_NAME': /\b(?:number|string|bool)\b/,

  // 布尔字面量
  'BOOLEAN_LITERAL': /\b(?:true|false)\b/,

  // 数字字面量
  'NUMBER_LITERAL': /\b\d+(?:\.\d+)?\b/,

  // 标识符
  'IDENTIFIER': /[A-Za-z_][A-Za-z0-9_]*/,

  // 箭头
  'ARROW': /->/,

  // 比较运算符
  'COMPARE_OP': /(?:<=|>=|==|<|>)/,

  // 逻辑运算符
  'LOGIC_OP': /(?:&&|\|\||!)/,

  // 算术运算符
  'ARITH_OP': /[+\-*/]/,

  // 赋值
  'ASSIGN': /=/,

  // 左括号
  'LPAREN': /\(/,

  // 右括号
  'RPAREN': /\)/,

  // 左方括号
  'LBRACKET': /\[/,

  // 右方括号
  'RBRACKET': /\]/,

  // 左大括号
  'LBRACE': /\{/,

  // 右大括号
  'RBRACE': /}/,

  // 逗号
  'COMMA': /,/,

  // 分号
  'SEMICOLON': /;/,

  // 空白符：只匹配空格、制表符、回车、换行
  'WHITESPACE': { match: /\s+/, lineBreaks: true}
};


export function createLexer(input: string) {
    const lexer = compile(tokenSpecs);
    lexer.reset(input);
    return lexer;
}

// 可直接忽略的 token 类型
const ignores = ['WHITESPACE'] as const;
const ignoreSet = new Set<TokenName>(ignores);
export type TToken = Token & { type?: Exclude<TokenName, typeof ignores[number]>};
/**
 * 忽略指定类型的 token，并且进行类型约束
 * @param input 代码
 */
export function* createTokenStream(
    input: string
): Generator<TToken> {
    const lexer = createLexer(input);
    let token: Token | undefined;

    while ((token = lexer.next())) {
        if (ignoreSet.has(token.type as TokenName)) continue;

        yield token as TToken;
    }
}

