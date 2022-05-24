import { task } from "hardhat/config";
import { ActionType, CLIArgumentType } from "hardhat/types";
import path from "path";
import { libraryDirectory } from "./index";

export function taskMounter(filename: string) {
  const pathToFile = path.join(libraryDirectory, filename);
  let taskName = filename.split("/").pop()?.split(".").shift() as string; // dynamically name task based on filename

  taskName = "_".concat(taskName); // prefix with _

  import(pathToFile).then(extendHardhatCli);

  function extendHardhatCli(module: ImportedTasksArgs): void {
    let { action, description, params, optionalParams, positionalParams } = module;

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
      Object.entries(optionalParams).forEach((params) => extension.addOptionalParam.bind(params));
    }

    if (positionalParams) {
      // import the positional params
      // optional
      Object.entries(positionalParams).forEach((params) => extension.addPositionalParam.bind(params));
    }

    extension.setAction(action());
  }
}

interface Params {
  [key: string]: string;
}
interface PositionalParams {
  [key: string]: [string, string, CLIArgumentType<string>][];
}
interface ImportedTasksArgs {
  action: () => ActionType<any>;
  description: string;
  params?: Params;
  optionalParams?: Params;
  positionalParams?: PositionalParams;
}
