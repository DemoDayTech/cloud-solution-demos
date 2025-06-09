# This example uses your AWS [default] profile and its region. 
# In order to use a custom AWS profile form your ~/.aws/ you will have to provide as follows:
# provider "aws" {
#   region  = "region name from ~/.aws/config i.e. us-east-1"
#   profile = "profile name from ~/.aws/credentials"
# }

# Generate EC2 SSH Key Pair (local ephemeral key for demo)
resource "tls_private_key" "example" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "key" {
  key_name   = "${var.basename}-demo-key"
  public_key = tls_private_key.example.public_key_openssh
}

# Generates a local file with name 'filename' with the contents of the EC2 Key Pair
# This can be used to SSH into the EC2 instanace which gets created
# This also gets deleted by Terraform when issuing 'terraform destroy' command
resource "local_file" "my-ec2-keypair" {
  content = tls_private_key.example.private_key_pem
  filename = "${aws_key_pair.key.key_name}.pem"
}

# Security Group for EC2 instance
resource "aws_security_group" "allow_ssh_http" {
  name        = "${var.basename}-sg"
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

# IAM Role for EC2
resource "aws_iam_role" "ec2_ssm_role" {
  name = "${var.basename}-ec2-ssm-role"
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

# Attach policies to IAM Role for SSM and CloudWatch permissions
resource "aws_iam_role_policy_attachment" "ssm_attach" {
  role       = aws_iam_role.ec2_ssm_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_role_policy_attachment" "cloudwatch_attach" {
  role       = aws_iam_role.ec2_ssm_role.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
}

# EC2 Instance Profile
resource "aws_iam_instance_profile" "ec2_profile" {
  name = "${var.basename}-ec2-profile"
  role = aws_iam_role.ec2_ssm_role.name
}

# SNS topic to associate with cloudwatch alarms
resource "aws_sns_topic" "procstat_alerts" {
  name = "${var.basename}-alerts"
}

# Email to subscribe to SNS Topic for notification of alarm activating
resource "aws_sns_topic_subscription" "email_alert" {
  topic_arn = aws_sns_topic.procstat_alerts.arn
  protocol  = "email"
  endpoint  = "dev@demodaytech.com" # Update this with your email
}

# (Amazon Linux 2023)
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }
}

# EC2 Instance Creation with userdata script
# This can be extracted out into a separate file and imported using Terraform's 'templatefile()'
# See 'terraform-and-aws-systems-manager' project for example
resource "aws_instance" "demo_instance" {
  ami                         = data.aws_ami.amazon_linux.id
  instance_type               = "t3.micro"
  key_name                    = aws_key_pair.key.key_name
  iam_instance_profile        = aws_iam_instance_profile.ec2_profile.name
  vpc_security_group_ids      = [aws_security_group.allow_ssh_http.id]

  user_data = <<-EOF
              #!/bin/bash
              yum update -y
              yum install -y nginx amazon-cloudwatch-agent

              # Start nginx
              systemctl enable nginx
              systemctl start nginx

              # Simulate a 2nd running process
              nohup bash -c 'while true; do echo "${var.example-app-name} running"; sleep 10; done' >/var/log/${var.example-app-name}.log 2>&1 &

              # Get a session token for IMDSv2
              TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")

              # Use the token to get the instance ID
              INSTANCE_ID=$(curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/instance-id)

              # Get current date/time which can be used for the cloudwatch metric namespace name
              CURRENT_DATETIME=$(date '+%Y-%m-%d-%H.%M.%S')

              # Write CloudWatch agent config
              cat <<EOT > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
              {
                  "agent": {
                      "metrics_collection_interval": 60,
                      "logfile": "/opt/aws/amazon-cloudwatch-agent/logs/amazon-cloudwatch-agent.log"
                  },
                  "metrics": {
                      "namespace": "${var.basename}-${local.current_timestamp}",
                      "append_dimensions": {
                          "InstanceId": "$INSTANCE_ID"
                      },
                      "metrics_collected": {
                          "procstat": [
                              {
                                  "pattern": "nginx",
                                  "measurement": [
                                      "pid_count"
                                  ],
                                  "metrics_collection_interval": 60
                              },
                              {
                                  "pattern": "${var.example-app-name}",
                                  "measurement": [
                                      "pid_count"
                                  ],
                                  "metrics_collection_interval": 60
                              }
                          ]
                      }
                  }
              }
              EOT

              # Start CloudWatch agent
              /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
                -a fetch-config -m ec2 -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json -s
              EOF

  tags = {
    Name = "${var.basename}-instance"
  }
}

# CloudWatch Alarm for 'nginx' process, alert when process count < 1
resource "aws_cloudwatch_metric_alarm" "nginx_procstat_alarm" {
  alarm_name          = "${var.basename}-nginx-process-alarm"
  namespace           = "${var.basename}-${local.current_timestamp}"
  metric_name         = "procstat_lookup_pid_count"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 1
  period              = 60
  statistic           = "Minimum"
  threshold           = 1
  dimensions = {
    pattern    = "nginx",
    pid_finder = "native"
  }
  treat_missing_data = "breaching"
  alarm_description  = "Alarm when nginx process goes down"
  alarm_actions      = [aws_sns_topic.procstat_alerts.arn]
}

# CloudWatch Alarm for 2nd process, alert when process count < 1
resource "aws_cloudwatch_metric_alarm" "myapp_procstat_alarm" {
  alarm_name          = "${var.basename}-myapp-process-alarm"
  namespace           = "${var.basename}-${local.current_timestamp}"
  metric_name         = "procstat_lookup_pid_count"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 1
  period              = 60
  statistic           = "Minimum"
  threshold           = 1
  dimensions = {
    pattern    = "${var.example-app-name}"
    pid_finder = "native"
  }
  treat_missing_data = "breaching"
  alarm_description  = "Alarm when ${var.example-app-name} process goes down"
  alarm_actions      = [aws_sns_topic.procstat_alerts.arn]
}
