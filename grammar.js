// @ts-check
/// <reference types="tree-sitter-cli/dsl" />

const PREC = {
  CONTROL: 0,
  ASSIGN: 1,
  NULL_COALESCE: 2,
  LOGICAL_OR: 3,
  LOGICAL_AND: 4,
  BIT_OR: 5,
  BIT_XOR: 6,
  BIT_AND: 7,
  EQUALITY: 8,
  COMPARE: 9,
  IS: 10,
  IN: 11,
  SHIFT: 12,
  ADD: 13,
  MULTIPLY: 14,
  RANGE: 15,
  UNARY: 16,
  PRIMARY: 18,
  CALL: 19,
  OBJECT_DECL: 20,
  BLOCK: 25,
  TYPE_ANNOTATION: 28,
  TYPE_PARAMS: 30,
  CONDITIONAL: 1000,
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
    [$.AbstractType, $.ClassType, $.DefType, $.EnumType],
    [$.AbstractType, $.DefType, $.EnumType],
    [$.ClassVar, $.ClassMethod],
    [$.EBinop, $._expr_or_comp],
    [$.EConst, $.FunctionArg, $.compile_condition],
    [$.EConst, $.FunctionArg],
    [$.EConst, $.compile_condition],
    [$.EVars, $.EBinop],
    [$.FunctionArg],
    [$.TypePath],
    [$._expr_prim, $.EArrayDecl],
    [$._expr_prim, $.ECall],
    [$._expr_prim, $._expr_or_comp],
    [$._expr_prim, $._function_body],
    [$._type_decl, $._conditional_body],
    [$.import],
  ],
  word: ($) => $.identifier,
  rules: {
    module: ($) =>
      seq(
        optional($.package),
        repeat(choice($.import, $.using)),
        repeat(choice($._type_decl, $._expr_stmt)),
      ),

    //////////////////////////////////////////////////////////////////////////

    package: ($) => seq("package", dotSep($.identifier), $._semicolon),

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
                choice($.type_name, $.identifier),
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

    _expr_stmt: ($) => seq($._Expr, optional($._semicolon)),

    _Expr: ($) => choice($.EBinop, $.ETernary, $.EUnop, $._expr_atom),
    _expr_atom: ($) => choice($.ECall, $.EField, $.EArray, $._expr_prim),
    _expr_prim: ($) =>
      choice(
        $.EConst,
        $._EParenthesis,
        $.EBlock,
        $.EObjectDecl,
        $.EArrayDecl,
        $.ENew,
        $.EVars,
        $.EFunction,
        $.EArrowFunction,
        $.EReturn,
        $.EBreak,
        $.EContinue,
        $.EThrow,
        $.EFor,
        $.EIf,
        $.EWhile,
        $.ESwitch,
        $.ETry,
        $.ECast,
        $.EUntyped,
        $.ECheckType,
        $.EMeta,
        ///////////////////
        $.macro,
        $.reification,
        $.type_trace,
        $.wildcard_pattern,
      ),

    ECall: ($) =>
      prec.left(
        PREC.CALL,
        seq(
          field(
            "callee",
            choice(
              $.EField,
              $._EParenthesis,
              $.identifier,
              $.EConst,
              $.ECall,
              $.EArray,
              $.ENew,
              $.EFunction,
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
          field("operator", choice(".", "?.")),
          field("name", seq(optional("$"), $.identifier)),
        ),
      ),
    EArray: ($) =>
      prec.left(
        PREC.CALL,
        seq(field("array", $._Expr), "[", field("index", $._Expr), "]"),
      ),
    EConst: ($) =>
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
      prec.right(
        PREC.ASSIGN + 1,
        seq(
          optional("inline"),
          "function",
          optional(
            field("name", choice($.identifier, alias("new", $.identifier))),
          ),
          optional(field("params", $._type_params)),
          $._function_args,
          optional(field("ret", $._type_annotation)),
          field("body", $._function_body),
        ),
      ),
    EArrowFunction: ($) =>
      prec.right(
        PREC.ASSIGN + 1,
        seq(
          choice(
            seq("(", ")"),
            $.identifier,
            $.FunctionArg,
            seq($._function_args, optional($._type_annotation)),
          ),
          "->",
          field("body", $._function_body),
        ),
      ),

    _function_body: ($) => choice($._Expr, $.EBlock),

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
        PREC.NULL_COALESCE - 1,
        seq(
          field("cond", $._Expr),
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
        { ops: ["=>"], prec: PREC.ASSIGN, assoc: "right" },
        { ops: ["??"], prec: PREC.NULL_COALESCE },
        { ops: ["||"], prec: PREC.LOGICAL_OR },
        { ops: ["&&"], prec: PREC.LOGICAL_AND },
        { ops: ["|"], prec: PREC.BIT_OR },
        { ops: ["^"], prec: PREC.BIT_XOR },
        { ops: ["&"], prec: PREC.BIT_AND },
        { ops: ["==", "!="], prec: PREC.EQUALITY },
        { ops: [">", ">=", "<", "<="], prec: PREC.COMPARE },
        { ops: ["in"], prec: PREC.IN },
        { ops: ["<<", ">>", ">>>"], prec: PREC.SHIFT },
        { ops: ["+", "-"], prec: PREC.ADD },
        { ops: ["*", "/", "%"], prec: PREC.MULTIPLY },
        { ops: ["..."], prec: PREC.RANGE },
      ];
      return choice(
        ...BINOPS.map(({ ops, prec: level, assoc }) => {
          const op = ops.length === 1 ? ops[0] : choice(...ops);
          const rule = seq(
            field("left", $._Expr),
            field("op", op),
            field("right", $._Expr),
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
            field("operator", choice("++", "--", "+", "-", "!", "~")),
            field("operand", $._Expr),
          ),
        ),
        prec.left(
          PREC.CALL,
          seq(field("operand", $._Expr), field("operator", choice("++", "--"))),
        ),
      ),
    EBlock: ($) =>
      prec(
        PREC.BLOCK,
        seq("{", repeat(seq($._expr_or_comp, optional($._semicolon))), "}"),
      ),
    EObjectDecl: ($) =>
      prec(
        PREC.OBJECT_DECL,
        seq(
          "{",
          commaSep(
            seq(
              field("name", choice($.identifier, $.String)),
              ":",
              field("value", $._Expr),
            ),
          ),
          "}",
        ),
      ),
    EArrayDecl: ($) =>
      seq("[", optional(choice(commaSep($._Expr), $.EFor, $.EWhile)), "]"),
    EReturn: ($) => prec.right(PREC.CONTROL, seq("return", optional($._Expr))),
    EBreak: (_) => prec.right(PREC.CONTROL, "break"),
    EContinue: (_) => prec.right(PREC.CONTROL, "continue"),
    EThrow: ($) => prec.right(PREC.CONTROL, seq("throw", $._Expr)),
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
          field("var", $.identifier),
          "in",
          field("iterable", $._Expr),
          ")",
          field("body", $._expr_or_comp),
        ),
      ),
    EIf: ($) =>
      prec.right(
        PREC.CONTROL,
        seq(
          "if",
          "(",
          field("condition", $._Expr),
          ")",
          field("consequence", $._expr_or_comp),
          optional(seq("else", field("alternative", $._expr_or_comp))),
        ),
      ),
    EWhile: ($) =>
      prec.right(
        choice(
          seq(
            "while",
            "(",
            field("condition", $._Expr),
            ")",
            field("body", $._expr_or_comp),
          ),
          seq(
            "do",
            field("body", $._expr_or_comp),
            "while",
            "(",
            field("condition", $._Expr),
            ")",
          ),
        ),
      ),
    _expr_or_comp: ($) =>
      choice(
        $.EFor,
        $.EIf,
        $.EWhile,
        prec(
          PREC.ASSIGN + 1,
          seq(field("key", $._Expr), "=>", field("value", $._Expr)),
        ),
        $._Expr,
      ),
    ESwitch: ($) =>
      prec(
        PREC.PRIMARY,
        seq(
          "switch",
          field("subject", choice($._EParenthesis, $._Expr)),
          "{",
          field(
            "cases",
            repeat(
              seq(
                "case",
                field("patterns", commaSep1($._Expr)),
                ":",
                field("body", repeat(seq($._Expr, optional($._semicolon)))),
              ),
            ),
          ),
          optional(
            seq(
              choice("default", seq("case", $.wildcard_pattern)),
              ":",
              field("body", repeat(seq($._Expr, optional($._semicolon)))),
            ),
          ),
          "}",
        ),
      ),
    ETry: ($) =>
      prec.right(
        seq(
          "try",
          $._Expr,
          repeat1(
            seq(
              "catch",
              "(",
              $.identifier,
              optional($._type_annotation),
              ")",
              field("body", $._Expr),
            ),
          ),
        ),
      ),
    ECheckType: ($) => seq("(", $._Expr, $._type_annotation, ")"),
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

    type_trace: ($) => prec(PREC.CALL + 1, seq("$type", $._EParenthesis)),

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
            // $._semicolon, // Functions in anonymous types are declarations, no body.
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
        optional(repeat1(choice($._visibility, "enum"))),
        "abstract",
        field("name", $.type_name),
        optional($._type_params),
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
        optional(repeat1(choice($._visibility))),
        choice("class", "interface"),
        field("name", $.type_name),
        optional($._type_params),
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
            repeat1(choice($._visibility, "dynamic", "inline", "static")),
          ),
          choice("var", "final"),
          field("name", $.identifier),
          optional($.property_accessor),
          optional($._type_annotation),
          optional(seq("=", $._Expr)),
          $._semicolon,
        ),
      ),
    ClassMethod: ($) =>
      prec.right(
        PREC.ASSIGN,
        seq(
          optional(
            repeat1(
              choice(
                $._visibility,
                "macro",
                "dynamic",
                "inline",
                "override",
                "final",
                "static",
              ),
            ),
          ),
          "function",
          field("name", choice($.identifier, alias("new", $.identifier))),
          optional(field("params", $._type_params)),
          $._function_args,
          optional(field("ret", $._type_annotation)),
          choice(
            field("body", seq($._Expr, optional($._semicolon))),
            $._semicolon,
          ),
        ),
      ),

    DefType: ($) =>
      seq(
        optional(repeat1(choice($._visibility, "extern"))),
        "typedef",
        field("name", $.type_name),
        optional(field("params", $._type_params)),
        "=",
        field("type", $.ComplexType),
        optional($._semicolon),
      ),

    EnumType: ($) =>
      seq(
        optional(repeat1(choice($._visibility, "extern"))),
        "enum",
        field("name", $.type_name),
        optional(field("params", $._type_params)),
        "{",
        repeat($.EnumConstructor),
        "}",
      ),
    EnumConstructor: ($) =>
      seq(
        field("name", $.identifier),
        optional($._function_args),
        $._semicolon,
      ),

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

    public: (_) => "public",
    private: (_) => "private",
    _visibility: ($) => choice($.public, $.private),

    _type_annotation: ($) =>
      prec(PREC.TYPE_ANNOTATION, seq(":", field("type", $.ComplexType))),

    _type_params: ($) => seq("<", commaSep1($.TypeParameter), ">"),
    _type_arguments: ($) => seq("<", commaSep($.ComplexType), ">"),

    _function_args: ($) =>
      seq("(", field("args", commaSep($.FunctionArg)), ")"),

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

    // ------------------------------------------------------------------------

    identifier: (_) => /[a-zA-Z_][a-zA-Z0-9_]*/,
    package_name: ($) => $._camelCaseIdentifier,
    type_name: ($) => $._pascalCaseIdentifier,

    _camelCaseIdentifier: (_) => /[a-z_][a-zA-Z0-9_]*/,
    _pascalCaseIdentifier: (_) => /[A-Z][a-zA-Z0-9_]*/,

    optional: (_) => "?",
    wildcard: (_) => "*",
    wildcard_pattern: (_) => "_", // Added
    _semicolon: (_) => ";",

    comment: ($) => choice($.line_comment, $.block_comment),
    line_comment: (_) => token(seq("//", /[^\n]*/)),
    block_comment: (_) => token(seq("/*", /[^*]*\*+([^/*][^*]*\*+)*\//)),

    // ------------------------------------------------------------------------

    conditional: ($) =>
      prec(
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
        seq($._Expr, optional($._semicolon)),
        $._type_decl,
        repeat1($.MetaDataEntry),
        $.conditional_error,
      ),
    conditional_elseif: ($) =>
      seq("#elseif", $.compile_condition, repeat($._conditional_body)),
    conditional_else: ($) => seq("#else", repeat($._conditional_body)),
    conditional_error: ($) => seq("#error", $.String),
    conditional_end: (_) => "#end",
  },
});
