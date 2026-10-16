abstract Foo(Int) {}
// <- keyword.type
//       ^ type.definition
//          ^ punctuation.bracket
//           ^ type
//              ^ punctuation.bracket
//                ^ punctuation.bracket
//                 ^ punctuation.bracket

abstract Foo(Int) from Int to Int {}
//                ^ keyword
//                         ^ keyword
