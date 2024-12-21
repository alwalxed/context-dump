import fs from "fs";
import path from "path";
import { textFileExtensions } from "./constants";

export function isTextFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase().slice(1);
  return textFileExtensions.has(ext);
}

export function loadGitignore(directory: string): string[] {
  const gitignorePath = path.join(directory, ".gitignore");
  try {
    if (!fs.existsSync(gitignorePath)) return [];

    const gitignoreContent = fs.readFileSync(gitignorePath, "utf-8");
    return gitignoreContent
      .split("\n")
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => line.trim());
  } catch (error) {
    console.warn(
      `Warning: Unable to read .gitignore file: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    return [];
  }
}

export function getAllFiles(
  dirPath: string,
  ignoredFiles: string[],
  arrayOfFiles: string[] = []
): string[] {
  try {
    const files = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const file of files) {
      const fullPath = path.join(dirPath, file.name);

      // Skip if path matches any ignored pattern
      if (ignoredFiles.some((ignored) => fullPath.includes(ignored))) continue;

      try {
        if (file.isDirectory()) {
          getAllFiles(fullPath, ignoredFiles, arrayOfFiles);
        } else if (file.isFile() && isTextFile(fullPath)) {
          arrayOfFiles.push(fullPath);
        }
      } catch (error) {
        if (error instanceof Error && "code" in error) {
          if (error.code === "EACCES" || error.code === "EPERM") {
            console.warn(`Warning: Permission denied accessing ${fullPath}`);
            continue;
          }
        }
        throw error;
      }
    }

    return arrayOfFiles;
  } catch (error) {
    if (error instanceof Error && "code" in error) {
      if (error.code === "EACCES" || error.code === "EPERM") {
        console.warn(
          `Warning: Permission denied accessing directory ${dirPath}`
        );
        return arrayOfFiles;
      }
    }
    throw error;
  }
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
  selectedFiles: string[]
): void {
  if (selectedFiles.length === 0) {
    throw new Error("No files selected for output generation.");
  }

  const context: AIContext = {
    project_structure: [],
    file_contents: {},
  };

  let successfulReads = 0;

  selectedFiles.forEach((file) => {
    const relativePath = path.relative(directory, file);

    try {
      if (!isTextFile(file)) {
        console.warn(`Warning: Skipping non-text file ${file}`);
        return;
      }

      const fileContent = fs.readFileSync(file, "utf-8");
      context.project_structure.push(relativePath);

      context.file_contents[relativePath] = {
        content: fileContent,
        extension: path.extname(file).slice(1),
      };
      successfulReads++;
    } catch (error) {
      console.warn(
        `Warning: Unable to read file ${file}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  });

  if (successfulReads === 0) {
    throw new Error("No valid files could be read for output generation.");
  }

  try {
    fs.writeFileSync(outputFile, JSON.stringify(context, null, 2), "utf-8");
  } catch (error: unknown) {
    throw new Error(
      `Failed to write output file: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
