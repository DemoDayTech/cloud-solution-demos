#!/bin/bash

yum update -y
yum install -y amazon-ssm-agent
systemctl enable amazon-ssm-agent
systemctl start amazon-ssm-agent

# Create a simple "app" that writes logs every 60 seconds
cat <<'EOL' > /usr/local/bin/healthcare_app.sh
#!/bin/bash
LOG_FILE="/var/log/healthcare_app.log"
echo "Healthcare Applicaton $((RANDOM % 25 + 1)) Logs" >> $LOG_FILE
while true; do
echo "$(date '+%Y-%m-%d %H:%M:%S') app heartbeat" >> $LOG_FILE
sleep 60
done
EOL

chmod +x /usr/local/bin/healthcare_app.sh

# Run it in background (for demo)
nohup /usr/local/bin/healthcare_app.sh &

# SSM Fetch Secret Example
aws ssm get-parameter --name "/demo/healthcare-app/credentials" --with-decryption --region ${aws_region} --output text --query Parameter.Value > /tmp/credentials.txt