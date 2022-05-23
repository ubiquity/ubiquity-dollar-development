import fs from "fs";
import path from "path";
import descriptions from "./descriptions.json"

console.log({ descriptions });

// auto import tasks in library
const libraryDirectory = path.join(__dirname, "library");
fs.readdirSync(libraryDirectory).forEach(file => {
  if (file.endsWith(".ts")) {
    import(
      path.join(libraryDirectory, file)
    );
  }
});

interface Description {
  "name": string,
  "description": string,
  "parameters": [string, string][]
}
