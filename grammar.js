// @ts-check
/// <reference types="tree-sitter-cli/dsl" />

const PREC = {
  ASSIGN: 1,
  NULL_COALESCE: 2,
  LOGICAL_OR: 3,
  LOGICAL_AND: 4,
  BITWISE_OR: 5,
  BITWISE_XOR: 6,
  BITWISE_AND: 7,
  EQUALITY: 8,
  RELATIONAL: 9,
  SHIFT: 10,
  ADD: 11,
  MULT: 12,
  UNARY: 13,
  CALL: 14,
  PRIMARY: 15,
  RANGE: 11, // integer, tie with ADD
};

/**
 * Creates a separated list with at least one element.
 * Example: `a, b, c` → sep1(",", $.identifier)
 *
 * @param {string|Rule} sep - The separator token or rule
 * @param {Rule} rule - The element rule
 * @returns {Rule}
 */
function sep1(sep, rule) {
  return seq(rule, repeat(seq(sep, rule)));
}

/**
 * Creates a separated list that may be empty.
 * Example: `a, b, c` or nothing → sep(",", $.identifier)
 *
 * @param {string|Rule} sep
 * @param {Rule} rule
 * @returns {Rule}
 */
function sep(sep, rule) {
  return optional(sep1(sep, rule));
}

/** @param {Rule} rule @returns {Rule} */
const commaSep1 = (rule) => sep1(",", rule);
/** @param {Rule} rule @returns {Rule} */
const commaSep = (rule) => sep(",", rule);
/** @param {Rule} rule @returns {Rule} */
const dotSep1 = (rule) => sep1(".", rule);

