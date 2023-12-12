# VPCモジュール+VCPエンドポイントモジュール

下記モジュールを使用する
[AWS VPC Terraform module](https://registry.terraform.io/modules/terraform-aws-modules/vpc/aws/latest)

また、同リポジトリ内にあるVPCエンドポイントモジュールも合わせて利用する。
[AWS VPC Endpoints Terraform sub-module](https://github.com/terraform-aws-modules/terraform-aws-vpc/tree/master/modules/vpc-endpoints)

オプション指定の多くを固定しているため、他プロジェクトでモジュールを使用する場合はカスタマイズすること。

<!-- BEGIN_TF_DOCS -->
## Requirements

| Name | Version |
|------|---------|
| <a name="requirement_terraform"></a> [terraform](#requirement\_terraform) | >= 1.2.8 |
| <a name="requirement_aws"></a> [aws](#requirement\_aws) | ~> 4.0 |

## Providers

| Name | Version |
|------|---------|
| <a name="provider_aws"></a> [aws](#provider\_aws) | ~> 4.0 |

## Modules

| Name | Source | Version |
|------|--------|---------|
| <a name="module_endpoints"></a> [endpoints](#module\_endpoints) | terraform-aws-modules/vpc/aws//modules/vpc-endpoints | 3.14.2 |
| <a name="module_vpc"></a> [vpc](#module\_vpc) | terraform-aws-modules/vpc/aws | 3.14.2 |

## Resources

| Name | Type |
|------|------|
| [aws_security_group.vpc_tls](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/security_group) | resource |
| [aws_security_group_rule.vpc_default_self](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/security_group_rule) | resource |
| [aws_region.current](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/region) | data source |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_az_suffixes"></a> [az\_suffixes](#input\_az\_suffixes) | リージョン内のAZを表すアルファベットのリスト | `list(string)` | <pre>[<br>  "a",<br>  "c",<br>  "d"<br>]</pre> | no |
| <a name="input_create_ssm_endpoint"></a> [create\_ssm\_endpoint](#input\_create\_ssm\_endpoint) | n/a | `bool` | `false` | no |
| <a name="input_env"></a> [env](#input\_env) | リソース名などに付与される環境識別文字列 (dev/stg/prod) | `string` | n/a | yes |
| <a name="input_project_name"></a> [project\_name](#input\_project\_name) | プロジェクト全体で使う名前。これを使って各リソースにPJ名を入れる | `string` | n/a | yes |
| <a name="input_vpc_cidr_block"></a> [vpc\_cidr\_block](#input\_vpc\_cidr\_block) | VPCのCidrブロック | `string` | n/a | yes |

## Outputs

| Name | Description |
|------|-------------|
| <a name="output_outputs"></a> [outputs](#output\_outputs) | n/a |
<!-- END_TF_DOCS -->
