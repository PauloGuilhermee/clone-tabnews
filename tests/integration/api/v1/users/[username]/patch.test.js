import orchestrator from "infra/scripts/orchestrator.js";
import { version as uuidVersion } from "uuid";
import user from "models/user";
import password from "models/password";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.RunPendingMigrations();
});

describe("PATCH /api/v1/users/[username]", () => {
  describe("Anonymous User", () => {
    // Testa erro ao atualizar username inexistente
    test("With nonexistent username", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users/usuarioinexistente", {
        method: "PATCH",
      });
      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "O username informado não foi encontrado no sistema.",
        action: "Verfifique se o username está digitado corretamente.",
        status_code: 404,
      });
    });

    // Verifica erro ao atualizar para um username já existente
    test("With duplicated 'username'", async () => {
      await orchestrator.createUser({
        username: "user1",
      });
      await orchestrator.createUser({
        username: "user2",
      });

      const response = await fetch("http://localhost:3000/api/v1/users/user2", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "User1",
        }),
      });

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O username informado já está sendo utilizado.",
        action: "Utilize outro username para realizar esta operação.",
        status_code: 400,
      });
    });

    // Verifica erro ao atualizar para um email já existente
    test("With duplicated 'email'", async () => {
      await orchestrator.createUser({
        email: "email1@gmail.com",
      });

      const createdUser = await orchestrator.createUser({
        email: "email2@gmail.com",
      });

      const response = await fetch(`http://localhost:3000/api/v1/users/${createdUser.username}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "email1@gmail.com",
        }),
      });

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O email informado já está sendo utilizado.",
        action: "Utilize outro email para realizar esta operação.",
        status_code: 400,
      });
    });

    // Verifica atualização do username com sucesso
    test("With update 'username'", async () => {
      await orchestrator.createUser({
        username: "uniqueUser1",
      });

      const response = await fetch("http://localhost:3000/api/v1/users/uniqueUser1", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "uniqueUser2",
        }),
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "uniqueUser2",
        email: responseBody.email,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    // Verifica atualização do email com sucesso
    test("With update 'email'", async () => {
      const createdUser = await orchestrator.createUser({
        email: "uniqueEmail1@gmail.com",
      });

      const response = await fetch(`http://localhost:3000/api/v1/users/${createdUser.username}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "uniqueEmail2@gmail.com",
        }),
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: responseBody.username,
        email: "uniqueEmail2@gmail.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    // Verifica atualização do password com sucesso
    test("With new 'password'", async () => {
      const createdUser = await orchestrator.createUser({
        password: "newPassword1",
      });

      const response = await fetch(`http://localhost:3000/api/v1/users/${createdUser.username}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: "newPassword2",
        }),
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: responseBody.username,
        email: responseBody.email,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const userIdDatabase = await user.findOneByUsername(createdUser.username);
      const correctPasswordMatch = await password.compare("newPassword2", userIdDatabase.password);
      expect(correctPasswordMatch).toBe(true);

      const incorrectPasswordMatch = await password.compare("newPassword1", userIdDatabase.password);
      expect(incorrectPasswordMatch).toBe(false);
    });
  });
});
