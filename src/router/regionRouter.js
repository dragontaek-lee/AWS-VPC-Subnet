import { Router } from "express";
import { regionController } from "../controller/index.js";

const router = Router();

router.get("/", regionController.getAvailableRegions);

export default router;
