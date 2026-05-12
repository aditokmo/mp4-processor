import { FileMetadata } from "@prisma/client";
import { FileRepository } from "../repository/file.repository.js";

export class FileService {
    static async getAllFiles(): Promise<FileMetadata[]> {
        return await FileRepository.getAll();
    }

    static async getFileById(id: string): Promise<FileMetadata | null> {
        return await FileRepository.getById(id);
    }

    static async uploadFile(path: string): Promise<FileMetadata> {
        const file = await FileRepository.upload(path);

        // NATS integration

        return file;
    }

    static async deleteFileById(id: string): Promise<FileMetadata | null> {
        return await FileRepository.deleteById(id);
    }
}