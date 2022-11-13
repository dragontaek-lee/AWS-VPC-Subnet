import { vpcService } from "../service/index.js";

const getVPCInfo = async (req, res) => {
    const data = await vpcService.getVPCInfo();
    return res.json({ status: 200, message: "VPC info get success", data: data});
};

const saveVPCInfo = async (req, res) => {
    await vpcService.saveVPCInfo();
    return res.json({ status: 200, message: "VPC info saved successfly"});
}

const getSubnetInfo = async (req, res) => {
    const data = await vpcService.getSubnetInfo();
    return res.json({ status: 200, message: "Subnet info get success", data: data});
}

const vpcController = {
    getVPCInfo,
    getSubnetInfo,
    saveVPCInfo
};

export default vpcController;
