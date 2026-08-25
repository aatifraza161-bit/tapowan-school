// If user has explicitly provided TURSO credentials, prefer SQLite (Turso) 
// even if a generic DATABASE_URL (like Vercel Postgres) exists in the environment.
module.exports = (process.env.DATABASE_URL && !process.env.TURSO_DATABASE_URL)
  ? require("./db-postgres")
  : require("./db-sqlite");

