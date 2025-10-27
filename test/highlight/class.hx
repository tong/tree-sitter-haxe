class Main {}
// <- keyword.declaration
//    ^ type.definition
//         ^ punctuation.bracket

class Main<T,R> {}
// <- keyword.declaration
//    ^  type.definition
//         ^ type.parameter
//           ^ type.parameter

class Main<T:Array<Int>> {}
// <- keyword.declaration
//    ^  type.definition
//         ^  type.parameter
//           ^  type.definition
//                 ^ type.definition

class Main extends Other {}
// <- keyword.declaration
//    ^  type.definition
//         ^  keyword
//                 ^  type.definition

class Main implements Other {}
// <- keyword.declaration
//    ^  type.definition
//         ^  keyword
//                    ^  type.definition
