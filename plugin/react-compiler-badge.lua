-- plugin/react-compiler-badge.lua
-- This file is automatically loaded by Neovim when the plugin is in the runtime path.

if vim.g.loaded_react_compiler_badge == 1 then
  return
end
vim.g.loaded_react_compiler_badge = 1

-- Note: We don't automatically call setup() here to allow the user
-- to configure it via require("react-compiler-badge").setup({})
-- However, if you want zero-config (and the user didn't provide opts),
-- you could technically trigger a default setup here, but it's cleaner to let Lazy or the user do it.

-- To support the "zero config" goal better:
-- We can expose a user command to manually trigger analysis if they want,
-- or just rely on the user calling setup() in their init.lua / lazy config.
