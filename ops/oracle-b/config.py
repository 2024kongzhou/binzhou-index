#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""AI 运维中枢配置（敏感信息，勿提交 Git）"""

import os

# ==================== 商汤 AI ====================
SENSENOVA_API_KEY = os.getenv("SENSENOVA_API_KEY", "")
SENSENOVA_BASE_URL = os.getenv("SENSENOVA_BASE_URL", "https://token.sensenova.cn/v1")
SENSENOVA_MODEL = os.getenv("SENSENOVA_MODEL", "deepseek-v4-flash")

# ==================== PushPlus 微信推送 ====================
PUSHPLUS_TOKEN = os.getenv("PUSHPLUS_TOKEN", "")

# ==================== keyi.de5.net 网站集成 ====================
SITE_BASE_URL = os.getenv("SITE_BASE_URL", "https://keyi.de5.net")
SITE_ADMIN_EMAIL = os.getenv("SITE_ADMIN_EMAIL", "admin@keyi.de5.net")
SITE_ADMIN_PASSWORD = os.getenv("SITE_ADMIN_PASSWORD", "")

# ==================== AI 中枢 API 鉴权 ====================
API_KEY = os.getenv("API_KEY", "")

# ==================== 应用 ====================
APP_HOST = os.getenv("APP_HOST", "0.0.0.0")
APP_PORT = int(os.getenv("APP_PORT", "8000"))
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
# ==================== Oracle 图片服务器 ====================
IMAGE_SERVER_URL = os.getenv("IMAGE_SERVER_URL", "http://127.0.0.1:8001")
IMAGE_SERVER_TOKEN = os.getenv("IMAGE_SERVER_TOKEN", "")
