-- Re-indents every test/indent/*.hx file and reports lines that change.
--
--   nvim --clean --headless -l test/indent/run.lua PARSER NVIM_TREESITTER
--
-- PARSER is a built haxe parser (`tree-sitter build -o haxe.so`) and
-- NVIM_TREESITTER the nvim-treesitter checkout providing `indentexpr()`.
local parser, nvim_treesitter = arg[1], arg[2]
local dir = vim.fs.dirname(vim.fs.abspath(debug.getinfo(1, "S").source:sub(2)))
local root = vim.fs.dirname(vim.fs.dirname(dir))

nvim_treesitter = vim.fs.normalize(nvim_treesitter)
vim.opt.runtimepath:prepend(nvim_treesitter)
-- Defines `kind-eq?`; plugins aren't loaded with --clean.
vim.cmd.source(nvim_treesitter .. "/plugin/query_predicates.lua")
vim.treesitter.language.add("haxe", { path = parser })
local query = io.open(root .. "/queries/indents.scm"):read("a")
vim.treesitter.query.set("haxe", "indents", query)

local failed = 0
for name in vim.fs.dir(dir) do
  if name:match("%.hx$") then
    vim.cmd.edit(dir .. "/" .. name)
    vim.bo.filetype = "haxe"
    vim.bo.expandtab = false
    vim.bo.tabstop = 4
    vim.bo.shiftwidth = 0
    vim.treesitter.start(0, "haxe")
    vim.bo.indentexpr = "v:lua.require'nvim-treesitter'.indentexpr()"

    local expected = vim.api.nvim_buf_get_lines(0, 0, -1, false)
    vim.cmd("silent normal! gg=G")
    local actual = vim.api.nvim_buf_get_lines(0, 0, -1, false)
    for i, line in ipairs(expected) do
      if actual[i] ~= line then
        failed = failed + 1
        print(("%s:%d: expected %q, got %q"):format(name, i, line, actual[i]))
      end
    end
    vim.cmd("bwipeout!")
  end
end

print(failed == 0 and "indent: ok" or ("indent: %d lines differ"):format(failed))
os.exit(failed == 0 and 0 or 1)
