resource "aws_ssm_parameter" "healthcare_app_credentials" {
  name  = "/demo/healthcare-app/credentials"
  type  = "SecureString"
  value = jsonencode(var.healthcare_app)
}

resource "aws_ssm_parameter" "monitoring_app_db_password" {
  name  = "/demo/monitoring-app/credentials"
  type  = "SecureString"
  value = jsonencode(var.monitoring_app)
}

resource "aws_ssm_parameter" "business_app_credentials" {
  name  = "/demo/business-app/credentials"
  type  = "SecureString"
  value = jsonencode(var.business_app)
}