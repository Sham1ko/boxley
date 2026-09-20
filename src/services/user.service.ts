import bcrypt from "bcrypt";
import prisma from "../db/prisma";

export const createUser = async (password: string) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      password: hashedPassword,
    },
  });
  return user;
};

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

export const updateUser = async (id: string, updateData: any) => {
  const user = await prisma.user.update({
    where: { id },
    data: updateData,
  });
  return user;
};

export const deleteUser = async (id: string) => {
  await prisma.user.delete({
    where: { id },
  });
};
