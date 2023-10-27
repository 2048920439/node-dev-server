import express from 'express';
import path from 'path';
import os from 'os';
import net from 'net';
import compression from 'compression';
import {createProxyMiddleware} from 'http-proxy-middleware';
import dayjs from 'dayjs';
import fs from 'fs';

/**
 * @param {Object} config - 配置对象
 * @param {string} config.staticDir - 静态文件的根目录
 * @param {string} [config.name='地址:'] - 名称
 * @param {string} [config.host='localhost'] - 主机名
 * @param {number} [config.port=3000] - 端口号
 * @param {Object} [config.proxy] - 代理配置
 */
function openService(config) {
    return new Promise(resolve => {
        const {
            name = '地址:',
            staticDir,
            host = getIpv4() || 'localhost',
            port = 3000,
            proxy = {},
        } = config;

        const app = express();

        // 设置静态文件目录
        app.use(express.static(staticDir));

        // 启用gzip
        app.use(compression());

        // 使用代理
        for (let [key, config] of Object.entries(proxy)) {
            const proxyMiddleware = createProxyMiddleware({
                ...config,
                logLevel: 'silent',
                onProxyRes: (proxyRes, req) => {
                    proxyRes.headers['X-Real-Url'] = config.target + req.originalUrl;

                    const date = dayjs().format('MM-DD HH:mm:ss');
                    const logMessage = `[${date}] ${req.headers.host}${req.url}  \n - Ip: ${req.ip} - Proxy: ${config.target}`;

                    fs.appendFile('C:/Users/Administrator/Desktop/server.log', `\n${logMessage}\n`, (err) => {
                        if (err)  console.error('日志写入失败:', err);
                    });
                },
                onError:err => {
                    fs.appendFile('C:/Users/Administrator/Desktop/server.log', `\n${err}\n`, (err) => {
                        if (err)  console.error('日志写入失败:', err);
                    });
                }
            });
            // noinspection JSCheckFunctionSignatures
            app.use(key, proxyMiddleware);
        }

        // 定义基本路由
        app.get('/', (req, res) => {
            res.sendFile(path.join(staticDir, 'index.html'));
        });

        findAvailablePort(port)
            .then(port => {
                app.listen(port, () => {
                    const url = `http://${host}:${port}`;
                    console.log(`${name}: ${url}`);
                    resolve();
                });
            })
            .catch(err => {
                console.log('启动失败');
                console.log({staticDir});
                console.log(err);
            });

    });
}

// 获取IPv4地址
function getIpv4() {
    const networkInterfaces = os.networkInterfaces();
    for (const interfaceName in networkInterfaces) {
        const interfaceInfo = networkInterfaces[interfaceName];
        for (const info of interfaceInfo) {
            // 只考虑IPv4地址
            if (info.family === 'IPv4' && !info.internal) {
                return info.address;
            }
        }
    }
    return '';
}

// 寻找可用端口
function findAvailablePort(port) {
    return new Promise((resolve, reject) => {
        const server = net.createServer();

        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                // 端口被占用，尝试下一个端口
                resolve(findAvailablePort(port + 1));
            } else {
                // 其他错误，拒绝Promise
                reject(err);
            }
        });

        server.listen({port: port}, () => {
            // 服务器成功监听端口，表示端口可用
            server.close(() => {
                resolve(port);
            });
        });
    });
}

export {
    openService,
    getIpv4,
    findAvailablePort,
};
