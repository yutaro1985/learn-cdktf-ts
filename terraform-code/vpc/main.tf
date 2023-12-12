locals {
  vpc_name                  = "${var.project_name}-vpc-${var.env}"
  enable_flow_logs          = var.env == "prod"
  az_count                  = length(var.az_suffixes)
  public_subnets_prefixes   = [for num in range(0, local.az_count) : num]
  database_subnets_prefixes = [for num in range(local.az_count * 2, local.az_count * 3) : num]
}

data "aws_region" "current" {}

module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  # バージョン指定に変数使用不可のため直書き
  version = "3.14.2"

  # 基本設定
  name           = local.vpc_name
  cidr           = var.vpc_cidr_block
  azs            = [for s in var.az_suffixes : "${data.aws_region.current.name}${s}"]
  public_subnets = [for num in local.public_subnets_prefixes : cidrsubnet(var.vpc_cidr_block, 4, num)]
  # コストの観点から今回アプリ用プライベートサブネットは作成しない（付随してNAT GatewayやVPCエンドポイントが必要になるため）
  database_subnets                   = [for num in local.database_subnets_prefixes : cidrsubnet(var.vpc_cidr_block, 4, num)]
  create_database_subnet_route_table = true
  create_database_subnet_group       = true
  # オプション
  assign_ipv6_address_on_creation = true
  enable_ipv6                     = true
  public_subnet_ipv6_prefixes     = local.public_subnets_prefixes
  database_subnet_ipv6_prefixes   = local.database_subnets_prefixes
  create_igw                      = true
  create_egress_only_igw          = true
  enable_nat_gateway              = false
  enable_vpn_gateway              = false
  enable_dns_hostnames            = true
  enable_dns_support              = true
  enable_dhcp_options             = true

  manage_default_network_acl    = true
  default_network_acl_tags      = { Name = "${var.project_name}-default-acl-${var.env}" }
  manage_default_route_table    = false
  manage_default_security_group = true
  default_security_group_tags   = { Name = "${var.project_name}-default-sg-${var.env}" }

  enable_flow_log                      = local.enable_flow_logs
  create_flow_log_cloudwatch_log_group = local.enable_flow_logs
  create_flow_log_cloudwatch_iam_role  = local.enable_flow_logs
}

module "endpoints" {
  for_each = var.create_ssm_endpoint ? toset([module.vpc.vpc_id]) : toset([])
  source   = "terraform-aws-modules/vpc/aws//modules/vpc-endpoints"
  # バージョン指定に変数使用不可のため直書き
  version = "3.14.2"

  vpc_id             = each.value
  security_group_ids = [module.vpc.default_security_group_id]

  endpoints = {
    ssm = {
      service             = "ssm"
      private_dns_enabled = true
      subnet_ids          = module.vpc.private_subnets
      security_group_ids  = [aws_security_group.vpc_tls[module.vpc.vpc_id].id]
    },
    ssmmessages = {
      service             = "ssmmessages"
      private_dns_enabled = true
      subnet_ids          = module.vpc.private_subnets
    },
    ec2messages = {
      service             = "ec2messages"
      private_dns_enabled = true
      subnet_ids          = module.vpc.private_subnets
    },
  }
}

# SSM Endopoint用のセキュリティグループ
resource "aws_security_group" "vpc_tls" {
  for_each    = var.create_ssm_endpoint ? toset([module.vpc.vpc_id]) : toset([])
  name_prefix = "${local.vpc_name}-vpc_tls"
  description = "Allow TLS inbound traffic"
  vpc_id      = each.value

  ingress {
    description = "TLS from VPC"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = [module.vpc.vpc_cidr_block]
  }
}

resource "aws_security_group_rule" "vpc_default_self" {
  type                     = "ingress"
  from_port                = 0
  to_port                  = 0
  protocol                 = "all"
  source_security_group_id = module.vpc.default_security_group_id
  security_group_id        = module.vpc.default_security_group_id
}
