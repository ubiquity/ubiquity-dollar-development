import fs from "fs";
import path from "path";
const libraryDirectory = path.join(__dirname, "library");
// auto import files in directory
fs.readdirSync(libraryDirectory).forEach(file => {
  if (file.endsWith(".ts")) {
    import(
      path.join(libraryDirectory, file)
    );
  }
});
