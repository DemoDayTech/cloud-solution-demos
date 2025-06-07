# output "instance_id" {
#   value = aws_instance.demo_instance.id
# }

# output "public_ip" {
#   value = aws_instance.demo_instance.public_ip
# }

output "ssh_private_key_pem" {
  value     = tls_private_key.example.private_key_pem
  sensitive = true
}
