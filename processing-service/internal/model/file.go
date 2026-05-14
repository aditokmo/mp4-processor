package model

const (
	SubjectFileProcess = "file.process"
	SubjectFileResult  = "file.result"
)

type ProcessFileMessage struct {
	FileID   string `json:"fileId"`
	FilePath string `json:"filePath"`
}

type FileResultMessage struct {
	FileID     string `json:"fileId"`
	Status     string `json:"status"`
	OutputPath string `json:"outputPath,omitempty"`
	Error      string `json:"error,omitempty"`
}
