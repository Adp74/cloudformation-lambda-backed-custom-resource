/*load the aws-sdk package to access the SDK's classes and interact with individual services*/
var AWS = require('aws-sdk'), 
    lambda = new AWS.Lambda();

/**
 * It is a built-in module developed by AWS. It is used to send failure/success signals to Cloudformation engine.
 * For more information about the module, see:
 * https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-lambda-function-code.html#cfn-lambda-function-code-cfnresponsemodule
 */
var response = require('./cfn-response');

exports.handler = (event, context) => {

    /**
     * In case of Delete signal, we do not have to do nothing because this script is not creating any persistent resource.
     * We can directly return with success signal.
     */
    if ((event.RequestType == 'Delete') || (event.RequestType == 'Create')) {
        return response.send(event, context, response.SUCCESS);
    }

    /*If not, event.RequestType = CREATE or UPDATE*/
    /*event.ResourceType = Custom::LambdaCode*/
    var params = {
        FunctionName: event.ResourceProperties.FunctionName, /* required */
        DryRun: false,
        Publish: true,
        S3Bucket: event.ResourceProperties.S3Bucket,
        S3Key: event.ResourceProperties.S3Key,
        S3ObjectVersion: event.ResourceProperties.S3ObjectVersion
      };
    lambda.updateFunctionCode(params, function(err, data) {
        if (err) return response.send(event, context, response.FAILED, err); // an error occurred
        else     return response.send(event, context, response.SUCCESS, {'Version': data.Version}, data.FunctionArn);           // successful response
      });

};
