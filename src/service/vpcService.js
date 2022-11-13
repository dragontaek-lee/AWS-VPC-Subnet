import AWS from "aws-sdk";

const getVPCInfo = async () => {
    //console.log(process.env.AWS_REGION)
    //const ec2 = new AWS.EC2();
    // ec2.describeVpcs()
   
    return "VPCInfo";
};

const vpcService = {
    getVPCInfo
};

export default vpcService;