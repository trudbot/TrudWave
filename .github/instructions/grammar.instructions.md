design

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
<number, number, text>
compare = match (a, b) {
    when a > b -> "greater";
    when a < b -> "less";
    otherwise -> "equal";
};

<number, number, number>
sum_2 = match(a, b) {
    when _ -> a + b;
    // 或者
    // otherwise -> a + b;
};

// match语法糖， 等价于上面
<number, number, number>
sum_2(a, b) = a + b;

<number, number, number, number>
sum_3(a, b, c) = sum_2(sum_2(a, b), c);
```
```
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