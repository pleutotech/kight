## Kight - Fly through the boilerplate
Kight can be used to generate a simple express-typescript project with the database of your choice.

#### Installation
```
npm install -g kight
```

#### Initialize a Project
```
// Initializes a project without database
kight init <project-name>

// Initializes a project with MongoDB
kight init <project-name> --mongo

// Initializes a project with PostgreSQL
kight init <project-name> --postgres
```
Note: When initializing with PostgreSQL `db-migrate` and `db-migrate-pg` are automatically installed to handle migrations. You can use `db-migrate` as usual. Read more about `db-migrate` [here](https://db-migrate.readthedocs.io/en/latest/Getting%20Started/commands/).

#### Auth
Starting from v0.1.0, Kight can use `jsonwebtoken` and `bcryptjs` for generating basic JWT Authentication. Note that the option `--auth` only works when you have selected a database. It won't work without `--postgres` or `--mongo`.
```
// Initializes a project with MongoDB and Auth
kight init <project-name> --mongo --auth

// Initializes a project with PostgreSQL and Auth
kight init <project-name> --postgres --auth
```
Note: When using --auth with PostgreSQL, Kight will automatically create a migration for the users table under the `migrations/` folder. 

### Folder Structure
Kight uses a simple and scalable folder structure. Here's an outline of what it looks like:
```
src/
|- api/
|   |- <feature>/
|   |   |- <feature>.controller.ts
|   |   |- <feature>.routes.ts
|   |- routes.ts
|
|- db/
|   |- pool.db.ts
|   |- sql_model.db.ts
|
|- models/
|   |- <model>.model.ts
|
|- utils/
|   |- <util>.util.ts
|
|- middlewares/
|   |- <middleware>.middleware.ts
|
|- server.ts

types/
|- <name>.d.ts

migrations/
|- <migration_name>.js
```
- `src/api/` contains the REST API.
- `src/api/routes.ts` if where all the api routes live.
- `src/db/` (postgres only) contains the data pool and sql_model class.
- `src/models/` contains all the models.
- `src/utils/` contains all the utility classes.
- `src/middlewares/` contains all the middlewares.
- `types/` contains additional type definitions.
- `migrations/` (postgres only) contains the migrations created by `db-migrate`.
- `src/server.ts` is the main entry point.

#### More updates coming soon!
