import { Router } from "express";
import { FileController } from "../controllers/file.controller.js";

const router: Router = Router();

router.get("/", FileController.getFiles);
router.get("/:id", FileController.getFile);
router.post("/process", FileController.uploadFile); // Add rate limiter
router.delete("/:id", FileController.deleteFile);

export default router;