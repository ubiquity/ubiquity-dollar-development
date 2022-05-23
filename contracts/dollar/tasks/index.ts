import { task } from "hardhat/config"; import "@nomiclabs/hardhat-waffle";
import fs from "fs";

// auto import index from all directories
fs.readdirSync(__dirname).forEach(file => {
  if (!file.includes(".")) {
    import(`./${file}`);
  }
});


export function taskMounter(description: string) {
  const taskname = __filename.split("/").pop()?.split(".").shift() as string; // dynamically name task based on filename

  console.log(taskname);

  const filename = `./${taskname}/`; // look in folder with same name as task for files
  import(filename).then(module => task(taskname, description).setAction(module.default())); // map default export to task
}
