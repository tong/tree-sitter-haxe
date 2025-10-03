// swift-tools-version:5.3

import Foundation
import PackageDescription

var sources = ["src/parser.c"]
if FileManager.default.fileExists(atPath: "src/scanner.c") {
    sources.append("src/scanner.c")
}

let package = Package(
    name: "TreeSitterHaxe",
    products: [
        .library(name: "TreeSitterHaxe", targets: ["TreeSitterHaxe"]),
    ],
    dependencies: [
        .package(name: "SwiftTreeSitter", url: "https://github.com/tree-sitter/swift-tree-sitter", from: "0.9.0"),
    ],
    targets: [
        .target(
            name: "TreeSitterHaxe",
            dependencies: [],
            path: ".",
            sources: sources,
            resources: [
                .copy("queries")
            ],
            publicHeadersPath: "bindings/swift",
            cSettings: [.headerSearchPath("src")]
        ),
        .testTarget(
            name: "TreeSitterHaxeTests",
            dependencies: [
                "SwiftTreeSitter",
                "TreeSitterHaxe",
            ],
            path: "bindings/swift/TreeSitterHaxeTests"
        )
    ],
    cLanguageStandard: .c11
)
