// @ts-check
/// <reference types="tree-sitter-cli/dsl" />

const PREC = {
  CONTROL: 0,
  ASSIGN: 1,
  TERNARY: 2,
  NULL_COALESCE: 3,
  LOGICAL_OR: 4,
  LOGICAL_AND: 5,
  BIT_OR: 6,
  BIT_XOR: 7,
  BIT_AND: 8,
  EQUALITY: 9,
  COMPARE: 10,
  IS: 11,
  IN: 12,
  SHIFT: 13,
  ADD: 14,
  MULTIPLY: 15,
  RANGE: 16,
  UNARY: 17,
  POSTFIX: 18,
  PRIMARY: 19,
  CALL: 20,
  // BLOCK: 26,
  OBJECT_DECL: 27,
  TYPE_ANNOTATION: 29,
  TYPE_PARAMS: 31,
  CONDITIONAL: 1001,
  MACRO: -1,
};

/**
 * @param {string|Rule} sep - The separator token or rule
 * @param {Rule} rule - The element rule
 * @returns {Rule}
 */
function sep1(sep, rule) {
  return seq(rule, repeat(seq(sep, rule)));
}
/**
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
/** @param {Rule} rule @returns {Rule} */
const dotSep = (rule) => sep(".", rule);

export default grammar({
  name: "haxe",
  extras: ($) => [/\s+/, $.comment, $.conditional],
  reserved: {
    global: (_) => [
      "abstract",
      "as",
      "break",
      "case",
      "cast",
      "catch",
      "class",
      "continue",
      "default",
      "do",
      "dynamic",
      "else",
      "enum",
      "extends",
      "extern",
      "false",
      "final",
      "for",
      "function",
      "if",
      "implements",
      "import",
      "in",
      "inline",
      "interface",
      "macro",
      "new",
      "null",
      "override",
      "package",
      "private",
      "public",
      "return",
      "static",
      "super",
      "switch",
      "this",
      "throw",
      "true",
      "try",
      "typedef",
      "untyped",
      "using",
      "var",
      "while",
    ],
  },
  conflicts: ($) => [
    [
      $.AbstractType,
      $.ClassMethod,
      $.ClassType,
      $.ClassVar,
      $.DefType,
      $.EnumType,
    ],
    [
      $.AbstractType,
      $.ClassMethod,
      $.ClassType,
      $.ClassVar,
      $.DefType,
      $.EnumType,
      $._conditional_body,
    ],
    [$.AbstractType, $.ClassType, $.DefType, $.EnumType],
    [$.AbstractType, $.DefType, $.EnumType, $._conditional_body],
    [$.AbstractType, $.DefType, $.EnumType],
    [$.AbstractType, $._conditional_body],
    [$.ClassMethod, $._conditional_body],
    [$.ClassType, $._conditional_body],
    [$.ClassVar, $.ClassMethod, $._conditional_body],
    [$.ClassVar, $.ClassMethod],
    [$.ClassVar, $._conditional_body],
    [$.DefType, $.EnumType, $._conditional_body],
    [$.EBlock, $.EObjectDecl],
    [$.ECall, $.EFunction, $.ClassMethod],
    [$.ECall],
    [$.EFunction],
    [$.TypePath],
    [$._EConst, $.FunctionArg, $.compile_condition],
    [$._EConst, $.FunctionArg],
    [$._EConst, $._expr_lhs, $.compile_condition],
    [$._EConst, $._expr_lhs],
    [$._EConst, $.compile_condition],
    [$._Expr, $._expr_value],
    [$._block_or_expr, $._comprehension_body],
    [$._block_or_expr],
    [$._class_field, $._conditional_body],
    [$._expr_atom, $.ESwitch],
    [$._expr_atom, $._expr_value],
    [$._expr_lhs, $.compile_condition],
    [$._expr_meta, $.ECall],
    [$._expr_postfix, $._expr_lhs],
    [$._expr_prim, $._block_or_expr],
    [$._expr_prim, $._expr_value],
    [$._expr_stmt, $.EArrayDecl],
    [$._type_decl, $._class_field, $._conditional_body],
    [$._type_decl, $._conditional_body],
    [$.cases],
    [$.import],
  ],
  inline: ($) => [
    $._semicolon,
    $.visibility,
    $.rest,
    //
  ],
  word: ($) => $.identifier,
  rules: {
    module: ($) =>
      seq(
        optional($.package),
        repeat(choice($.import, $.using)),
        repeat(choice($._type_decl, $._expr_statement)),
      ),

    //////////////////////////////////////////////////////////////////////////

    package: ($) => seq("package", dotSep($.package_name), $._semicolon),

    import: ($) =>
      seq(
        "import",
        choice(
          seq(
            field("path", repeat(seq($.package_name, "."))),
            field("module", $.type_name),
            optional(field("sub", repeat1(seq(".", $.identifier)))),
            optional(
              choice(
                seq(".", $.wildcard),
                seq("as", field("alias", choice($.type_name, $.identifier))),
              ),
            ),
          ),
          seq(
            field(
              "path",
              seq(
                dotSep1($.package_name),
                "as",
                field("alias", choice($.type_name, $.identifier)),
              ),
            ),
          ),
          seq(field("path", repeat1(seq($.package_name, "."))), $.wildcard),
        ),
        $._semicolon,
      ),

    using: ($) =>
      seq(
        "using",
        field("path", optional(seq(dotSep($.package_name), "."))),
        repeat(seq($.type_name, ".")),
        field("type", $.type_name),
        $._semicolon,
      ),

    ///////////////////////////////////////////////////////////////////////////

    _expr_statement: ($) => seq($._Expr, optional($._semicolon)),

    _Expr: ($) => choice($.EBinop, $.ETernary, $.EUnop, $._expr_postfix),
    _expr_postfix: ($) => choice($.ECall, $.EField, $.EArray, $._expr_prim),
    _expr_prim: ($) =>
      choice($._expr_atom, $._expr_stmt, $._expr_meta, $.EBlock),
    _expr_atom: ($) =>
      choice($._EConst, $._EParenthesis, $.EObjectDecl, $.EArrayDecl, $.ENew),
    _expr_stmt: ($) =>
      choice(
        $.EBreak,
        $.EContinue,
        $.EFor,
        $.EIf,
        $.EReturn,
        $.ESwitch,
        $.EThrow,
        $.ETry,
        $.EVars,
        $.EWhile,
      ),
    _expr_meta: ($) =>
      choice(
        $.EArrowFunction,
        $.ECast,
        $.ECheckType,
        $.EFunction,
        $.EMeta,
        $.EUntyped,
        //
        $.macro,
        $.reification,
        $.type_trace,
        $.wildcard_pattern,
      ),
    _expr_value: ($) =>
      choice(
        $._expr_postfix,
        $._expr_atom,
        $.EObjectDecl,
        $.EArrayDecl,
        $.ENew,
      ),
    _expr_lhs: ($) => choice($.identifier, $.EField, $.EArray),

    _block_or_expr: ($) =>
      choice(
        prec.dynamic(1, $.EBlock),
        prec.dynamic(-1, seq($._Expr, optional($._semicolon))),
      ),

    ECall: ($) =>
      prec.left(
        PREC.CALL,
        seq(
          optional("inline"),
          field(
            "callee",
            choice(
              $._EParenthesis,
              $.ECall, //TODO: should not be required
              $.EField,
              $.identifier,
              $.super,
            ),
          ),
          "(",
          field("args", commaSep(choice($.reification, $._Expr))),
          ")",
        ),
      ),
    EField: ($) =>
      prec.left(
        PREC.CALL,
        seq(
          field("object", $._Expr),
          choice(".", alias("?.", $.optional)),
          seq(optional("$"), field("name", $.identifier)),
        ),
      ),
    EArray: ($) =>
      prec.left(
        PREC.CALL,
        seq(field("array", $._Expr), "[", field("index", $._Expr), "]"),
      ),
    _EConst: ($) =>
      choice(
        $.Int,
        $.Float,
        $.String,
        $.Regexp,
        $.true,
        $.false,
        $.null,
        $.this,
        $.super,
        $.identifier,
      ),
    _EParenthesis: ($) => prec(PREC.PRIMARY, seq("(", $._Expr, ")")),
    ENew: ($) =>
      prec.left(PREC.CALL, seq("new", $.TypePath, "(", commaSep($._Expr), ")")),
    EFunction: ($) =>
      prec.right(PREC.CONTROL - 1, seq(optional("inline"), $._function_decl)),
    EArrowFunction: ($) =>
      prec.right(
        PREC.CONTROL - 1,
        seq(
          choice(
            seq("(", ")"),
            field("args", $.identifier),
            seq(field("args", $._function_args), optional($._type_annotation)),
          ),
          "->",
          field("body", $._block_or_expr),
        ),
      ),
    EVars: ($) =>
      prec.right(
        PREC.ASSIGN,
        seq(
          choice("var", "final"),
          commaSep1(
            seq(
              field("name", $.identifier),
              optional(field("type", $._type_annotation)),
              optional(
                seq("=", field("value", prec(PREC.ASSIGN + 1, $._Expr))),
              ),
            ),
          ),
        ),
      ),
    ETernary: ($) =>
      prec.right(
        PREC.TERNARY,
        seq(
          field("cond", choice($._expr_postfix, $.EBinop, $.EUnop)),
          "?",
          field("if", $._Expr),
          ":",
          field("else", $._Expr),
        ),
      ),
    EBinop: ($) => {
      const BINOPS = [
        {
          ops: [
            "=>",
            "=",
            "+=",
            "-=",
            "*=",
            "/=",
            "%=",
            "&=",
            "|=",
            "^=",
            "<<=",
            ">>=",
            ">>>=",
          ],
          prec: PREC.ASSIGN,
          assoc: "right",
        },
        { ops: ["??"], prec: PREC.NULL_COALESCE, assoc: "right" },
        { ops: ["||"], prec: PREC.LOGICAL_OR },
        { ops: ["&&"], prec: PREC.LOGICAL_AND },
        { ops: ["|"], prec: PREC.BIT_OR },
        { ops: ["^"], prec: PREC.BIT_XOR },
        { ops: ["&"], prec: PREC.BIT_AND },
        { ops: ["==", "!="], prec: PREC.EQUALITY },
        { ops: [">", ">=", "<", "<="], prec: PREC.COMPARE },
        { ops: ["is"], prec: PREC.IS, rhs: $.TypePath },
        { ops: ["in"], prec: PREC.IN },
        { ops: ["<<", ">>", ">>>"], prec: PREC.SHIFT },
        { ops: ["+", "-"], prec: PREC.ADD },
        { ops: ["*", "/", "%"], prec: PREC.MULTIPLY },
        { ops: ["..."], prec: PREC.RANGE },
      ];
      return choice(
        ...BINOPS.map(({ ops, prec: level, assoc, rhs }) => {
          const op = ops.length === 1 ? ops[0] : choice(...ops);
          const rule = seq(
            field("left", $._Expr),
            field("op", op),
            field("right", rhs || $._Expr),
          );
          return assoc === "right"
            ? prec.right(level, rule)
            : prec.left(level, rule);
        }),
      );
    },
    EUnop: ($) =>
      choice(
        prec.right(
          PREC.UNARY,
          seq(
            field("op", choice("++", "--", "+", "-", "!", "~")),
            field("operand", $._expr_value),
          ),
        ),
        prec.left(
          PREC.POSTFIX,
          seq(field("operand", $._expr_lhs), field("op", choice("++", "--"))),
        ),
      ),
    EBlock: ($) => prec.dynamic(-1, seq("{", repeat($._expr_statement), "}")),
    EObjectDecl: ($) =>
      prec.dynamic(
        -1,
        seq(
          "{",
          commaSep(
            seq(
              field("name", choice($.identifier, $.String)),
              ":",
              field("value", $._expr_value),
            ),
          ),
          "}",
        ),
      ),
    EArrayDecl: ($) =>
      seq(
        "[",
        optional(
          choice(
            commaSep($._Expr),
            alias($._comprehension_for, $.EFor),
            $.EWhile,
          ),
        ),
        "]",
      ),
    _comprehension_for: ($) =>
      seq(
        "for",
        "(",
        choice(
          seq(field("key", $.identifier), "=>", field("value", $.identifier)),
          field("var", $.identifier),
        ),
        "in",
        field("iterable", $._Expr),
        ")",
        field("body", $._comprehension_body),
      ),
    _comprehension_if: ($) =>
      seq(
        "if",
        "(",
        field("cond", $._Expr),
        ")",
        field("if", $._comprehension_body),
      ),
    _comprehension_body: ($) =>
      choice(
        alias($._comprehension_for, $.EFor),
        alias($._comprehension_if, $.EIf),
        $._Expr,
      ),
    EReturn: ($) => prec.right(PREC.CONTROL, seq("return", optional($._Expr))),
    EBreak: (_) => prec.right(PREC.CONTROL, "break"),
    EContinue: (_) => prec.right(PREC.CONTROL, "continue"),
    EThrow: ($) =>
      prec.right(PREC.CONTROL, seq("throw", field("expr", $._Expr))),
    ECast: ($) =>
      prec.right(
        PREC.CALL + 1,
        seq(
          "cast",
          choice(
            field("expr", $._Expr),
            seq(
              "(",
              field("expr", $._Expr),
              ",",
              field("type", $.ComplexType),
              ")",
            ),
          ),
        ),
      ),
    EUntyped: ($) => prec.right(seq("untyped", $._Expr)),
    EFor: ($) =>
      prec(
        PREC.PRIMARY + 1,
        seq(
          "for",
          "(",
          choice(
            seq(field("key", $.identifier), "=>", field("value", $.identifier)),
            field("var", $.identifier),
          ),
          "in",
          field("iterable", $._Expr),
          ")",
          field("body", $._block_or_expr),
        ),
      ),
    EIf: ($) =>
      prec.right(
        PREC.CONTROL + 1,
        seq(
          "if",
          "(",
          field("cond", $._Expr),
          ")",
          field("if", $._block_or_expr),
          optional(seq("else", field("else", $._block_or_expr))),
        ),
      ),
    EWhile: ($) =>
      prec.right(
        PREC.CONTROL + 1,
        choice(
          seq(
            "while",
            "(",
            field("cond", $._Expr),
            ")",
            field("body", $._block_or_expr),
          ),
          seq(
            "do",
            field("body", $._block_or_expr),
            "while",
            "(",
            field("cond", $._Expr),
            ")",
          ),
        ),
      ),
    ESwitch: ($) =>
      prec(
        PREC.CONTROL,
        seq(
          "switch",
          field("subject", choice($._EParenthesis, $._Expr)),
          "{",
          optional(field("cases", $.cases)),
          optional(field("default", $.switch_default)),
          "}",
        ),
      ),
    cases: ($) => repeat1($.switch_case),
    switch_case: ($) =>
      prec.dynamic(
        -1,
        seq(
          "case",
          field("patterns", commaSep1($._Expr)),
          ":",
          field("body", repeat(seq($._Expr, optional($._semicolon)))),
        ),
      ),
    switch_default: ($) =>
      prec.right(
        1,
        seq(
          choice("default", seq("case", alias($.wildcard_pattern, ""))),
          ":",
          field("body", repeat(seq($._Expr, optional($._semicolon)))),
        ),
      ),
    ETry: ($) =>
      prec.right(
        seq(
          "try",
          $._block_or_expr,
          repeat1(
            seq(
              "catch",
              "(",
              $.identifier,
              optional($._type_annotation),
              ")",
              field("body", $._block_or_expr),
            ),
          ),
        ),
      ),
    ECheckType: ($) =>
      prec.right(
        PREC.TYPE_ANNOTATION,
        seq("(", field("expr", $._Expr), $._type_annotation, ")"),
      ),
    EMeta: ($) =>
      prec.right(
        PREC.PRIMARY,
        seq(repeat1($.MetaDataEntry), field("expr", $._Expr)),
        // seq(
        //   repeat1($.MetaDataEntry),
        //   field("expr", choice($._type_decl, $.EFunction, $.EVars)),
        // ),
      ),

    macro: ($) => prec(PREC.MACRO, seq("macro", $._Expr)),
    reification: ($) =>
      choice(
        seq("$", $.identifier),
        seq("${", $._Expr, "}"),
        seq("$e{", $._Expr, "}"),
        seq("$a{", commaSep($._Expr), "}"),
        seq("$b{", repeat(seq($._Expr, optional($._semicolon))), "}"),
        seq("$i{", $.identifier, "}"),
        seq("$p{", commaSep($.identifier), "}"),
        seq("$v{", $._Expr, "}"),
      ),

    type_trace: ($) =>
      prec(PREC.CALL + 1, seq("$type", "(", field("type", $._Expr), ")")),

    // ------------------------------------------------------------------------

    TypePath: ($) =>
      seq(
        repeat(seq(field("pack", $.package_name), ".")),
        field("name", $.type_name),
        optional(field("sub", prec.left(PREC.PRIMARY, seq(".", $.identifier)))),
        optional(field("params", $._type_arguments)),
      ),

    ComplexType: ($) =>
      choice(
        $._base_type,
        prec.left(
          2,
          field("TIntersection", seq($.ComplexType, "&", $.ComplexType)),
        ),
        prec.right(
          1,
          field(
            "TFunction",
            seq(field("arg", $._base_type), "->", field("ret", $.ComplexType)),
          ),
        ),
      ),

    _base_type: ($) =>
      choice(
        //field("TPath", prec(PREC.PRIMARY, $.TypePath)),
        prec(PREC.PRIMARY, $.TypePath),
        $.TAnonymous,
        seq("(", $.ComplexType, ")"),
      ),

    TAnonymous: ($) =>
      prec.right(
        seq(
          "{",
          sep(
            choice(",", $._semicolon),
            choice($.AnonymousField, seq(">", field("extends", $.TypePath))),
          ),
          optional(choice(",", $._semicolon)),
          "}",
          optional($._semicolon),
        ),
      ),
    AnonymousField: ($) =>
      seq(
        repeat($.MetaDataEntry),
        choice(
          seq(
            optional($.optional),
            field("name", $.identifier),
            ":",
            field("type", $.ComplexType),
          ),
          seq(
            optional(choice("var", "final")),
            field("name", $.identifier),
            $._type_annotation,
          ),
          seq(
            "function",
            field("name", $.identifier),
            optional(field("params", $._type_params)),
            $._function_args,
            optional(field("ret", $._type_annotation)),
          ),
        ),
      ),

    TypeParameter: ($) =>
      seq(
        field("name", $.type_name),
        choice(
          optional(seq(":", field("constraint", $.ComplexType))),
          optional(seq("=", field("default", $.ComplexType))),
        ),
      ),

    MetaDataEntry: ($) =>
      prec.right(
        seq(
          "@",
          optional(token.immediate(":")),
          field("name", choice($.identifier, alias("macro", $.identifier))),
          optional(seq("(", field("params", commaSep($._Expr)), ")")),
        ),
      ),

    FunctionArg: ($) =>
      //ISSUE: without dynamic ECast fails
      prec.dynamic(
        1,
        seq(
          repeat($.MetaDataEntry),
          optional($.optional),
          optional(field("rest", $.rest)),
          field("name", $.identifier),
          optional(field("type", $._type_annotation)),
          optional(seq("=", field("value", $._Expr))),
        ),
      ),

    // ------------------------------------------------------------------------

    _type_decl: ($) =>
      seq(
        field("meta", repeat($.MetaDataEntry)),
        choice($.AbstractType, $.ClassType, $.DefType, $.EnumType),
      ),

    AbstractType: ($) =>
      seq(
        optional(repeat1(choice($.visibility, "enum"))),
        "abstract",
        $._type_decl_signature,
        "(",
        field("type", $.ComplexType),
        ")",
        repeat(
          choice(
            field("from", seq("from", $.TypePath)),
            field("to", seq("to", $.TypePath)),
          ),
        ),
        "{",
        repeat($._class_field),
        "}",
      ),

    ClassType: ($) =>
      seq(
        optional(repeat1(choice($.visibility))),
        choice("class", "interface"),
        $._type_decl_signature,
        optional(seq("extends", field("extends", $.TypePath))),
        repeat(seq("implements", field("implements", $.TypePath))),
        "{",
        repeat($._class_field),
        "}",
      ),
    _class_field: ($) =>
      seq(repeat($.MetaDataEntry), choice($.ClassVar, $.ClassMethod)),
    ClassVar: ($) =>
      prec.left(
        PREC.ASSIGN,
        seq(
          optional(
            repeat1(choice($.visibility, "dynamic", "inline", "static")),
          ),
          choice("var", "final"),
          field("name", $.identifier),
          optional($.property_accessor),
          optional($._type_annotation),
          optional(seq("=", $._Expr)),
          $._semicolon,
        ),
      ),
    property_accessor: ($) =>
      seq(
        "(",
        field("get", $.property_access),
        ",",
        field("set", $.property_access),
        ")",
      ),
    property_access: ($) =>
      choice(
        alias("default", $.default),
        alias("get", $.get),
        alias("set", $.set),
        alias("dynamic", $.dynamic),
        alias("never", $.never),
        $.null,
        $.identifier,
      ),
    ClassMethod: ($) =>
      prec.right(
        PREC.ASSIGN,
        seq(
          optional(
            repeat1(
              choice(
                $.visibility,
                "macro",
                "dynamic",
                "inline",
                "override",
                "final",
                "static",
              ),
            ),
          ),
          $._function_decl,
          optional($._semicolon),
        ),
      ),
    DefType: ($) =>
      seq(
        optional(repeat1(choice($.visibility, "extern"))),
        "typedef",
        $._type_decl_signature,
        "=",
        field("type", $.ComplexType),
        optional($._semicolon),
      ),

    EnumType: ($) =>
      seq(
        optional(repeat1(choice($.visibility, "extern"))),
        "enum",
        $._type_decl_signature,
        "{",
        repeat($.EnumConstructor),
        "}",
      ),
    EnumConstructor: ($) =>
      seq(
        field("meta", repeat($.MetaDataEntry)),
        field("name", $.identifier),
        optional(field("params", $._type_params)),
        optional(field("args", $._function_args)),
        $._semicolon,
      ),

    _function_decl: ($) =>
      seq(
        "function",
        optional(
          seq(
            field("name", choice($.identifier, alias("new", $.identifier))),
            optional(field("params", $._type_params)),
          ),
        ),
        $._function_args,
        optional(field("ret", $._type_annotation)),
        //choice(field("body", $._expr_or_block), $._semicolon),
        choice(field("body", $._block_or_expr), $._semicolon),
      ),

    _type_decl_signature: ($) =>
      seq(field("name", $.type_name), optional($._type_params)),

    // ------------------------------------------------------------------------

    Int: (_) =>
      choice(
        /0x[a-fA-F\d][a-fA-F\d_]*/,
        /0b[01][01_]*/,
        /0o[0-7][0-7_]*/,
        /\d[\d_]*/,
      ),

    Float: (_) =>
      choice(
        /\d[\d_]*\.\d[\d_]*([ee][+-]?\d[\d_]*)?/,
        /\d[\d_]+[ee][+-]?\d[\d_]*/,
      ),

    String: ($) =>
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
      choice(seq("${", $._Expr, "}"), seq("$", $.identifier)),

    Regexp: (_) =>
      seq("~/", repeat(choice(/[^/\\\n]/, /\\./)), "/", /[gimsu]*/),

    true: (_) => "true",
    false: (_) => "false",
    null: (_) => "null",
    this: (_) => "this",
    super: (_) => "super",
    rest: (_) => "...",

    // ------------------------------------------------------------------------

    _type_annotation: ($) =>
      prec(PREC.TYPE_ANNOTATION, seq(":", field("type", $.ComplexType))),

    _type_params: ($) => seq("<", commaSep1($.TypeParameter), ">"),
    _type_arguments: ($) => seq("<", commaSep($.ComplexType), ">"),

    _function_args: ($) =>
      seq("(", field("args", commaSep($.FunctionArg)), ")"),

    // ------------------------------------------------------------------------

    visibility: (_) => choice("public", "private"),

    identifier: (_) => /[a-zA-Z_][a-zA-Z0-9_]*/,
    package_name: (_) => /[a-z_][a-zA-Z0-9_]*/,
    type_name: (_) => /[A-Z][a-zA-Z0-9_]*/,

    optional: (_) => "?",
    wildcard: (_) => "*",
    wildcard_pattern: (_) => "_",
    _semicolon: (_) => ";",

    comment: ($) => choice($.line_comment, $.block_comment),
    line_comment: (_) => token(seq("//", /[^\n]*/)),
    block_comment: (_) => token(seq("/*", /[^*]*\*+([^/*][^*]*\*+)*\//)),

    // ------------------------------------------------------------------------

    conditional: ($) =>
      prec.right(
        PREC.CONDITIONAL,
        seq(
          "#if",
          $.compile_condition,
          repeat($._conditional_body),
          repeat($.conditional_elseif),
          optional($.conditional_else),
          $.conditional_end,
        ),
      ),
    compile_condition: ($) =>
      choice(
        $.identifier,
        alias("macro", $.identifier),
        $.Int,
        $.Float,
        $.String,
        seq("(", $.compile_condition, ")"),
        prec.left(7, seq($.compile_condition, ".", $.identifier)),
        prec.right(6, seq("!", $.compile_condition)),
        prec.left(
          5,
          seq($.compile_condition, choice("*", "/", "%"), $.compile_condition),
        ),
        prec.left(
          4,
          seq($.compile_condition, choice("+", "-"), $.compile_condition),
        ),
        prec.left(
          3,
          seq(
            $.compile_condition,
            choice(">", ">=", "<", "<=", "==", "!="),
            $.compile_condition,
          ),
        ),
        prec.left(2, seq($.compile_condition, "&&", $.compile_condition)),
        prec.left(1, seq($.compile_condition, "||", $.compile_condition)),
      ),
    _conditional_body: ($) =>
      choice(
        // ISSUE: adding everything sucks
        $._class_field,
        $._expr_statement,
        $._type_decl,
        $.visibility,
        $.conditional_error,
        repeat1($.MetaDataEntry),
      ),
    conditional_elseif: ($) =>
      seq("#elseif", $.compile_condition, repeat($._conditional_body)),
    conditional_else: ($) => seq("#else", repeat($._conditional_body)),
    conditional_error: ($) => seq("#error", $.String),
    conditional_end: (_) => "#end",
  },
});
