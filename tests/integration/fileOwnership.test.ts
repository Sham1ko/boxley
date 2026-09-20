import supertest from "supertest";
import app from "../../src/app";
import setupTestDB from "../utils/setupTestDB";

setupTestDB();

describe("File ownership", () => {
  let userAId: string;
  let tokenA: string;
  let tokenB: string;
  let fileId: number;

  // Глобальный beforeEach из setupTestDB уже очистил таблицы,
  // поэтому создаём пользователей и файл здесь, в каждом тесте
  beforeEach(async () => {
    const [signupA, signupB] = await Promise.all([
      supertest(app)
        .post("/api/auth/signup")
        .send({ password: "password123", device: "device-a" })
        .expect(201),
      supertest(app)
        .post("/api/auth/signup")
        .send({ password: "password123", device: "device-b" })
        .expect(201),
    ]);
    userAId = signupA.body.user.id;
    tokenA = signupA.body.accessToken;
    tokenB = signupB.body.accessToken;

    const upload = await supertest(app)
      .post("/api/file/upload")
      .set("Authorization", `Bearer ${tokenA}`)
      .attach("file", Buffer.from("test content"), {
        filename: "test.txt",
        contentType: "text/plain",
      })
      .expect(201);
    fileId = upload.body.id;
  });

  it("allows the owner to get the file", async () => {
    const response = await supertest(app)
      .get(`/api/file/${fileId}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .expect(200);

    expect(response.body.id).toBe(fileId);
    expect(response.body.userId).toBe(userAId);
  });

  it("returns 404 when another user gets the file", async () => {
    await supertest(app)
      .get(`/api/file/${fileId}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .expect(404);
  });

  it("returns 404 when another user downloads the file", async () => {
    await supertest(app)
      .get(`/api/file/download/${fileId}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .expect(404);
  });

  it("lets the owner download the file", async () => {
    const response = await supertest(app)
      .get(`/api/file/download/${fileId}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .expect(200);

    expect(response.text).toBe("test content");
    expect(response.headers["content-disposition"]).toContain("test.txt");
  });

  it("returns 404 when another user deletes the file and keeps it intact", async () => {
    await supertest(app)
      .delete(`/api/file/${fileId}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .expect(404);

    // Файл не должен был удалиться
    await supertest(app)
      .get(`/api/file/${fileId}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .expect(200);
  });

  it("lets the owner delete the file", async () => {
    await supertest(app)
      .delete(`/api/file/${fileId}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .expect(204);

    await supertest(app)
      .get(`/api/file/${fileId}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .expect(404);
  });

  it("returns 403 when a user accesses another user's profile", async () => {
    const userBId = await supertest(app)
      .get("/api/auth/info")
      .set("Authorization", `Bearer ${tokenB}`)
      .expect(200)
      .then((response) => response.body.id);

    await supertest(app)
      .get(`/api/user/${userBId}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .expect(403);

    await supertest(app)
      .put(`/api/user/${userBId}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ password: "newpass" })
      .expect(403);

    await supertest(app)
      .delete(`/api/user/${userBId}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .expect(403);
  });
});
