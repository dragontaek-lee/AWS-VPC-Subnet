import { vpcService } from "../service/index.js";

const getVPCInfo = async (req, res) => {
    const data = await vpcService.getVPCInfo();
    return res.json({ status: 200, message: "VPC info get success", data: data});
};

const getSubnetInfo = async (req, res) => {
    const data = await vpcService.getSubnetInfo();
    return res.json({ status: 200, message: "Subnet info get success", data: data});
}

const vpcController = {
    getVPCInfo,
    getSubnetInfo
};

export default vpcController;
