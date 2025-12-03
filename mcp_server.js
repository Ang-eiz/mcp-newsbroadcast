const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const port = 8000;

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 健康检查接口
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: '新闻联播MCP服务运行正常' 
    });
});

// 获取指定日期的新闻联播文字稿
async function getNewsByDate(dateStr) {
    try {
        const url = `https://cn.govopendata.com/xinwenlianbo/${dateStr}`;
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        
        // 查找包含JSON-LD数据的script标签
        const scriptContent = $('script[type="application/ld+json"]').html();
        if (!scriptContent) {
            throw new Error('未找到新闻内容');
        }
        
        const jsonData = JSON.parse(scriptContent);
        
        return {
            date: dateStr,
            content: jsonData.articleBody || ''
        };
    } catch (error) {
        throw new Error(`无法获取该日期的新闻联播: ${error.message}`);
    }
}

// MCP服务描述接口
app.get('/mcp/describe', (req, res) => {
    res.json({
        name: 'news_联播',
        version: '1.0.0',
        description: '获取指定日期的新闻联播文字稿',
        tools: [
            {
                name: 'get_news',
                description: '获取指定日期的新闻联播文字稿',
                parameters: {
                    type: 'object',
                    properties: {
                        date: {
                            type: 'string',
                            description: '日期，格式为YYYYMMDD，例如20231231'
                        }
                    },
                    required: ['date']
                }
            }
        ]
    });
});

// MCP服务调用入口
app.post('/mcp/call', async (req, res) => {
    try {
        const { tool, params } = req.body;
        
        if (!tool) {
            return res.status(400).json({ error: '缺少tool参数' });
        }
        
        if (tool === 'get_news') {
            if (!params || !params.date) {
                return res.status(400).json({ error: '缺少date参数' });
            }
            
            const result = await getNewsByDate(params.date);
            return res.json(result);
        } else {
            return res.status(404).json({ error: `不支持的工具: ${tool}` });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// MCP调用接口GET方法支持（返回使用说明）
app.get('/mcp/call', (req, res) => {
    res.json({
        message: 'MCP调用接口，请使用POST方法访问',
        usage: {
            method: 'POST',
            body: {
                "tool": "get_news",
                "params": {
                    "date": "20231231"
                }
            },
            example: 'curl -X POST -H "Content-Type: application/json" -d "{\"tool\":\"get_news\",\"params\":{\"date\":\"20231231\"}}" http://localhost:8000/mcp/call'
        }
    });
});

// HTTP API接口（非MCP协议）
app.post('/get_news', async (req, res) => {
    try {
        const { date } = req.body;
        
        if (!date) {
            return res.status(400).json({ error: '缺少date参数' });
        }
        
        const result = await getNewsByDate(date);
        return res.json(result);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// 启动服务器
app.listen(port, () => {
    console.log(`新闻联播MCP服务已启动，监听端口 ${port}`);
    console.log(`健康检查: http://localhost:${port}/health`);
    console.log(`MCP描述: http://localhost:${port}/mcp/describe`);
    console.log(`MCP调用: http://localhost:${port}/mcp/call`);
    console.log(`HTTP API: http://localhost:${port}/get_news`);
});