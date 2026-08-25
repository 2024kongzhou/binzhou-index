# 滨州索引 - Cloudflare 部署指南

## 架构
- **前端**: Next.js 14 (静态导出) + Tailwind CSS + shadcn/ui
- **API**: Cloudflare Pages Functions (Edge Runtime)
- **数据库**: Cloudflare D1 (SQLite)
- **缓存**: Cloudflare KV
- **对象存储**: Oracle Cloud Object Storage (可选)

---

## 快速部署步骤

### 1. 将工作流文件移到正确位置

本仓库中的 `.github/configs/deploy.yml` 需要复制到 `.github/workflows/deploy.yml` 才能启用自动部署。

**操作方法**: 在 GitHub 网页上，进入 `.github/configs/` 目录，点击 `deploy.yml` 文件，然后点击右上角的 "..." -> "Move"，将文件移动到 `.github/workflows/deploy.yml`。

### 2. 配置 GitHub Secrets

在仓库 Settings -> Secrets and variables -> Actions 中添加以下 Secrets：

| Secret 名称 | 说明 | 获取方式 |
|------------|------|---------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API Token | Cloudflare Dashboard -> My Profile -> API Tokens -> Create Token (使用 "Edit Cloudflare Workers" 模板) |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Account ID | Cloudflare Dashboard 右侧边栏 |
| `JWT_SECRET` | JWT 签名密钥 | 任意随机字符串，如 `binzhou-2026-secret-key` |

### 3. 创建 Cloudflare D1 数据库

在 Cloudflare Dashboard -> Workers & Pages -> D1 中创建数据库：
- 名称: `binzhou-db`

创建后，在 `wrangler.toml` 中更新 `database_id`。

### 4. 创建 Cloudflare KV 命名空间

在 Cloudflare Dashboard -> Workers & Pages -> KV 中创建：
- 名称: `binzhou-cache`

创建后，在 `wrangler.toml` 中更新 `id`。

### 5. 初始化数据库

使用 wrangler CLI 执行 SQL 文件：

```bash
# 推送表结构
npx wrangler d1 execute binzhou-db --file=./drizzle/schema.sql

# 推送种子数据
npx wrangler d1 execute binzhou-db --file=./drizzle/seed.sql
```

### 6. 推送代码触发部署

将新的 Next.js 项目代码推送到 main 分支，GitHub Actions 会自动：
1. 构建项目 (`npm run build`)
2. 部署到 Cloudflare Pages
3. 执行 D1 数据库迁移

---

## 本地开发

```bash
npm install
npm run build
npm run dev
```

本地使用 SQLite（数据存储在 `local.db`），已包含演示数据。

---

## 管理后台

- 地址: `https://你的域名/admin`
- 默认管理员: `admin@keyi.de5.net`
- 默认密码: `admin123`

**部署后请立即修改管理员密码！**

---

## 项目结构

```
binzhou-new/
├── src/                    # Next.js 前端源码
│   ├── app/               # 页面路由
│   ├── components/        # UI 组件
│   ├── db/                # 数据库 schema & 本地连接
│   └── lib/               # 工具函数
├── functions/             # Cloudflare Pages Functions (API)
│   ├── api/               # API 路由
│   └── _utils/            # 共享工具
├── drizzle/               # 数据库迁移 & 种子
│   ├── schema.sql         # 表结构
│   └── seed.sql           # 演示数据
├── dist/                  # 构建输出 (静态文件)
├── wrangler.toml          # Cloudflare 配置
└── next.config.mjs        # Next.js 配置
```

---

## 常见问题

**Q: API 返回 500 错误？**
A: 检查 D1 数据库是否正确绑定，`wrangler.toml` 中的 `database_id` 是否正确。

**Q: 登录后页面不显示用户信息？**
A: 检查 JWT_SECRET 是否已设置为 GitHub Secret。

**Q: 静态页面可以访问但 API 404？**
A: 确保 `functions/` 目录存在于项目根目录，且文件路径正确。