export default grammar({
  name: "haxe",
  extras: ($) => [/\s+/, $.comment],
  conflicts: ($) => [
    [$.interface_decl],
    [$.enum_decl],
    [$.function_decl],
    [$._expr_stmt, $.statement_or_expr],
    [$.type_path],
    [$.abstract_decl],
    [$.object, $.block],
    [$.switch_case],
    [$._expression, $.param],
    [$._expression, $.object_pattern],
    [$._expression, $.literal],
    [$._expression, $.pattern],
    [$._expression, $._pattern_arg],
    [$.arg_list, $.call_pattern],
    [$.package_path],
    [$.return_stmt, $.return_expr],
    [$.return_expr],
    [$.var_decl, $.function_decl, $.conditional],
    [$._conditional_expr],
  ],
  inline: ($) => [$._semicolon],
  word: ($) => $.identifier,
  rules: {
    module: ($) =>
      seq(
        optional($.package_stmt),
        repeat(choice($.import_stmt, $.using_stmt)),
        repeat(choice($._type_decl, $._statement)),
      ),

    // Expressions ------------------------------------------------------------

    _expression: ($) =>
      choice(
        // $.conditional,
        $.macro_expr,
        $.assignment_expr,
        $.binop,
        $.unop,
        $.ternop,
        $.function_expr,
        $.return_expr,
        $.arrow_function_expr,
        $.new_expr,
        $.member_expr,
        $.array_access,
        $.call_expr,
        $.array,
        $.map,
        $.object,
        $._parenthesized_expr,
        $.cast_expr,
        $.range,
        $.identifier,
        $.int,
        $.float,
        $.string,
        $.regexp,
        $.true,
        $.false,
        $.null,
        // $.cc_expr, // only expression-level CC here
        $.untyped,
      ),

    expression: ($) => $._expression,

    _parenthesized_expr: ($) => seq("(", $._expression, ")"),

    assignment_expr: ($) =>
      prec.right(
        PREC.ASSIGN,
        seq(
          field("left", $._expression),
          //field("operator", $.assignment_operator),
          $._assignment_operator,
          field("right", $._expression),
        ),
      ),
    _assignment_operator: (_) =>
      choice("=", "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=", "<<=", ">>="),

    member_expr: ($) =>
      prec.left(
        PREC.CALL,
        seq(field("object", $._expression), ".", field("field", $.identifier)),
      ),

    call_expr: ($) =>
      prec.left(
        PREC.CALL,
        seq(
          field(
            "function",
            choice(
              $.identifier,
              $.member_expr,
              $.new_expr,
              $._parenthesized_expr,
            ),
          ),
          field("arguments", $.arg_list),
        ),
      ),

    new_expr: ($) =>
      prec(
        PREC.CALL + 1,
        seq("new", field("type", $.type_path), field("args", $.arg_list)),
      ),

    function_expr: ($) =>
      seq(
        "function",
        optional($.type_params),
        "(",
        optional($.param_list),
        ")",
        optional(seq(":", $.type_path)),
        field("body", choice($.block, $._expression)),
      ),

    return_expr: ($) => seq("return", optional($._expression)),

    arrow_function_expr: ($) =>
      prec.right(
        PREC.CALL + 1,
        seq(
          field(
            "params",
            choice(
              seq(
                "(",
                optional($.param_list),
                ")",
                optional(seq(":", $.type_path)),
              ),
              choice($.identifier, "_"),
            ),
          ),
          "->",
          field("body", $._expression),
        ),
      ),

    arg_list: ($) =>
      seq(
        "(",
        optional(seq($._expression, repeat(seq(",", $._expression)))),
        ")",
      ),

    macro_expr: ($) =>
      prec.right(
        PREC.CALL + 1,
        seq($._macro_keyword, field("body", $._macro_body)),
      ),
    _macro_keyword: (_) => "macro",
    _macro_body: ($) => choice($.macro_splice, $._expression),
    macro_splice: ($) =>
      choice(
        seq("$v", "{", $._expression, "}"),
        seq("${", $._expression, "}"),
        seq("$a", "{", commaSep1($._expression), "}"),
        seq("$b", "{", repeat($._expression), "}"),
        seq("$i", "{", $.identifier, "}"),
        seq("$p", "{", commaSep1($.identifier), "}"),
      ),

    cast_expr: ($) =>
      choice(
        prec.right(PREC.UNARY, seq("cast", field("expression", $._expression))),
        seq(
          "cast",
          "(",
          field("expression", $._expression),
          ",",
          field("type", $.type_path),
          ")",
        ),
      ),

    untyped: ($) => seq("untyped", $._expression),

    array_access: ($) =>
      prec.left(PREC.CALL, seq($._expression, "[", $._expression, "]")),

    binop: ($) =>
      choice(
        prec.left(
          PREC.LOGICAL_OR,
          seq(
            field("left", $._expression),
            field("operator", "||"),
            field("right", $._expression),
          ),
        ),
        prec.left(
          PREC.LOGICAL_AND,
          seq(
            field("left", $._expression),
            field("operator", "&&"),
            field("right", $._expression),
          ),
        ),
        prec.left(
          PREC.BITWISE_OR,
          seq(
            field("left", $._expression),
            field("operator", "|"),
            field("right", $._expression),
          ),
        ),
        prec.left(
          PREC.BITWISE_XOR,
          seq(
            field("left", $._expression),
            field("operator", "^"),
            field("right", $._expression),
          ),
        ),
        prec.left(
          PREC.BITWISE_AND,
          seq(
            field("left", $._expression),
            field("operator", "&"),
            field("right", $._expression),
          ),
        ),
        prec.left(
          PREC.EQUALITY,
          seq(
            field("left", $._expression),
            field("operator", choice("==", "!=")),
            field("right", $._expression),
          ),
        ),
        prec.left(
          PREC.RELATIONAL,
          seq(
            field("left", $._expression),
            field("operator", choice("<", ">", "<=", ">=")),
            field("right", $._expression),
          ),
        ),
        prec.left(
          PREC.SHIFT,
          seq(
            field("left", $._expression),
            field("operator", choice("<<", ">>", ">>>")),
            field("right", $._expression),
          ),
        ),
        prec.left(
          PREC.ADD,
          seq(
            field("left", $._expression),
            field("operator", choice("+", "-")),
            field("right", $._expression),
          ),
        ),
        prec.left(
          PREC.MULT,
          seq(
            field("left", $._expression),
            field("operator", choice("*", "/", "%")),
            field("right", $._expression),
          ),
        ),
        prec.left(
          PREC.NULL_COALESCE,
          seq(
            field("left", $._expression),
            field("operator", "??"),
            field("right", $._expression),
          ),
        ),
      ),

    unop: ($) =>
      choice(
        prec.right(
          PREC.UNARY,
          seq(
            field("operator", choice("++", "--", "+", "-", "!", "~")),
            field("operand", $._expression),
          ),
        ),
        prec.left(
          PREC.CALL,
          seq(
            field("operand", $._expression),
            field("operator", choice("++", "--")),
          ),
        ),
      ),
    //TODO: expose?
    // _unop: ($) => choice($.unop_pre, $.unop_post),
    // unop_pre: ($) =>
    //   prec.right(
    //     PREC.UNARY,
    //     seq(
    //       field("operator", choice("++", "--", "+", "-", "!", "~")),
    //       field("operand", $._expression),
    //     ),
    //   ),
    // unop_post: ($) =>
    //   prec.left(
    //     PREC.UNARY,
    //     seq(
    //       field("operand", $._expression),
    //       field("operator", choice("++", "--")),
    //     ),
    //   ),
    ternop: ($) =>
      prec.right(
        PREC.NULL_COALESCE - 1, // slightly lower than ?? but higher than assignment
        seq(
          field("condition", $._expression),
          "?",
          field("consequence", $._expression),
          ":",
          field("alternative", $._expression),
        ),
      ),

    // Literals ---------------------------------------------------------------

    literal: ($) =>
      choice(
        $.int,
        $.string,
        $.true,
        $.false,
        $.null,
        $.regexp,
        $.array,
        $.map,
        $.object,
        $.range,
      ),

    int: (_) =>
      token(
        choice(
          /0x[a-fA-F\d][a-fA-F\d_]*/,
          /0b[01][01_]*/,
          /0o[0-7][0-7_]*/,
          /\d[\d_]*/,
        ),
      ),

    float: (_) =>
      token(
        choice(
          /\d[\d_]*\.\d[\d_]*([ee][+-]?\d[\d_]*)?/,
          /\d[\d_]+[ee][+-]?\d[\d_]*/,
        ),
      ),

    string: ($) =>
      choice(
        seq(
          "'",
          repeat(
            choice(
              alias(token.immediate(prec(1, /[^'\\$]+/)), $.fragment),
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
              alias(token.immediate(prec(1, /[^"\\$]+/)), $.fragment),
              $.escape_sequence,
            ),
          ),
          '"',
        ),
      ),
    escape_sequence: () => token.immediate(seq("\\", /./)),
    interpolation: ($) =>
      choice(seq("${", $._expression, "}"), seq("$", $.identifier)),

    regexp: (_) =>
      token(seq("~/", repeat(choice(/[^/\\\n]/, /\\./)), "/", /[gimsu]*/)),

    true: (_) => token("true"),
    false: (_) => token("false"),
    null: (_) => token("null"),

    array: ($) =>
      prec.right(
        choice(
          seq("[", optional(commaSep1($._expression)), optional(","), "]"),
          seq(
            "[",
            "for",
            "(",
            field("iterator", $.identifier),
            "in",
            field("iterable", $._expression),
            ")",
            optional(seq("if", field("condition", $._expression))),
            field("result", $._expression),
            "]",
          ),
          seq(
            "[",
            "while",
            "(",
            field("condition", $._expression),
            ")",
            field("result", $._expression),
            "]",
          ),
        ),
      ),

    map: ($) =>
      prec.right(
        choice(
          seq("[", commaSep1(seq($._expression, "=>", $._expression)), optional(","), "]"),
          seq(
            "[",
            "for",
            "(",
            field("iterator", $.identifier),
            "in",
            field("iterable", $._expression),
            ")",
            optional(seq("if", field("condition", $._expression))),
            field("key", $._expression),
            "=>",
            field("value", $._expression),
            "]",
          ),
          seq(
            "[",
            "while",
            "(",
            field("condition", $._expression),
            ")",
            field("key", $._expression),
            "=>",
            field("value", $._expression),
            "]",
          ),
        ),
      ),

    object: ($) =>
      seq("{", optional(seq(commaSep1($.object_field), optional(","))), "}"),
    object_field: ($) =>
      seq(
        field("key", choice($.identifier, $.string)),
        ":",
        field("value", $._expression),
      ),

    range: ($) =>
      prec.left(PREC.RANGE, seq($._expression, "...", $._expression)),

    // Statements -------------------------------------------------------------

    _statement: ($) =>
      choice(
        $.conditional,
        $.block,
        $.function_decl,
        $.break_stmt,
        $.continue_stmt,
        $.return_stmt,
        $.throw_stmt,
        $.type_trace_stmt,
        $.if_stmt,
        $.switch_stmt,
        $.for_stmt,
        $.while_stmt,
        $.do_stmt,
        $.try_stmt,
        $.var_decl,
        $._expr_stmt,
        $.function_decl,
      ),

    _expr_stmt: ($) => seq($._expression, $._semicolon),

    break_stmt: ($) => seq("break", $._semicolon),
    continue_stmt: ($) => seq("continue", $._semicolon),
    return_stmt: ($) =>
      seq("return", optional($._expression), optional($._semicolon)),
    throw_stmt: ($) => seq("throw", $._expression, $._semicolon),
    type_trace_stmt: ($) => seq("$(", $._expression, ")", $._semicolon),

    if_stmt: ($) =>
      prec.right(
        seq(
          "if",
          "(",
          $._expression,
          ")",
          $._statement,
          optional(seq("else", $._statement)),
        ),
      ),

    switch_stmt: ($) =>
      seq(
        "switch",
        $._expression,
        "{",
        repeat($.switch_case),
        optional($.switch_default),
        "}",
      ),
    switch_case: ($) =>
      seq(
        "case",
        field("pattern", optional(commaSep1($.pattern))),
        optional(seq("if", field("guard", $._expression))),
        ":",
        repeat($._statement),
      ),
    switch_default: ($) =>
      seq(choice("default", "_"), ":", repeat($._statement)),
    object_pattern: ($) =>
      seq(
        "{",
        commaSep1(
          seq(
            field("key", $.identifier),
            ":",
            field(
              "value",
              choice(
                $.identifier,
                $.int,
                $.string,
                $.true,
                $.false,
                $.null,
                $.call_expr,
                $.object_pattern, // nested patterns
              ),
            ),
          ),
        ),
        optional(","),
        "}",
      ),

    for_stmt: ($) =>
      seq("for", "(", $.identifier, "in", $._expression, ")", $._statement),

    while_stmt: ($) => seq("while", "(", $._expression, ")", $._statement),
    do_stmt: ($) =>
      seq(
        "do",
        field("body", $._statement),
        "while",
        field("condition", $._parenthesized_expr),
        $._semicolon,
      ),

    try_stmt: ($) => seq("try", $.block, repeat1($.catch_clause)),

    catch_clause: ($) =>
      seq("catch", "(", $.identifier, ":", $.type_path, ")", $.block),

    block: ($) => seq("{", repeat($._statement), "}"),

    pattern: ($) =>
      choice("_", $.identifier, $.literal, $.call_pattern, $.object_pattern),

    _pattern_arg: ($) => choice($.pattern, seq($.identifier, "=", $.pattern)),

    call_pattern: ($) =>
      seq($.identifier, "(", optional(commaSep($._pattern_arg)), ")"),

    package_stmt: ($) => seq("package", optional($.package_path), $._semicolon),

    import_stmt: ($) =>
      seq(
        "import",
        choice(
          $.type_path,
          seq($.package_path, ".", $.wildcard),
          seq($.type_path, ".", $.wildcard),
          seq($.type_path, choice("as", "in"), field("as", $.identifier)),
        ),
        $._semicolon,
      ),

    using_stmt: ($) => seq("using", $.type_path, $._semicolon),

    // Declarations -----------------------------------------------------------

    _type_decl: ($) =>
      choice(
        $.abstract_decl,
        $.class_decl,
        $.interface_decl,
        $.enum_decl,
        $.typedef_decl,
      ),

    abstract_decl: ($) =>
      seq(
        optional($._prefix),
        optional($.abstract_enum_modifier),
        "abstract",
        field("name", $.identifier),
        optional($.type_decl_params),
        optional(seq("(", field("underlying_type", $.type_path), ")")),
        optional(seq("from", field("from_type", $.type_path))),
        optional(seq("to", field("to_type", $.type_path))),
        optional($.block),
      ),
    abstract_enum_modifier: (_) => "enum",

    class_decl: ($) =>
      seq(
        optional($._prefix),
        "class",
        field("name", $.identifier),
        optional($.type_decl_params),
        optional($.class_extends),
        repeat($.class_implements),
        $.class_body,
      ),
    class_body: ($) => seq("{", repeat($.class_member), "}"),
    class_member: ($) =>
      choice($.var_decl, $.function_decl, $.constructor_decl),
    class_extends: ($) => seq("extends", $.type_path),
    class_implements: ($) => seq("implements", $.type_path),

    constructor_decl: ($) =>
      seq(
        optional($._prefix),
        "function",
        "new",
        optional($.type_params),
        "(",
        optional($.param_list),
        ")",
        optional($.block),
      ),

    type_path_list: ($) => seq($.type_path, repeat(seq(",", $.type_path))),

    var_decl: ($) =>
      seq(
        optional($._prefix),
        choice("var", "final"),
        field("name", $.identifier),
        optional($.property_accessor), //TODO: move to class_var_decl, interface_var_decl
        optional(seq(":", field("type", $.type_path))),
        optional(seq("=", field("value", $._expression))),
        $._semicolon,
      ),
    property_accessor: ($) =>
      seq(
        "(",
        field("get", $.property_access_identifier),
        ",",
        field("set", $.property_access_identifier),
        ")",
      ),
    property_access_identifier: ($) =>
      choice($.identifier, "default", "null", "get", "set", "dynamic", "never"),

    enum_decl: ($) =>
      seq(
        optional($._prefix),
        "enum",
        field("name", $.identifier),
        optional($.type_decl_params),
        optional($.enum_body),
      ),
    enum_body: ($) =>
      seq("{", repeat(seq($.enum_item, optional($._semicolon))), "}"),
    enum_item: ($) =>
      seq(
        field("name", $.identifier),
        optional(seq(":", $.type_path)),
        optional(seq("(", optional(commaSep1($.enum_param)), ")")),
      ),
    enum_param: ($) =>
      seq(
        optional("?"),
        field("name", $.identifier),
        optional(seq(":", $.type_path)),
      ),

    typedef_decl: ($) =>
      seq(
        optional($._prefix),
        "typedef",
        field("name", $.identifier),
        optional($.type_decl_params),
        "=",
        choice($.identifier, $.typedef_block),
        optional($._semicolon),
      ),
    typedef_block: ($) =>
      seq(
        "{",
        repeat(
          seq(
            choice(
              seq(">", field("extends", $.type_path)),
              $.var_decl,
              seq($.identifier, ":", $.type_path),
            ),
            optional(","),
            optional($._semicolon),
          ),
        ),
        "}",
      ),

    interface_decl: ($) =>
      seq(
        optional($._prefix),
        "interface",
        field("name", $.identifier),
        optional($.type_decl_params),
        optional($.block),
      ),

    function_decl: ($) =>
      seq(
        optional($._prefix),
        "function",
        field("name", $.identifier),
        optional($.type_decl_params),
        "(",
        optional($.param_list),
        ")",
        optional(seq(":", $.type_path)),
        optional($.block),
      ),

    param_list: ($) => seq($.param, repeat(seq(",", $.param))),
    param: ($) =>
      seq(
        optional($.optional),
        field("name", $.identifier),
        optional(seq(":", field("type", $.type_path))),
        optional(seq("=", field("value", $._expression))),
      ),

    // Conditional compilation ------------------------------------------------

    conditional: ($) =>
      seq(
        // $.conditional_if,
        "#if",
        field("condition", $._conditional_expr),
        field("consequence", repeat(choice($._statement, $.metadata))),
        repeat($.conditional_elseif),
        optional($.conditional_else),
        optional($.conditional_error),
        $.conditional_end,
      ),
    conditional_elseif: ($) =>
      seq("#elseif", field("condition", $._expression), repeat($._statement)),
    conditional_else: ($) => seq("#else", repeat($._statement)),
    conditional_error: ($) => seq("#error", $.string),
    conditional_end: (_) => "#end",
    _conditional_expr: ($) =>
      choice(
        $.identifier,
        $.int,
        $.float,
        $.true,
        $.false,
        $.null,
        seq("!", $._conditional_expr), // unary
        seq($._conditional_expr, "&&", $._conditional_expr), // binop
        seq($._conditional_expr, "||", $._conditional_expr),
        // etc, just enough to handle #if/#elseif conditions
      ),

    statement_or_expr: ($) => choice($._statement, $._expr_stmt),

    // Types ------------------------------------------------------------------

    type_name: ($) => $._pascal_case_identifier,

    type_path: ($) =>
      seq(
        optional(seq(field("package", $.package_path), ".")),
        $.type_name,
        optional($.type_params),
        repeat(seq(".", field("sub", $.identifier))),
      ),

    type_params: ($) => seq("<", commaSep1($.type_path), ">"),
    type_decl_params: ($) => seq("<", commaSep1($.type_decl_param), ">"),
    type_decl_param: ($) =>
      seq(
        $.type_name,
        choice(
          optional(seq(":", field("constraint", sep1(" & ", $.type_path)))),
          optional(seq("=", field("default", $.type_path))),
        ),
      ),

    package_path: ($) => dotSep1($.pack),
    pack: (_) => /[a-z_]+[a-zA-Z0-9]*/,

    // Modifiers / Metadata ---------------------------------------------------

    _modifier: ($) =>
      choice(
        alias("abstract", $.abstract),
        alias("extern", $.extern),
        alias("final", $.final),
        alias("inline", $.inline),
        alias("override", $.override),
        alias("private", $.private),
        alias("public", $.public),
        alias("static", $.static),
      ),

    metadata: ($) =>
      prec.right(
        seq(
          "@",
          optional(token.immediate(":")),
          field("name", $.identifier),
          optional(seq("(", field("args", $.metadata_args), ")")),
        ),
      ),
    metadata_args: ($) => seq($._expression, repeat(seq(",", $._expression))),

    _prefix: ($) => repeat1(choice($._modifier, $.metadata)),

    // Tokens -----------------------------------------------------------------

    identifier: (_) => /[a-zA-Z_]+[a-zA-Z0-9]*/,

    optional: (_) => "?",
    wildcard: (_) => "*",

    _pascal_case_identifier: (_) => /[A-Z][a-zA-Z0-9_]*/,
    _semicolon: (_) => ";",

    comment: ($) => choice($.line_comment, $.block_comment),
    block_comment: (_) => token(seq("/*", /[^*]*\*+([^/*][^*]*\*+)*\//)),
    line_comment: (_) => token(seq("//", /[^\n]*/)),
  },
});
