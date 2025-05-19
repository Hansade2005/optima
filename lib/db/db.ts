import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Create a PostgreSQL client
const client = postgres(process.env.POSTGRES_URL!);

// Create a Drizzle instance
export const db = drizzle(client);
