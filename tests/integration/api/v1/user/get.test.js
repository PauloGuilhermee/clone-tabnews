import orchestrator from "infra/scripts/orchestrator.js";
import { version as uuidVersion } from "uuid";
import session from "models/session.js";
import setCookieParse from "set-cookie-parser";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.RunPendingMigrations();
});

describe("GET /api/v1/user", () => {
  describe("Default user", () => {
    // Verifica cadastro com dados válidos e únicos
    test("With valid session", async () => {
      const CreatedUser = await orchestrator.createUser({
        username: "UserWithValidSession",
      });
      const sessionObject = await orchestrator.createSession(CreatedUser.id);

      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          cookie: `session_id = ${sessionObject.token}`,
        },
      });

      const cacheControl = response.headers.get("Cache-Control");
      expect(cacheControl).toEqual("no-store, no-cache, max-age=0, must-revalidate");

      const responseBody = await response.json();
      expect(response.status).toBe(200);
      expect(responseBody).toEqual({
        id: CreatedUser.id,
        username: "UserWithValidSession",
        email: CreatedUser.email,
        password: CreatedUser.password,
        created_at: CreatedUser.created_at.toISOString(),
        updated_at: CreatedUser.updated_at.toISOString(),
      });
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      // session renewal assertions
      const renewedSessionObject = await session.findOneValidByToken(sessionObject.token);
      expect(renewedSessionObject.expires_at > sessionObject.expires_at).toBe(true);
      expect(renewedSessionObject.updated_at > sessionObject.updated_at).toBe(true);

      // Set-Cookie assertions
      const parsedSetCookie = setCookieParse(response, {
        map: true,
      });

      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: sessionObject.token,
        maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
        path: "/",
        httpOnly: true,
      });
    });

    test("With valid session renewed 5 minutes before expiration", async () => {
      const fiveMinutesInMs = 5 * 60 * 1000;
      jest.useFakeTimers({
        now: new Date(Date.now() - (session.EXPIRATION_IN_MILLISECONDS - fiveMinutesInMs)),
      });
      const CreatedUser = await orchestrator.createUser({
        username: "userWithRenewedSession",
      });

      const sessionObject = await orchestrator.createSession(CreatedUser.id);

      jest.useRealTimers();

      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          cookie: `session_id = ${sessionObject.token}`,
        },
      });
      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(responseBody).toEqual({
        id: CreatedUser.id,
        username: "userWithRenewedSession",
        email: CreatedUser.email,
        password: CreatedUser.password,
        created_at: CreatedUser.created_at.toISOString(),
        updated_at: CreatedUser.updated_at.toISOString(),
      });
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      // session renewal assertions
      const renewedSessionObject = await session.findOneValidByToken(sessionObject.token);
      expect(renewedSessionObject.expires_at > sessionObject.expires_at).toBe(true);
      expect(renewedSessionObject.updated_at > sessionObject.updated_at).toBe(true);

      const expiresAt = new Date(renewedSessionObject.expires_at);
      const updatedAt = new Date(renewedSessionObject.updated_at);

      const expirationTimeInMilisseconds = expiresAt - updatedAt;

      expect(session.EXPIRATION_IN_MILLISECONDS - expirationTimeInMilisseconds).toBeLessThan(1000);

      // Set-Cookie assertions
      const parsedSetCookie = setCookieParse(response, {
        map: true,
      });

      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: sessionObject.token,
        maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
        path: "/",
        httpOnly: true,
      });
    });

    test("With nonexistent session", async () => {
      const nonexistentToken = "24560516f4e09dfd7a39415a38465f28e20f72088419c96e553118b89c2903493a4755b016447b36c75b199fdf04d8af";

      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          cookie: `session_id = ${nonexistentToken}`,
        },
      });

      expect(response.status).toBe(401);
      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Usuário não possui sessão ativa.",
        action: "Verifique se esta usuário está logado e tente novamente.",
        status_code: 401,
      });
    });

    test("With expired session", async () => {
      jest.useFakeTimers({
        now: new Date(Date.now() - session.EXPIRATION_IN_MILLISECONDS),
      });

      const CreatedUser = await orchestrator.createUser({
        username: "UserWithExpiredSession",
      });
      const sessionObject = await orchestrator.createSession(CreatedUser.id);

      jest.useRealTimers();

      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          cookie: `session_id = ${sessionObject.token}`,
        },
      });
      expect(response.status).toBe(401);
      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Usuário não possui sessão ativa.",
        action: "Verifique se esta usuário está logado e tente novamente.",
        status_code: 401,
      });
    });
  });
});
