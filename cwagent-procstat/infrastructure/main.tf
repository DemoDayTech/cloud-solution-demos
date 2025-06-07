provider "aws" {
  region = "us-east-1"
}

# Generate SSH key pair (local ephemeral key for demo)
resource "tls_private_key" "example" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "deployer" {
  key_name   = "procstat-demo-key"
  public_key = tls_private_key.example.public_key_openssh
}

# THis can be used to SSH into your EC2 instance. 
resource "local_file" "my-ec2-keypair" {
  content = tls_private_key.example.private_key_pem
  filename = "${aws_key_pair.deployer.key_name}.pem"
}

# Security Group
resource "aws_security_group" "allow_ssh_http" {
  name        = "procstat-demo-sg"
  description = "Allow SSH and HTTP"
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# IAM Role for EC2 with SSM and CloudWatch permissions
resource "aws_iam_role" "ec2_ssm_role" {
  name = "procstat-demo-ec2-ssm-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action    = "sts:AssumeRole"
        Effect    = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ssm_attach" {
  role       = aws_iam_role.ec2_ssm_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_role_policy_attachment" "cloudwatch_attach" {
  role       = aws_iam_role.ec2_ssm_role.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
}

# Instance Profile
resource "aws_iam_instance_profile" "ec2_profile" {
  name = "procstat-demo-ec2-profile"
  role = aws_iam_role.ec2_ssm_role.name
}

# SNS topic
resource "aws_sns_topic" "procstat_alerts" {
  name = "procstat-demo-alerts"
}

# SNS email subscription
resource "aws_sns_topic_subscription" "email_alert" {
  topic_arn = aws_sns_topic.procstat_alerts.arn
  protocol  = "email"
  endpoint  = "dev@demodaytech.com"
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

# EC2 Instance
resource "aws_instance" "demo_instance" {
  ami                         = data.aws_ami.amazon_linux.id
  instance_type               = "t3.micro"
  key_name                    = aws_key_pair.deployer.key_name
  iam_instance_profile        = aws_iam_instance_profile.ec2_profile.name
  vpc_security_group_ids      = [aws_security_group.allow_ssh_http.id]

  user_data = <<-EOF
              #!/bin/bash
              yum update -y
              yum install -y nginx amazon-cloudwatch-agent

              # Start nginx
              systemctl enable nginx
              systemctl start nginx

              # Simulate my-app process
              nohup bash -c 'while true; do echo "my-app running"; sleep 10; done' >/var/log/my-app.log 2>&1 &

              # Write CloudWatch agent config
              cat <<EOT > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
              ${file("cloudwatch-agent-config.json")}
              EOT

              # Start CloudWatch agent
              /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
                -a fetch-config -m ec2 -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json -s
              EOF

  tags = {
    Name = "procstat-demo-instance"
  }
}

# CloudWatch Alarm - nginx
resource "aws_cloudwatch_metric_alarm" "nginx_procstat_alarm" {
  alarm_name          = "Procstat-nginx-process-alarm"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 2
  metric_name         = "cpu_usage"
  namespace           = "ProcstatDemo"
  period              = 60
  statistic           = "Average"
  threshold           = 0.1
  dimensions = {
    InstanceId = aws_instance.demo_instance.id
  }
  treat_missing_data = "breaching"
  alarm_description  = "Alarm when nginx process goes down"
  alarm_actions      = [aws_sns_topic.procstat_alerts.arn]
}

# CloudWatch Alarm - my-app
resource "aws_cloudwatch_metric_alarm" "myapp_procstat_alarm" {
  alarm_name          = "Procstat-myapp-process-alarm"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 2
  metric_name         = "cpu_usage"
  namespace           = "ProcstatDemo"
  period              = 60
  statistic           = "Average"
  threshold           = 0.1
  dimensions = {
    InstanceId = aws_instance.demo_instance.id
  }
  treat_missing_data = "breaching"
  alarm_description  = "Alarm when my-app process goes down"
  alarm_actions      = [aws_sns_topic.procstat_alerts.arn]
}
