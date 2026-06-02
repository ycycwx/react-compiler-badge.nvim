local M = {}

M.defaults = {
  highlight = {
    bg = "#1a6bbc",
    fg = "#ffffff",
    bold = true,
  },
  icon = " Memo✨ ",
  failed_highlight = {
    bg = "#8a1f11",
    fg = "#ffffff",
    bold = true,
  },
  failed_icon = " Memo✕ ",
  show_failed = true,
  show_diagnostics = true,
}

return M
