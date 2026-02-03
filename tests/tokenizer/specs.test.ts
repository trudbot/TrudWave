import { testTokenizer } from '../test-utils';

// 1. 基础字面量测试
testTokenizer('数字测试', '123 45.67', [
    { type: 'NUMBER_LITERAL', value: '123' },
    { type: 'NUMBER_LITERAL', value: '45.67' }
]);

testTokenizer('字符串测试', '"hello" "world"', [
    { type: 'STRING_LITERAL', value: '"hello"' },
    { type: 'STRING_LITERAL', value: '"world"' }
]);

testTokenizer('字符串转义测试', '"say \\"hi\\""', [
    { type: 'STRING_LITERAL', value: '"say \\"hi\\""' }
]);

testTokenizer('布尔值测试', 'true false', [
    { type: 'BOOLEAN_LITERAL', value: 'true' },
    { type: 'BOOLEAN_LITERAL', value: 'false' }
]);

// 2. 关键字与类型
testTokenizer('类型关键字', 'number string bool', [
    { type: 'TYPE_NAME', value: 'number' },
    { type: 'TYPE_NAME', value: 'string' },
    { type: 'TYPE_NAME', value: 'bool' }
]);

testTokenizer('流程关键字', 'match when otherwise', [
    { type: 'KEYWORD', value: 'match' },
    { type: 'KEYWORD', value: 'when' },
    { type: 'KEYWORD', value: 'otherwise' }
]);

// 3. 标识符
testTokenizer('标识符', 'abc _name var123', [
    { type: 'IDENTIFIER', value: 'abc' },
    { type: 'IDENTIFIER', value: '_name' },
    { type: 'IDENTIFIER', value: 'var123' }
]);

testTokenizer('关键字作为标识符前缀（应识别为标识符）', 'matcha number1', [
    { type: 'IDENTIFIER', value: 'matcha' },
    { type: 'IDENTIFIER', value: 'number1' }
]);

// 4. 运算符与符号
testTokenizer('算术运算符', '+ - * /', [
    { type: 'ARITH_OP', value: '+' },
    { type: 'ARITH_OP', value: '-' },
    { type: 'ARITH_OP', value: '*' },
    { type: 'ARITH_OP', value: '/' }
]);

testTokenizer('比较运算符', '< > <= >= ==', [
    { type: 'COMPARE_OP', value: '<' },
    { type: 'COMPARE_OP', value: '>' },
    { type: 'COMPARE_OP', value: '<=' },
    { type: 'COMPARE_OP', value: '>=' },
    { type: 'COMPARE_OP', value: '==' }
]);

testTokenizer('逻辑运算符', '&& || !', [
    { type: 'LOGIC_OP', value: '&&' },
    { type: 'LOGIC_OP', value: '||' },
    { type: 'LOGIC_OP', value: '!' }
]);

testTokenizer('赋值与箭头', '= ->', [
    { type: 'ASSIGN', value: '=' },
    { type: 'ARROW', value: '->' }
]);

testTokenizer('分隔符', '( ) { } , ;', [
    { type: 'LPAREN', value: '(' },
    { type: 'RPAREN', value: ')' },
    { type: 'LBRACE', value: '{' },
    { type: 'RBRACE', value: '}' },
    { type: 'COMMA', value: ',' },
    { type: 'SEMICOLON', value: ';' }
]);

// 5. 注释与空白
testTokenizer('忽略空白', '    \n  \t  ', []);

testTokenizer('保留注释', '// this is a comment', [
    { type: 'COMMENT', value: '// this is a comment' }
]);

testTokenizer('注释与代码混合', '1 // comment \n 2', [
    { type: 'NUMBER_LITERAL', value: '1' },
    { type: 'COMMENT', value: '// comment ' },
    { type: 'NUMBER_LITERAL', value: '2' }
]);

// 6. 综合测试
testTokenizer('变量声明', 'number a = 1.5;', [
    { type: 'TYPE_NAME', value: 'number' },
    { type: 'IDENTIFIER', value: 'a' },
    { type: 'ASSIGN', value: '=' },
    { type: 'NUMBER_LITERAL', value: '1.5' },
    { type: 'SEMICOLON', value: ';' }
]);

testTokenizer('函数式结构', 'match x { \nwhen 1 -> true \n}', [
    { type: 'KEYWORD', value: 'match' },
    { type: 'IDENTIFIER', value: 'x' },
    { type: 'LBRACE', value: '{' },
    { type: 'KEYWORD', value: 'when' },
    { type: 'NUMBER_LITERAL', value: '1' },
    { type: 'ARROW', value: '->' },
    { type: 'BOOLEAN_LITERAL', value: 'true' },
    { type: 'RBRACE', value: '}' }
]);
