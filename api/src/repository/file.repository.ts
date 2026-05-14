import { FileMetadata } from "@prisma/client";
import {prisma} from "../lib/prisma.js";
import { FileProcessPayload, FileProcessResult, ProcessingStatus } from "../utils/types.js";


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

    static async updateStatus(file: FileProcessResult): Promise<FileMetadata | null> {
        const existingFile = await prisma.fileMetadata.findUnique({ where: { id: file.fileId } });
        if (!existingFile) return null;

        return await prisma.fileMetadata.update({
            where: { id: file.fileId },
            data: {
                status: file.status,
                processedPath: file.outputPath
            }
        })
    }

    static async deleteById(id: string): Promise<FileMetadata | null> {
        const existingFile = await prisma.fileMetadata.findUnique({ where: { id } });
        if (!existingFile) return null;
        return await prisma.fileMetadata.delete({ where: { id } });
    }
}