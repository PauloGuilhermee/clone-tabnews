import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database.js";
import { ServicesError } from "infra/errors";

const defaultMigrationOptios = {
  dryRun: true,
  dir: resolve("infra", "migrations"),
  direction: "up",
  log: () => {},
  migrationsTable: "pgmigrations",
};

async function listPendingMigrations() {
  let dbClient;
  try {
    dbClient = await database.getNewClient();
    const pendingMigrations = await migrationRunner({
      ...defaultMigrationOptios,
      dbClient,
      dryRun: true,
    });
    return pendingMigrations;
  } finally {
    await dbClient?.end();
  }
}

async function RunPendingMigrations() {
  let dbClient;
  try {
    dbClient = await database.getNewClient();
    const migratedMigrations = await migrationRunner({
      ...defaultMigrationOptios,
      dbClient,
      dryRun: false,
    });
    return migratedMigrations;
  } catch (error) {
    const publicErrorObject = new ServicesError({
      cause: error,
      message: "Erro ao executar as migrations",
    });
    console.error(publicErrorObject);
    throw publicErrorObject;
  } finally {
    await dbClient?.end();
  }
}

const migrator = {
  listPendingMigrations,
  RunPendingMigrations,
};

export default migrator;
