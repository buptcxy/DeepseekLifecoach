// 导入所需模块
const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 配置中间件
app.use(cors()); // 启用CORS
app.use(express.json()); // 解析JSON请求体
app.use(express.static(path.join(__dirname))); // 提供静态文件

// DeepSeek API配置
const DEEPSEEK_API_KEY = 'sk-a51f011d215341eebd3d756d860375fe';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

// 处理聊天API请求
app.post('/api/chat', async (req, res) => {
    try {
        // 设置响应头，支持流式输出
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // 获取请求中的消息
        const { messages } = req.body;

        // 创建到DeepSeek API的请求
        const response = await axios({
            method: 'post',
            url: DEEPSEEK_API_URL,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
            },
            data: {
                model: 'deepseek-chat',
                messages: messages,
                stream: true,
                temperature: 0.6
            },
            responseType: 'stream',
            timeout: 60000 // 60秒超时设置
        });

        // 将DeepSeek API的响应流式传输到客户端
        response.data.on('data', (chunk) => {
            res.write(chunk);
        });

        response.data.on('end', () => {
            res.end();
        });

        // 处理请求被客户端中止的情况
        req.on('close', () => {
            res.end();
        });
    } catch (error) {
        console.error('API请求错误:', error);
        res.status(500).json({ error: '服务器错误，请稍后再试' });
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log('按Ctrl+C停止服务器');
});