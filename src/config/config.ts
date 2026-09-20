import dotenv from "dotenv";

// dotenv.config() нужно вызвать до чтения переменных: модули сервисов
// вычисляются раньше, чем это происходит в других модулях (импорты поднимаются вверх).
// quiet — чтобы dotenv 18 не печатал подсказки в логи сервера
dotenv.config({ quiet: true });

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} is not set. Add it to the .env file (e.g. \`${name}=<value>\`).`
    );
  }
  return value;
}

export const JWT_SECRET: string = requireEnv("JWT_SECRET");
export const MINIO_ROOT_USER: string = requireEnv("MINIO_ROOT_USER");
export const MINIO_ROOT_PASSWORD: string = requireEnv("MINIO_ROOT_PASSWORD");
export const MINIO_DEFAULT_BUCKET: string = requireEnv("MINIO_DEFAULT_BUCKET");
// МинIO-совместимый S3 endpoint; по умолчанию локальный MinIO из docker-compose
export const MINIO_ENDPOINT: string =
  process.env.MINIO_ENDPOINT || "http://localhost:9000";

// В .env DATABASE_URL написан с интерполяцией вида ${MYSQL_USER} —
// раскрываем ссылки на другие переменные окружения сами
const expandEnv = (value: string): string =>
  value.replace(/\$\{([^}]+)\}/g, (_, name: string) => process.env[name] ?? "");

export const DATABASE_URL: string = expandEnv(requireEnv("DATABASE_URL"));
