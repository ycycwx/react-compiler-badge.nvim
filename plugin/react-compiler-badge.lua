-- plugin/react-compiler-badge.lua
-- This file is automatically loaded by Neovim when the plugin is in the runtime path.

if vim.g.loaded_react_compiler_badge == 1 then
  return
end
vim.g.loaded_react_compiler_badge = 1

-- Automatically setup with defaults.
-- If the user provides configuration via setup({...}), it will simply re-run setup
-- and update the configuration (since we use an augroup to clear previous autocommands).
require("react-compiler-badge").setup()
