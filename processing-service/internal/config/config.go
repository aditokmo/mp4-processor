package config

import (
	"fmt"
	"os"
)

type Config struct {
	NatsURL   string
	OutputDir string
}

func Load() (*Config, error) {
	natsURL := os.Getenv("NATS_URL")
	if natsURL == "" {
		natsURL = "nats://nats:4222"
	}

	outputDir := os.Getenv("OUTPUT_DIR")
	if outputDir == "" {
		return nil, fmt.Errorf("OUTPUT_DIR environment is not set")
	}

	return &Config{
		NatsURL:   natsURL,
		OutputDir: outputDir,
	}, nil
}
