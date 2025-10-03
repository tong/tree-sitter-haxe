package tree_sitter_haxe_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_haxe "github.com/tong/tree-sitter-haxe/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_haxe.Language())
	if language == nil {
		t.Errorf("Error loading Haxe grammar")
	}
}
