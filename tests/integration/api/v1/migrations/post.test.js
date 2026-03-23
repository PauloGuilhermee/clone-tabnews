import database from "infra/database";
import orchestrator from "infra/scripts/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDatabase();
});

describe("POST /api/v1/migrations", () => {
  describe("Anonymous User", () => {
    describe("Running pending migrations", () => {
      test("For the first time", async () => {
        const response1 = await fetch("http://localhost:3000/api/v1/migrations", {
          method: "POST",
        });
        expect(response1.status).toBe(201);

        const response1Body = await response1.json();
        expect(response1Body.length).toBeGreaterThanOrEqual(0);
        expect(Array.isArray(response1Body)).toBe(true);

        const numberMigrations1 = await database.query("SELECT COUNT(*)::int FROM pgmigrations ");
        expect(numberMigrations1.rows[0].count).toBeGreaterThanOrEqual(0);
      });
      test("For the second time", async () => {
        const response2 = await fetch("http://localhost:3000/api/v1/migrations", {
          method: "POST",
        });
        expect(response2.status).toBe(200);

        const response2Body = await response2.json();
        expect(response2Body.length).toBe(0);
        expect(Array.isArray(response2Body)).toBe(true);

        const numberMigrations2 = await database.query("SELECT COUNT(*)::int FROM pgmigrations ");
        expect(numberMigrations2.rows[0].count).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
