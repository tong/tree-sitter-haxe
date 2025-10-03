(class_declaration
  body: (class_body) @fold)

(interface_declaration
  body: (interface_body) @fold)

(abstract_declaration
  body: (abstract_body) @fold)

(enum_declaration
  body: (enum_body) @fold)

(function_declaration
  body: (block) @fold)

(block) @fold

(switch_expression
  body: (switch_body) @fold)

(try_statement) @fold

(catch_clause
  body: (block) @fold)

(block_comment) @fold

(array_literal) @fold

(map_literal) @fold

(structural_type) @fold
