/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "haxe",

  externals: ($) => [],

  extras: ($) => [/\s/, $.line_comment, $.block_comment],

  supertypes: ($) => [$.expression, $.primary_expression],

  conflicts: ($) => [[$.array_access_expression, $.map_access_expression]],

  word: ($) => $.identifier,

  rules: {
    //== General ===============================================================

    source_file: ($) => repeat(choice($.declaration, $.statement)),

    declaration: ($) =>
      choice(
        $.class_declaration,
        $.enum_declaration,
        $.interface_declaration,
        $.abstract_declaration,
        $.typedef_declaration,
        $.function_declaration,
      ),

    //== Statements ============================================================

    statement: ($) =>
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
          field("consequence", $.statement),
          optional(seq("else", field("alternative", $.statement))),
        ),
      ),

    while_statement: ($) =>
      seq(
        "while",
        field("condition", $.parenthesized_expression),
        field("body", $.statement),
      ),

    for_statement: ($) =>
      seq(
        "for",
        "(",
        field("iterator", $.identifier),
        "in",
        field("iterable", $.expression),
        ")",
        field("body", $.statement),
      ),

    return_statement: ($) =>
      seq("return", optional($.expression), $._semicolon),

    block: ($) => seq("{", repeat($.statement), "}"),

    using_statement: ($) =>
      seq("using", field("path", $.qualified_type), $._semicolon),

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
        $.qualified_type,
        optional(
          choice(
            seq(".", "*"),
            seq("as", $.type_name),
            seq("in", $.identifier),
          ),
        ),
        $._semicolon,
      ),

    expression_statement: ($) => seq($.expression, $._semicolon),

    variable_declaration: ($) =>
      seq(
        repeat($.metadata),
        repeat($.modifier),
        choice("var", "final"),
        field("name", $.identifier),
        optional($.property_accessor),
        field("type", optional(seq(":", $.qualified_type))),
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
        $.number,
        $.string_literal,
        $.regex_literal,
        $.identifier,
        $.true,
        $.false,
        $.null,
        $.parenthesized_expression,
        $.array_literal,
        $.map_literal,
      ),

    parenthesized_expression: ($) => seq("(", $.expression, ")"),

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
          field("class", $.qualified_type),
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
        repeat($.statement),
      ),

    case_pattern: ($) =>
      choice(
        $.expression,
        $.enum_constructor_pattern,
        $.object_pattern,
        $.array_pattern,
        $.qualified_type,
        // 'null',
        "_",
      ),
    enum_constructor_pattern: ($) =>
      prec(
        1,
        seq(
          $.qualified_type,
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
      seq(field("name", $.identifier), ":", field("type", $.qualified_type)),
    class_declaration: ($) =>
      seq(
        repeat($.metadata),
        repeat($.modifier),
        "class",
        field("name", $.type_name),
        optional(field("type_parameters", $.type_parameter_list)),
        optional(field("extends", $.extends_clause)),
        optional(field("implements", $.implements_clause)),
        field("body", $.class_body),
      ),

    extends_clause: ($) => seq("extends", $.qualified_type),

    implements_clause: ($) =>
      seq("implements", $.qualified_type, repeat(seq(",", $.qualified_type))),

    interface_declaration: ($) =>
      seq(
        repeat($.metadata),
        repeat($.modifier),
        "interface",
        field("name", $.type_name),
        optional(field("extends", $.extends_clause)),
        field("body", $.interface_body),
      ),

    abstract_declaration: ($) =>
      seq(
        repeat($.metadata),
        repeat($.modifier),
        "abstract",
        field("name", $.type_name),
        optional(field("type_parameters", $.type_parameter_list)),
        optional(field("underlying_type", $.abstract_underlying_type)),
        optional(field("from", $.abstract_from_clause)),
        optional(field("to", $.abstract_to_clause)),
        field("body", $.abstract_body),
      ),

    abstract_underlying_type: ($) => seq("(", $.qualified_type, ")"),

    abstract_from_clause: ($) => seq("from", $.qualified_type),

    abstract_to_clause: ($) => seq("to", $.qualified_type),

    abstract_body: ($) => seq("{", repeat($.interface_field_declaration), "}"),

    typedef_declaration: ($) =>
      seq(
        repeat($.metadata),
        repeat($.modifier),
        "typedef",
        field("name", $.type_name),
        optional(field("type_parameters", $.type_parameter_list)),
        "=",
        field("type", choice($.qualified_type, $.structural_type)),
        $._semicolon,
      ),

    structural_type: ($) => seq("{", repeat($.structural_field), "}"),

    structural_field: ($) =>
      seq(
        optional("var"),
        field("name", $.identifier),
        ":",
        field("type", $.qualified_type),
        $._semicolon,
      ),
    interface_body: ($) => seq("{", repeat($.interface_field_declaration), "}"),

    interface_field_declaration: ($) =>
      seq(
        repeat($.modifier),
        choice($._variable_signature, $._function_signature),
      ),

    _variable_signature: ($) =>
      seq(
        "var",
        field("name", $.identifier),
        field("type", optional(seq(":", $.qualified_type))),
        $._semicolon,
      ),

    _function_signature: ($) =>
      seq(
        "function",
        field("name", $.identifier),
        field("parameters", $.parameter_list),
        field("return_type", optional(seq(":", $.qualified_type))),
        $._semicolon,
      ),

    enum_declaration: ($) =>
      seq(
        repeat($.metadata),
        repeat($.modifier),
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
      seq(field("name", $.identifier), ":", field("type", $.qualified_type)),

    type_parameter: ($) => $.type_name,

    type_parameter_list: ($) =>
      seq("<", $.type_parameter, repeat(seq(",", $.type_parameter)), ">"),

    type_argument: ($) => $.qualified_type,

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
        repeat($.modifier),
        "function",
        field("name", $.identifier),
        optional(field("type_parameters", $.type_parameter_list)),
        field("parameters", $.parameter_list),
        field("return_type", optional(seq(":", $.qualified_type))),
        field("body", $.block),
      ),

    parameter_list: ($) =>
      seq("(", optional(seq($.parameter, repeat(seq(",", $.parameter)))), ")"),

    parameter: ($) =>
      seq(
        field("name", $.identifier),
        field("type", optional(seq(":", $.qualified_type))),
      ),

    //== Primitives ============================================================

    //TODO: import statement error
    // qualified_type: $ => prec.right(choice(
    //   seq($.type_name, optional($.type_argument_list)),
    //   seq($.package_name, '.', $.qualified_type)
    // )),
    qualified_type: ($) =>
      prec.right(
        seq(
          $.type_name,
          optional($.type_argument_list),
          repeat(seq(".", $.type_name, optional($.type_argument_list))),
        ),
      ),
    // qualified_type: ($) =>
    //   prec.right(
    //     seq(
    //       optional(seq($.package_path, ".")),
    //       $.type_name,
    //       optional($.type_argument_list),
    //       repeat(seq(".", $.type_name, optional($.type_argument_list))),
    //     ),
    //   ),

    modifier: (_) =>
      choice("public", "private", "static", "override", "inline", "extern"),

    // package_path: ($) => prec.right(seq($.identifier, repeat(seq(".", $.identifier)))),
    package_name: ($) => $._camel_case_identifier,
    type_name: ($) => $._pascal_case_identifier,

    number: (_) =>
      token(
        choice(
          seq(choice("0x", "0X"), /[\da-fA-F][\da-fA-F_]*/),
          seq(choice("0b", "0B"), /[01][01_]*/),
          seq(choice("0o", "0O"), /[0-7][0-7_]*/),
          /\d[\d_]*\.\d[\d_]*(e[+-]?\d+)?/,
          /\d[\d_]*(e[+-]?\d+)?/,
        ),
      ),

    string_literal: (_) =>
      token(
        choice(
          seq("'", repeat(choice(/[^'\\\n]+/, /\\./)), "'"),
          seq('"', repeat(choice(/[^"\\\n]+/, /\\./)), '"'),
        ),
      ),

    regex_literal: (_) =>
      token(seq("~/", repeat(choice(/[^/\\\n]/, /\\./)), "/", /[gimsu]*/)),

    true: (_) => "true",
    false: (_) => "false",
    null: (_) => "null",

    line_comment: (_) => token(seq("//", /[^\n]*/)),
    block_comment: (_) => token(seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/")),

    identifier: (_) => /[a-zA-Z_][a-zA-Z0-9_]*/,
    _camel_case_identifier: (_) => /[a-z_][a-zA-Z0-9_]*/,
    _pascal_case_identifier: (_) => /[A-Z][a-zA-Z0-9_]*/,

    _semicolon: (_) => token(";"),
    // _semicolon: _ => token(';'),
  },
});
