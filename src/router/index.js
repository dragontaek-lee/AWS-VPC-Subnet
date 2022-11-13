import { Router } from "express";
import vpcRouter from "./vpcRouter.js";
import regionRouter from "./regionRouter.js";

const router = Router();

router.use("/vpc", vpcRouter);
router.use("/region", regionRouter);

export default router;
