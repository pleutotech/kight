#!/usr/bin/env node

import { Command } from "commander";
import InitProject from "./handlers/init.js";

const program = new Command();

program
    .name("Kight")
    .description("Fly through projects")
    .version("0.1.4");

program
    .command("init <projectname>")
    .description("Initializes a new project")
    .option("--postgres", "Use PostgreSQL as the database")
    .option("--mongo", "Use MongoDB as the database")
    .option("--auth", "Generate Auth code (uses jsonwebtoken and bcryptjs)")
    .action((projectName, options) => {
        InitProject(projectName, options);
    });

program.parse(process.argv);