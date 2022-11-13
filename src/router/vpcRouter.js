import { Router } from "express";
import { vpcController } from "../controller/index.js";

const router = Router();

router.get("/", vpcController.getVPCInfo);
router.get("/subnet", vpcController.getSubnetInfo);

export default router;
