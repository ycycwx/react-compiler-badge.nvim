# react-compiler-badge.nvim

A Neovim plugin that highlights React components optimized by the [React Compiler](https://react.dev/learn/react-compiler) (experimental).

## Features

- 🎯 Automatically detects React components optimized by the React Compiler
- ✨ Visual indicators with customizable highlights and icons
- ✕ Optional indicators for React components that were not optimized
- 🔄 Real-time analysis on file read and write
- 📝 Supports TypeScript and JavaScript React files
- ⚙️ Highly configurable appearance

## Requirements

- Neovim >= 0.9.0
- Node.js (for running the analyzer script)
- `babel-plugin-react-compiler` (installed via npm)

## Installation

Using [lazy.nvim](https://github.com/folke/lazy.nvim):

```lua
{
  "ycycwx/react-compiler-badge.nvim",
  build = "npm ci", -- Installs dependencies for analyzer.js
  event = {
    "BufReadPost *.tsx",
    "BufReadPost *.ts",
    -- "BufReadPost *.jsx",
    -- "BufReadPost *.js",
  },
  opts = {
    -- Configuration (see below)
  },
}
```

Using [packer.nvim](https://github.com/wbthomason/packer.nvim):

```lua
use({
  "ycycwx/react-compiler-badge.nvim",
  run = "npm ci",
  event = {
    "BufReadPost *.tsx",
    "BufReadPost *.ts",
    -- "BufReadPost *.jsx",
    -- "BufReadPost *.js",
  },
  config = function()
    require("react-compiler-badge").setup({
      -- Configuration (see below)
    })
  end,
})
```

## Configuration

See `:help react-compiler-badge` for detailed options.

| Option             | Default                                           | Description                                                              |
| :----------------- | :------------------------------------------------ | :----------------------------------------------------------------------- |
| `highlight`        | `{ bg = "#1a6bbc", fg = "#ffffff", bold = true }` | Highlight group definition.                                              |
| `icon`             | `" Memo✨ "`                                      | Virtual text icon.                                                       |
| `failed_highlight` | `{ bg = "#8a1f11", fg = "#ffffff", bold = true }` | Highlight group definition for components that were not optimized.       |
| `failed_icon`      | `" Memo✕ "`                                       | Virtual text icon for components that were not optimized.                |
| `show_failed`      | `true`                                            | Whether to show indicators for components that were not optimized.       |
| `show_diagnostics` | `true`                                            | Whether to publish React Compiler failure reasons as Neovim diagnostics. |

### Example Configuration

```lua
require("react-compiler-badge").setup({
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
})
```

## How It Works

The plugin uses Babel to analyze your React code and detect functions that have been optimized by the React Compiler. When an optimized function is detected, it displays a visual indicator (icon) at the end of the line.

It also detects component-like functions in the source file during the same Babel pass. If a component-like function is not present in the React Compiler optimized output, the plugin can display the failed indicator and publish the compiler reason as a Neovim diagnostic.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
