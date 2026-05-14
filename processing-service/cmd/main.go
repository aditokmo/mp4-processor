package main

import (
	"log"
	"log/slog"
	"os"
	"os/signal"
	"processing-service/internal/config"
	"processing-service/internal/service"
	"syscall"

	"github.com/nats-io/nats.go"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))
	slog.SetDefault(logger)

	cfg, err := config.Load()
	if err != nil {
		slog.Error("Failed to load config", "error", err)
		os.Exit(1)
	}

	nc, err := nats.Connect(cfg.NatsURL)
	if err != nil {
		log.Fatalf("NATS Connection Error: %v", err)
	}
	defer nc.Close()

	log.Println("Go Processing Service is successfully started and it's listening on 'file.process'...")

	process := service.Process(nc, cfg.OutputDir)

	go func() {
		if err := process.Start(); err != nil {
			log.Println("Processing error:", err)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
	<-stop

	log.Println("Processing service is shutting down")
}
