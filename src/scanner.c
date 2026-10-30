#include "tree_sitter/parser.h"

#include <string.h>
#include <wctype.h>

enum TokenType {
  TRAILING_DOT_FLOAT,
  MARKUP,
  ERROR_SENTINEL,
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
static bool scan_trailing_dot_float(TSLexer *lexer) {
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

#define MAX_NAME 64

static bool is_name_start(int32_t c) { return iswalpha(c) || c == '_'; }

static bool is_name_char(int32_t c) {
  return iswalnum(c) || c == '_' || c == '-' || c == ':' || c == '.';
}

// Reads a tag name, truncated to MAX_NAME - 1 characters.
static void scan_name(TSLexer *lexer, char *name) {
  unsigned length = 0;
  while (is_name_char(lexer->lookahead)) {
    if (length < MAX_NAME - 1)
      name[length++] = (char)lexer->lookahead;
    advance(lexer);
  }
  name[length] = '\0';
}

// Inline markup, `<div>…</div>`, read as one token the way the Haxe lexer
// does: up to the close tag matching the first one, counting nested tags of
// the same name. Tags of other names, and the text, are not looked at.
static bool scan_markup(TSLexer *lexer) {
  char tag[MAX_NAME], name[MAX_NAME];

  if (lexer->lookahead != '<')
    return false;
  advance(lexer);
  if (!is_name_start(lexer->lookahead))
    return false;
  scan_name(lexer, tag);

  int depth = 0;
  bool in_open = true;
  for (;;) {
    switch (lexer->lookahead) {
    case 0:
      if (lexer->eof(lexer))
        return false;
      advance(lexer);
      break;
    case '<':
      advance(lexer);
      if (lexer->lookahead == '/') {
        advance(lexer);
        scan_name(lexer, name);
        if (lexer->lookahead == '>') {
          advance(lexer);
          if (strcmp(name, tag) == 0 && depth-- == 0) {
            lexer->result_symbol = MARKUP;
            return true;
          }
        }
        in_open = false;
      } else if (is_name_start(lexer->lookahead)) {
        scan_name(lexer, name);
        in_open = strcmp(name, tag) == 0;
        if (in_open)
          depth++;
      }
      break;
    case '/':
      advance(lexer);
      if (lexer->lookahead == '>') {
        advance(lexer);
        // `/>` only closes a tag still being opened, `<br/>`.
        if (in_open && depth-- == 0) {
          lexer->result_symbol = MARKUP;
          return true;
        }
        in_open = false;
      }
      break;
    case '>':
      advance(lexer);
      in_open = false;
      break;
    default:
      advance(lexer);
    }
  }
}

bool tree_sitter_haxe_external_scanner_scan(void *payload, TSLexer *lexer,
                                            const bool *valid_symbols) {
  bool markup = valid_symbols[MARKUP] && !valid_symbols[ERROR_SENTINEL];
  if (!valid_symbols[TRAILING_DOT_FLOAT] && !markup)
    return false;

  while (iswspace(lexer->lookahead))
    lexer->advance(lexer, true);

  if (markup && lexer->lookahead == '<')
    return scan_markup(lexer);
  if (valid_symbols[TRAILING_DOT_FLOAT])
    return scan_trailing_dot_float(lexer);
  return false;
}
