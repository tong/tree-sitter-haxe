; Comments --------------------------------------------------------------------

(comment) @comment
(line_comment) @comment.line
(block_comment) @comment.block

; Conditional Compilation -----------------------------------------------------

;(conditional) @keyword.directive
(conditional) @macro

; Module ----------------------------------------------------------------------

(module) @module
(package "package" @keyword)
(import "import" @keyword)
(using "using" @keyword)

; --------------------------

(MetaDataEntry) @attribute.preproc
(MetaDataEntry "@" @attribute)
(MetaDataEntry ":" @attribute)
(MetaDataEntry name: (identifier) @attribute)
(MetaDataEntry "(" @attribute.parameter)
(MetaDataEntry params: (_) @attribute.parameter)
(MetaDataEntry ")" @attribute.parameter)

; Type declarations -----------------------------------------------------------

[
  (AbstractType name: (type_name))
  (ClassType name: (type_name))
  (DefType name: (type_name))
  (EnumType name: (type_name))
 ] @type.definition

(TAnonymous) @type.builtin
(AnonymousField
  name: (identifier) @variable.member
  type: (ComplexType) @type)

(TypePath
  pack: (package_name) @namespace
  name: (type_name) @type
  sub: (identifier) @type)

; (_type_params "<" @punctuation.bracket)
; (_type_params ">" @punctuation.bracket)
(TypeParameter name: (type_name) @type.parameter)
(TypeParameter ":" @operator)
(TypeParameter "=" @operator)

; Fields ----------------------------------------------------------------------

(ClassVar
  name: (identifier) @variable.member
  type: (ComplexType) @type
  (EConst)? @constant)

(property_accessor
  get: (property_access (get) @keyword)
  set: (property_access (set) @keyword))

; Functions -------------------------------------------------------------------

(ClassMethod
  (public)? @storage.modifier
  (private)? @storage.modifier
  "macro" @preproc ;
  name: (identifier) @function.method
  args: (FunctionArg
    name: (identifier) @variable.parameter
    type: (ComplexType (TypePath name: (type_name) @type)))
  type: (ComplexType (TypePath name: (type_name) @type))
  body: (EBlock)? @block)

(DefType "extern" @storage.modifier)
(EnumType "extern" @storage.modifier)

(FunctionArg
  name: (identifier) @variable.parameter
  type: (ComplexType (TypePath name: (type_name) @type)))

(EFunction
  name: (identifier) @function
  type: (ComplexType (TypePath name: (type_name) @type)))

; Expressions -----------------------------------------------------------------

(EConst (Int) @number)
(EConst (Float) @float)
(EConst (String (fragment) @string))
(EConst (String (escape_sequence) @string.escape))
(EConst (String (interpolation) @string.special))
(EConst (Regexp) @string.regex)

(EConst (true) @boolean)
(EConst (false) @boolean)
(EConst (identifier) @constant)

(EField
  object: (EConst (identifier) @variable)
  name: (identifier) @property)

(ECall
  callee: (identifier) @function.call
  args: (_)? @argument)

(EBinop) @operator
(EIf) @conditional
(EReturn) @keyword.return
(ECast) @cast
(ETernary) @conditional.ternary
(EBlock) @block
(EVars) @declaration

(ENew) @keyword
(EMeta) @attribute
(EMacro (macro) @preproc.block)

; Keywords --------------------------------------------------------------------

[
  (public)
  (private)
  "static"
  "inline"
  "dynamic"
  "override"
  "final" 
] @storage.modifier

(super) @variable.builtin
(this) @variable.builtin

[
  (macro)
  (EMacro (macro))
] @preproc

[
  "case"
  "catch"
  "class"
  "default"
  "do"
  "else"
  "extends"
  "extern"
  "for"
  "function"
  "if"
  "implements"
  "in"
  "inline"
  "new"
  "static"
  "switch"
  "throw"
  "try"
  "untyped"
  "var"
  "while"
] @keyword

[
 "abstract"
 "class"
 "interface"
 "enum"
 "typedef"
 "var"
] @keyword.declaration

["{" "}" "[" "]" "(" ")" ] @punctuation.bracket
["," ";" ":" "..."] @punctuation.delimiter
["?" "??"] @punctuation.special

[
  "="
  "=="
  "!="
  "<"
  "<="
  ">"
  ">="
  "&&"
  "||"
  "!"
  "+"
  "-"
  "*"
  "/"
  "?"
  "++"
  "--"
  "~"
  "&"
  "|"
  "^"
  "<<"
  ">>"
  ">>>"
  "%"
  "+="
  "-="
  "*="
  "/="
  "%="
  "&="
  "|="
  "^="
  "<<="
  ">>="
] @operator

 [
  "->"
  "=>"
  "in"
  ; "is"
 ] @keyword.operator


(identifier) @variable

