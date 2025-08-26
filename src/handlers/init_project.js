import fs from "fs";
import { execSync } from "child_process";

const serverTsText = `import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import ApiRoutes from "./api/routes.js";

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/api", ApiRoutes());

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(\`Server started at PORT: \${port}\`);
})`;
const serverTsMongoText = `import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import ApiRoutes from "./api/routes.js";

mongoose.connect(process.env.DATABASE_URL!)
.then(() => {
  console.log("MongoDB Connected");
})
.catch((ex) => {
  console.log(\`MONGO_ERR: \${ex}\`);  
});

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/api", ApiRoutes());

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(\`Server started at PORT: \${port}\`);
})`;

const pgPoolText = `import { Pool } from "pg";
import DatabaseConfig from "./../../database.json" with { type: "json" };

const pool = new Pool({
  host: DatabaseConfig.db.host,
  port: DatabaseConfig.db.port,
  user: DatabaseConfig.db.user,
  password: DatabaseConfig.db.password,
  database: DatabaseConfig.db.database,
  ssl: DatabaseConfig.db.ssl,
});

export default pool;`;

const dotenvText = `# Configuration
API_VERSION=1.0.0
NODE_ENV=development
PORT=5000

# Secrets
JWT_SECRET=

# Mailer
MAILER_USER=
MAILER_PASSWORD=`;

const dotenvMongoText = `# Configuration
API_VERSION=1.0.0
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL=mongodb://localhost:27017/test

# Secrets
JWT_SECRET=

# Mailer
MAILER_USER=
MAILER_PASSWORD=`;

const nodemonJsonText = `{
    "watch": ["src"],
    "ext": "ts",
    "exec": "tsc && node dist/server.js"
}`;

const packageJsonText = (projectName) => `{
  "name": "${projectName}",
  "version": "1.0.0",
  "description": "",
  "main": "dist/server.js",
  "scripts": {
    "dev": "nodemon",
    "build": "tsc",
    "start": "node dist/server.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "module"
}
`;

const tsConfigText = `
{
  // Visit https://aka.ms/tsconfig to read more about this file
  "compilerOptions": {
    // File Layout
    "rootDir": "./src",
    "outDir": "./dist",

    // Environment Settings
    // See also https://aka.ms/tsconfig/module
    "module": "nodenext",
    "target": "esnext",
    "types": [],
    // For nodejs:
    // "lib": ["esnext"],
    // "types": ["node"],
    // and npm install -D @types/node

    // Other Outputs
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true,

    // Stricter Typechecking Options
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,

    // Style Options
    // "noImplicitReturns": true,
    // "noImplicitOverride": true,
    // "noUnusedLocals": true,
    // "noUnusedParameters": true,
    // "noFallthroughCasesInSwitch": true,
    // "noPropertyAccessFromIndexSignature": true,

    // Recommended Options
    "strict": true,
    "jsx": "react-jsx",
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "noUncheckedSideEffectImports": true,
    "moduleDetection": "force",
    "skipLibCheck": true,
  }
}
`;

const gitIgnoreText = `.DS_Store
dist
node_modules
.env`;

const databaseJsonText = `
{
    "defaultEnv": "dev",
    "dev": {
        "driver": "pg",
        "host": "127.0.0.1",
        "port": 5432,
        "user": "",
        "password": "",
        "database": "",
        "ssl": false
    }
}`;

const routesTsText = `import { Router } from "express";

export default function ApiRoutes() {
  const router = Router();

  // TODO: Add your api routes here...

  return router;
}`;

