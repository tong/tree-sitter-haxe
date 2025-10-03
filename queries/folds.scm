; Class declarations
(class_declaration
  body: (class_body) @fold)

; Interface declarations  
(interface_declaration
  body: (interface_body) @fold)

; Abstract declarations
(abstract_declaration
  body: (abstract_body) @fold)

; Enum declarations
(enum_declaration
  body: (enum_body) @fold)

; Function declarations (including constructors)
(function_declaration
  body: (block) @fold)

; Generic blocks (if statements, loops, etc.)
(block) @fold

; Switch expressions
(switch_expression
  body: (switch_body) @fold)

; Try-catch blocks  
(try_statement) @fold

; Individual catch clauses
(catch_clause
  body: (block) @fold)

; Multi-line comments
(block_comment) @fold

; Array literals (when they span multiple lines)
(array_literal) @fold

; Map/Object literals (when they span multiple lines)  
(map_literal) @fold

; Structural types (typedef with object syntax)
(structural_type) @fold
