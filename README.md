# MP4 Processor

A microservices-based application that receives, processes, and stores information about MP4 files. Built with Node.js (API Service) and Go (Processing Service), communicating over NATS, with data stored in PostgreSQL. The system extracts the file data from MP4 files and stores the result for later use in video streaming piplines.

## How to start locally

1. Clone the repository:

```bash
git clone https://github.com/aditokmo/mp4-processor.git
cd mp4-processor
```

2. Create a `.env` file and copy from .env-example:

ENV files are needed in:
- root
- api
- processing-service

3. Start the services with Docker Compose:

```bash
docker compose up --build
```

4. Wait for the services to start.
   - PostgreSQL database
   - NATS message broker
   - Node.js API service
   - Go processing service

5. When services are started, open Postman and visit the [API Documentation](#api-documentation) section.

## How it works

- User sends a `POST /files/process` request with an absolute path to an MP4 file on disk
- API Service saves a record to the database with status PROCESSING
- API Service publishes a NATS message to the Processing Service
- Processing Service receives the message, opens the MP4 file, extracts the initialization file data (ftyp + moov boxes) and writes it to a new file, and saves it to `shared/output` folder
- Processing Service publishes the result back to the API Service via NATS
- API Service receives the result and updates the database record with status SUCCESSFUL or FAILED
- User can check the status and get the path to the processed file

## Volume Mounts

The `shared/` folder is already included in the repository with a test 
MP4 file ready to use. Both services mount this folder automatically 
with Docker Compose - no additional setup is required.

After cloning and running `docker compose up --build`, the folder 
structure for videos and file output looks like this:

```text
shared/
├── video.mp4
└── output/
```

Both the API Service and Processing Service access the same 
`/shared/` path inside their containers. When you submit 
`/shared/video.mp4` as the file path, both services can read 
and write to this location.

To test with your own MP4 file, simply copy it into the `shared/` 
folder and use its path in the request:


```json
{
   "path": "/shared/your-file.mp4"
}
```

## API Documentation

### Base URL
 
```
http://localhost:3000
```
 
### Endpoints Overview
 
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/files` | List all files |
| `GET` | `/api/v1/files/:id` | Get single file details |
| `POST` | `/api/v1/files/process` | Submit file for processing |
| `DELETE` | `/api/v1/files/:id` | Delete file record |

### Request Examples

#### List all files
```bash
curl -X GET http://localhost:3000/api/v1/files
```

#### Get single file details
```bash
curl -X GET http://localhost:3000/api/v1/files/123
```
Replace `123` with the actual file ID.

#### Submit file for processing
```bash
curl -X POST http://localhost:3000/api/v1/files/process \
  -H "Content-Type: application/json" \
  -d '{"path": "/shared/video.mp4"}'
```
**Body required:** JSON object with `path` field containing an absolute path to the MP4 file on disk.

#### Delete file record
```bash
curl -X DELETE http://localhost:3000/api/v1/files/123
```
Replace `123` with the actual file ID.

## Tech Stack

| Service | Technology |
|---|---|
| API Service | Node.js, TypeScript, Express, Prisma |
| Processing Service | Go |
| Message Broker | NATS |
| Database | PostgreSQL |
| Containerization | Docker, Docker Compose |
