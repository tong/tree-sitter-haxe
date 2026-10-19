#include "tree_sitter/parser.h"

#include <wctype.h>

enum TokenType {
  TRAILING_DOT_FLOAT,
};

void *tree_sitter_haxe_external_scanner_create(void) { return NULL; }

void tree_sitter_haxe_external_scanner_destroy(void *payload) {}

unsigned tree_sitter_haxe_external_scanner_serialize(void *payload,
                                                     char *buffer) {
  return 0;
}

void tree_sitter_haxe_external_scanner_deserialize(void *payload,
                                                   const char *buffer,
                                                   unsigned length) {}

static void advance(TSLexer *lexer) { lexer->advance(lexer, false); }

// `1.` is a float, but `0...n` is an int followed by a range, and the
// regex lexer can't look past the dot to tell them apart.
bool tree_sitter_haxe_external_scanner_scan(void *payload, TSLexer *lexer,
                                            const bool *valid_symbols) {
  if (!valid_symbols[TRAILING_DOT_FLOAT])
    return false;

  while (iswspace(lexer->lookahead))
    lexer->advance(lexer, true);

  if (!iswdigit(lexer->lookahead))
    return false;
  while (iswdigit(lexer->lookahead) || lexer->lookahead == '_')
    advance(lexer);

  if (lexer->lookahead != '.')
    return false;
  advance(lexer);

  // `0...n`, `1.5` and `1.e3` are left to the regex lexer.
  if (lexer->lookahead == '.' || lexer->lookahead == '_' ||
      iswalnum(lexer->lookahead)) {
    return false;
  }

  lexer->result_symbol = TRAILING_DOT_FLOAT;
  return true;
}
