(comment) @comment
(line_comment) @comment.line
(block_comment) @comment.block

[
  (conditional)
  (conditional_elseif)
  (conditional_else)
  (conditional_end)
  (conditional_error)
] @keyword.directive

(identifier) @variable

["{" "}" "[" "]" "(" ")"] @punctuation.bracket
["," ";" ":" "..."] @punctuation.delimiter
["?" "??"] @punctuation.special

[
  "break"
  "case"
  "cast"
  "catch"
  "continue"
  "default"
  "do"
  "else"
  "enum"
  "extends"
  "extern"
  "for"
  "if"
  "implements"
  "import"
  "in"
  "new"
  "package"
  "switch"
  "throw"
  "try"
  "untyped"
  "using"
  "var"
  "while"
] @keyword

[
  "abstract"
  "class"
  "enum"
  "interface"
  "typedef"
] @keyword.declaration

["return"] @keyword.return
["function"] @keyword.function
["as"] @keyword.operator

[
  (public)
  (private)
  "final"
  "inline"
  "override"
  "static"
  "dynamic"
  "macro"
] @keyword.modifier

(super) @variable.builtin
(this) @variable.builtin

["->" "=>"] @keyword.operator

(EBinop op: _ @operator)
(EUnop operator: _ @operator)
(ETernary "?" @operator)
(ETernary ":" @operator)
(ComplexType "&" @operator)

(Int) @number
(Float) @number.float
(String (fragment) @string)
(String (escape_sequence) @string.escape)
(String (interpolation) @string.special)
(Regexp) @string.regex

(true) @boolean
(false) @boolean
(null) @constant.builtin

(package_name) @namespace

(import
  path: (package_name) @namespace
  (wildcard) @constant)
(import
  path: (package_name) @namespace
  path: (package_name) @namespace
  module: (type_name) @module)
(import
  path: (package_name) @namespace
  path: (package_name) @namespace
  module: (type_name) @module
  alias: (identifier) @type)
(import
  path: (package_name) @namespace
  path: (package_name) @namespace
  module: (type_name) @module
  sub: (identifier) @property)

(using
  path: (package_name) @namespace
  type: (type_name) @type)

;---------------------------------------------------

(type_name) @type

(ComplexType "->" @keyword.operator)

(TypePath
  pack: (package_name) @namespace
  name: (type_name) @type
  sub: (identifier) @property)

(TypeParameter
  name: (type_name) @type.parameter)
(TypeParameter
  name: (type_name) @type.parameter
  [":"] @punctuation.delimiter
  constraint: (ComplexType
    (TypePath
      name: (type_name) @type)))

(FunctionArg
  name: (identifier) @variable.parameter
  "=" @punctuation.special)

[
  (TypePath)
  (TypeParameter)
  (ComplexType)
] ["<" ">"] @punctuation.bracket


; Declarations ----------------------------------------------------------------

[
  (AbstractType)
  (ClassType)
  (EnumType)
  (DefType)
] @type.definition

(ClassVar type: (ComplexType) @type)
(ClassMethod
  name: (identifier) @function.method)

(EnumConstructor name: (identifier) @constant)

(TAnonymous) @type.builtin
(AnonymousField name: (identifier) @variable.member)

; Expressions -----------------------------------------------------------------

(EField name: (identifier) @property)
(ECast type: (ComplexType) @type)
(ECall callee: (identifier) @function.call)
(ECall callee: (EField name: (identifier) @function.call))
(EFor
  key: (identifier) @variable
  value: (identifier) @variable
  var: (identifier) @variable
)
(EFunction name: (identifier) @function)
(ENew (TypePath) @type)
(EObjectDecl name: (identifier) @property)
(EObjectDecl name: (String) @property)
(ETry (identifier) @variable)
(EVars name: (identifier) @variable)

; Metadata --------------------------------------------------------------------

(MetaDataEntry
  [
    "@" @attribute
    ":" @attribute
    name: (identifier) @attribute
    params: (_) @attribute.parameter
    "(" @punctuation.bracket
    ")" @punctuation.bracket
    (ECall callee: (EField name: (identifier) @function.call))
  ])

; Fallback
; (type_name) @type
; (identifier) @variable

