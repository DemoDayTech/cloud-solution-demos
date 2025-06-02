## Overview
This project provisions the following using Terraform:
- 3 groups of **Systems Manager Enabled** EC2 instances using Terraform. The 3 groups represent 3 types of applications: Healthcare, Business, and Monitoring Apps. 
- EC2 userdata scripts are also provisiones/run as part of the EC2 initial startup
- SSM Parameters used by each of these application types

After deployment, AWS Systems Manager can be used to run shell scripts against these EC2 instances via the Systems Manager -> RunCommand -> AWS-RunShellScript. This is meant to show how Systems Manager can be used to execute shell scripts against groups of deployed EC2 instances. In this case, the commands run via Systems Manager are simple 'cat' commands to display the contents of the files: */tmp/credentials.txt* and */var/log/**_app.log* which were created as part of the userdata startup scripts. 


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