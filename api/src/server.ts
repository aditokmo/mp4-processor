import 'dotenv/config';
import app from "./app.js";
import { connectNats, getNatsConnection, SUBJECTS } from "./lib/nats.js";
import { FileService } from './services/file.service.js';

async function startServer() {
    try {
        await connectNats();
        
        const nc = getNatsConnection();
        const decoder = new TextDecoder();

        const subscription = nc.subscribe(SUBJECTS.FILE_RESULT);
        
        (async () => {
            for await (const msg of subscription) {
                const data = JSON.parse(decoder.decode(msg.data));
                console.log("Stigao rezultat iz Go servisa!", data.fileId);
                
                await FileService.handleProcessingResult(data);
            }
        })();
        // --------------------------------------------

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`API is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

startServer();