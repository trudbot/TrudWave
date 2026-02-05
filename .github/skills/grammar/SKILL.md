---
name: grammar
description: 编程语言的相关语法/使用的展示示例。 当需要了解trudwave怎么使用时阅读它。
---

**变量声明**

变量值运行时不可修改

```
number x = 1;
```
**基本数据类型**

* number
* string
* bool

**运算符**

* 算术运算: + - * /
* 逻辑运算: && || !
* 比较运算： < > >= <= ==

**函数定义**

```
<number, number> fib = match n {
    when n <= 0 -> 0;
    when n == 1 -> 1;
    otherwise -> fib(n - 1) + fib(n - 2);
};
```
```
// 最后一个类型是返回值类型, 前面的类型是参数类型
<number, number, text>
compare = match (a, b) {
    when a > b -> "greater";
    when a < b -> "less";
    otherwise -> "equal";
};

// 使用 match 创建一个匿名函数
<number, number, number>
sum_2 = match(a, b) {
    when _ -> a + b;
    // 或者
    // otherwise -> a + b;
};

// match语法糖， 等价于上面
<number, number, number>
sum_2(a, b) = a + b;

// 函数调用函数
<number, number, number, number>
sum_3(a, b, c) = sum_2(sum_2(a, b), c);
```
```
// 声明函数的两种语法
funcName(a, b) = xxx;
equal to
funcName = match(a, b) {
    otherwise -> xxx;
};
```
**列表**

```
[number, number, string] x = [1, 2, '3'];
```