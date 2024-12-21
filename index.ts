#!/usr/bin/env node

import { program } from "commander";
import fs from "fs";
import inquirer from "inquirer";
import path from "path";
import {
  generateAIFriendlyOutput,
  getAllFiles,
  isTextFile,
  loadGitignore,
} from "./src/utils";

const defaultIgnored: string[] = [
  "node_modules",
  ".git",
  "dist",
  "build",
  ".vscode",
  ".idea",
  ".Trash",
];

process.on("SIGINT", () => {
  console.log("\nOperation cancelled by user");
  process.exit(0);
});

program
  .version("1.0.0")
  .argument("[directory]", "Directory to process", "./")
  .option("-o, --output <file>", "Output file name", "ai_context.json")
  .option(
    "-e, --exclude <items>",
    "Comma-separated list of files/folders to exclude"
  )
  .parse(process.argv);

const options = program.opts();
const inputDirectory: string = path.resolve(program.args[0] || "./");
const outputFile: string = options.output;
const excludeFiles: string[] = options.exclude
  ? options.exclude.split(",")
  : [];

async function run(): Promise<void> {
  try {
    // Validate input directory
    try {
      const stats = fs.statSync(inputDirectory);
      if (!stats.isDirectory()) {
        console.error(`Error: "${inputDirectory}" is not a directory.`);
        process.exit(1);
      }
    } catch (error) {
      console.error(
        `Error: Cannot access directory "${inputDirectory}": ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      process.exit(1);
    }

    const ignoredFiles: string[] = [
      ...defaultIgnored,
      ...loadGitignore(inputDirectory),
      ...excludeFiles,
    ];

    let allFiles: string[];
    try {
      allFiles = getAllFiles(inputDirectory, ignoredFiles);
    } catch (error) {
      console.error(
        `Error scanning directory: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      process.exit(1);
    }

    if (allFiles.length === 0) {
      console.log(
        "No valid text files found in the specified directory after applying exclusions."
      );
      process.exit(0);
    }

    // Filter out non-text files and create choices
    const choices = allFiles
      .filter((file) => isTextFile(file))
      .map((file) => ({
        name: path.relative(inputDirectory, file),
        value: file,
        checked: false,
      }));

    try {
      // @ts-ignore
      const answers = await inquirer.prompt([
        {
          type: "checkbox",
          name: "selectedFiles",
          message: "Select files to include in the AI context:",
          choices,
          pageSize: 20,
          validate: (answer: string[]) => {
            if (answer.length === 0) {
              return "You must select at least one file.";
            }
            return true;
          },
        },
      ]);

      const { selectedFiles } = answers;

      if (selectedFiles.length === 0) {
        console.log("No files selected. Exiting without generating output.");
        process.exit(0);
      }

      generateAIFriendlyOutput(inputDirectory, outputFile, selectedFiles);
      console.log(`AI-friendly context written to ${outputFile}`);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message?.includes("User force closed")
      ) {
        console.log("\nOperation cancelled by user");
        process.exit(0);
      }
      throw error;
    }
  } catch (error) {
    console.error(
      "Error:",
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

run().catch((error) => {
  console.error(
    "An unexpected error occurred:",
    error instanceof Error ? error.message : String(error)
  );
  process.exit(1);
});
