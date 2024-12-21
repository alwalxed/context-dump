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
  "project_structure": ["utils.ts"],
  "file_contents": {
    "utils.ts": {
      "content": "import fs from \"fs\";\nimport path from \"path\";\n\nexport function loadGitignore(directory: string): string[] {\n  const gitignorePath = path.join(directory, \".gitignore\");\n  if (!fs.existsSync(gitignorePath)) return [];\n\n  const gitignoreContent = fs.readFileSync(gitignorePath, \"utf-8\");\n  return gitignoreContent\n    .split(\"\\n\")\n    .filter((line) => line && !line.startsWith(\"#\"))\n    .map((line) => line.trim());\n}\n\nexport function getAllFiles(\n  dirPath: string,\n  ignoredFiles: string[],\n  arrayOfFiles: string[] = [],\n): string[] {\n  const files = fs.readdirSync(dirPath);\n\n  files.forEach((file) => {\n    const fullPath = path.join(dirPath, file);\n\n    if (ignoredFiles.some((ignored) => fullPath.includes(ignored))) return;\n\n    if (fs.statSync(fullPath).isDirectory()) {\n      arrayOfFiles = getAllFiles(fullPath, ignoredFiles, arrayOfFiles);\n    } else {\n      arrayOfFiles.push(fullPath);\n    }\n  });\n\n  return arrayOfFiles;\n}\n\ninterface FileContent {\n  content: string;\n  extension: string;\n}\n\ninterface AIContext {\n  project_structure: string[];\n  file_contents: {\n    [key: string]: FileContent;\n  };\n}\n\nexport function generateAIFriendlyOutput(\n  directory: string,\n  outputFile: string,\n  selectedFiles: string[],\n): void {\n  if (selectedFiles.length === 0) {\n    throw new Error(\"No files selected for output generation.\");\n  }\n\n  const context: AIContext = {\n    project_structure: [],\n    file_contents: {},\n  };\n\n  selectedFiles.forEach((file) => {\n    const relativePath = path.relative(directory, file);\n\n    try {\n      const fileContent = fs.readFileSync(file, \"utf-8\");\n\n      context.project_structure.push(relativePath);\n\n      context.file_contents[relativePath] = {\n        content: fileContent,\n        extension: path.extname(file).slice(1) // Remove the leading dot\n      };\n    } catch (error) {\n      console.warn(`Warning: Unable to read file ${file}. It will be skipped.`);\n    }\n  });\n\n  if (Object.keys(context.file_contents).length === 0) {\n    throw new Error(\"No valid files could be read for output generation.\");\n  }\n\n  fs.writeFileSync(outputFile, JSON.stringify(context, null, 2), \"utf-8\");\n}",
      "extension": "ts"
    }
  }
}
```

## Contributing

We welcome contributions! Submit issues or pull requests to help improve this tool.

## License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/alwalxed/context-dump/blob/main/LICENSE) file for details.
