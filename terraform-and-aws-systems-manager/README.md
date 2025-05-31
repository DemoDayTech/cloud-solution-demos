cloud_formation_equiv_example.yaml is a quick chatgpt created Cloudformation equivalent of the Terraform main.tf file

# Systems Manager Commands to Run After Deployment


**Healthcare Application**

aws ssm send-command --document-name "AWS-RunShellScript" --document-version "1" --targets '[{"Key":"tag:Name","Values":["Healthcare App"]}]' --parameters '{"workingDirectory":[""],"executionTimeout":["3600"],"commands":["cat /tmp/credentials.txt","cat /var/log/healthcare_app.log"]}' --timeout-seconds 600 --max-concurrency "50" --max-errors "0" --profile default

aws ssm list-command-invocations \
  --command-id "<from_previous_command_output>" \
  --details \
  --profile default


**Business Application**

aws ssm send-command --document-name "AWS-RunShellScript" --document-version "1" --targets '[{"Key":"tag:Name","Values":["Business App"]}]' --parameters '{"workingDirectory":[""],"executionTimeout":["3600"],"commands":["cat /tmp/credentials.txt","cat /var/log/business_app.log"]}' --timeout-seconds 600 --max-concurrency "50" --max-errors "0" --profile default

aws ssm list-command-invocations \
  --command-id "<from_previous_command_output>" \
  --details \
  --profile default


**Monitoring Application**

aws ssm send-command --document-name "AWS-RunShellScript" --document-version "1" --targets '[{"Key":"tag:Name","Values":["Monitoring App"]}]' --parameters '{"workingDirectory":[""],"executionTimeout":["3600"],"commands":["cat /tmp/credentials.txt","cat /var/log/monitoring_app.log"]}' --timeout-seconds 600 --max-concurrency "50" --max-errors "0" --profile default

aws ssm list-command-invocations \
  --command-id "62455d07-55c8-43e1-bbd1-de8de68383f0" \
  --details \
  --profile default

