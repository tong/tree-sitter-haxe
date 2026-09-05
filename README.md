# tree-sitter-haxe

[![CI](https://github.com/tong/tree-sitter-haxe/actions/workflows/ci.yml/badge.svg)](https://github.com/tong/tree-sitter-haxe/actions/workflows/ci.yml)

A [tree-sitter](https://tree-sitter.github.io/) grammar for the [Haxe](https://haxe.org/) programming language.

The grammar covers Haxe's core syntax: package/import declarations, classes, interfaces, abstracts, enums, typedefs, generics, functions, expressions (including binary/unary/ternary operators, `switch`, `for`/`while`, comprehensions, casts), metadata, conditional compilation (`#if`/`#else`/`#end`), and macros/reification.

Related: the [Hxml](https://github.com/tong/tree-sitter-hxml/) grammar for Haxe's `.hxml` build files.

### C / pkg-config

```sh
make
sudo make install
```

This builds and installs `libtree-sitter-haxe` along with a `tree-sitter-haxe.pc` pkg-config file and the query files under `$(PREFIX)/share/tree-sitter/queries/haxe`.

## Queries

Query files live in [`queries/`](queries) and follow the conventions used by editors and tools built on tree-sitter (Neovim, Zed, Helix, etc.):

- `highlights.scm` — syntax highlighting captures
- `injections.scm` — language injections (e.g. embedded markup/regex-like content)
- `locals.scm` — scope/local-variable analysis
- `folds.scm` — code folding
- `tags.scm` — symbol outline / "tags" (`nav`, ctags-style)

## Development

Requires the [`tree-sitter` CLI](https://github.com/tree-sitter/tree-sitter).

```sh
# regenerate the parser from grammar.js
tree-sitter generate

# run the corpus tests in test/corpus
tree-sitter test

# parse every example file in examples/
npm run test-examples

# check highlighting queries against test/highlight/*.hx
tree-sitter highlight test/highlight/*.hx

# run the Node.js binding tests
npm test

# open the interactive playground
npm start
```

Grammar rules are defined in [`grammar.js`](grammar.js); the generated parser lives in `src/`. Example Haxe source used for parsing/highlighting checks is in [`examples/`](examples), and corpus test cases (input + expected S-expression tree) are in [`test/corpus/`](test/corpus).

## License

[MIT](LICENSE)
