const bcrypt = require("bcryptjs");

async function generatePassword() {
  const password = "Admin123";

  const hashedPassword = await bcrypt.hash(
    password,
    10
  );

  console.log(hashedPassword);
}

generatePassword();