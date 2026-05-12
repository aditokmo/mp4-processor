import { FileMetadata } from "@prisma/client";
import {prisma} from "../lib/prisma.js";
import { ProcessingStatus } from "../utils/types.js";


export class FileRepository {
    static async getAll(): Promise<FileMetadata[]> {
        return await prisma.fileMetadata.findMany({ orderBy: { createdAt: "desc" } });
    }

    static async getById(id: string): Promise<FileMetadata | null> {
        return await prisma.fileMetadata.findUnique({ where: { id } });
    }

    static async upload(path: string): Promise<FileMetadata> {
        return await prisma.fileMetadata.create({
            data: {
                originalPath: path,
                status: ProcessingStatus.PROCESSING,
            },
        })
    }

    static async deleteById(id: string): Promise<FileMetadata | null> {
        const existingFile = await prisma.fileMetadata.findUnique({ where: { id } });
        if (!existingFile) return null;
        return await prisma.fileMetadata.delete({ where: { id } });
    }
}