# 🚀 AWS VPC / Subnet
![License](https://img.shields.io/badge/express-4.18.2-blue)
![License](https://img.shields.io/badge/aws--sdk-2.1253.0-orange)
![License](https://img.shields.io/badge/prisma-4.5.0-green)

# About
## Summary
- AWS 계정 내 특정 리전의 VPC정보와 Subnet정보를 AWS API를 이용하여 가져온다.
- 가져온 정보를 RDBMS(postgreSQL)에 저장한다
- 특정 리전은 env에 명시한다 (AWS_REGION)
- env에는 특정 리전과 ACCESS_KEY값들이 명시되어있다
- 해당 값들로 AWS sdk를 config해서 사용한다.

## Built with
- Javascript, nodeJS(express)
- AWS sdk(API)
- postgreSQL, prisma

## ERD

![13412321](https://user-images.githubusercontent.com/54241139/201528494-9bc5528e-9b43-4710-ac00-281402be3375.PNG)
