; Comments
; --------
(comment) @comment
(line_comment) @comment.line
(block_comment) @comment.block

; Conditional Compilation
; -----------------------
; (([
;   (conditional)
;   (conditional_elseif)
;   (conditional_else)
;   (conditional_error)
;   (conditional_end)
; ]) @keyword.directive)

(conditional) @keyword.directive
(conditional_elseif) @keyword.directive
(conditional_else) @keyword.directive
(conditional_error) @keyword.directive
(conditional_end) @keyword.directive

; Keywords
; --------
; Keywords that are defined as string literals in the grammar
[
  "abstract"
  "break"
  "case"
  "cast"
  "class"
  "continue"
  "default"
  "do"
  "else"
  "enum"
  "extends"
  "final"
  "for"
  "function"
  "if"
  "implements"
  "import"
  "interface"
  "macro"
  "new"
  "package"
  "return"
  "switch"
  "throw"
  "try"
  "typedef"
  "untyped"
  "using"
  "var"
  "while"
] @keyword

; Modifier keywords that are aliased nodes in the grammar
[
  (abstract)
  (extern)
  (final)
  (inline)
  (override)
  (private)
  (public)
  (static)
] @keyword

(optional) @keyword
(wildcard) @keyword

; Punctuation
; -----------
[
  "{"
  "}"
  "["
  "]"
  "("
  ")"
] @punctuation.bracket

[
  ","
  ";"
  ":"
  "..."
] @punctuation.delimiter

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
] @keyword.operator

; Literals
; --------
(int) @number
(float) @float
(string) @string
(fragment) @string
(escape_sequence) @string.escape
(interpolation) @string.special
(true) @boolean
(false) @boolean
(null) @constant.builtin
(regexp) @string.regex

; Functions
; ---------
(function_decl name: (identifier) @function)
(call_expr function: (identifier) @function.call)
(call_expr function: (member_expr field: (identifier) @function.call))

; Types
; -----
(class_decl name: (identifier) @type)
(interface_decl name: (identifier) @type)
(enum_decl name: (identifier) @type)
(abstract_decl name: (identifier) @type)
(typedef_decl name: (identifier) @type)

(type_path (identifier) @type)
(cast_expr type: (type_path) @type)
(new_expr type: (type_path) @type)

(for_stmt element: (identifier) @variable)
(for_stmt key: (identifier) @variable)
(for_stmt value: (identifier) @variable)

(switch_case pattern: (identifier) @constant)
(switch_case pattern: (_) @constant)

(return_stmt "return") @keyword
(throw_stmt "throw") @keyword
(catch_clause (identifier) @variable.exception)

; (type_param name: (type_name) @type)

(enum_item name: (identifier) @constant)
(enum_param name: (identifier) @variable.parameter)

; Properties & Variables
; --------------------
(var_decl name: (identifier) @variable.local)
(param name: (identifier) @variable.parameter)
(member_expr field: (identifier) @property)
(object_field key: (identifier) @property)
(object_field key: (string) @property)

; Identifiers (fallback)
; ----------------------
(identifier) @variable

; Property Accessors
; ------------------
(property_accessor) @attribute
(property_accessor
  get: (property_access_identifier) @keyword.modifier)
(property_accessor
  set: (property_access_identifier) @keyword.modifier)

; Highlight common accessor patterns specially
(property_accessor
  get: (property_access_identifier) @constant.builtin
  (#match? @constant.builtin "^(default|null|never|dynamic)$"))
(property_accessor
  set: (property_access_identifier) @constant.builtin
  (#match? @constant.builtin "^(default|null|never|dynamic)$"))

; Metadata / Annotations
; ----------------------
(metadata name: (identifier) @attribute)
(metadata "@" @attribute)
(metadata ":" @attribute)

; Macro refication
; ----------------
(macro_expr
  body: (macro_splice) @macro)
(macro_expr body: (int) @number)
(macro_expr body: (binop) @operator)

