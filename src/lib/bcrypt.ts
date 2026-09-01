import bcrypt from "bcrypt";

export const hashPassword = (password: string) => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (
  passwordTo: string,
  passwordBy: string,
) => {
  return await bcrypt.compare(passwordTo, passwordBy);
};