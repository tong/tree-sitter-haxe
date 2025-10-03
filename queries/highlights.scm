; comments
(line_comment) @comment.line
(block_comment) @comment.block

; ((line_comment) @comment
;   (#match? @comment "TODO|FIXME|XXX"))
; ((block_comment) @comment
;   (#match? @comment "TODO|FIXME|XXX"))
(identifier) @variable

; MetaData
; --------
(metadata) @tag
(metadata name: (identifier) @type) @tag

; Declarations
; ------------
; (class_declaration name: (identifier) @type.definition)
; (interface_declaration name: (identifier) @type.definition)
; (typedef_declaration name: (identifier) @type.definition)

(function_declaration name: (identifier) @function)
; (function_arg name: (identifier) @variable.parameter)

; Expressions
; -----------
; (call_expression name: (identifier) @variable.parameter)


; Literals
; --------
; [(keyword) (null)] @keyword
; (type) @type
(type_name) @type
(package_name) @module
; (type (identifier) !built_in) @type
; (type built_in: (identifier)) @type.builtin
; [(integer) (float)] @number
; (string) @string
; (bool) @boolean
; (operator) @operator
; (escape_sequence) @punctuation
(null) @constant.builtin
; (access_identifiers "null" @keyword)

; Keywords
; --------
[
  "abstract"
  ; "as"
  "break"
  "case"
  ; "cast"
  "catch"
  "class"
  "continue"
  "default"
  ; "do"
  ; "dynamic"
  "else"
  "enum"
  "extends"
  "extern"
  ; "final"
  "for"
  "function"
  "if"
  "implements"
  "import"
  "in"
  "inline"
  "interface"
  ; "macro"
  ; "operator"
  ; "overload"
  "override"
  "package"
  "private"
  "public"
  "return"
  "static"
  "switch"
  ; "this"
  "throw"
  "try"
  "typedef"
  ; "untyped"
  "using"
  "var"
  "while"
] @keyword

; (function_declaration name: "new" @constructor)
; (call_expression
;   "new" @keyword
;   constructor: (type_name) @constructor
; )

; Tokens
; ------

(":") @punctuation.special
; (pair [":" "=>"] @punctuation.special)

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
]  @punctuation.bracket
;
[
;   ";"
;   "?."
;   "."
  ","
] @punctuation.delimiter

; Interpolation
; -------------
; (interpolation "$" @punctuation.special)
; (interpolation
;   "${" @punctuation.special
;   "}" @punctuation.special
; ) @embedded
