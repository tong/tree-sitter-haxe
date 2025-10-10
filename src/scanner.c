#include "tree_sitter/alloc.h"
#include "tree_sitter/parser.h"
#include <wctype.h>

enum TokenType {
  CLOSING_BRACE_MARKER,
  CLOSING_BRACE_UNMARKER,
};

typedef struct {
  uint32_t brace_nesting;
} Scanner;

void *tree_sitter_haxe_external_scanner_create() {
  Scanner *scanner = ts_malloc(sizeof(Scanner));
  scanner->brace_nesting = 0;
  return scanner;
}

void tree_sitter_haxe_external_scanner_destroy(void *payload) {
  ts_free(payload);
}

unsigned tree_sitter_haxe_external_scanner_serialize(void *payload,
                                                     char *buffer) {
  Scanner *scanner = (Scanner *)payload;
  buffer[0] = scanner->brace_nesting;
  return 1;
}

void tree_sitter_haxe_external_scanner_deserialize(void *payload,
                                                   const char *buffer,
                                                   unsigned length) {
  Scanner *scanner = (Scanner *)payload;
  if (length > 0) {
    scanner->brace_nesting = buffer[0];
  } else {
    scanner->brace_nesting = 0;
  }
}

bool tree_sitter_haxe_external_scanner_scan(void *payload, TSLexer *lexer,
                                            const bool *valid_symbols) {
  Scanner *scanner = (Scanner *)payload;

  while (iswspace(lexer->lookahead)) {
    lexer->advance(lexer, true);
  }

  if (lexer->lookahead == '$') {
    lexer->advance(lexer, false);
    if (lexer->lookahead == '{') {
      scanner->brace_nesting++;
    }
  } else if (lexer->lookahead == '{') {
    if (scanner->brace_nesting > 0) {
      scanner->brace_nesting++;
    }
  } else if (lexer->lookahead == '}') {
    if (scanner->brace_nesting > 0) {
      scanner->brace_nesting--;
      if (scanner->brace_nesting == 0) {
        if (valid_symbols[CLOSING_BRACE_UNMARKER]) {
          lexer->result_symbol = CLOSING_BRACE_UNMARKER;
          return true;
        }
      }
    } else {
      if (valid_symbols[CLOSING_BRACE_MARKER]) {
        lexer->result_symbol = CLOSING_BRACE_MARKER;
        return true;
      }
    }
  }

  return false;
}
