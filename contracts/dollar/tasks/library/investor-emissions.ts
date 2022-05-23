const description = "Get info about manager contract's address"; // set the task's description




import { task } from "hardhat/config"; import "@nomiclabs/hardhat-waffle";
const taskname = __filename.split("/").pop()?.split(".").shift() as string; // dynamically name task based on filename
const filename = `./${taskname}/`; // look in folder with same name as task for files
import(filename).then(module => task(taskname, description).setAction(module.default())); // map default export to task
