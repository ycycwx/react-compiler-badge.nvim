# react-compiler-badge.nvim

A Neovim plugin that highlights React components optimized by the [React Compiler](https://react.dev/learn/react-compiler) (experimental).

## Features

- 🎯 Automatically detects React components optimized by the React Compiler
- ✨ Visual indicators with customizable highlights and icons
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
    "BufReadPost *.jsx",
    -- "BufReadPost *.ts",
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
    "BufReadPost *.jsx",
    -- "BufReadPost *.ts",
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

| Option | Default | Description |
| :--- | :--- | :--- |
| `highlight` | `{ bg = "#1a6bbc", fg = "#ffffff", bold = true }` | Highlight group definition. |
| `icon` | `" Memo✨ "` | Virtual text icon. |

### Example Configuration

```lua
require("react-compiler-badge").setup({
  highlight = {
    bg = "#1a6bbc",
    fg = "#ffffff",
    bold = true,
  },
  icon = " Memo✨ ",
})
```

## Directory Structure

- `doc/`: Vim help documentation (`:help react-compiler-badge`).
- `lua/`: Plugin logic.
- `plugin/`: Automatic plugin initialization.
- `lib/`: Analyzer script (Node.js).

## How It Works

The plugin uses Babel to analyze your React code and detect functions that have been optimized by the React Compiler. When an optimized function is detected, it displays a visual indicator (icon) at the end of the line.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
