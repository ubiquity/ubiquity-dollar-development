import { task } from "hardhat/config";
import { ActionType, ConfigurableTaskDefinition } from "hardhat/types";
import path from "path";
import { libraryDirectory } from "./index";

export function taskMounter(filename: string) {
  const pathToFile = path.join(libraryDirectory, filename);
  const taskName = filename.split("/").pop()?.split(".").shift() as string; // dynamically name task based on filename

  import(pathToFile).then(extendHardhatCli);

  function extendHardhatCli(module: ImportedTasksArgs): void {
    let { action, description, params, optionalParams } = module;

    const extension = task(taskName, description);

    if (!action) {
      // import the task
      // required
      console.error(`\t${taskName} has no action export`);
      action = () => {
        throw new Error("No function found");
      };
    }

    if (!description) {
      // import the description
      // optional
      console.warn(`\t${taskName} has no description`);
      description = "No description found";
    }

    if (params) {
      // import the required params
      // optional; if there are none this can still run
      Object.entries(params).forEach(([key, value]) => extension.addParam(key, value));
    }

    if (optionalParams) {
      // import the optional params
      // optional
      Object.entries(optionalParams).forEach(([key, value]) => extension.addOptionalParam(key, value));
    }

    extension.setAction(action());
  }
}

interface ImportedTasksArgs {
  action: () => ActionType<any>;
  description: string;
  params?: { [key: string]: string };
  optionalParams?: { [key: string]: string };
}
