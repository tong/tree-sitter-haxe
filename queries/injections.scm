; Basic SQL injection for strings containing SQL keywords
((string_literal) @injection.content
  (#match? @injection.content "(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)")
  (#set! injection.language "sql"))

; Basic HTML injection for strings containing HTML tags
((string_literal) @injection.content
  (#match? @injection.content "<[a-zA-Z]+")
  (#set! injection.language "html"))

; Basic CSS injection for strings containing CSS rules
; ((string_literal) @injection.content
;   (#match? @injection.content "\\{[^}]+:")
;   (#set! injection.language "css"))
; Basic JSON injection for strings that look like JSON objects
((string_literal) @injection.content
  (#match? @injection.content "^\"\\{[^}]+\\}\"$")
  (#set! injection.language "json"))

; XML injection for strings containing XML declarations
((string_literal) @injection.content
  (#match? @injection.content "<\\?xml")
  (#set! injection.language "xml"))

; URL injection for strings starting with protocols
((string_literal) @injection.content
  (#match? @injection.content "^\"(https|http|ftp)://")
  (#set! injection.language "uri"))
