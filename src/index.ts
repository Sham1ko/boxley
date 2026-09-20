import app from "./app";

// На Vercel приложение работает как serverless-функция: экспортируем app,
// локально — обычный HTTP-сервер
if (!process.env.VERCEL) {
  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
}

export default app;
