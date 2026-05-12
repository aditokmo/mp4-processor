import 'dotenv/config';
import app from "./app.js";

async function startServer() {
    try {
        const PORT = process.env.PORT || 3000;

        app.listen(PORT, () => {
            console.log(`API is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start the server:", error);
        process.exit(1);
    }
}

startServer();