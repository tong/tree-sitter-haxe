class Main {}
// <- keyword.type
//    ^ type.definition
//         ^ punctuation.bracket
//          ^ punctuation.bracket

class Main<T,R> {}
// <- keyword.type
//    ^ type.definition
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
  public static macro function foo() {}
}
// ^ keyword.modifier
//       ^ keyword.modifier
//              ^ keyword.modifier
//                    ^ keyword.function
//                             ^ function.macro

class Main {
  function a(): Int {}
}
//           ^ punctuation.bracket
//            ^ punctuation.delimiter
//               ^ type

final class Main {}
// <- keyword.modifier
//    ^ keyword.type
//          ^ type.definition
//               ^ punctuation.bracket
//                ^ punctuation.bracket

extern class Main {}
// <- keyword.modifier
//     ^ keyword.type
//           ^ type.definition
//                ^ punctuation.bracket
//                 ^ punctuation.bracket

abstract class Main {}
// <- keyword.modifier
//       ^ keyword.type
//             ^ type.definition
//                  ^ punctuation.bracket
//                   ^ punctuation.bracket

typedef Handler = (event:Event, ?Count:Int) -> Void;
// <- keyword.type
//      ^ type.definition
//                 ^ variable.parameter
//                       ^ type
//                               ^ variable.parameter
//                                     ^ type
//                                             ^ type

extern class Main {
  overload function test():Void;
//^ keyword.modifier
//         ^ keyword.function
}

class Main {
  static var x = "a";
//             ^ operator
//               ^ string
}
