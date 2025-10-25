#!/bin/bash
set -e
echo "Parsing all example .hx files..."
find examples -type f -name "*.hx" ! -name "_*.hx" | while read -r file; do
	echo "::group::Parsing $file"
	if ! tree-sitter parse "$file" >/tmp/out.txt 2>&1; then
		echo "❌ Failed to parse $file"
		cat /tmp/out.txt
		exit 1
	fi
	echo "✅ Parsed successfully: $file"
	echo "::endgroup::"
done