const sqlModelText = `
import type { Pool } from "pg";

const DEFAULT_ROW_LIMIT = 100;
const DEFAULT_ROW_OFFSET = 0;

interface IFindFilters {
    where?: string;
    whereArgs?: any[];
    limit?: number;
    offset?: number;
    orderBy?: string;
}

interface IFindOneFilters {
    where?: string;
    whereArgs?: any[];
}

export default class SqlModel<T> {
    private pool: Pool;
    private tableName: string;

    constructor(pool: Pool, tableName: string) {
        this.pool = pool;
        this.tableName = tableName;
    }

    async find(filters: IFindFilters = {}) : Promise<T[]> {
        let sql = \`SELECT * FROM \${this.tableName}\`;
        if(filters.where) sql += \` WHERE \${filters.where}\`;
        sql += \` LIMIT \${filters.limit || DEFAULT_ROW_LIMIT}\`;
        sql += \` OFFSET \${filters.offset || DEFAULT_ROW_OFFSET}\`;
        if(filters.orderBy) sql += \` ORDER BY \${filters.orderBy}\`;

        let args: any[] = [...filters.whereArgs || []];

        const result = await this.pool.query(sql, args);
        return result.rows;
    }

    async findById(id: number) : Promise<T|null> {
        let sql = \`SELECT * FROM \${this.tableName} WHERE id=$1\`;
        let args: any[] = [id];

        const result = await this.pool.query(sql, args);
        if(result.rows.length === 0) return null;

        return result.rows[0];
    }

    async findOne(filters: IFindOneFilters = {}) : Promise<T|null> {
        let sql = \`SELECT * FROM \${this.tableName}\`;
        if(filters.where) sql += \` WHERE \${filters.where}\`;
        sql += \` LIMIT 1\`;

        let args: any[] = [...filters.whereArgs || []];

        const result = await this.pool.query(sql, args);
        if(result.rows.length === 0) return null;

        return result.rows[0];
    }

    async insert(data: Partial<T>) : Promise<T|null> {
        const fields = Object.keys(data).map(key => \`\${key}\`).join(", ");
        const placeholders = Object.keys(data).map((_, index) => \`$\${index+1}\`).join(", ");

        let sql = \`INSERT INTO \${this.tableName}(\${fields}) VALUES(\${placeholders}) RETURNING *\`
        let args: any[] = [...Object.values(data)];

        const result = await this.pool.query(sql, args);
        if(result.rows.length === 0) return null;

        return result.rows[0];
    }

    async findByIdAndUpdate(id: number, data: Partial<T>) : Promise<T|null> {
        const fields = Object.entries(data).map(([key, _], index) => \`\${key}=$\${index+1}\`).join(", ");

        let sql = \`UPDATE \${this.tableName} SET \${fields} WHERE id=$\${Object.entries(data).length + 1} RETURNING *\`;
        let args: any[] = [...Object.values(data), id];

        const result = await this.pool.query(sql, args);
        if(result.rows.length === 0) return null;

        return result.rows[0];
    }

    async findByIdAndDelete(id: number) {
        let sql = \`DELETE FROM \${this.tableName} WHERE id=$1 RETURNING *\`;
        let args: any[] = [id];

        const result = await this.pool.query(sql, args);
        if(result.rows.length === 0) return null;

        return result.rows[0];
    }
}`;

/**
 * 
 * @param {string} projectName 
 * @param {string} dbType 
 */
export default function InitProject(projectName, dbType) {
    if(fs.existsSync(projectName)) {
        console.log(`Error: A folder named ${projectName} already exists`);
        return;
    }

    console.log(`Initializing Project: ${projectName} | Database: ${dbType}`);
    fs.mkdirSync(projectName);
    
    // Writing the package.json
    fs.writeFileSync(`${projectName}/package.json`, packageJsonText(projectName));

    let installDependencies = "npm install express cors helmet morgan dotenv";
    let installDevDependencies = "npm install -D typescript nodemon @types/node @types/express @types/cors @types/morgan";

    if(dbType === "postgres") {
      installDependencies += " db-migrate pg db-migrate-pg";
      installDevDependencies += " @types/pg";
    }

    if(dbType === "mongo") {
      installDependencies += " mongoose";
    }

    console.log("Installing dependencies...");
    execSync(installDependencies, { cwd: projectName });

    console.log("Installing dev dependencies...");
    execSync(installDevDependencies, { cwd: projectName });

    console.log("Setting things up...");
    fs.mkdirSync(`${projectName}/src`);
    
    if(dbType === "mongo") {
      fs.writeFileSync(`${projectName}/.env`, dotenvMongoText);
      fs.writeFileSync(`${projectName}/src/server.ts`, serverTsMongoText);
    }
    else {
      fs.writeFileSync(`${projectName}/.env`, dotenvText);
      fs.writeFileSync(`${projectName}/database.json`, databaseJsonText);
      fs.writeFileSync(`${projectName}/src/server.ts`, serverTsText);

      fs.mkdirSync(`${projectName}/src/db`, { recursive: true });
      fs.writeFileSync(`${projectName}/src/db/pool.db.ts`, pgPoolText);
      fs.writeFileSync(`${projectName}/src/db/sql_model.db.ts`, sqlModelText);
    }

    fs.writeFileSync(`${projectName}/.gitignore`, gitIgnoreText);
    fs.writeFileSync(`${projectName}/nodemon.json`, nodemonJsonText);
    fs.writeFileSync(`${projectName}/tsconfig.json`, tsConfigText);

    fs.mkdirSync(`${projectName}/src/api`);
    fs.writeFileSync(`${projectName}/src/api/routes.ts`, routesTsText);

    console.log(`Project ${projectName} initialized.`);
}