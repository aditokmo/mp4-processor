package parser

import (
	"encoding/binary"
	"fmt"
	"io"
	"os"
	"path/filepath"
)

type box struct {
	size     uint32
	boxType  string
	rawBytes []byte
}

func readFileBox(file io.Reader) (*box, error) {
	header := make([]byte, 8)
	if _, err := io.ReadFull(file, header); err != nil {
		return nil, fmt.Errorf("Failed to read box header: %w", err)
	}

	size := binary.BigEndian.Uint32(header[0:4])

	boxType := string(header[4:8])

	if size < 8 {
		return nil, fmt.Errorf("Invalid box size %d for box type %q: must be at least 8", size, boxType)
	}

	dataLen := size - 8
	data := make([]byte, dataLen)

	if dataLen > 0 {
		if _, err := io.ReadFull(file, data); err != nil {
			return nil, fmt.Errorf("Failed to read box data for type %q: %w", boxType, err)
		}
	}

	rawBytes := make([]byte, size)
	copy(rawBytes[0:8], header)
	copy(rawBytes[8:], data)

	return &box{
		size:     size,
		boxType:  boxType,
		rawBytes: rawBytes,
	}, nil
}

func ExtractFileInit(filePath, outputDir, fileID string) (string, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return "", fmt.Errorf("Failed to open file %q: %w", filePath, err)
	}
	defer file.Close()

	ftypBox, err := readFileBox(file)
	if err != nil {
		return "", fmt.Errorf("Failed to read first box: %w", err)
	}

	if ftypBox.boxType != "ftyp" {
		return "", fmt.Errorf(
			"Expected first box to be 'ftyp', got %q - file may not be a valid MP4 file",
			ftypBox.boxType,
		)
	}

	moovBox, err := readFileBox(file)
	if err != nil {
		return "", fmt.Errorf("Failed to read second box: %w", err)
	}

	if moovBox.boxType != "moov" {
		return "", fmt.Errorf(
			"Expected second box to be 'moov', got %q - file may not be a valid MP4 file",
			moovBox.boxType,
		)
	}

	initSegment := make([]byte, 0, len(ftypBox.rawBytes)+len(moovBox.rawBytes))
	initSegment = append(initSegment, ftypBox.rawBytes...)
	initSegment = append(initSegment, moovBox.rawBytes...)

	if err := os.MkdirAll(outputDir, 0755); err != nil {
		return "", fmt.Errorf("Failed to create output directory %q: %w", outputDir, err)
	}

	outputFilename := fmt.Sprintf("%s_init.mp4", fileID)
	outputPath := filepath.Join(outputDir, outputFilename)

	return outputPath, nil
}
