((String
  (fragment) @injection.content)
  (#lua-match? @injection.content "^%s*{")
  (#set! injection.language "json"))

((String
  (fragment) @injection.content)
  (#lua-match? @injection.content "<%a")
  (#set! injection.language "html"))

((markup) @injection.content
  (#set! injection.language "html"))

; ((String
;   (fragment) @injection.content)
;   (#match? @injection.content "(<\\?xml|<[a-zA-Z0-9_-]+(:[a-zA-Z0-9_-]+)?)")
;   (#set! injection.language "xml"))
; ((String
;   (fragment) @injection.content)
;   (#match? @injection.content "(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)")
;   (#set! injection.language "sql"))
((Regexp) @injection.content
  (#set! injection.language "regex"))

(interpolation) @haxe

(comment
  (block_comment) @injection.content
  (#set! injection.language "jsdoc"))

