variable "healthcare_app" {
  type = map(string)
  default = {
    "username" = "health-user"
    "password" = "Secret123!"
    "url"      = "http://127.0.0.1"
  }
}

variable "monitoring_app" {
  type = map(string)
  default = {
    "username" = "monitoring-user"
    "password" = "Secret456!"
    "url"      = "http://localhost"
  }
}

variable "business_app" {
  type = map(string)
  default = {
    "username" = "business-user"
    "password" = "Secret789!"
    "url"      = "http://localhost:3000"
  }
}