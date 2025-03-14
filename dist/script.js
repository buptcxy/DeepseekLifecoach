// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const chatHistory = document.getElementById('chatHistory');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');

    // 初始化变量
    let conversationHistory = [
        {role: "system", content: "你是一位专业的生活教练，你的目标是通过对话帮助用户成长。你会倾听用户的问题，提供有建设性的建议，鼓励用户反思，并帮助他们制定可行的计划。你的回答应该温暖、有同理心，但也要直接、诚实。避免给出过于笼统的建议，而是基于用户的具体情况提供个性化的指导。"}
    ];

    // 获取API地址
    const API_URL = window.location.hostname === 'localhost' ? '/api/chat' : 'https://your-backend-api.com/api/chat';

    // 发送消息函数
    function sendMessage() {
        const message = userInput.value.trim();
        if (message === '') return;

        // 添加用户消息到聊天历史
        addMessageToChat('user', message);
        
        // 清空输入框
        userInput.value = '';
        
        // 显示AI正在输入的指示器
        showTypingIndicator();
        
        // 添加用户消息到对话历史
        conversationHistory.push({role: "user", content: message});
        
        // 发送请求到后端
        fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: conversationHistory
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            // 检查响应是否为流式数据
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let aiMessage = '';
            let aiMessageElement = null;
            
            // 移除输入指示器
            removeTypingIndicator();
            
            // 处理流式响应
            function readStream() {
                return reader.read().then(({ done, value }) => {
                    if (done) {
                        // 流结束，将完整消息添加到对话历史
                        if (aiMessage) {
                            conversationHistory.push({role: "assistant", content: aiMessage});
                        }
                        return;
                    }
                    
                    // 解码接收到的数据
                    const chunk = decoder.decode(value, { stream: true });
                    
                    // 处理接收到的数据块
                    try {
                        // 分割数据块，处理可能的多个事件
                        const lines = chunk.split('\n');
                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                const data = line.slice(6);
                                if (data === '[DONE]') continue;
                                
                                try {
                                    const jsonData = JSON.parse(data);
                                    if (jsonData.choices && jsonData.choices[0].delta && jsonData.choices[0].delta.content) {
                                        const content = jsonData.choices[0].delta.content;
                                        aiMessage += content;
                                        
                                        // 如果是第一个数据块，创建新的消息元素
                                        if (!aiMessageElement) {
                                            aiMessageElement = addMessageToChat('ai', content, true);
                                        } else {
                                            // 否则，追加到现有消息
                                            const contentElement = aiMessageElement.querySelector('p');
                                            contentElement.textContent += content;
                                        }
                                    }
                                } catch (parseError) {
                                    console.error('解析JSON数据时出错:', parseError);
                                }
                            }
                        }
                    } catch (e) {
                        console.error('处理流数据时出错:', e);
                    }
                    
                    // 继续读取流
                    return readStream();
                });
            }
            
            return readStream();
        })
        .catch(error => {
            console.error('请求出错:', error);
            removeTypingIndicator();
            addMessageToChat('ai', '抱歉，我遇到了一些问题，请稍后再试。');
        });
    }

    // 添加消息到聊天界面
    function addMessageToChat(sender, content, isStream = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        const paragraph = document.createElement('p');
        paragraph.textContent = content;
        
        contentDiv.appendChild(paragraph);
        messageDiv.appendChild(contentDiv);
        chatHistory.appendChild(messageDiv);
        
        // 滚动到底部
        chatHistory.scrollTop = chatHistory.scrollHeight;
        
        return isStream ? messageDiv : null;
    }

    // 显示AI正在输入的指示器
    function showTypingIndicator() {
        const indicatorDiv = document.createElement('div');
        indicatorDiv.className = 'message ai-message';
        indicatorDiv.id = 'typingIndicator';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content typing-indicator';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('span');
            contentDiv.appendChild(dot);
        }
        
        indicatorDiv.appendChild(contentDiv);
        chatHistory.appendChild(indicatorDiv);
        
        // 滚动到底部
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    // 移除输入指示器
    function removeTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.remove();
        }
    }

    // 绑定发送按钮点击事件
    sendButton.addEventListener('click', sendMessage);

    // 绑定输入框回车事件
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // 阻止默认的换行行为
            sendMessage();
        }
    });

    // 自动聚焦到输入框
    userInput.focus();
});