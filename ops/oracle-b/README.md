# Oracle-B 服务代码

这些文件是 2026-09-26 维修后的运行代码，不包含密钥。`main.py` 和 `config.py` 对应 `/home/ubuntu/ai-hub/app/`；`image-server.py` 对应 `/home/ubuntu/oracle-image-server.py`。现有虚拟环境和 systemd 服务继续使用。

服务通过 systemd `EnvironmentFile=/etc/binzhou-services.env` 注入 `SENSENOVA_API_KEY`、`PUSHPLUS_TOKEN`、`SITE_ADMIN_PASSWORD`、`API_KEY`、`IMAGE_SERVER_TOKEN`、`APP_HOST=127.0.0.1`。该文件权限为 0600，不应复制到仓库。迁移或恢复时必须同步环境文件，不能只复制 Python 文件。

运行环境检查：ai-hub、image-server、cloudflared-tunnel 均 active；本机及 HTTPS 隧道的图片 GET 返回 200，鉴权后的 `/hub/health` 返回 healthy。没有在验收时触发推送或文章生成。

完整发布状态、备份位置及剩余事项见根目录 `UPGRADE.md`。原生产 Pages 尚未升级，Cloudflare 授权恢复后还需配置 AI 网关密钥，并进行端到端验收。
