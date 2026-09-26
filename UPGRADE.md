# 网站升级与部署说明

## 当前交付状态（2026-09-26）

网站升级代码位于 `edge/`，已经通过构建、类型检查与 12 项回归测试。Oracle-B 的服务维修已应用。更新 GitHub 部署 Token 后授权已恢复；真实 D1 数据的首页、村庄、文章、商品、联系页及草稿隔离检查通过。图片代理改用 Cloudflare 支持的 manual 重定向处理后返回 200。预览部署记录：https://github.com/2024kongzhou/binzhou-index/actions/runs/36234975220 。正式发布结果以 main 分支的部署记录为准。

## 运行与维护

使用 Node.js 24：

```sh
npm ci --prefix edge
npm run typecheck
npm run build
npm test
npm run dev
```

本地预览地址 `http://localhost:3000`，使用内存中的演示数据，不连接生产数据库，也不允许提交。构建产物是 `dist/_worker.js`，由 Cloudflare Pages Advanced Mode 执行。模板、CSS、浏览器脚本与 SVG 均随单个 Worker 发布；不需要读取生产 API 才能完成构建。

原 `src/`、`functions/` 与 `drizzle/` 保留作为旧版参考，不参与当前构建。原 Next.js 静态导出依赖构建时获取文章 slug，导致构建失败与新发布文章 404。新版从 D1 动态渲染，数据更新后立即可读。

## 数据和鉴权

- 沿用原 D1 `binzhou-db` 与 KV `CACHE`，本次没有修改生产表结构、导入种子或删除业务数据。
- 账号密码继续使用 bcrypt；原账号和密码可沿用。JWT 使用现有 `JWT_SECRET`，Cookie 为 HttpOnly、Secure、SameSite=Lax。
- 每次鉴权读取数据库中的当前账号状态及角色，不能仅依赖旧 JWT 中的管理员声明。
- 退出时把令牌摘要写入 KV 撤销表。KV 跨区域存在传播延迟，撤销和请求频率限制不提供强一致保证。
- 草稿列表、草稿详情与管理接口需要管理员；普通用户只能读取自己发送或接收的私信。
- 所有写入验证来源和 JSON 类型，并限制字段长度。用户文本转义输出；图片仅接受受限路径或 HTTPS。
- 评论进入待审核状态；预约和联系方式只供管理员查看。
- Preview 共用原数据库，但 `PREVIEW_READ_ONLY=true` 阻止应用的所有写入。预览不开放真实账号提交。

## 发布

GitHub Actions 使用锁定依赖构建、类型检查、测试，通过后部署同名分支。main 发布到正式站，其他分支发布到预览。部署流程不执行数据库 schema/seed。

需要恢复当前 Cloudflare 账户的 Pages 编辑权限，并使 CI 所用 Token 可从受允许的执行环境使用。不要把 Token 写进源码、报告或聊天。当前 CI 失败记录：
https://github.com/2024kongzhou/binzhou-index/actions/runs/36232755210

恢复授权后，先在 `codex/site-upgrade` 运行 `Deploy to Cloudflare Pages`，验证真实 D1 数据、图片、动态文章与认证；验收后再合入 main 发布。Pages 配置以 `wrangler.toml` 为准。配置方式参见 [Cloudflare 官方文档](https://developers.cloudflare.com/pages/functions/wrangler-configuration/)。

发布前保留的生产部署：`8298cec5-847a-442c-8ac0-b84604db8417`。需要回退时使用 Pages 的部署回退功能。本次没有修改生产 D1，因此无需回退数据。

## Oracle-B

- ai-hub：`/home/ubuntu/ai-hub/app`，监听 `127.0.0.1:8000`。
- image-server：`/home/ubuntu/oracle-image-server.py`，监听 `127.0.0.1:8001`。
- 现有 cloudflared-tunnel 转发到 8001；图片源 `/images/<filename>` 已验证 200。
- 新增 `/hub/health` 与 `/hub/ai/generate`，必须携带 X-API-Key，经本机转发至 AI 服务；没有公开任意代理或任务触发接口。
- 服务密钥迁移到 `/etc/binzhou-services.env`，root 所有、0600；systemd drop-in 引用这个文件。代码与原 unit 内的密钥默认值已移除。
- 移除启动 90 秒后自动发布和启动推送；保留原有定时任务。当天文章已存在则跳过，避免重启覆盖正文和封面。AI 调用失败抛出错误，不能作为文章正文发布。
- SSH 统计支持 ISO8601 日志，实测能计数；日志使用 `/etc/logrotate.d/binzhou-ai-hub` 轮转。
- 维修前备份目录：`/home/ubuntu/site-maintenance-backup-20260926T092813Z`，仅 root 可访问，含旧凭据，不可提交 Git。

## 尚需完成的线上工作

1. Cloudflare 发布权限已恢复，预览已验收；main 发布后仍需确认正式域名和管理员登录。
2. 图片目前依赖原有 Quick Tunnel，重启后地址可能变化。后续应迁移到命名隧道和固定域名，并更新 `ORACLE_IMG_SERVER`。
3. AI 网关已经在 B 上验证健康，但 Pages 的 `AI_HUB_URL` 和加密 `AI_HUB_KEY` 尚未配置。因此新版 `/api/ai` 会明确返回 503，不再伪装健康。
4. 管理员弱密码与旧凭据轮换需要在保证站主登录和定时任务同步更新的前提下安排；本次没有更改站主密码。
5. 本次没有主动触发 AI 生成、自动发文或推送，避免制造正式内容和通知。下一次定时任务仍需观察实际执行结果。
6. 未取得 Cloudflare 数据库导出权限。本次未修改生产数据库，也未声称完成完整数据备份。
