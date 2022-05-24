import { task } from "hardhat/config";
import { ActionType, CLIArgumentType } from "hardhat/types";
import path from "path";
import { libraryDirectory } from "./index";

interface Params {
  [key: string]: string;
}
interface OptionalParams {
  [key: string]: string[];
}
interface PositionalParams {
  [key: string]: [string, string, CLIArgumentType<string>][];
}
interface TaskModule {
  action: () => ActionType<any>;
  description?: string;
  params?: Params;
  optionalParams?: OptionalParams;
  positionalParams?: PositionalParams;
}

import colors from "./utils/console-colors";

export function taskMounter(filename: string) {
  const pathToFile = path.join(libraryDirectory, filename);
  let taskName = filename.split("/").pop()?.split(".").shift() as string; // dynamically name task based on filename

  // taskName = "_".concat(taskName); // prefix with _

  taskName = colors.bright.concat(taskName).concat(colors.reset); // highlight custom tasks

  import(pathToFile).then(extendHardhatCli);

  function extendHardhatCli({ action, description, params, optionalParams, positionalParams }: TaskModule): void {
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
