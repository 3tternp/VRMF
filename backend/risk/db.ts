import { SQLDatabase } from 'encore.dev/storage/sqldb';

export const riskDB = new SQLDatabase("risk", {
  migrations: "./migrations",
});
