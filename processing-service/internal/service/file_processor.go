package service

import (
	"encoding/json"
	"fmt"
	"log"
	"processing-service/internal/model"
	"processing-service/internal/parser"

	"github.com/nats-io/nats.go"
)

type FileProcessor struct {
	nc        *nats.Conn
	outputDir string
}

func Process(nc *nats.Conn, outputDir string) *FileProcessor {
	return &FileProcessor{
		nc,
		outputDir,
	}
}

func (p *FileProcessor) Start() error {
	log.Printf("Subscribing to NATS subject: %s", model.SubjectFileProcess)

	sub, err := p.nc.Subscribe(model.SubjectFileProcess, p.handleMessage)
	if err != nil {
		return fmt.Errorf("Failed to subscribe to %s %w", model.SubjectFileProcess, err)
	}

	log.Printf("Processing service ready - waiting for jobs...")

	p.nc.Flush()

	p.nc.SetClosedHandler(func(nc *nats.Conn) {
		log.Println("NATS connection closed")
		sub.Unsubscribe()
	})

	runtime := make(chan struct{})
	<-runtime

	return nil
}

func (p *FileProcessor) handleMessage(msg *nats.Msg) {
	var job model.ProcessFileMessage
	if err := json.Unmarshal(msg.Data, &job); err != nil {
		log.Printf("ERROR: failed to decode file.process message: %v", err)
		return
	}

	log.Printf("Received job - fileId: %s, path: %s", job.FileID, job.FilePath)

	outputPath, err := parser.ExtractFileInit(job.FilePath, p.outputDir, job.FileID)

	var result model.FileResultMessage

	if err != nil {
		log.Printf("ERROR: failed to process fileId %s: %v", job.FileID, err)
		result = model.FileResultMessage{
			FileID: job.FileID,
			Status: "FAILED",
			Error:  err.Error(),
		}
	} else {
		log.Printf("SUCCESS: fileId %s → %s", job.FileID, outputPath)
		result = model.FileResultMessage{
			FileID:     job.FileID,
			Status:     "SUCCESSFUL",
			OutputPath: outputPath,
		}
	}

	if err := p.publishResult(result); err != nil {
		log.Printf("ERROR: failed to publish result for fileId %s: %v", job.FileID, err)
	}
}

func (p *FileProcessor) publishResult(result model.FileResultMessage) error {
	data, err := json.Marshal(result)
	if err != nil {
		return fmt.Errorf("Failed to encode result message: %w", err)
	}

	if err := p.nc.Publish(model.SubjectFileResult, data); err != nil {
		return fmt.Errorf("Failed to publish to %s: %w", model.SubjectFileResult, err)
	}

	return nil
}
