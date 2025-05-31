terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# This example uses your AWS [default] profile and its region. 
# In order to use a custom AWS profile form your ~/.aws/ you will have to provide as follows:
# provider "aws" {
#   region  = "region name from ~/.aws/config i.e. us-east-1"
#   profile = "profile name from ~/.aws/credentials"
# }

module "ssm" {
  source = "./ssm"
}

module "ec2" {
  source = "./ec2"
}