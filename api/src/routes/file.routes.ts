import { Router } from "express";
import { FileController } from "../controllers/file.controller.js";
import { uploadRateLimiter } from "../middleware/rateLimiter.js";

const router: Router = Router();

router.get("/", FileController.getFiles);
router.get("/:id", FileController.getFile);
router.post("/process", uploadRateLimiter, FileController.uploadFile);
router.delete("/:id", FileController.deleteFile);

export default router;