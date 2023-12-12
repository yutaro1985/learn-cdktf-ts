import { Construct } from "constructs";
import { App, TerraformOutput, TerraformStack } from "cdktf";
import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import { Instance } from "@cdktf/provider-aws/lib/instance";
import { DataAwsSsmParameter } from "@cdktf/provider-aws/lib/data-aws-ssm-parameter";

class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // define rcdesources here
    new AwsProvider(this, "aws", {
      region: "ap-northeast-1",
      profile: "privateadmin",
    });

    const amazonLinux2023Latest = new DataAwsSsmParameter(
      this,
      "AL2023latest",
      {
        name: "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-6.1-x86_64",
      }
    );

    const ec2Instance = new Instance(this, "compute", {
      ami: amazonLinux2023Latest.value,
      instanceType: "t2.micro",
    });

    new TerraformOutput(this, "public_ip", {
      value: ec2Instance.publicIp,
    });
  }
}

const app = new App();
new MyStack(app, "aws_instance");

app.synth();
