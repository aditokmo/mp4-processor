import { connect, NatsConnection } from "@nats-io/transport-node";
import { FileProcessPayload } from "../utils/types";

let nc: NatsConnection;

export const SUBJECTS = {
  FILE_PROCESS: "file.process",
  FILE_RESULT: "file.result",
} as const;

export const connectNats = async () => {
  const natsUrl = process.env.NATS_URL || "nats://nats:4222";
  try {
    nc = await connect({ servers: natsUrl });
    console.log(`NATS connected to: ${natsUrl}`);
  } catch (err) {
    console.error("NATS error:", err);
    throw err;
  }
};

export const publishFileForProcessing = (data: FileProcessPayload) => {
  if (!nc) throw new Error("NATS nije inicijalizovan");
  
  const jsonString = JSON.stringify(data);

  const payload = Buffer.from(jsonString);
  
  nc.publish(SUBJECTS.FILE_PROCESS, payload);
};

export function getNatsConnection(): NatsConnection {
  if (!nc) {
    throw new Error('NATS connection not established. Call connectNats() first.');
  }
  return nc;
}