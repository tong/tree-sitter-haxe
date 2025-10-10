; Comments
; --------
(comment) @comment
(line_comment) @comment.line
(block_comment) @comment.block

; Identifiers
; -----------
(identifier) @variable

; MetaData
; --------
(metadata) @attribute
(metadata
  name: (identifier) @attribute.name)
(metadata
  params: (argument_list) @punctuation)

; Declarations
; ------------
(class_declaration
  name: (type_name) @type.definition)
(interface_declaration
  name: (type_name) @type.definition)
(abstract_declaration
  name: (type_name) @type.definition)
(typedef_declaration
  name: (type_name) @type.definition)
(enum_declaration
  name: (type_name) @type.definition)

(function_declaration
  name: (identifier) @function)
(function_declaration
  name: (identifier) @constructor
  (#eq? @constructor "new"))

(keyword_function) @keyword.function

; Interface and abstract function signatures
(interface_field_declaration
  name: (identifier) @function
  parameters: (parameter_list))
(interface_field_declaration
  name: (identifier) @variable)

; Parameters
(parameter
  name: (identifier) @variable.parameter)
(enum_constructor_argument
  name: (identifier) @variable.parameter)

; Function calls
(call_expression
  function: (identifier) @function.call)
(call_expression
  function: (field_expression
    property: (identifier) @function.call))

; Constructor calls
(new_expression
  class: (type_name) @constructor)

; Field access
(field_expression
  property: (identifier) @property)

"final" @keyword.modifier ; in case final is used as var replacement

; Variables and assignments
(variable_declaration
  name: (identifier) @variable)

; Enum constructors
(enum_constructor
  (type_name) @constructor)

; Literals
; --------
(integer) @number.int
(float) @number.float
(string_literal) @string
(true) @boolean
(false) @boolean
(null) @constant.builtin

; Array literals
(array_literal) @punctuation.bracket

; Access modifiers
; ---------
(access) @keyword.access

; Types
; -----
(type_name) @type
(package_name) @module

; Built-in types (common Haxe types)
((type_name) @type.builtin
  (#match? @type.builtin "^(Int|Float|String|Bool|Void|Dynamic|Any)$"))

; Keywords
; --------
[
  "abstract"
  "break"
  "case"
  "catch"
  "class"
  "continue"
  "default"
  "do"
  "else"
  "enum"
  "extends"
  "extern"
  "final"
  "for"
  "function"
  "if"
  "implements"
  "import"
  "in"
  "inline"
  "interface"
  "override"
  "package"
  "private"
  "public"
  "return"
  "static"
  "switch"
  "throw"
  "try"
  "typedef"
  "using"
  "var"
  "while"
] @keyword

; Special keywords
"new" @keyword.operator
(cast_keyword) @keyword.operator

; Operators
; ---------
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
  "..."
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
  ">>>="
  "=>"
  "->"
] @operator

; Punctuation
; -----------
[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
] @punctuation.bracket

[
  ";"
  ","
  "."
  ":"
] @punctuation.delimiter

; Special punctuation
":" @punctuation.special
(string_literal) @string

(true) @boolean

(false) @boolean

(null) @constant.builtin

; Array literals
(array_literal) @punctuation.bracket

; Access modifiers
; ---------
(access) @keyword.access

; Types
; -----
(type_name) @type

(package_name) @module

; Built-in types (common Haxe types)
((type_name) @type.builtin
  (#match? @type.builtin "^(Int|Float|String|Bool|Void|Dynamic|Any)$"))

; Keywords
; --------
[
  "abstract"
  "break"
  "case"
  "catch"
  "class"
  "continue"
  "default"
  "else"
  "enum"
  "extends"
  "extern"
  "final"
  "for"
  "function"
  "if"
  "implements"
  "import"
  "in"
  "inline"
  "interface"
  "override"
  "package"
  "private"
  "public"
  "return"
  "static"
  "switch"
  "throw"
  "try"
  "typedef"
  "using"
  "var"
  "while"
] @keyword

; Special keywords
"new" @keyword.operator

; Operators
; ---------
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
  "..."
] @operator

; Punctuation
; -----------
[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
] @punctuation.bracket

[
  ";"
  ","
  "."
  ":"
] @punctuation.delimiter

; Special punctuation
":" @punctuation.special


; Conditional compilation
; ------------
[
  "if"
  "elseif" 
  "else"
  "end"
  "error"
] @keyword.directive (#has-parent? conditional_if conditional_elseif conditional_else conditional_end conditional_error)

(conditional_if) @keyword.directive
(conditional_elseif) @keyword.directive
(conditional_else) @keyword.directive
(conditional_end) @keyword.directive
(conditional_error) @keyword.directive

;"#" @punctuation.special
"#" @keyword.directive
