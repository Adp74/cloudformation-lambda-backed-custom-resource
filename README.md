
# Creating Lambda function using CloudFormation

Infrastructure as code is the process of provisioning and managing your cloud resources by writing a template file that is both human readable, and machine consumable. For AWS cloud development the built-in choice for infrastructure as code is AWS CloudFormation. Using AWS CloudFormation you can write a description of the resources that you want to create on your AWS account, and then ask AWS CloudFormation to make this description into reality.

Following the "Infrastructure as code" principle, this project contains the corresponding template (yaml format) for deploying a cloudwacth event rule that executes the AWS lamdba function periodically. 

These are the resources created by CloudFormation:
- AWS lambda Function
- IAM roles
- AWS CloudWatch Event

![alt text](https://github.com/Adp74/cloudformation-lambda-backed-custom-resource/blob/master/Images/Lambda-CloudFormation-arch%20(1).png)

## Challenge: Updating Lambda

The lambda code is stored in a S3 bucket with versioning enabled. Each time the lambda code is updated, a new version of the S3 object is created, with the same S3 key, but a different Version Id. If you try to create a change set or update the stack, CloudFormation will not realize/consider that a change has happened because the script is not part of the CloudFormation resources. When there is an update in Lambda resource property like memory, there is no problem as a CloudFormation will pick these changes and update accordingly. 

Error message in CloudFormation: Status: Failed. Reason: "The submitted information didn't contain changes. Submit different information to create a change set."

This project contains the approach that I followed to solve this problem. My solution is based on updating a property in the Custom Resource, triggering the invokation of a lambda function that will handle this change, publishing a new version of the original Lambda Function (with the new code). Changing a parameter of a Custom Resource if the way for CloudFormation to realize that there has been a change, and resource needs to be updated.

![alt text](https://github.com/Adp74/cloudformation-lambda-backed-custom-resource/blob/master/Images/Lambda-CloudFormation-customresource.png)


## Custom Resource
Custom resources enable you to write custom provisioning logic in templates that AWS CloudFormation runs anytime you create, update (if you changed the custom resource), or delete stacks. For example, you might want to include resources that aren't available as AWS CloudFormation resource types.

Use the AWS::CloudFormation::CustomResource or Custom::MyCustomResourceTypeName resource type to define custom resources in your templates. Custom resources require at least one property: the service token, which specifies where AWS CloudFormation sends requests to, such as an Amazon SNS topic or Lambda Function arn. Apart from that, the custom resource may have others input data parameters.

```
Resources:
  Custom:
    Type: Custom::CustomResource
    Properties:
      ServiceToken: !GetAtt CustomResourceLambdaFunction.Arn
      Param1: val1
      Param2: val2
        …
```



