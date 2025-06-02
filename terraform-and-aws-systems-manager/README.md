## Requirements to Run
1. An AWS Account 
2. aws-cli 2.17.0 or greater with [default] credentials setup in ~/.aws/
    - Reference: https://docs.aws.amazon.com/cli/v1/userguide/cli-configure-files.html
1. Terraform v1.9.1 or greater


## Systems Manager Commands to Run After Deployment

**Healthcare Application**
```
aws ssm send-command --document-name "AWS-RunShellScript" --document-version "1" --targets '[{"Key":"tag:Name","Values":["Healthcare App"]}]' --parameters '{"workingDirectory":[""],"executionTimeout":["3600"],"commands":["cat /tmp/credentials.txt","cat /var/log/healthcare_app.log"]}' --timeout-seconds 600 --max-concurrency "50" --max-errors "0" --profile default
```
```
aws ssm list-command-invocations \
  --command-id "<from_previous_command_output>" \
  --details \
  --profile default
```


**Business Application**
```
aws ssm send-command --document-name "AWS-RunShellScript" --document-version "1" --targets '[{"Key":"tag:Name","Values":["Business App"]}]' --parameters '{"workingDirectory":[""],"executionTimeout":["3600"],"commands":["cat /tmp/credentials.txt","cat /var/log/business_app.log"]}' --timeout-seconds 600 --max-concurrency "50" --max-errors "0" --profile default
```
```
aws ssm list-command-invocations \
  --command-id "<from_previous_command_output>" \
  --details \
  --profile default
```

**Monitoring Application**
```
aws ssm send-command --document-name "AWS-RunShellScript" --document-version "1" --targets '[{"Key":"tag:Name","Values":["Monitoring App"]}]' --parameters '{"workingDirectory":[""],"executionTimeout":["3600"],"commands":["cat /tmp/credentials.txt","cat /var/log/monitoring_app.log"]}' --timeout-seconds 600 --max-concurrency "50" --max-errors "0" --profile default
```
```
aws ssm list-command-invocations \
  --command-id "<from_previous_command_output>" \
  --details \
  --profile default
```


**Note**


*cloud_formation_equiv_example.yaml* is a quickly generated CloudFormation equivalent of the main.tf Terraform  file