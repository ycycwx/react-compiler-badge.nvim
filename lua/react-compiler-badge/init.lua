local config = require("react-compiler-badge.config")
local core = require("react-compiler-badge.core")

local M = {}

function M.setup(opts)
  opts = opts or {}
  local conf = vim.tbl_deep_extend("force", config.defaults, opts)

  core.setup(conf)
end

return M
