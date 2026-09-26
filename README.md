# 滨州索引

村庄档案、地方故事、本地好物与生活服务网站。网站：https://keyi.de5.net/

本分支提供新版 Cloudflare Pages 服务端渲染实现，替代原来的 Next.js 静态导出。原有 D1 数据和账号沿用，无需重新导入。

```sh
npm ci --prefix edge
npm run typecheck
npm run build
npm test
npm run dev
```

要求 Node.js 24。本地预览使用演示数据，地址为 http://localhost:3000/ 。线上配置在 `wrangler.toml`，服务端入口为 `edge/worker.ts`，原始服务代码位于 `ops/oracle-b/`。

**已修复问题、凭据配置、服务器备份与回退说明见 [UPGRADE.md](UPGRADE.md)。** Cloudflare 授权已恢复，真实数据预览通过；正式发布结果以 main 分支的部署记录为准。
