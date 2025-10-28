; Comments
(comment) @comment
(line_comment) @comment.line
(block_comment) @comment.block

; Conditional Compilation
[
  (conditional)
  (conditional_elseif)
  (conditional_else)
  (conditional_end)
  (conditional_error)
] @keyword.directive

; Punctuation
["{" "}" "[" "]" "(" ")"] @punctuation.bracket
["," ";" ":" "..."] @punctuation.delimiter
["?" "??"] @punctuation.special

; Keywords
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

; Operators
["->" "=>"] @keyword.operator

(EBinop op: _ @operator)
(EUnop operator: _ @operator)
(ETernary "?" @operator)
(ETernary ":" @operator)
(ComplexType "&" @operator)

; Literals
(Int) @number
(Float) @number.float
(String (fragment) @string)
(String (escape_sequence) @string.escape)
(String (interpolation) @string.special)
(Regexp) @string.regex

(true) @boolean
(false) @boolean
(null) @constant.builtin

; Module structure
(package_name) @namespace

; (import
;   path: (package_name) @namespace
;   (wildcard) @constant)
; (import
;   path: (package_name) @namespace
;   module: (type_name) @type
;   alias: (identifier) @type)

; import some.where.Type;
; (import
;   path: (package_name) @namespace
;   path: (package_name) @namespace
;   module: (type_name) @module)
; import some.where.*;
(import
  path: (package_name) @namespace
  (wildcard) @constant)

; import some.where.Type;
(import
  path: (package_name) @namespace
  path: (package_name) @namespace
  module: (type_name) @module)

; import some.where.Type as Alias;
(import
  path: (package_name) @namespace
  path: (package_name) @namespace
  module: (type_name) @module
  alias: (identifier) @type)

; import some.where.Type.field;
(import
  path: (package_name) @namespace
  path: (package_name) @namespace
  module: (type_name) @module
  sub: (identifier) @property)

(using
  path: (package_name) @namespace
  type: (type_name) @type)

; Declarations
(AbstractType name: (type_name) @type.definition)
(ClassType name: (type_name) @type.definition)
(DefType name: (type_name) @type.definition)
(EnumType name: (type_name) @type.definition)
(EnumConstructor name: (identifier) @constant)

(ClassVar name: (identifier) @variable.member)
(ClassMethod name: (identifier) @function.method)
(ClassMethod
  [":"] @punctuation.delimiter)
(ClassMethod
  type: (ComplexType
    (TypePath
      name: (type_name) @type)))
(ClassMethod
  args: (FunctionArg
    type: (ComplexType
      (TypePath
        name: (type_name) @type))))

(EVars name: (identifier) @variable)
(EFunction name: (identifier) @function)

; Types
(TypePath
  pack: (package_name) @namespace
  name: (type_name) @type.definition
  sub: (identifier) @property)

(TypeParameter
  name: (type_name) @type.parameter)
; constrained
(TypeParameter
  name: (type_name) @type.parameter
  [":"] @punctuation.delimiter
  constraint: (ComplexType
    (TypePath
      name: (type_name) @type)))

(AbstractType ["<" ">"] @punctuation.bracket)
(ClassType ["<" ">"] @punctuation.bracket)
(DefType ["<" ">"] @punctuation.bracket)
(EnumType ["<" ">"] @punctuation.bracket)

(ComplexType "->" @keyword.operator)

(TAnonymous) @type.builtin
(AnonymousField name: (identifier) @variable.member)

(FunctionArg
  type: (ComplexType
    (TypePath
      name: (type_name) @type)))
(ClassVar type: (ComplexType) @type)
(ClassMethod ret: (ComplexType) @type)
(EFunction ret: (ComplexType) @type)

(DefType type: (ComplexType) @type)
(AbstractType type: (ComplexType) @type)

(ECast type: (ComplexType) @type)
(ENew (TypePath) @type)

; (_type_arguments
;   "<" @punctuation.bracket
;   (type_name) @type.parameter
;   ">" @punctuation.bracket)

; Function calls
(ECall callee: (identifier) @function.call)
(ECall callee: (EField name: (identifier) @function.call))

; Variables and properties
(FunctionArg name: (identifier) @variable.parameter)
(EField name: (identifier) @property)
(EObjectDecl name: (identifier) @property)
(EObjectDecl name: (String) @property)
(EFor
  key: (identifier) @variable
  value: (identifier) @variable
  var: (identifier) @variable
)
(ETry (identifier) @variable)

; Metadata
(MetaDataEntry) @attribute
(MetaDataEntry "@" @attribute)
(MetaDataEntry ":" @attribute)
(MetaDataEntry name: (identifier) @attribute)
(MetaDataEntry "(" @punctuation.bracket)
(MetaDataEntry params: (_) @attribute.parameter)
(MetaDataEntry ")" @punctuation.bracket)
(MetaDataEntry
  (ECall callee: (EField name: (identifier) @function.call)))

; Fallback
; (type_name) @type
(identifier) @variable

