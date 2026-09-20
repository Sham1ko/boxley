import { PrismaClient } from "../generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { DATABASE_URL } from "../config/config";

// Prisma 7 требует driver adapter: клиент работает поверх драйвера mariadb
const adapter = new PrismaMariaDb(DATABASE_URL);

const prisma = new PrismaClient({ adapter });

export default prisma;
