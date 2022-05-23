import { task } from "hardhat/config";
import { ActionType } from "hardhat/types";
import path from "path";
import { libraryDirectory } from "./index";
interface ImportedTasksArgs {
  action: () => ActionType<any>;
  description: string;
  params?: { [key: string]: string }
  optionalParams?: { [key: string]: string }
}

export function taskMounter(filename: string) {
  const pathToFile = path.join(libraryDirectory, filename);
  const taskName = filename.split("/").pop()?.split(".").shift() as string; // dynamically name task based on filename

  import(pathToFile).then(extendHardhatCli);

  function extendHardhatCli(module: ImportedTasksArgs) {

    let { action, description, params, optionalParams } = module

    // import the task
    // required
    if (!action) {
      console.error(`\t${taskName} has no action export`);
      action = () => {
        throw new Error("No function found");
      };
    }

    // import the description
    // optional
    if (!description) {
      console.warn(`\t${taskName} has no description`);
      description = "No description found";
    }

    // import the params
    // optional
    if (params) {
      Object.entries(params).forEach(([key, value]) => task(taskName, description).addParam(key, value));
    }

    // import the optional params
    // optional
    if (optionalParams) {
      Object.entries(optionalParams).forEach(([key, value]) => task(taskName, description).addOptionalParam(key, value));
    }

    task(taskName, description).setAction(action());

  }
}
