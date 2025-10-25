#include "tree_sitter/alloc.h"
#include "tree_sitter/parser.h"
#include <wctype.h>

enum TokenType {
  LBRACE_STATEMENT,
  LBRACE_EXPRESSION,
  RBRACE,
  STATEMENT_CONTEXT_MARKER,
};

typedef struct {
  bool is_statement_context;
} Scanner;

void *tree_sitter_haxe_external_scanner_create() {
  Scanner *scanner = ts_malloc(sizeof(Scanner));
  scanner->is_statement_context = false;
  return scanner;
}

void tree_sitter_haxe_external_scanner_destroy(void *payload) {
  Scanner *scanner = (Scanner *)payload;
  ts_free(scanner);
}

unsigned tree_sitter_haxe_external_scanner_serialize(void *payload,
                                                     char *buffer) {
  Scanner *scanner = (Scanner *)payload;
  buffer[0] = scanner->is_statement_context;
  return 1;
}

void tree_sitter_haxe_external_scanner_deserialize(void *payload,
                                                   const char *buffer,
                                                   unsigned length) {
  Scanner *scanner = (Scanner *)payload;
  if (length > 0) {
    scanner->is_statement_context = buffer[0];
  } else {
    scanner->is_statement_context = false;
  }
}

bool tree_sitter_haxe_external_scanner_scan(void *payload, TSLexer *lexer,
                                            const bool *valid_symbols) {
  Scanner *scanner = (Scanner *)payload;

  // Handle the zero-width statement context marker
  if (valid_symbols[STATEMENT_CONTEXT_MARKER]) {
    scanner->is_statement_context = true;
    // This is a zero-width token, so we don't advance the lexer.
    // We just set the state and return true.
    lexer->result_symbol = STATEMENT_CONTEXT_MARKER;
    return true;
  }

  while (iswspace(lexer->lookahead)) {
    lexer->advance(lexer, true);
  }

  // Handle '{'
  if (lexer->lookahead == '{') {
    if (scanner->is_statement_context) {
      // If the state tells us we are in a statement context, emit a statement
      // brace.
      scanner->is_statement_context = false; // Consume the state
      lexer->result_symbol = LBRACE_STATEMENT;
    } else {
      // Otherwise, emit an expression brace.
      lexer->result_symbol = LBRACE_EXPRESSION;
    }
    lexer->advance(lexer, false);
    return true;
  }

  // Handle '}'
  if (lexer->lookahead == '}') {
    if (valid_symbols[RBRACE]) {
      lexer->result_symbol = RBRACE;
      lexer->advance(lexer, false);
      return true;
    }
  }

  return false;
}