import "dotenv/config";
import path from "path";
import { defineConfig } from "prisma/config";

// В .env DATABASE_URL написан с интерполяцией вида ${MYSQL_USER} — раскрываем сами
const expandEnv = (value: string): string =>
  value.replace(/\$\{([^}]+)\}/g, (_, name: string) => process.env[name] ?? "");

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
  },
  datasource: {
    url: expandEnv(process.env.DATABASE_URL ?? ""),
  },
});
