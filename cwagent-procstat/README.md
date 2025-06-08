Terraform
 CW Agent procstat plugin


# Demo Project: Terraform + AWS Systems Manager + Procstat Plugin

This project provisions an EC2 instance with:

✅ nginx running  
✅ Simulated "my-app" process running  
✅ CloudWatch agent with **procstat plugin**  
✅ CloudWatch metrics & alarms  
✅ SNS notification to `dev@demodaytech.com`

---

## Usage

### 1️⃣ Initialize Terraform

```bash
terraform init



TODO
- The cw config file is not well formed and CW agent does not start up. 