// 导入所需模块
const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
// 导入dotenv并配置
require('dotenv').config();

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 配置中间件
app.use(cors()); // 启用CORS
app.use(express.json()); // 解析JSON请求体
app.use(express.static(path.join(__dirname))); // 提供静态文件

// DeepSeek API配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/chat/completions';

// 处理聊天API请求
app.post('/api/chat', async (req, res) => {
    try {
        // 检查API密钥是否配置
        if (!DEEPSEEK_API_KEY) {
            return res.status(500).json({ error: 'API密钥未配置，请设置DEEPSEEK_API_KEY环境变量' });
        }
        
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
                model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
                messages: messages,
                stream: true,
                temperature: parseFloat(process.env.TEMPERATURE || '0.6')
            },
            responseType: 'stream',
            timeout: parseInt(process.env.API_TIMEOUT || '60000') // 默认60秒超时设置
        });

        // 将DeepSeek API的响应流式传输到客户端
        response.data.on('data', (chunk) => {
            const text = chunk.toString();
            try {
                const lines = text.split('\n');
                for (const line of lines) {
                    if (line.trim().startsWith('data:')) {
                        // 直接转发DeepSeek API的SSE数据
                        res.write(`${line.trim()}\n\n`);
                    }
                }
            } catch (error) {
                console.error('处理响应数据时出错:', error);
            }
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