#!/usr/bin/env node

import { Command } from "commander";
import InitProject from "./handlers/init_project.js";

const program = new Command();

program
    .name("Kight")
    .description("Fly through projects")
    .version("0.0.1");

program
    .command("init <projectname>")
    .description("Initializes a new project")
    .option("--postgres", "Use PostgreSQL as the database")
    .option("--mongo", "Use MongoDB as the database")
    .action((projectName, options) => {
        let dbType = "postgres";
        if(options.mongo) dbType = "mongo";
        if(options.postgres) dbType = "postgres";

        InitProject(projectName, dbType);
    });

program.parse(process.argv);