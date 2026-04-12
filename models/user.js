import database from "infra/database";
import { ValidationError, NotFoundError } from "infra/errors.js";
import password from "models/password.js";

// --------------------------- função para BUSCAR Usuário ---------------------------

async function findOneByUsername(username) {
  const userFound = await runSelectQuery(username);
  return userFound;

  async function runSelectQuery(username) {
    const results = await database.query({
      text: `
          SELECT
            *
          FROM 
            users
          WHERE
            LOWER(username) = LOWER($1)
          LIMIT
            1
          ;`,
      values: [username],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "O username informado não foi encontrado no sistema.",
        action: "Verfifique se o username está digitado corretamente.",
      });
    }

    return results.rows[0];
  }
}

// --------------------------- função para CRIAR Usuário ---------------------------

async function create(userInputValues) {
  await validateUniqueUsername(userInputValues.username);
  await validateUniqueEmail(userInputValues.email);
  await hashPasswordInObject(userInputValues);

  const newUser = await runInsertQuery(userInputValues);
  return newUser;

  async function runInsertQuery(userInputValues) {
    const results = await database.query({
      text: `
          INSERT INTO 
            users (username, email, password) 
          VALUES 
            ($1, $2, $3)
          RETURNING
            *
          ;`,
      values: [userInputValues.username, userInputValues.email, userInputValues.password],
    });
    return results.rows[0];
  }
}

// --------------------------- função para ATUALIZAR Usuário ---------------------------

async function update(username, userInputValues) {
  const currentUser = await findOneByUsername(username);

  if ("username" in userInputValues) {
    if (currentUser.username.toLowerCase() !== userInputValues.username.toLowerCase()) {
      await validateUniqueUsername(userInputValues.username);
    }
  }

  if ("email" in userInputValues) {
    await validateUniqueEmail(userInputValues.email);
  }

  if ("password" in userInputValues) {
    await hashPasswordInObject(userInputValues);
  }

  const userWithNewValues = { ...currentUser, ...userInputValues };
  const updateUser = await runUpdateQuery(userWithNewValues);

  return updateUser;

  async function runUpdateQuery(userWithNewValues) {
    const results = await database.query({
      text: `
        UPDATE
          users
        SET
          username = $2,
          email = $3,
          password = $4,
          updated_at = timezone('utc', now())
        WHERE
          id = $1
        RETURNING
          *
      `,
      values: [userWithNewValues.id, userWithNewValues.username, userWithNewValues.email, userWithNewValues.password],
    });

    return results.rows[0];
  }
}

// --------------------------- função para VALIDAR se o USERNAME é único ---------------------------

async function validateUniqueUsername(username) {
  const results = await database.query({
    text: `
          SELECT
            username
          FROM 
            users
          WHERE
            LOWER(username) = LOWER($1)
          ;`,
    values: [username],
  });

  if (results.rowCount > 0) {
    throw new ValidationError({
      message: "O username informado já está sendo utilizado.",
      action: "Utilize outro username para realizar esta operação.",
    });
  }
}

// --------------------------- função para VALIDAR se o EMAIL é único ---------------------------

async function validateUniqueEmail(email) {
  const results = await database.query({
    text: `
          SELECT
            email
          FROM 
            users
          WHERE
            LOWER(email) = LOWER($1)
          ;`,
    values: [email],
  });

  if (results.rowCount > 0) {
    throw new ValidationError({
      message: "O email informado já está sendo utilizado.",
      action: "Utilize outro email para realizar esta operação.",
    });
  }
}

// --------------------------- função para criptografar a senha ---------------------------

async function hashPasswordInObject(userInputValues) {
  const hashedPassword = await password.hash(userInputValues.password);
  userInputValues.password = hashedPassword;
}

const user = {
  create,
  findOneByUsername,
  update,
};

export default user;
