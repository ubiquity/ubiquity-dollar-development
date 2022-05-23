import "@nomiclabs/hardhat-waffle";
import fs from "fs";
import { task } from "hardhat/config";
import { ActionType } from "hardhat/types";
import path from "path";

// auto import tasks in library
const libraryDirectory = path.join(__dirname, "library");

fs.readdirSync(libraryDirectory) // read library directory
  .filter(file => file.endsWith(".ts")) // only typescript files
  .forEach(fileProcessor); // process each file


interface testInterface {
  renderAction: () => ActionType<any>;
  description: string;
}

function fileProcessor(filename: string) {
  const pathToFile = path.join(libraryDirectory, filename);
  const taskName = filename.split("/").pop()?.split(".").shift() as string; // dynamically name task based on filename

  import(pathToFile)
    .then(assignAction)

  function assignAction(module: testInterface) {
    console.log({ [taskName]: module });
    let renderAction = module?.renderAction;
    if (!renderAction) {
      console.warn(`\t${taskName} has no renderAction export`);
      renderAction = () => { throw new Error("No function found") };
    }

    let description = module?.description;
    if (!description) {
      console.warn(`\t${taskName} has no description`);
      description = "No description found";
    }

    // map action export to task
    task(taskName, description)
      .setAction(renderAction());

  }




}



// import(pathToFile)
//   .then((module) => loadEntryFromLibrary(module, directoryName))
//   .then(module => task(taskName, description).setAction(module.action())) // map action export to task
//   .then(task => console.log(task))

function loadEntryFromLibrary(module: any, directoryName: string) {
  // console.log(filename, module.action);

  // const directoryName = `./${taskName}/`; // look in folder with same name as task for files
  return import(directoryName)
}
