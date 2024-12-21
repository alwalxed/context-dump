import fs from "fs";
import path from "path";

export function loadGitignore(directory: string): string[] {
  const gitignorePath = path.join(directory, ".gitignore");
  if (!fs.existsSync(gitignorePath)) return [];

  const gitignoreContent = fs.readFileSync(gitignorePath, "utf-8");
  return gitignoreContent
    .split("\n")
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => line.trim());
}

export function getAllFiles(
  dirPath: string,
  ignoredFiles: string[],
  arrayOfFiles: string[] = [],
): string[] {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);

    if (ignoredFiles.some((ignored) => fullPath.includes(ignored))) return;

    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, ignoredFiles, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

interface FileContent {
  content: string;
  extension: string;
}

interface AIContext {
  project_structure: string[];
  file_contents: {
    [key: string]: FileContent;
  };
}

export function generateAIFriendlyOutput(
  directory: string,
  outputFile: string,
  selectedFiles: string[],
): void {
  if (selectedFiles.length === 0) {
    throw new Error("No files selected for output generation.");
  }

  const context: AIContext = {
    project_structure: [],
    file_contents: {},
  };

  selectedFiles.forEach((file) => {
    const relativePath = path.relative(directory, file);

    try {
      const fileContent = fs.readFileSync(file, "utf-8");

      context.project_structure.push(relativePath);

      context.file_contents[relativePath] = {
        content: fileContent,
        extension: path.extname(file).slice(1), // Remove the leading dot
      };
    } catch (error) {
      console.warn(`Warning: Unable to read file ${file}. It will be skipped.`);
    }
  });

  if (Object.keys(context.file_contents).length === 0) {
    throw new Error("No valid files could be read for output generation.");
  }

  fs.writeFileSync(outputFile, JSON.stringify(context, null, 2), "utf-8");
}
