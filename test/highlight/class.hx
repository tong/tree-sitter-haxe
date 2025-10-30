class Main {}
// <- keyword.declaration
//    ^ type
//         ^ punctuation.bracket
//          ^ punctuation.bracket

class Main<T,R> {}
// <- keyword.declaration
//    ^ type
//        ^ punctuation.bracket
//         ^ type.parameter
//           ^ type.parameter
//            ^ punctuation.bracket

class Main {
  public function test(?another:Int=23) {}
}
//  ^ keyword.modifier
//         ^ keyword.function
//                 ^ function.method 
//                    ^ punctuation.bracket
//                     ^ punctuation.special
//                      ^ variable.parameter
//                              ^ type
//                                 ^ punctuation.special

class Main {
  function a(): Int {}
}
//           ^ punctuation.bracket
//            ^ punctuation.delimiter
//               ^ type
