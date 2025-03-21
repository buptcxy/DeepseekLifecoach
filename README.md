# 生活教练AI网站

## 项目概述
本项目是一个基于DeepSeek R1 API的生活教练网站，通过与AI对话，用户可以获得个人成长建议和指导。网站提供简洁直观的聊天界面，让用户能够方便地与AI生活教练进行交流。

## 功能特点
- 实时AI对话：通过DeepSeek R1 API实现与AI的实时对话
- 流式输出：提供流畅的对话体验，AI回复实时显示
- 个性化建议：AI根据用户的问题和情况提供定制化的生活建议
- 响应式设计：适配不同设备屏幕，提供良好的移动端体验

## 技术架构

### 前端部分
- 使用HTML5、CSS3和JavaScript构建用户界面
- 采用响应式设计，确保在不同设备上的良好显示效果
- 使用Flexbox和Grid布局实现页面结构
- 实现简洁直观的聊天界面

### 后端部分
- 使用Node.js创建简单的后端服务器
- 处理与DeepSeek R1 API的通信
- 解决跨域(CORS)问题
- 使用环境变量保护API密钥安全

## 环境变量配置

本项目使用环境变量来存储敏感信息，如API密钥。这样可以避免将敏感信息硬编码到代码中，提高安全性。

### 本地开发配置
1. 复制项目根目录中的`.env.example`文件，并重命名为`.env`
2. 在`.env`文件中填入你的DeepSeek API密钥和其他配置

```
# DeepSeek API配置
DEEPSEEK_API_KEY=your_api_key_here
DEEPSEEK_API_URL=https://api.deepseek.com/chat/completions
DEEPSEEK_MODEL=deepseek-chat

# 应用配置
PORT=3000
TEMPERATURE=0.6
API_TIMEOUT=60000
```

### Vercel部署配置
在Vercel上部署时，需要在Vercel项目设置中配置环境变量：

1. 登录Vercel账户并进入你的项目
2. 点击「Settings」→「Environment Variables」
3. 添加以下环境变量：
   - `DEEPSEEK_API_KEY`：你的DeepSeek API密钥
   - `DEEPSEEK_API_URL`：API端点URL（默认为https://api.deepseek.com/chat/completions）
   - `DEEPSEEK_MODEL`：使用的模型名称（默认为deepseek-chat）
   - `TEMPERATURE`：生成文本的随机性（默认为0.6）
   - `API_TIMEOUT`：API请求超时时间（默认为60000毫秒）
4. 点击「Save」保存设置

## 页面结构

### 主页面 (index.html)
- **页眉区域**：包含网站标题和简短介绍
- **聊天区域**：
  - 聊天历史显示区：显示用户与AI的对话历史
  - 消息输入区：用户输入问题的文本框和发送按钮
- **页脚区域**：包含版权信息和必要链接

## 样式说明
- 使用柔和的配色方案，创造平静、专注氛围
- 聊天气泡采用不同的颜色区分用户和AI的消息
- 响应式设计确保在移动设备上的良好体验
- 简洁的界面设计，减少视觉干扰

## 使用说明
1. 打开网站首页
2. 在输入框中输入你想咨询的问题或分享你的情况
3. 点击发送按钮或按回车键发送消息
4. AI生活教练会根据你的问题提供建议和指导
5. 继续对话以获取更深入的建议

## 开发计划
1. 搭建基础HTML结构和CSS样式
2. 实现前端JavaScript交互逻辑
3. 创建Node.js后端服务器
4. 集成DeepSeek R1 API
5. 测试和优化用户体验
6. 部署上线