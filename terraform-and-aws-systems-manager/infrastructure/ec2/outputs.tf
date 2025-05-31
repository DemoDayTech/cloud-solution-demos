# Outputs instance IDs
output "healthcare_instance_ids" {
  value = [for instance in aws_instance.healthcare_instance : instance.id]
}

output "monitoring_instance_ids" {
  value = [for instance in aws_instance.monitoring_instance : instance.id]
}

output "business_instance_ids" {
  value = [for instance in aws_instance.business_instance : instance.id]
}
