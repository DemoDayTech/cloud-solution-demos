locals {
  current_timestamp = timestamp()
}

variable "basename" {
  type = string
  description = "Base name for resource names"
  default = "cwagent-procstat"
}

variable "example-app-name" {
  type = string
  description = "Name of an example dummy application which we will simulate running on the EC2"
  default = "my-app"
}


