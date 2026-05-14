import type { Request, Response } from "express";
import { FileService } from "../services/file.service.js";
import path from "node:path";
import fs from "node:fs";

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
            const filePath = req.body.path;
            if (!filePath) {
                res.status(400).json({ status: "error", message: "File path is required" });
                return;
            }

            if (typeof filePath !== "string") {
                res.status(400).json({ status: "error", message: "File path must be a string" });
                return;
            }

            if (!path.isAbsolute(filePath)) {
                res.status(400).json({ status: "error", message: "File path must be an absolute path" });
                return;
            }

            let fileDetails;
            try {
                fileDetails = await fs.promises.stat(filePath);
            } catch {
                res.status(400).json({ status: "error", message: "File path does not exist or is not accessible" });
                return;
            }

            if (!fileDetails.isFile()) {
                res.status(400).json({ status: "error", message: "File path must point to a file" });
                return;
            }

            if (!filePath.toLowerCase().endsWith('.mp4')) {
                res.status(400).json({ status: "error", message: "Only MP4 files are supported" });
                return;
            }

            try {
                const fileHandle = await fs.promises.open(filePath, 'r');
                const buffer = Buffer.alloc(12);
                await fileHandle.read(buffer, 0, 12, 0);
                await fileHandle.close();
                
                const magicString = buffer.toString('ascii', 4, 8);
                if (magicString !== 'ftyp') {
                    res.status(400).json({ status: "error", message: "File does not appear to be a valid MP4 file" });
                    return;
                }
            } catch (error) {
                console.error("Error reading file for validation:", error);
                res.status(500).json({ status: "error", message: "Failed to validate file" });
                return;
            }

            const file = await FileService.uploadFile(filePath);
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
            console.error("Error deleting file:", error);
            res.status(500).json({ status: "error", message: "Failed to delete file" });
        }
    }
}