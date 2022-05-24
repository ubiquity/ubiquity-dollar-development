import path from "path";
import { taskMounter } from "./utils/task-mounter";
import * as fs from "fs";

export const libraryDirectory = path.join(__dirname, "library");

// auto import tasks in library
fs.readdirSync(libraryDirectory) // read library directory
  .filter((file) => file.endsWith(".ts")) // only typescript files
  .forEach(taskMounter); // process each file
