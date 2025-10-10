; Class definitions
(class_declaration
  name: (type_name) @name) @definition.class

; Interface definitions
(interface_declaration
  name: (type_name) @name) @definition.interface

; Abstract type definitions
(abstract_declaration
  name: (type_name) @name) @definition.type

; Typedef definitions
(typedef_declaration
  name: (type_name) @name) @definition.type

; Enum definitions
(enum_declaration
  name: (type_name) @name) @definition.enum

; Enum constructor definitions
(enum_constructor
  (type_name) @name) @definition.constructor

; Function definitions
(function_declaration
  name: (identifier) @name) @definition.function

; Constructor definitions (special case of functions named "new")
(function_declaration
  name: (identifier) @name
  (#eq? @name "new")) @definition.constructor

; Method definitions (functions inside classes/interfaces)
(class_body
  (field_declaration
    (function_declaration
      name: (identifier) @name))) @definition.method

(interface_body
  (interface_field_declaration
    name: (identifier) @name
    parameters: (parameter_list))) @definition.method

; Variable definitions
(variable_declaration
  name: (identifier) @name) @definition.variable

; Interface variable definitions
; (interface_body
;   (interface_field_declaration
;     name: (identifier) @name
;     type: (qualified_type))) @definition.variable
; Parameter definitions
(parameter
  name: (identifier) @name) @definition.parameter

; Function calls (for references)
(call_expression
  function: (identifier) @name) @reference.call

; Field access (for references)
(field_expression
  property: (identifier) @name) @reference.field

; Type references
; (qualified_type
;   (type_name) @name) @reference.type
; Package names
(package_statement
  (package_name) @name) @definition.module

