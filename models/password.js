import bcryptjs from "bcryptjs";

async function hash(password) {
  const pepper = process.env.PEPPER_PASSWORD;
  const passwordWithPepper = password + pepper;
  const rounds = getNumberOfRounds();
  return await bcryptjs.hash(passwordWithPepper, rounds);
}

function getNumberOfRounds() {
  return process.env.NODE_ENV === "production" ? 14 : 1;
}

async function compare(providePassword, storedPassword) {
  return await bcryptjs.compare(providePassword + process.env.PEPPER_PASSWORD, storedPassword);
}

const password = {
  hash,
  compare,
};

export default password;
