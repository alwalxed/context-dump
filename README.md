# Context Dump for AI

An interactive CLI tool to generate AI-friendly context from selected files, making project data easily consumable for AI models.

## Features

- **Interactive File Selection**: Choose files using a checkbox interface.
- **Intelligent File Filtering**: Automatically ignores common files and directories (e.g., `node_modules`, `.git`).
- **`.gitignore` Compliance**: Respects `.gitignore` rules to streamline file selection.
- **Structured JSON Output**: Outputs a JSON file containing the project structure and file contents.

## Installation

Install the tool globally with:

```bash
npm install -g context-dump
```

## Usage

### Basic Command

Run the tool with a simple command:

```bash
context-dump
```

By default, the output is saved to `ai_context.json` in the current directory.

### Options

#### Specify Output File

Use the `-o` or `--output` option to specify a custom output file:

```bash
context-dump -o custom_output.json
```

#### Exclude Specific Files or Folders

Use the `-e` or `--exclude` option to exclude specific files or folders (comma-separated):

```bash
context-dump -e foo,bar
```

## Screenshots

![context-dump-for-ai](https://raw.githubusercontent.com/alwalxed/context-dump/refs/heads/main/screenshot.png)

## Output Structure

The output JSON file contains two main sections:

- **`project_structure`**: A list of file paths included in the output.
- **`file_contents`**: A dictionary where keys are file paths, and values include the file content and extension.

### Example Output

```json
{
  "project_structure": ["example.js"],
  "file_contents": {
    "example.js": {
      "content": "console.log('Hello, World!');",
      "extension": "js"
    }
  }
}
```

## Contributing

Submit issues or pull requests to help improve this tool.

## License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/alwalxed/context-dump/blob/main/LICENSE) file for details.
