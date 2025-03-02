const http = require('http');
const os = require('os');

// 打印系统信息
console.log('系统信息:');
console.log('操作系统:', os.platform());
console.log('主机名:', os.hostname());
console.log('网络接口:', os.networkInterfaces());

// 添加错误处理
process.on('uncaughtException', (err) => {
    console.error('未捕获的异常:', err);
    console.error('错误堆栈:', err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('未处理的 Promise 拒绝:', reason);
});

const server = http.createServer((req, res) => {
    // 详细的请求日志
    console.log('\n收到新请求:');
    console.log('时间:', new Date().toLocaleString());
    console.log('方法:', req.method);
    console.log('URL:', req.url);
    console.log('请求头:', JSON.stringify(req.headers, null, 2));
    console.log('客户端IP:', req.socket.remoteAddress);

    res.writeHead(200, { 
        'Content-Type': 'text/html; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    
    res.end(`
        <html>
            <head>
                <title>测试服务器</title>
                <meta charset="utf-8">
                <style>
                    body { 
                        font-family: Arial, sans-serif;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                        background-color: #f0f2f5;
                    }
                    .container {
                        text-align: center;
                        padding: 20px;
                        background: white;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        max-width: 600px;
                        width: 90%;
                    }
                    .info {
                        text-align: left;
                        margin: 10px 0;
                        padding: 10px;
                        background: #f8f9fa;
                        border-radius: 4px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>测试服务器运行成功！</h1>
                    <div class="info">
                        <p><strong>服务器信息：</strong></p>
                        <p>当前时间: ${new Date().toLocaleString()}</p>
                        <p>操作系统: ${os.platform()}</p>
                        <p>主机名: ${os.hostname()}</p>
                        <p>Node.js 版本: ${process.version}</p>
                    </div>
                    <div class="info">
                        <p><strong>请求信息：</strong></p>
                        <p>请求路径: ${req.url}</p>
                        <p>请求方法: ${req.method}</p>
                        <p>客户端IP: ${req.socket.remoteAddress}</p>
                    </div>
                </div>
            </body>
        </html>
    `);
});

const HOST = 'localhost';  // 使用 localhost
const PORT = 9000;        // 使用 9000 端口

// 详细的错误处理
server.on('error', (err) => {
    console.error('\n服务器错误:');
    console.error('错误类型:', err.name);
    console.error('错误消息:', err.message);
    console.error('错误堆栈:', err.stack);
    
    if (err.code === 'EADDRINUSE') {
        console.log(`端口 ${PORT} 已被占用，请尝试其他端口`);
    } else if (err.code === 'EACCES') {
        console.log(`没有权限绑定端口 ${PORT}，请尝试使用大于 1024 的端口`);
    }
});

// 服务器事件监听
server.on('listening', () => {
    console.log('\n服务器启动成功:');
    console.log(`本地访问地址: http://${HOST}:${PORT}`);
    console.log(`IP访问地址: http://127.0.0.1:${PORT}`);
    console.log('\n等待请求中...');
});

server.listen(PORT, HOST); 