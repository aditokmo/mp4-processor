export enum ProcessingStatus {
  PROCESSING = "PROCESSING",
  SUCCESSFUL = "SUCCESSFUL",
  FAILED = "FAILED",
}

export interface FileMetadata {
  id: string;
  originalPath: string;
  processedPath?: string | null;
  status: ProcessingStatus;
  errorMessage?: string | null;
  createdAt: Date;
}

export interface FileProcessPayload {
  fileId: string;
  filePath: string;
  status: ProcessingStatus;
}

export interface FileProcessResult {
  fileId: string;
  outputPath: string;
  status: ProcessingStatus;
}