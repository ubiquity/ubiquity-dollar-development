import "@nomiclabs/hardhat-waffle";
import fs from "fs";
import path from "path";
import { taskMounter } from "./task-mounter";

export const libraryDirectory = path.join(__dirname, "library");

// auto import tasks in library
fs.readdirSync(libraryDirectory) // read library directory
  .filter((file) => file.endsWith(".ts")) // only typescript files
  .forEach(taskMounter); // process each file
