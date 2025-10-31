funk();
// <- function.call

new Some();
// <- keyword
//   ^ type

cast(a,String);
// ^ keyword
//   ^ variable
//     ^ type

for(a in b) {}
// <- keyword
//  ^ variable
//    ^ keyword
//       ^ variable

switch([7, 6]) {
    case [a, b] if(b>a): 
}
//   ^ keyword.control
//              ^ keyword
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

