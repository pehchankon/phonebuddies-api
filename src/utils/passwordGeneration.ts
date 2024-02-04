async function generateBcryptHash(rawPassword: string): Promise<string> {
  return await Bun.password.hash(rawPassword, {
    algorithm: "bcrypt",
    cost: 4,
  });
}

async function comparePassword(
  rawPassword: string,
  hashedPassword: string
): Promise<boolean> {
  const verify = await Bun.password.verify(rawPassword, hashedPassword);
  return verify;
}

export { generateBcryptHash, comparePassword }
