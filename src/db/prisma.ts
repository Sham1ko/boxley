import { PrismaClient } from "../generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { DATABASE_URL } from "../config/config";

// Prisma 7 требует driver adapter: клиент работает поверх драйвера mariadb.
// Нюанс: драйвер mariadb из URL-параметров понимает только ssl=true/false и
// игнорирует ssl-mode/sslaccept (они нужны Prisma CLI для db push). ssl=true
// включает полную проверку сертификата и падает на self-signed CA Aiven,
// поэтому собираем конфиг сами: TLS включён, сертификат не проверяется.
// Для полной проверки можно скачать ca.pem из консоли Aiven и передать
// его как ssl: { ca: <pem> }.
const url = new URL(DATABASE_URL);
const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: url.port ? Number(url.port) : undefined,
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: decodeURIComponent(url.pathname.slice(1)),
  ssl: { rejectUnauthorized: false },
});

const prisma = new PrismaClient({ adapter });

export default prisma;
