import { SQLDatabase } from 'encore.dev/storage/sqldb';

export const risksDB = new SQLDatabase("risks", {
  migrations: "./migrations",
});
