import { SQLDatabase } from 'encore.dev/storage/sqldb';

// Reference the existing risk database
export const controlDB = SQLDatabase.named("risk");
