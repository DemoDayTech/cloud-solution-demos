output "instance_id" {
  value = aws_instance.demo_instance.id
}

output "instance_public_ip" {
  value = aws_instance.demo_instance.public_ip
}

output "ssm_parameter_name" {
  value = aws_ssm_parameter.db_password.name
}
