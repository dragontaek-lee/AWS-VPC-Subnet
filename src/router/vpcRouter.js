import { Router } from "express";
import { vpcController } from "../controller/index.js";

const router = Router();

router.get("/", vpcController.getVPCInfo);
router.post("/",vpcController.saveVPCInfo);
router.get("/subnet", vpcController.getSubnetInfo);
router.post("/subnet", vpcController.saveSubnetInfo);

export default router;
