local M = {}

function M.setup(config)
  -- Calculate the plugin root directory based on the location of this file
  -- lua/react-compiler-badge/core.lua -> .../plugin_root
  local current_file = debug.getinfo(1, "S").source:sub(2)
  local plugin_root = vim.fn.fnamemodify(current_file, ":p:h:h:h")
  local script_path = plugin_root .. "/lib/analyzer.js"

  local ns_id = vim.api.nvim_create_namespace("ReactCompilerMarker")
  local diagnostic_ns_id = vim.api.nvim_create_namespace("ReactCompilerBadgeDiagnostics")

  vim.api.nvim_set_hl(0, "ReactCompilerIcon", config.highlight)
  vim.api.nvim_set_hl(0, "ReactCompilerFailedIcon", config.failed_highlight)

  local function normalize_result(result)
    local optimized = result.optimized or {}
    local failed = result.failed or {}

    return optimized, failed
  end

  local function set_marker(bufnr, line, icon, highlight)
    local row = line - 1
    if row < 0 then
      return
    end

    vim.api.nvim_buf_set_extmark(bufnr, ns_id, row, 0, {
      virt_text = {
        { icon, highlight },
      },
      virt_text_pos = "eol",
    })
  end

  local function set_diagnostics(bufnr, failed)
    if not config.show_diagnostics then
      vim.diagnostic.reset(diagnostic_ns_id, bufnr)
      return
    end

    local diagnostics = {}
    for _, item in ipairs(failed) do
      local line = item.line
      if type(line) == "number" and line > 0 then
        table.insert(diagnostics, {
          lnum = line - 1,
          col = 0,
          severity = vim.diagnostic.severity.WARN,
          source = "react-compiler-badge",
          message = item.reason or "React Compiler did not optimize this component",
          code = item.kind,
        })
      end
    end

    vim.diagnostic.set(diagnostic_ns_id, bufnr, diagnostics, {})
  end

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

        local optimized, failed = normalize_result(result)
        set_diagnostics(bufnr, failed)

        for _, line in ipairs(optimized) do
          set_marker(bufnr, line, config.icon, "ReactCompilerIcon")
        end

        if config.show_failed then
          for _, item in ipairs(failed) do
            set_marker(bufnr, item.line, config.failed_icon, "ReactCompilerFailedIcon")
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
