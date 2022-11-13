import { Router } from "express";
import vpcRouter from "./vpcRouter.js";

const router = Router();

router.use("/vpc", vpcRouter);

export default router;
