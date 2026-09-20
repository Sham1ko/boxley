import dotenv from "dotenv";

// dotenv.config() нужно вызвать до чтения переменных: модули сервисов
// вычисляются раньше, чем dotenv.config() в app.ts (импорты поднимаются вверх)
dotenv.config();

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error(
    "JWT_SECRET is not set. Add it to the .env file (e.g. `JWT_SECRET=<random hex>`)."
  );
}

export const JWT_SECRET: string = secret;
