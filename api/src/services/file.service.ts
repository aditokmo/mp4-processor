import { FileMetadata } from "@prisma/client";
import { FileRepository } from "../repository/file.repository.js";
import { FileProcessPayload, FileProcessResult, ProcessingStatus } from "../utils/types.js";
import { publishFileForProcessing } from "../lib/nats.js";

export class FileService {
    static async getAllFiles(): Promise<FileMetadata[]> {
        return await FileRepository.getAll();
    }

    static async getFileById(id: string): Promise<FileMetadata | null> {
        return await FileRepository.getById(id);
    }

    static async uploadFile(path: string): Promise<FileMetadata> {
        const file = await FileRepository.upload(path);

        const message: FileProcessPayload = {
            fileId: file.id,
            filePath: file.originalPath,
            status: file.status as ProcessingStatus
        }

        try {
            publishFileForProcessing(message);
            console.log(`Published file.process for fileId: ${file.id}`);
        } catch (error) {
            console.error(`Failed to publish NATS message:`, error);
        }

        return file;
    }

    static async handleProcessingResult(message: FileProcessResult): Promise<void> {
        const status = message.status.toUpperCase() as ProcessingStatus
        console.log(`Received file.result for fileId: ${message.fileId}, path: ${message.outputPath}`);

        await FileRepository.updateStatus({
            fileId: message.fileId,
            status,
            outputPath: message.outputPath
        });
    }

    static async deleteFileById(id: string): Promise<FileMetadata | null> {
        return await FileRepository.deleteById(id);
    }
}