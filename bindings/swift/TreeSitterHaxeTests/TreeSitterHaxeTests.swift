import XCTest
import SwiftTreeSitter
import TreeSitterHaxe

final class TreeSitterHaxeTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_haxe())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Haxe grammar")
    }
}
