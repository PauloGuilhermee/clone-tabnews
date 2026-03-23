import { cleanDatabase } from "tests/utils/cleanDatabase.js";
import orchestrator from "infra/scripts/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await cleanDatabase();
});

describe("GET /api/v1/migrations", () => {
  describe("Anonymous User", () => {
    test("Retrieving pending migrations", async () => {
      const respose = await fetch("http://localhost:3000/api/v1/migrations");
      expect(respose.status).toBe(200);

      const responseBody = await respose.json();
      expect(Array.isArray(responseBody)).toBe(true);
      expect(responseBody.length).toBeGreaterThan(0);
    });
  });
});
