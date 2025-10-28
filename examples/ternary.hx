var a = true ? 1 : 0;
var b = false ? "yes" : "no";

// nested ternary
var c = true ? (false ? 1 : 2) : 3;

// ternary in expressions
var d = 10 + (true ? 5 : 6);
var e = (false ? 1 : 2) * 3;

// ternary with function calls
var f = test() ? foo() : bar();
