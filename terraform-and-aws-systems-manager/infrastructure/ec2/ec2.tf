
# IAM Role + Policy for EC2 SSM
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

# EC2 Instance (Amazon Linux 2023)
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }
}

resource "aws_instance" "healthcare_instance" {
  ami                         = data.aws_ami.amazon_linux.id
  instance_type               = "t3.micro"
  iam_instance_profile        = aws_iam_instance_profile.ec2_ssm_profile.name
  count                       = 3

  user_data = templatefile("${path.module}/startup-scripts/healthcare-app.sh", {
      aws_region = var.aws_region
    }
  )

  tags = {
    Name = "Healthcare App"
  }
}

resource "aws_instance" "monitoring_instance" {
  ami                         = data.aws_ami.amazon_linux.id
  instance_type               = "t3.micro"
  iam_instance_profile        = aws_iam_instance_profile.ec2_ssm_profile.name
  count                       = 4

  user_data = templatefile("${path.module}/startup-scripts/monitoring-app.sh", {
      aws_region = var.aws_region
    }
  )

  tags = {
    Name = "Monitoring App"
  }
}

resource "aws_instance" "business_instance" {
  ami                         = data.aws_ami.amazon_linux.id
  instance_type               = "t3.micro"
  iam_instance_profile        = aws_iam_instance_profile.ec2_ssm_profile.name
  count                       = 2

  user_data = templatefile("${path.module}/startup-scripts/business-app.sh", {
      aws_region = var.aws_region
    }
  )

  tags = {
    Name = "Business App"
  }
}