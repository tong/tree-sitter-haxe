100;
//^ number

0xf;
//^ number

0xffabcd;
//   ^ number

100;
//^ number

100.0;
//^ number.float

4.3e5;
//^ number.float

"haxe";
//^ string

'haxe';
//^ string

'hello\ntest';
//^ string
//    ^ string.escape
//      ^ string

'haxe $user at ${planet}';
//^ string
//    ^ string.special
//     ^ variable
//          ^ string
//                ^ variable

~/haxe/gi;
//^ string.regex

true;
//^ boolean

false;
//^ boolean

null;
//^ constant.builtin

this;
//^ variable.builtin

super;
//^ variable.builtin

somevar;
//^ variable

  [1, 2, 3, 4, 5];
//^ punctuation.bracket
// ^ number
//  ^ punctuation.delimiter

