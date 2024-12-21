# Context Dump For AI

An interactive CLI tool to create AI-friendly context from selected files.

## Features

- Interactive file selection with checkboxes
- Ignores common files/folders (e.g., `node_modules`, `.git`)
- Respects `.gitignore` rules
- Outputs JSON with project structure and file contents

## Installation

Install globally with:

```bash
npm i -g context-dump
```

## Usage

### Basic Command

Run the tool:

```bash
context-dump
```

By default, it outputs to `ai_context.json` in the current directory.

### Options

- `-o, --output <file>`: Specify the output file (default: `ai_context.json`).

```bash
context-dump -o output.json
```

- `-e, --exclude <items>`: Exclude specific files or folders (comma-separated).

```bash
context-dump -e foo,boo
```

## Screenshots

![context-dump-for-ai](https://raw.githubusercontent.com/alwalxed/context-dump/refs/heads/main/screenshot.png)

## Contributing

Submit issues or pull requests for feedback.

## License

MIT License. See [LICENSE](https://github.com/alwalxed/context-dump/blob/main/LICENSE).
