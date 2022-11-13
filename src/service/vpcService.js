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

const saveVPCInfo = async () => {
    const ec2 = new AWS.EC2();
    const VpcList = await getVPCInfo(ec2);

    for(let vpc of VpcList.Vpcs){
        let vpcRes = await prisma.vpc.create({
            data: {          
                vpcId: vpc.VpcId,
                cidrBlock: vpc.CidrBlock,
                dhcpOptionsId: vpc.DhcpOptionsId,
                state: vpc.State,
                ownerId: vpc.OwnerId,
                instanceTenancy: vpc.InstanceTenancy,
                cidrBlock: vpc.CidrBlock,
                isDefault: vpc.IsDefault,
                tagsKey: vpc.Tags[0],
                tagValue: vpc.Tags[1]
            }
        })

        //Ipv6CidrBlockAssociationSet could be empty
        if(vpc.Ipv6CidrBlockAssociationSet.length != 0){
            for(let cidrblock of vpc.Ipv6CidrBlockAssociationSet){
                await prisma.ipv6CidrBlockAssociationSet.create({
                    data:{
                        vpcId: vpcRes.id,
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

        //CidrBlockAssociationSet could be empty
        if(vpc.CidrBlockAssociationSet.length != 0){
            for(let cidrblock of vpc.CidrBlockAssociationSet){
                await prisma.cidrBlockAssociation.create({
                    data:{
                        vpcId: vpcRes.id,
                        associationId: cidrblock.AssociationId,
                        cidrBlock: cidrblock.CidrBlock,
                        cidrBlockState: cidrblock.CidrBlockState.State,
                        cidrBlockStateMsg:cidrblock.CidrBlockState.StatusMessage,
                    }
                })
            }
        }
    }
}

const vpcService = {
    getVPCInfo,
    getSubnetInfo,
    saveVPCInfo
};

export default vpcService;