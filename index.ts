#!/usr/bin/env node

import { program } from "commander";
import fs from "fs";
import inquirer from "inquirer";
import path from "path";
import {
  generateAIFriendlyOutput,
  getAllFiles,
  loadGitignore,
} from "./utils.js";

const defaultIgnored: string[] = [
  "node_modules",
  ".git",
  "dist",
  "build",
  ".vscode",
  ".idea",
];

program
  .version("1.0.0")
  .argument("[directory]", "Directory to process", "./")
  .option("-o, --output <file>", "Output file name", "ai_context.json")
  .option(
    "-e, --exclude <items>",
    "Comma-separated list of files/folders to exclude",
  )
  .parse(process.argv);

const options = program.opts();
const inputDirectory: string = program.args[0] || "./";
const outputFile: string = options.output;
const excludeFiles: string[] = options.exclude
  ? options.exclude.split(",")
  : [];

async function run(): Promise<void> {
  if (!fs.existsSync(inputDirectory)) {
    console.error(`Error: The directory "${inputDirectory}" does not exist.`);
    process.exit(1);
  }

  const ignoredFiles: string[] = [
    ...defaultIgnored,
    ...loadGitignore(inputDirectory),
    ...excludeFiles,
  ];

  const allFiles: string[] = getAllFiles(inputDirectory, ignoredFiles);

  if (allFiles.length === 0) {
    console.log(
      "No files found in the specified directory after applying exclusions.",
    );
    process.exit(0);
  }

  const choices = allFiles.map((file) => ({
    name: path.relative(inputDirectory, file),
    value: file,
    checked: false,
  }));

  const answers = await (inquirer as any).prompt([
    {
      type: "checkbox",
      name: "selectedFiles",
      message: "Select files to include in the AI context:",
      choices,
      pageSize: 20,
      validate: (answer: string[]) => {
        if (answer.length === 0) {
          return "You must select at least one file or press Ctrl+C to cancel.";
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

  try {
    generateAIFriendlyOutput(inputDirectory, outputFile, selectedFiles);
    console.log(`AI-friendly context written to ${outputFile}`);
  } catch (error) {
    console.error("Error generating output:", error);
    process.exit(1);
  }
}

run().catch((error) => {
  console.error("An unexpected error occurred:", error);
  process.exit(1);
});
