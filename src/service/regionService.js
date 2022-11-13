import AWS from "aws-sdk";

/**
 * get all available regions of account
 *
 * @return {object} data of all available regions(Endpoint, RegionName, OptStatus)
 */
const getAvailableRegions = () => {
    const ec2 = new AWS.EC2();
    return new Promise((resolve, reject)=>{
        ec2.describeRegions({},(err,data) => {
            if(err) reject(err);
            else resolve(data);
        })
    })
};

const regionService = {
    getAvailableRegions
};

export default regionService;

