import { task } from "hardhat/config";
import { ActionType } from "hardhat/types";
import path from "path";
import { libraryDirectory } from "./index";

interface ImportedTasksArgs {
  action: () => ActionType<any>;
  description: string;
  params?: { [key: string]: string }
}

export function taskMounter(filename: string) {
  const pathToFile = path.join(libraryDirectory, filename);
  const taskName = filename.split("/").pop()?.split(".").shift() as string; // dynamically name task based on filename

  import(pathToFile).then(assignAction);

  function assignAction(module: ImportedTasksArgs) {

    let action = module?.action;
    if (!action) {
      console.warn(`\t${taskName} has no action export`);
      action = () => {
        throw new Error("No function found");
      };
    }

    let description = module?.description;
    if (!description) {
      console.warn(`\t${taskName} has no description`);
      description = "No description found";
    }

    let params = module?.params;
    if (params) {
      Object.entries(params).forEach(([key, value]) => task(taskName, description).addParam(key, value));
    }
    task(taskName, description).setAction(action());

  }
}
