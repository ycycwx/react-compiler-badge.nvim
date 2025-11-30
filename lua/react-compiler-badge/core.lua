local M = {}

function M.setup(config)
  -- Calculate the plugin root directory based on the location of this file
  -- lua/react-compiler-badge/core.lua -> .../plugin_root
  local current_file = debug.getinfo(1, "S").source:sub(2)
  local plugin_root = vim.fn.fnamemodify(current_file, ":p:h:h:h")
  local script_path = plugin_root .. "/lib/analyzer.js"

  local ns_id = vim.api.nvim_create_namespace("ReactCompilerMarker")

  vim.api.nvim_set_hl(0, "ReactCompilerIcon", config.highlight)

  local function update_markers(bufnr)
    local ft = vim.bo[bufnr].filetype
    if not (ft == "typescriptreact" or ft == "javascriptreact" or ft == "typescript" or ft == "javascript") then
      return
    end

    local ok, lines = pcall(vim.api.nvim_buf_get_lines, bufnr, 0, -1, false)
    if not ok then
      return
    end

    local code = table.concat(lines, "\n")

    -- Ensure script_path exists or handle error?
    -- For now, we assume it's there as part of the plugin.
    vim.system({ "node", script_path }, {
      stdin = code,
      text = true,
      stdin_close = true,
      cwd = plugin_root, -- Execute in plugin root so it finds node_modules
    }, function(obj)
      if obj.code ~= 0 then
        return
      end

      local ok2, result = pcall(vim.json.decode, obj.stdout)
      if not ok2 or type(result) ~= "table" then
        return
      end

      vim.schedule(function()
        if not vim.api.nvim_buf_is_valid(bufnr) then
          return
        end

        vim.api.nvim_buf_clear_namespace(bufnr, ns_id, 0, -1)

        for _, line in ipairs(result) do
          local row = line - 1
          if row >= 0 then
            vim.api.nvim_buf_set_extmark(bufnr, ns_id, row, 0, {
              virt_text = {
                { config.icon, "ReactCompilerIcon" },
              },
              virt_text_pos = "eol",
            })
          end
        end
      end)
    end)
  end

  local group = vim.api.nvim_create_augroup("ReactCompilerBadge", { clear = true })
  vim.api.nvim_create_autocmd({ "BufReadPost", "BufWritePost", "BufWinEnter" }, {
    group = group,
    pattern = { "*.tsx", "*.jsx", "*.ts", "*.js" },
    callback = function(ev)
      update_markers(ev.buf)
    end,
  })
end

return M
