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
- The cw alarm is not properly associated with the cw metrics produced by procstat. 

cd infrastructure
chmod 400 "procstat-demo-key.pem"
ssh -i "procstat-demo-key.pem" ec2-user@ec2-54-242-174-37.compute-1.amazonaws.com