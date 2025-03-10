import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export class AwsStackStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const helloWorldLambda = new lambda.Function(this, 'HelloWorldLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'hello-world-lambda.handler',
      code: lambda.Code.fromAsset('lib'),
    });
  }
}
