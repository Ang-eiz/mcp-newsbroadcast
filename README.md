# 新闻联播MCP服务

## 项目简介

新闻联播MCP服务是一个用于获取指定日期新闻联播文字稿的服务，支持MCP协议和HTTP API两种调用方式。

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动服务

#### 生产环境

```bash
npm start
```

#### 开发环境（支持热重载）

```bash
npm run dev
```

服务将在 `http://localhost:8000` 启动。

## API文档

### 健康检查

```
GET /health
```

**响应示例：**

```json
{
  "status": "ok",
  "message": "新闻联播MCP服务运行正常"
}
```

### 获取新闻联播文字稿（HTTP API）

```
POST /get_news
```

**请求参数：**

| 参数 | 类型 | 必填 | 描述 |
| ---- | ---- | ---- | ---- |
| date | string | 是 | 日期，格式为YYYYMMDD，例如20231231 |

**请求示例：**

```bash
curl -X POST -H "Content-Type: application/json" -d '{"date":"20231231"}' http://localhost:8000/get_news
```

**响应示例：**

```json
{
  "date": "20231231",
  "content": "新闻联播文字稿内容..."
}
```

## MCP协议支持

### MCP服务描述

```
GET /mcp/describe
```

**响应示例：**

```json
{
  "name": "news_联播",
  "version": "1.0.0",
  "description": "获取指定日期的新闻联播文字稿",
  "tools": [
    {
      "name": "get_news",
      "description": "获取指定日期的新闻联播文字稿",
      "parameters": {
        "type": "object",
        "properties": {
          "date": {
            "type": "string",
            "description": "日期，格式为YYYYMMDD，例如20231231"
          }
        },
        "required": ["date"]
      }
    }
  ]
}
```

### MCP服务调用

```
POST /mcp/call
```

**请求参数：**

| 参数 | 类型 | 必填 | 描述 |
| ---- | ---- | ---- | ---- |
| tool | string | 是 | 工具名称，固定为 `get_news` |
| params | object | 是 | 工具参数，包含 `date` 字段 |

**请求示例：**

```bash
curl -X POST -H "Content-Type: application/json" -d '{"tool":"get_news","params":{"date":"20231231"}}' http://localhost:8000/mcp/call
```

**响应示例：**

```json
{
  "date": "20231231",
  "content": "新闻联播文字稿内容..."
}
```

## 项目结构

```
mcp-newsbroadcast/
├── mcp_server.js          # 主服务文件
├── package.json           # 项目配置文件
├── package-lock.json      # 依赖锁定文件
├── ServerConfig.json      # 服务配置文件
├── LICENSE                # 许可证文件
└── README.md              # 项目说明文档
```

## 服务配置

服务配置文件 `ServerConfig.json` 包含了MCP服务的详细配置信息，外层只包含 `mcpServers` 字段，符合服务配置要求。

**ServerConfig.json内容：**

```json
{
  "mcpServers": {
    "default": {
      "name": "news_联播",
      "version": "1.0.0",
      "description": "获取指定日期的新闻联播文字稿",
      "command": "npx",
      "args": ["news-mcp-service@latest"],
      "tools": [
        {
          "name": "get_news",
          "description": "获取指定日期的新闻联播文字稿",
          "parameters": {
            "type": "object",
            "properties": {
              "date": {
                "type": "string",
                "description": "日期，格式为YYYYMMDD，例如20231231"
              }
            },
            "required": ["date"]
          }
        }
      ]
    }
  }
}
```

## 依赖说明

| 依赖 | 版本 | 用途 |
| ---- | ---- | ---- |
| express | ^4.18.2 | Web框架，用于构建API服务 |
| axios | ^1.6.0 | HTTP客户端，用于请求新闻联播数据 |
| cheerio | ^1.0.0-rc.12 | HTML解析库，用于提取新闻内容 |
| nodemon | ^3.0.1 | 开发工具，用于热重载服务 |

## 许可证

MIT License
