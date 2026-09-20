import dotenv from "dotenv";

// dotenv.config() нужно вызвать до чтения переменных: модули сервисов
// вычисляются раньше, чем dotenv.config() в app.ts (импорты поднимаются вверх)
dotenv.config();

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
