import { Construct } from "constructs";
import { App, TerraformOutput, TerraformStack, Token, Fn } from "cdktf";
import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import { Instance } from "@cdktf/provider-aws/lib/instance";
import { DataAwsSsmParameter } from "@cdktf/provider-aws/lib/data-aws-ssm-parameter";
import { Vpc } from "./.gen/modules/vpc";

class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new AwsProvider(this, "aws", {
      region: "ap-northeast-1",
      profile: "privateadmin",
    });

    // create vpc from module
    const vpc = new Vpc(this, "vpc", {
      projectName: "advent_calendar",
      env: "dev",
      vpcCidrBlock: "10.0.0.0/16",
      azSuffixes: ["a", "c", "d"],
      createSsmEndpoint: true,
    });

    const amazonLinux2023Latest = new DataAwsSsmParameter(
      this,
      "AL2023latest",
      {
        name: "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-6.1-x86_64",
      }
    );
    const public_subnets = Fn.lookup(
      Token.asAnyMap(vpc.outputsOutput),
      "public_subnets"
    );
    const ec2Instance = new Instance(this, "compute", {
      ami: amazonLinux2023Latest.value,
      instanceType: "t2.micro",
      subnetId: Fn.element(public_subnets, Math.floor(Math.random() * 3)),
    });

    let outputs = new Map();
    outputs.set("public_ip", ec2Instance.publicIp);
    outputs.set("subnet", ec2Instance.availabilityZone);

    new TerraformOutput(this, "outputs", {
      value: outputs,
    });
  }
}

const app = new App();
new MyStack(app, "aws_instance");

app.synth();
