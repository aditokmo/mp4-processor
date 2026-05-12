import type { Request, Response } from "express";
import { FileService } from "../services/file.service.js";

export class FileController {
    static async getFiles(req: Request, res: Response): Promise<void> {
        try {
            const files = await FileService.getAllFiles();
            res.status(200).json({ status: "success", data: files });
        } catch (error) {
            console.error("Error fetching files:", error);
            res.status(500).json({ status: "error", message: "Failed to retrieve files" });
        }
    }

    static async getFile(req: Request, res: Response): Promise<void> {
        const id = req.params.id as string;
        try {
            const file = await FileService.getFileById(id);
            if (!file) {
                res.status(404).json({ status: "error", message: "File not found" });
                return;
            }
            res.status(200).json({ status: "success", data: file });
        } catch (error) {
            console.error("Error fetching file:", error);
            res.status(500).json({ status: "error", message: "Failed to retrieve file" });
        }
    }

    static async uploadFile(req: Request, res: Response): Promise<void> {
        try {
            const { path } = req.body;
            if (!path) {
                res.status(400).json({ status: "error", message: "File path is required" });
                return;
            }

            if (typeof path !== "string") {
                res.status(400).json({ status: "error", message: "File path must be a string" });
                return;
            }

            const file = await FileService.uploadFile(path);
            res.status(201).json({ status: "success", data: file });
            
        } catch (error) {
            console.error("Error uploading file:", error);
            res.status(500).json({ status: "error", message: "Failed to upload file" });
        }
    }

    static async deleteFile(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id as string;
            if (!id) {
                res.status(400).json({ status: "error", message: "File ID is required" });
                return;
            }

            const deleted = await FileService.deleteFileById(id);

            if (!deleted) {
                res.status(404).json({ status: "error", message: "File not found" });
                return;
            }

            res.status(200).json({ status: "success", message: "File deleted" });
        } catch (error) {
            
        }
    }
}