/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "haxe",
  externals: ($) => [$._closing_brace_marker, $._closing_brace_unmarker],
  extras: ($) => [/\s/, $.comment],
  supertypes: ($) => [$.expression, $.primary_expression],
  conflicts: ($) => [
    [$.array_access_expression, $.map_access_expression],
    // [$.object_literal, $.block],
    [$.object_literal, $.object_pattern],
    [$.property, $.case_pattern],
  ],
  word: ($) => $.identifier,
  rules: {
    source_file: ($) => repeat(choice($._declaration, $._statement)),

    _declaration: ($) =>
      choice(
        $.class_declaration,
        $.enum_declaration,
        $.interface_declaration,
        $.abstract_declaration,
        $.typedef_declaration,
        $.function_declaration,
      ),

    //== Statements ============================================================

    _statement: ($) =>
      choice(
        $.package_statement,
        $.import_statement,
        $.expression_statement,
        $.variable_declaration,
        $.if_statement,
        $.while_statement,
        $.for_statement,
        $.return_statement,
        $.try_statement,
        $.using_statement,
        $.break_statement,
        $.continue_statement,
        $.throw_statement,
        $.block,
      ),

    if_statement: ($) =>
      prec.right(
        seq(
          "if",
          field("condition", $.parenthesized_expression),
          field("consequence", $._statement),
          optional(seq("else", field("alternative", $._statement))),
        ),
      ),

    while_statement: ($) =>
      seq(
        "while",
        field("condition", $.parenthesized_expression),
        field("body", $._statement),
      ),

    for_statement: ($) =>
      seq(
        "for",
        "(",
        field("iterator", $.identifier),
        "in",
        field("iterable", $.expression),
        ")",
        field("body", $._statement),
      ),

    return_statement: ($) =>
      seq("return", optional($.expression), $._semicolon),

    block: ($) =>
      seq(field("open", "{"), repeat($._statement), $._closing_brace),

    using_statement: ($) =>
      seq("using", field("path", $._qualified_type), $._semicolon),

    try_statement: ($) =>
      seq("try", field("body", $.block), repeat1($.catch_clause)),

    break_statement: ($) => seq("break", $._semicolon),

    continue_statement: ($) => seq("continue", $._semicolon),

    throw_statement: ($) => seq("throw", $.expression, $._semicolon),
    catch_clause: ($) =>
      seq(
        "catch",
        "(",
        field("exception", $.parameter),
        ")",
        field("body", $.block),
      ),

    package_statement: ($) =>
      seq(
        "package",
        optional(
          field("name", seq(repeat(seq($.package_name, ".")), $.package_name)),
        ),
        $._semicolon,
      ),

    import_statement: ($) =>
      seq(
        "import",
        optional(repeat(seq($.package_name, "."))),
        optional(repeat(seq($.type_name, "."))),
        choice(
          "*",
          seq(
            $.type_name,
            optional(seq(".", alias($._camel_case_identifier, $.identifier))),
          ),
        ),
        optional(
          seq(
            choice("as", "in"),
            choice($.type_name, alias($._camel_case_identifier, $.identifier)),
          ),
        ),
        $._semicolon,
      ),

    expression_statement: ($) => seq($.expression, optional($._semicolon)),

    variable_declaration: ($) =>
      seq(
        repeat($.metadata),
        repeat($.access),
        choice("var", "final"),
        field("name", $.identifier),
        field("type", optional(seq(":", $._qualified_type))),
        optional(seq("=", field("value", $.expression))),
        $._semicolon,
      ),

    property_accessor: ($) =>
      seq(
        "(",
        field("getter", $.accessor_type),
        field("setter", $.accessor_type),
        ")",
      ),

    accessor_type: ($) =>
      choice($.identifier, "default", "null", "never", "dynamic"),

    //== Expressions ===========================================================

    expression: ($) =>
      choice(
        $.primary_expression,
        $.unary_expression,
        $.binary_expression,
        $.call_expression,
        $.field_expression,
        $.new_expression,
        $.array_access_expression,
        $.map_access_expression,
        $.switch_expression,
      ),

    primary_expression: ($) =>
      choice(
        $.integer,
        $.float,
        $.string_literal,
        $.regex_literal,
        $.identifier,
        $.true,
        $.false,
        $.null,
        $.parenthesized_expression,
        $.array_literal,
        $.map_literal,
        $.object_literal,
      ),

    parenthesized_expression: ($) => seq("(", $.expression, ")"),

    object_literal: ($) =>
      seq("{", optional(seq($.property, repeat(seq(",", $.property)))), "}"),

    property: ($) =>
      seq(field("key", $.identifier), ":", field("value", $.expression)),

    array_literal: ($) =>
      prec(
        -1,
        seq(
          "[",
          optional(seq($.expression, repeat(seq(",", $.expression)))),
          "]",
        ),
      ),

    array_access_expression: ($) =>
      prec.left(
        10,
        seq(
          field("array", $.expression),
          "[",
          field("index", $.expression),
          "]",
        ),
      ),

    map_access_expression: ($) =>
      prec.left(
        10,
        seq(field("map", $.expression), "[", field("key", $.expression), "]"),
      ),

    map_literal: ($) =>
      seq(
        "[",
        seq(
          // Make the content mandatory
          $.key_value_pair,
          repeat(seq(",", $.key_value_pair)),
        ),
        "]",
      ),

    key_value_pair: ($) =>
      seq(field("key", $.expression), "=>", field("value", $.expression)),

    new_expression: ($) =>
      prec.right(
        9,
        seq(
          "new",
          field("class", $._qualified_type),
          field("arguments", $.argument_list),
        ),
      ),

    call_expression: ($) =>
      prec(
        10,
        seq(
          field("function", $.expression),
          field("arguments", $.argument_list),
        ),
      ),

    argument_list: ($) =>
      seq(
        "(",
        optional(seq($.expression, repeat(seq(",", $.expression)))),
        ")",
      ),

    field_expression: ($) =>
      prec.left(
        10,
        seq(
          field("object", $.expression),
          ".",
          field("property", $.identifier),
        ),
      ),

    unary_expression: ($) =>
      prec.right(
        8,
        seq(
          field("operator", choice("!", "-")),
          field("argument", $.expression),
        ),
      ),

    binary_expression: ($) =>
      choice(
        prec.right(
          0,
          seq(field("left", $.expression), "=", field("right", $.expression)),
        ),
        prec.left(
          1,
          seq(field("left", $.expression), "||", field("right", $.expression)),
        ),
        prec.left(
          2,
          seq(field("left", $.expression), "&&", field("right", $.expression)),
        ),
        prec.left(
          3,
          seq(
            field("left", $.expression),
            choice("==", "!="),
            field("right", $.expression),
          ),
        ),
        prec.left(
          4,
          seq(
            field("left", $.expression),
            choice("<", ">", "<=", ">="),
            field("right", $.expression),
          ),
        ),
        prec.left(
          5,
          seq(field("left", $.expression), "...", field("right", $.expression)),
        ),
        prec.left(
          6,
          seq(field("left", $.expression), "+", field("right", $.expression)),
        ),
        prec.left(
          6,
          seq(field("left", $.expression), "-", field("right", $.expression)),
        ),
        prec.left(
          7,
          seq(field("left", $.expression), "*", field("right", $.expression)),
        ),
        prec.left(
          7,
          seq(field("left", $.expression), "/", field("right", $.expression)),
        ),
      ),

    switch_expression: ($) =>
      seq("switch", field("value", $.expression), field("body", $.switch_body)),

    switch_body: ($) => seq("{", repeat($.case_statement), "}"),

    case_statement: ($) =>
      seq(
        choice(
          seq(
            "case",
            field("pattern", $.case_pattern),
            repeat(seq(",", field("pattern", $.case_pattern))),
          ),
          "default",
        ),
        optional(seq("when", field("guard", $.expression))),
        ":",
        repeat($._statement),
      ),

    case_pattern: ($) =>
      choice(
        $.expression,
        $.enum_constructor_pattern,
        $.object_pattern,
        $.array_pattern,
        $._qualified_type,
        // 'null',
        "_",
      ),
    enum_constructor_pattern: ($) =>
      prec(
        1,
        seq(
          $._qualified_type,
          optional(field("arguments", $.pattern_argument_list)),
        ),
      ),

    pattern_argument_list: ($) =>
      seq(
        "(",
        optional(seq($.case_pattern, repeat(seq(",", $.case_pattern)))),
        ")",
      ),

    object_pattern: ($) =>
      seq(
        "{",
        optional(seq($.field_pattern, repeat(seq(",", $.field_pattern)))),
        "}",
      ),

    field_pattern: ($) =>
      seq(
        field("name", $.identifier),
        optional(seq(":", field("pattern", $.case_pattern))),
      ),

    array_pattern: ($) =>
      prec.right(
        11,
        seq(
          "[",
          optional(seq($.case_pattern, repeat(seq(",", $.case_pattern)))),
          "]",
        ),
      ),

    type_pattern: ($) =>
      seq(field("name", $.identifier), ":", field("type", $._qualified_type)),
    class_declaration: ($) =>
      seq(
        repeat($.metadata),
        repeat($.access),
        "class",
        field("name", $.type_name),
        optional(field("type_parameters", $.type_parameter_list)),
        optional(field("extends", $.extends_clause)),
        optional(field("implements", $.implements_clause)),
        field("body", $.class_body),
      ),

    extends_clause: ($) => seq("extends", $._qualified_type),

    implements_clause: ($) =>
      seq("implements", $._qualified_type, repeat(seq(",", $._qualified_type))),

    interface_declaration: ($) =>
      seq(
        repeat($.metadata),
        repeat($.access),
        "interface",
        field("name", $.type_name),
        optional(field("extends", $.extends_clause)),
        field("body", $.interface_body),
      ),

    abstract_declaration: ($) =>
      seq(
        repeat($.metadata),
        repeat($.access),
        "abstract",
        field("name", $.type_name),
        optional(field("type_parameters", $.type_parameter_list)),
        optional(field("underlying_type", $.abstract_underlying_type)),
        optional(field("from", $.abstract_from_clause)),
        optional(field("to", $.abstract_to_clause)),
        field("body", $.abstract_body),
      ),

    abstract_underlying_type: ($) => seq("(", $._qualified_type, ")"),

    abstract_from_clause: ($) => seq("from", $._qualified_type),

    abstract_to_clause: ($) => seq("to", $._qualified_type),

    abstract_body: ($) => seq("{", repeat($.interface_field_declaration), "}"),

    typedef_declaration: ($) =>
      seq(
        repeat($.metadata),
        repeat($.access),
        "typedef",
        field("name", $.type_name),
        optional(field("type_parameters", $.type_parameter_list)),
        "=",
        field("type", choice($._qualified_type, $.structural_type)),
        $._semicolon,
      ),

    structural_type: ($) => seq("{", repeat($.structural_field), "}"),

    structural_field: ($) =>
      seq(
        optional("var"),
        field("name", $.identifier),
        ":",
        field("type", $._qualified_type),
        $._semicolon,
      ),
    interface_body: ($) => seq("{", repeat($.interface_field_declaration), "}"),

    interface_field_declaration: ($) =>
      seq(
        repeat($.access),
        choice($._variable_signature, $._function_signature),
      ),

    _variable_signature: ($) =>
      seq(
        "var",
        field("name", $.identifier),
        field("type", optional(seq(":", $._qualified_type))),
        $._semicolon,
      ),

    _function_signature: ($) =>
      seq(
        "function",
        field("name", $.identifier),
        field("parameters", $.parameter_list),
        field("return_type", optional(seq(":", $._qualified_type))),
        $._semicolon,
      ),

    enum_declaration: ($) =>
      seq(
        repeat($.metadata),
        repeat($.access),
        "enum",
        field("name", $.type_name),
        optional(field("type_parameters", $.type_parameter_list)),
        field("body", $.enum_body),
      ),

    enum_body: ($) =>
      seq(
        "{",
        optional(
          seq(
            $.enum_constructor,
            repeat(seq(";", $.enum_constructor)),
            optional(";"),
          ),
        ),
        "}",
      ),

    enum_constructor: ($) =>
      seq(
        repeat($.metadata),
        $.type_name,
        optional(field("arguments", $.enum_constructor_argument_list)),
      ),

    enum_constructor_argument_list: ($) =>
      seq(
        "(",
        optional(
          seq(
            $.enum_constructor_argument,
            repeat(seq(",", $.enum_constructor_argument)),
          ),
        ),
        ")",
      ),

    enum_constructor_argument: ($) =>
      seq(field("name", $.identifier), ":", field("type", $._qualified_type)),

    type_parameter: ($) => $.type_name,

    type_parameter_list: ($) =>
      seq("<", $.type_parameter, repeat(seq(",", $.type_parameter)), ">"),

    type_argument: ($) => $._qualified_type,

    type_argument_list: ($) =>
      seq("<", $.type_argument, repeat(seq(",", $.type_argument)), ">"),

    metadata: ($) =>
      choice(
        seq(
          "@:",
          field("name", $.identifier),
          optional(field("arguments", $.argument_list)),
        ),
        seq(
          "@",
          field("name", $.identifier),
          optional(field("arguments", $.argument_list)),
        ),
      ),
    class_body: ($) => seq("{", repeat($.field_declaration), "}"),

    field_declaration: ($) =>
      choice($.variable_declaration, $.function_declaration),

    function_declaration: ($) =>
      seq(
        repeat($.metadata),
        repeat($.access),
        "function",
        field("name", $.identifier),
        optional(field("type_parameters", $.type_parameter_list)),
        field("parameters", $.parameter_list),
        field("return_type", optional(seq(":", $._qualified_type))),
        field("body", $.block),
      ),

    parameter_list: ($) =>
      seq("(", optional(seq($.parameter, repeat(seq(",", $.parameter)))), ")"),

    parameter: ($) =>
      seq(
        field("name", $.identifier),
        field("type", optional(seq(":", $._qualified_type))),
      ),

    //== primitives ============================================================

    //todo: import statement error
    // qualified_type: $ => prec.right(choice(
    //   seq($.type_name, optional($.type_argument_list)),
    //   seq($.package_name, '.', $._qualified_type)
    // )),
    _qualified_type: ($) =>
      prec.right(
        choice(
          seq($.type_name, optional($.type_argument_list)),
          seq(choice($.package_name, $.type_name), ".", $._qualified_type),
        ),
      ),
    // qualified_type: ($) =>
    //   prec.right(
    //     seq(
    //       optional(seq($.package_path, ".")),
    //       $.type_name,
    //       optional($.type_argument_list),
    //       repeat(seq(".", $.type_name, optional($.type_argument_list)))
    //     )
    //   ),

    access: (_) =>
      choice(
        "abstract",
        "dynamic",
        "extern",
        "final",
        "inline",
        "macro",
        "override",
        "private",
        "public",
        "static",
      ),

    // package_path: ($) => prec.right(seq($.identifier, repeat(seq(".", $.identifier)))),
    package_name: ($) => $._camel_case_identifier,
    type_name: ($) => $._pascal_case_identifier,

    integer: (_) =>
      choice(
        /\d[\d_]*/, // decimal
        /0x[a-fa-f\d][a-fa-f\d_]*/, // hex
        /0b[01][01_]*/, // binary
        /0o[0-7][0-7_]*/, // octal
      ),

    float: (_) =>
      token(
        choice(
          /\d[\d_]*\.\d[\d_]*([ee][+-]?\d[\d_]*)?/, // decimal float with optional exponent
          /\d[\d_]+[ee][+-]?\d[\d_]*/, // decimal integer with exponent
        ),
      ),

    string_literal: ($) =>
      choice(
        seq(
          "'",
          repeat(
            choice(
              alias(token.immediate(prec(1, /[^'\\$]+/)), $.string_fragment),
              $.escape_sequence,
              $.interpolation,
            ),
          ),
          "'",
        ),
        seq(
          '"',
          repeat(
            choice(
              alias(token.immediate(prec(1, /[^"\\$]+/)), $.string_fragment),
              $.escape_sequence,
              $.interpolation,
            ),
          ),
          '"',
        ),
      ),

    interpolation: ($) =>
      seq("${", $.expression, $._closing_interpolation_brace),

    _closing_interpolation_brace: ($) => seq($._closing_brace_unmarker, "}"),

    escape_sequence: () => token.immediate(seq("\\", /./)),

    regex_literal: (_) =>
      token(seq("~/", repeat(choice(/[^/\\\n]/, /\\./)), "/", /[gimsu]*/)),

    true: (_) => "true",
    false: (_) => "false",
    null: (_) => "null",

    comment: ($) => choice($.line_comment, $.block_comment),
    line_comment: (_) => token(seq("//", /[^\n]*/)),
    block_comment: (_) => token(seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/")),

    _closing_brace: ($) => seq($._closing_brace_marker, "}"),

    identifier: (_) => /[a-zA-Z_][a-zA-Z0-9_]*/,
    _camel_case_identifier: (_) => /[a-z_][a-zA-Z0-9_]*/,
    _pascal_case_identifier: (_) => /[A-Z][a-zA-Z0-9_]*/,

    _semicolon: (_) => token(";"),
  },
});
