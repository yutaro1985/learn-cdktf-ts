variable "project_name" {
  type        = string
  description = "プロジェクト全体で使う名前。これを使って各リソースにPJ名を入れる"
}
variable "env" {
  type        = string
  description = "リソース名などに付与される環境識別文字列 (dev/stg/prod)"
}

variable "vpc_cidr_block" {
  type        = string
  description = "VPCのCidrブロック"
  validation {
    condition     = can(regex("(^10\\..+)|(^172\\.(1[6-9]|2[0-9]|3[0-1])\\..+)|(^192\\.168\\..+)", var.vpc_cidr_block))
    error_message = "You must set the input variable \"vpc_cidr_block\" to the Private Address Space range of RFC 1918."
  }
}

variable "az_suffixes" {
  type        = list(string)
  default     = ["a", "c", "d"]
  description = "リージョン内のAZを表すアルファベットのリスト"
}

variable "create_ssm_endpoint" {
  type    = bool
  default = false
}
