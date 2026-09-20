import { randomUUID } from "crypto";
import { S3 } from "@aws-sdk/client-s3";
import {
  S3_ACCESS_KEY_ID,
  S3_BUCKET,
  S3_ENDPOINT,
  S3_SECRET_ACCESS_KEY,
} from "../config/config";
import prisma from "../db/prisma";

const s3 = new S3({
  credentials: {
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: S3_SECRET_ACCESS_KEY,
  },
  endpoint: S3_ENDPOINT,
  region: "us-east-1", // S3-совместимые хранилища регион не требуют, но клиенту он нужен
  forcePathStyle: true, // path-style URL — и для MinIO, и для R2
});
const BUCKET_NAME = S3_BUCKET;

// Функция загрузки файла
export const uploadFile = async (file: any, userId: string) => {
  const fileKey = `${randomUUID()}-${file.originalname}`;
  const params = {
    Bucket: BUCKET_NAME,
    Key: fileKey,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  // Загрузка файла в MinIO
  await s3.putObject(params);

  const extension = file.originalname.split(".").pop() || "";

  // Сохранение информации о файле в базе данных
  const newFile = await prisma.file.create({
    data: {
      filePath: fileKey,
      name: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      extension: extension,
      userId: userId,
      status: "uploaded",
      uploadDate: new Date(),
    },
  });

  return newFile;
};

// Функция получения файла по ID (только своего)
export const getFileById = async (id: number, userId: string) => {
  const file = await prisma.file.findFirst({
    where: { id, userId },
  });
  if (!file) throw new Error("File not found");
  return file;
};

// Функция получения списка файлов с пагинацией для опреденного пользователя
export const listFilesByUser = async (
  userId: string,
  page: number,
  listSize: number
) => {
  const files = await prisma.file.findMany({
    where: { userId },
    skip: (page - 1) * listSize,
    take: listSize,
  });
  return files;
};

// Функция удаления файла по ID (только своего)
export const deleteFile = async (id: number, userId: string) => {
  const file = await prisma.file.findFirst({
    where: { id, userId },
  });
  if (!file) throw new Error("File not found");

  if (file.filePath) {
    await s3.deleteObject({
      Bucket: BUCKET_NAME,
      Key: file.filePath, // Используем filePath как ключ для удаления
    });
  } else {
    throw new Error("File path is null");
  }

  // Удаление файла из базы данных
  await prisma.file.delete({
    where: { id },
  });
};

// Функция получения файла по ID для скачивания (только своего)
export const downloadFile = async (id: number, userId: string) => {
  const file = await prisma.file.findFirst({
    where: { id, userId },
  });

  if (!file || !file.filePath) {
    throw new Error("File not found");
  }

  const params = {
    Bucket: BUCKET_NAME,
    Key: file.filePath,
  };

  const data = await s3.getObject(params);

  return {
    name: file.name,
    mimeType: file.mimeType,
    body: data.Body as ReadableStream,
  };
};
