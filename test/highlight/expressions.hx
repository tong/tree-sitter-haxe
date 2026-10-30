funk();
// <- function.call

new Some();
// <- keyword.operator
//   ^ type

cast(a,String);
// ^ keyword.operator
//   ^ variable
//     ^ type

for(a in b) {}
// <- keyword.repeat
//  ^ variable
//    ^ keyword.operator
//       ^ variable

switch([7, 6]) {
    case [a, b] if(b>a): 
}
//   ^ keyword.conditional
//              ^ keyword.conditional
//                    ^ punctuation.bracket
//                     ^ punctuation.delimiter


function(?a:Int=23){}
//<- keyword.function
//       ^ punctuation.special
//        ^ variable.parameter
//         ^ punctuation.delimiter
//          ^ type
//             ^ punctuation.special
//               ^ number

(a,b)->i;
//<- punctuation.bracket
// ^ variable.parameter

untyped a;
// ^ keyword.debug


throw "x";
// <- keyword.exception
//    ^ string

#if js
// <- keyword.directive
//  ^ constant.macro
var x = 1;
//    ^ operator
#end
// <- keyword.directive

var view = html(<p>${x}</p>);
//              ^ string.special
