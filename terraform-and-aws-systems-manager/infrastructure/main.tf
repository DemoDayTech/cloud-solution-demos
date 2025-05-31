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
#TODO Provide example for custom profile and use vars from variables.tf
# provider "aws" {
#   region  = var.region
#   profile = "my-profile-name"
# }

# 1️⃣ SSM Parameter (SecureString)
resource "aws_ssm_parameter" "db_password" {
  name  = "/demo-app/db-password"
  type  = "SecureString"
  value = "SuperSecret123"
}

# 2️⃣ IAM Role + Policy for EC2 SSM
data "aws_iam_policy_document" "ec2_assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ec2_ssm_role" {
  name               = "ec2_ssm_role"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume_role_policy.json
}

resource "aws_iam_role_policy_attachment" "ssm_core" {
  role       = aws_iam_role.ec2_ssm_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "ec2_ssm_profile" {
  name = "ec2_ssm_profile"
  role = aws_iam_role.ec2_ssm_role.name
}

# 3️⃣ EC2 Instance (Amazon Linux 2023)
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }
}

resource "aws_instance" "demo_instance" {
  ami                         = data.aws_ami.amazon_linux.id
  instance_type               = "t3.micro"
  iam_instance_profile        = aws_iam_instance_profile.ec2_ssm_profile.name

  # Optional: add user data to print the SSM param (safe for demo only)
  user_data = <<-EOF
              #!/bin/bash
              aws ssm get-parameter --name "/demo-app/db-password" --with-decryption --region ${var.aws_region} --output text --query Parameter.Value > /tmp/db_password.txt
              EOF

  tags = {
    Name = "Terraform-SSM-Demo"
  }
}