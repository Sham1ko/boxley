import { Request, Response } from "express";
import * as fileService from "../services/file.service";
import { CustomRequest } from "../middlewares/auth.middleware";

export const uploadFile = async (req: any, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const userId = req.user.id;
    const file = await fileService.uploadFile(req.file, userId);
    res.status(201).json(file);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};

export const getFileById = async (req: CustomRequest<{ id: string }>, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const file = await fileService.getFileById(id, req.user.id);
    res.status(200).json(file);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};

export const listFiles = async (req: CustomRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const listSize = parseInt(req.query.listSize as string, 10) || 10;
    const userId = req.user.id;
    const files = await fileService.listFilesByUser(userId, page, listSize);
    res.status(200).json(files);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};

export const deleteFile = async (req: CustomRequest<{ id: string }>, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    await fileService.deleteFile(id, req.user.id);
    res.status(204).send();
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};

// Контроллер для скачивания файла
export const downloadFile = async (req: CustomRequest<{ id: string }>, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);

    // Сервис фильтрует по userId: чужой файл выбросит "File not found"
    const { name, mimeType, body } = await fileService.downloadFile(
      id,
      req.user.id
    );

    res.setHeader("Content-Disposition", `attachment; filename="${name}"`);
    res.setHeader("Content-Type", mimeType);

    (body as any).pipe(res);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "File not found") {
      res.status(404).json({ error: error.message });
    } else if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};
