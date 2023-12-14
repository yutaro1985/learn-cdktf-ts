import { Cloud9EnvironmentEc2 } from "@cdktf/provider-aws/lib/cloud9-environment-ec2";
import { Cloud9EnvironmentMembership } from "@cdktf/provider-aws/lib/cloud9-environment-membership";
import { DataAwsIamUser } from "@cdktf/provider-aws/lib/data-aws-iam-user";
import { DataAwsInstance } from "@cdktf/provider-aws/lib/data-aws-instance";
import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import { App, Fn, TerraformOutput, TerraformStack, Token } from "cdktf";
import { Construct } from "constructs";
import { Vpc } from "./.gen/modules/vpc";

interface MyConfig {
  name: any;
}

class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string, config: MyConfig) {
    super(scope, id);

    new AwsProvider(this, "aws", {
      region: "ap-northeast-1",
    });

    // create vpc from module
    const vpc = new Vpc(this, "vpc", {
      projectName: "advent_calendar",
      env: "dev",
      vpcCidrBlock: "10.0.0.0/16",
      azSuffixes: ["a", "c", "d"],
      createSsmEndpoint: true,
    });

    // const public_subnets = Fn.lookup(
    //   Token.asAnyMap(vpc.outputsOutput),
    //   "public_subnets"
    // );
    const private_subnets = Fn.lookup(
      Token.asAnyMap(vpc.outputsOutput),
      "public_subnets"
    );
    const example = new Cloud9EnvironmentEc2(this, "example", {
      instanceType: "t3.medium",
      name: config.name,
      connectionType: "CONNECT_SSM",
      subnetId: Fn.element(private_subnets, 0),
      imageId: "amazonlinux-2-x86_64",
    });
    const cloud9Instance = new DataAwsInstance(this, "cloud9_instance", {
      filter: [
        {
          name: "tag:aws:cloud9:environment",
          values: [example.id],
        },
      ],
    });
    // const cloud9Eip = new Eip(this, "cloud9_eip", {
    //   domain: "vpc",
    //   instance: Token.asString(cloud9Instance.id),
    // });
    const iamUserName = process.env.MYIAM as string;

    const myuser = new DataAwsIamUser(this, "myuser", {
      userName: iamUserName,
    });
    const awsCloud9EnvironmentMembershipTest = new Cloud9EnvironmentMembership(
      this,
      "test_2",
      {
        environmentId: example.id,
        permissions: "read-write",
        userArn: myuser.arn,
      }
    );
    /*This allows the Terraform resource name to match the original name. You can remove the call if you don't need them to match.*/
    awsCloud9EnvironmentMembershipTest.overrideLogicalId("test");

    let outputs = new Map();
    // outputs.set("cloud9_public_ip", cloud9Eip.publicIp);
    outputs.set("cloud9_instance_id", cloud9Instance.id);

    new TerraformOutput(this, "outputs", {
      value: outputs,
    });
  }
}

const app = new App();
new MyStack(app, "aws_instance", { name: "advent_calendar" });

app.synth();
