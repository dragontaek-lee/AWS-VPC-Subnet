import { regionService } from "../service/index.js";

// get all available region in account
const getAvailableRegions = async (req, res) => {
    const data = await regionService.getAvailableRegions();
    return res.json({ status: 200, message: "region info get success", data: data});
};

const regionController = {
    getAvailableRegions,
};

export default regionController;
