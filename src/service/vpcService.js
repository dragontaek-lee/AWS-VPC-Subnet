import AWS from "aws-sdk";

/**
 * get all VPCs and get detail informations
 *
 * @return {object} detail information of VPCS
 */
const getVPCInfo = async () => {
    const ec2 = new AWS.EC2();
    let vpcList = await getVPCs(ec2);
    let refinedVPCs = refineVPCs(vpcList.Vpcs);
    return getVPCDetails(ec2, refinedVPCs);
};

/**
 * get all VPC in region 
 *
 * @param {Instance} ec2 ec2 instance
 * @return {object} list of VPC in region,id
 */
const getVPCs = (ec2) => {
    return new Promise((resolve, reject)=>{
        ec2.describeVpcs((err,data)=>{
            if(err) reject(err);
            else resolve(data);
        })
    })
}

/**
 * refine vpcList
 * save only the Id of the VPCs
 * 
 * @param {Array} vpcList list of VPC infos
 * @return {Array} refined VPC list
 */
const refineVPCs = (vpcList) => {
    return vpcList.map(x => {
        return x.VpcId;
    })
}

/**
 * get detailed info of VPCs
 *
 * @param {Instance} ec2 ec2 instance
 * @param {Array} vpcList refined VPC list
 * @return {object} get detailed info of VPCS of each VPC id
 */
const getVPCDetails = (ec2, vpcList) => {
    const params = {
        VpcIds: vpcList
    }
    return new Promise((resolve, reject)=>{
        ec2.describeVpcs(params,(err,data)=>{
            if(err) reject(err);
            else resolve(data);
        })
    })
}

const getSubnetInfo = async () => {
    const ec2 = new AWS.EC2();
    let vpcList = await getVPCs(ec2);
    let refinedVPCs = refineVPCs(vpcList.Vpcs);
    return getSubnetDetails(ec2, refinedVPCs);
}

const getSubnetDetails = (ec2, vpcList) => {
    const params = {
        Filters: [{
            Name: "vpc-id", 
            Values: vpcList
        }]
       };

    return new Promise((resolve, reject)=>{
        ec2.describeSubnets(params,(err,data)=>{
            if(err) reject(err);
            else resolve(data);
        })
    })
}

const vpcService = {
    getVPCInfo,
    getSubnetInfo
};

export default vpcService;