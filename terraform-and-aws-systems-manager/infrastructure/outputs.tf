# Outputs public IPs for all EC2 instances created with count
output "instance_public_ips" {
  value = [for instance in aws_instance.demo_instance : instance.public_ip]
}

# Outputs private IPs
output "instance_private_ips" {
  value = [for instance in aws_instance.demo_instance : instance.private_ip]
}

# Outputs instance IDs
output "instance_ids" {
  value = [for instance in aws_instance.demo_instance : instance.id]
}

output "ssm_parameter_name" {
  value = aws_ssm_parameter.db_password.name
}
