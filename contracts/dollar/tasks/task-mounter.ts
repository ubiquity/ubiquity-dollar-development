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
      action = () => { throw new Error("No function found") }
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
      paramsHandler(params, extension);
    }

    if (optionalParams) {
      // import the optional params
      // optional
      Object.entries(optionalParams).forEach(([key, value]) => extension.addOptionalParam(key, value));
    }

    extension.setAction(action());
  }
}

function paramsHandler(params: { [key: string]: string }, extension: ConfigurableTaskDefinition) {
  // FIXME this needs to be mapped all at once
  // relevant if theres more than one required param

  const requiredArgsEntries = Object.entries(params);

  type TestType = [['receiver', 'The address that will be revoked'], ['manager', 'The address of uAD Manager']];

  if ((requiredArgsEntries as TestType).length > 1) {

    console.log(requiredArgsEntries);

    extension
      .addParam(requiredArgsEntries[0][0], requiredArgsEntries[0][1])
      .addParam(requiredArgsEntries[1][0], requiredArgsEntries[1][1]);

    // const metaprogrammingarray = requiredArgsEntries.map((arg, index: number) => {

    //   const [name, description] = arg;
    //   return `.addParam(requiredArgsEntries[${index}][0], requiredArgsEntries[${index}][1])`;
    // });

    // const logic = [`extension`, metaprogrammingarray.join("\n")].join("\n");
    // console.log(logic);
    // console.log(eval(logic));


  }
}

interface ImportedTasksArgs {
  action: () => ActionType<any>;
  description: string;
  params?: { [key: string]: string };
  optionalParams?: { [key: string]: string };
}
