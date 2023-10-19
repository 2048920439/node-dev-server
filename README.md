# 本地 Web 服务器工具

这是一个用于本地开发和测试的 Node.js Web 服务器工具。它可以帮助你轻松地启动本地 Web 服务，包括静态文件服务、代理配置以解决跨域问题，以及自动查找可用端口。此工具还提供了获取本地 IPv4 地址的功能，以便设置主机名。它非常适用于前端和后端开发，可以加快开发和测试流程。

## 特性

- 启动本地 Web 服务器
- 静态文件服务
- 代理配置，解决跨域问题
- 自动查找可用端口
- 获取本地 IPv4 地址
- 简单易用

## 安装

```bash
npm install
```

## 示例
```javascript
import { openService, getIpv4 } from '../server.js';

openService({
  staticDir: 'D:/web/dist',
  host: getIpv4(),
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://api.example.com',
      changeOrigin: true,
    },
  },
});
```

## 贡献
如果你发现问题或有改进意见，欢迎贡献或提出问题。
你可以在 GitHub 仓库 中提交问题或拉取请求。

## 授权
这个工具基于 Unlicense 协议发布,更多信息请查看<https://unlicense.org>。

---
作者: https://github.com/2048920439
