import fs from "fs";
import chalk from "chalk";
import { execSync } from "child_process";
import Handlebars from "handlebars";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @param {any} options 
 */
const getBackendFiles = (options) => {
  const now = new Date();
  const timestamp = `${now.getFullYear()}${now.getMonth().toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;

  let files = [];
  files.push({ templatePath: "src/templates/gitignore.hbs", filePath: ".gitignore" });
  files.push({ templatePath: "src/templates/nodemon.json.hbs", filePath: "nodemon.json" });
  files.push({ templatePath: "src/templates/package.json.hbs", filePath: "package.json" });
  files.push({ templatePath: "src/templates/tsconfig.json.hbs", filePath: "tsconfig.json" });
  files.push({ templatePath: "src/templates/api_response.util.ts.hbs", filePath: "src/utils/api_response.util.ts" });

  if(options.auth) {
    files.push({ templatePath: "src/templates/routes_auth.ts.hbs", filePath: "src/api/routes.ts" });
  }
  else {
    files.push({ templatePath: "src/templates/routes.ts.hbs", filePath: "src/api/routes.ts" });
  }

  if(!options.postgres && !options.mongo) {
    files.push({ templatePath: "src/templates/server.ts.hbs", filePath: "src/server.ts" });
    files.push({ templatePath: "src/templates/env_mongo.hbs", filePath: ".env" });
  }

  if(options.mongo) {
    files.push({ templatePath: "src/templates/env_mongo.hbs", filePath: ".env" });
    files.push({ templatePath: "src/templates/server_mongo.ts.hbs", filePath: "src/server.ts" });
  }
  
  if(options.postgres) {
    files.push({ templatePath: "src/templates/env.hbs", filePath: ".env" });
    files.push({ templatePath: "src/templates/knexfile.js.hbs", filePath: "knexfile.js" });
    files.push({ templatePath: "src/templates/pool.db.ts.hbs", filePath: "src/db/pool.db.ts" });
    files.push({ templatePath: "src/templates/server.ts.hbs", filePath: "src/server.ts" });
    files.push({ templatePath: "src/templates/sql_model.db.ts.hbs", filePath: "src/db/sql_model.db.ts" });
  }

  if(options.auth && (options.postgres || options.mongo)) {
    files.push({ templatePath: "src/templates/auth/jwt.util.ts.hbs", filePath: "src/utils/jwt.util.ts" });
    files.push({ templatePath: "src/templates/auth/jwt_auth.middleware.ts.hbs", filePath: "src/middlewares/jwt_auth.middleware.ts" });
    files.push({ templatePath: "src/templates/auth/user.routes.ts.hbs", filePath: "src/api/user/user.routes.ts" });
    files.push({ templatePath: "src/templates/auth/express.d.ts.hbs", filePath: "types/express.d.ts" });

    if(options.mongo) {
      files.push({ templatePath: "src/templates/auth/mongo/user.controller.ts.hbs", filePath: "src/api/user/user.controller.ts" });
      files.push({ templatePath: "src/templates/auth/mongo/user.model.ts.hbs", filePath: "src/models/user.model.ts" });
    }

    if(options.postgres) {
      files.push({ templatePath: "src/templates/auth/postgres/user.controller.ts.hbs", filePath: "src/api/user/user.controller.ts" });
      files.push({ templatePath: "src/templates/auth/postgres/user.model.ts.hbs", filePath: "src/models/user.model.ts" });
      files.push({ templatePath: "src/templates/auth/postgres/user.migration.hbs", filePath: `migrations/${timestamp}_create_users_table.js` });
    }
  }

  return files;
};

/**
 * 
 * @param {string} projectName 
 * @param {any} options 
 */
export default function InitProject(projectName, options) {
  if(fs.existsSync(projectName)) {
    console.log(chalk.redBright(`Folder ${projectName} already exists.`));
    return;
  }

  if(options.mongo && options.postgres) {
    console.log(chalk.redBright(`You cannot use two databases at once.`));
    return;
  }

  if(options.auth && (!options.postgres && !options.mongo)) {
    console.log(chalk.redBright(`--auth cannot be used without a database. Please use --postgres or --mongo.`));
    return;
  }

  console.log(chalk.blueBright(`Generating files...`));
  const backendFiles = getBackendFiles(options);
  backendFiles.forEach(file => {
    const templatePath = path.join(__dirname, "../../", file.templatePath);

    const templateSrc = fs.readFileSync(templatePath, "utf-8");
    const template = Handlebars.compile(templateSrc);
    const content = template({ projectName });

    let filePath = path.join(projectName, file.filePath);
    const dir = path.dirname(filePath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, content, "utf-8");
  });
  
  // Installing dependencies in backend
  let dependencies = "npm install express cors helmet morgan dotenv";
  let devDependencies = "npm install -D typescript nodemon ts-node @types/node @types/express @types/cors @types/morgan";
  if(options.postgres) {
    dependencies += " knex pg";
    devDependencies += " @types/pg";
  }
  if(options.mongo) {
    dependencies += " mongoose";
  }
  if(options.auth) {
    dependencies += " jsonwebtoken bcryptjs";
    devDependencies += " @types/jsonwebtoken @types/bcryptjs";
  }

  console.log(chalk.blueBright("Installing dependencies..."));
  execSync(dependencies, { cwd: projectName });

  console.log(chalk.blueBright("Installing dev dependencies..."));
  execSync(devDependencies, { cwd: projectName });

  console.log(chalk.greenBright(`Project: ${projectName} generated successfully!\n`));
  console.log(chalk.whiteBright(`Steps to run:`));
  console.log(chalk.whiteBright(`1. cd ${projectName}`));
  console.log(chalk.whiteBright(`2. npm run dev`));

  console.log(chalk.yellowBright(`\nNotes:`));
  console.log(chalk.yellowBright(`- Update the .env accordingly.`));
  if(options.postgres) {
    console.log(chalk.yellowBright(`- Migrate the database using \`npx knex migrate:latest\``));
  }

  console.log(chalk.greenBright("\nHAVE FUN!"));
}