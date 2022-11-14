import AWS from "aws-sdk";
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

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

/**
 * get detailed info of VPCs
 *
 * @return {object} get detailed info of Subnet VPCs
 */
const getSubnetInfo = async () => {
    const ec2 = new AWS.EC2();
    let vpcList = await getVPCs(ec2);
    let refinedVPCs = refineVPCs(vpcList.Vpcs);
    return getSubnetDetails(ec2, refinedVPCs);
}

/**
 * get detailed info of VPCs
 *
 * @param {Instance} ec2 ec2 instance
 * @param {Array} vpcList refined VPC list
 * @return {object} get detailed info of Subnet VPCs
 */
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

/**
 * save VPC detail information to DB
 */
const saveVPCInfo = async () => {
    const ec2 = new AWS.EC2();
    const VpcList = await getVPCInfo(ec2);

    await Promise.all(VpcList.Vpcs.map(async vpc => {

        let Ipv6CidrSet = vpc.Ipv6CidrBlockAssociationSet;
        let CidrSet = vpc.CidrBlockAssociationSet;

        delete vpc.CidrBlockAssociationSet;
        delete vpc.Ipv6CidrBlockAssociationSet;

        vpc.TagsKey = vpc.Tags[0];
        vpc.TagsValue = vpc.Tags[1];
        delete vpc.Tags;

        let vpcRes = await prisma.vpc.create({
            data: vpc
        })

          // Ipv6CidrBlockAssociationSet could be empty
        if(Ipv6CidrSet.length != 0){
            Ipv6CidrSet.map(async cidrblock => {
                cidrblock.vpcId = vpcRes.id;
                cidrblock.Ipv6CidrBlockState = cidrblock.Ipv6CidrBlockState.State;
                cidrblock.Ipv6CidrBlockStateMsg = cidrblock.Ipv6CidrBlockState.StatusMessage;
                delete cidrblock.Ipv6CidrBlockState;

                await prisma.ipv6CidrBlockAssociationSet.create({
                    data: cidrblock
                })
            })
        }
        
        //CidrBlockAssociationSet could be empty
        if(CidrSet.length != 0){
            CidrSet.map(async cidrblock => {
                cidrblock.VpcId = vpcRes.id;
                cidrblock.CidrBlockState = cidrblock.CidrBlockState.State;
                cidrblock.CidrBlockStateMsg = cidrblock.CidrBlockState.StatusMessage;
                delete cidrblock.CidrBlockState;

                await prisma.cidrBlockAssociation.create({
                    data: cidrblock
                })
            })
        }
    }));
}

/**
 * save Subnet detail information to DB
 */
const saveSubnetInfo = async () => {
    const ec2 = new AWS.EC2();
    const subnetList = await getSubnetInfo(ec2);
    for(let subnet of subnetList.Subnets){
        await prisma.subnet.create({
            data: {          
                availablitiyZone: subnet.AvailabilityZone,
                availablityZoneId: subnet.AvailabilityZoneId,
                availableIpAddressCnt: subnet.AvailableIpAddressCount,
                cidrBlock: subnet.CidrBlock,
                defaultForAz: subnet.DefaultForAz,
                mapPublicIpOnLaunch: subnet.MapPublicIpOnLaunch,
                state: subnet.State,
                subnetId: subnet.SubnetId ,
                vpcId : subnet.VpcId,
                ownerId: subnet.OwnerId,
                assignIpv6adressOncreat: subnet.AssignIpv6AddressOnCreation,
                subnetArn: subnet.SubnetArn,
                enableDns64: subnet.EnableDns64,
                ipv6Native: subnet.Ipv6Native,
                privateDnsOptType: subnet.PrivateDnsNameOptionsOnLaunch.HostnameType,
                dnsA: subnet.PrivateDnsNameOptionsOnLaunch.EnableResourceNameDnsARecord,
                dnsB: subnet.PrivateDnsNameOptionsOnLaunch.EnableResourceNameDnsAAAARecord,
            }
        })

        const vpc = await prisma.vpc.findUnique({
            where: {
                vpcId: subnet.VpcId
            }
        })

        //Ipv6CidrBlockAssociationSet could be empty
        if(subnet.Ipv6CidrBlockAssociationSet.length != 0){
            for(let cidrblock of vpc.Ipv6CidrBlockAssociationSet){
                await prisma.ipv6CidrBlockAssociationSet.create({
                    data:{
                        vpcId: vpc.id,
                        AssociationId: cidrblock.AssociationId,
                        ipv6CidrBlock: cidrblock.Ipv6CidrBlock,
                        ipv6CidrBlockState: cidrblock.Ipv6CidrBlockState.State,
                        ipv6CidrBlockStateMsg: cidrblock.Ipv6CidrBlockState.StatusMessage,
                        networkBorderGroup: cidrblock.NetworkBorderGroup,
                        ipv6Pool: cidrblock.Ipv6Pool
                    }
                })
            }
        }
    }
}

const vpcService = {
    getVPCInfo,
    getSubnetInfo,
    saveVPCInfo,
    saveSubnetInfo
};

export default vpcService;