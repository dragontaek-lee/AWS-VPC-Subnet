import AWS from "aws-sdk";

const getVPCInfo = async () => {
    AWS.config.getCredentials(function(err) {
        if (err) console.log(err.stack);
        else {
          console.log("Access key:", AWS.config.credentials.accessKeyId);
        }
      });
    return "VPCInfo";
};

const vpcService = {
    getVPCInfo
};

export default vpcService;
