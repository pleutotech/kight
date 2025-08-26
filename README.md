## Kight - Fly through the boilerplate
Kight can be used to generate a simple express-typescript project with the database of your choice.

#### Installation
1. Clone the repo: `git clone https://github.com/pleutotech/kight.git`
2. Install Dependencies: `npm install`
3. Install Kight: `npm install -g .`

#### Usage
```
// Initializes a project (uses Postgres by default)
kight init <project-name>

// Initializes a project with MongoDB
kight init <project-name> --mongo

// Initializes a project with PostgreSQL
kight init <project-name> --postgres
```
Note: When initializing with PostgreSQL `db-migrate` and `db-migrate-pg` are automatically installed to handle migrations. You can use `db-migrate` as usual. Example: `npx db-migrate create create-users-table`.

#### More updates coming soon!