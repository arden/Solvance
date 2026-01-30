# CoalScan Backend API

基于 Bun.js 的 CoalScan 后端 API 服务，提供 Solana Meme 代币风险分析功能。

## 技术栈

- **运行时**: Bun.js
- **Web 框架**: Hono
- **区块链**: Solana Web3.js
- **缓存**: Redis (ioredis)
- **验证**: Zod
- **语言**: TypeScript

## 快速开始

### 1. 安装依赖

```bash
cd backend
bun install
```

### 2. 配置环境变量

复制 `.env.example` 到 `.env` 并配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Solana RPC Configuration
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
# 推荐使用付费 RPC 服务（Helius、QuickNode 等）
# SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=
REDIS_CACHE_TTL=120

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# API Configuration
API_RATE_LIMIT=100
API_RATE_LIMIT_WINDOW=60000
```

### 3. 启动 Redis

确保 Redis 服务正在运行：

```bash
# 使用 Docker
docker run -d -p 6379:6379 redis:alpine

# 或使用本地安装的 Redis
redis-server
```

### 4. 启动开发服务器

```bash
bun run dev
```

服务器将在 `http://localhost:3001` 启动。

### 5. 启动生产服务器

```bash
bun run start
```

## API 端点

### 健康检查

```
GET /
GET /health
```

### 扫描代币

```
POST /api/scan
Content-Type: application/json

{
  "contractAddress": "Solana代币合约地址",
  "forceRefresh": false  // 可选，是否强制刷新缓存
}
```

响应：

```json
{
  "success": true,
  "data": {
    "contractAddress": "...",
    "scanTimestamp": 1234567890,
    "coalScore": 72,
    "riskLevel": "HIGH",
    "marketCap": 100000,
    "tokenAge": 86400,
    "scoreBreakdown": {
      "holdTimeScore": 65,
      "concentrationScore": 45,
      "walletConnectionScore": 80,
      "baseScore": 68,
      "redFlagBonus": 5,
      "sellBonus": 3,
      "agePenalty": 0,
      "maturityBonus": 0
    },
    "holders": [...],
    "bundles": [...],
    "redFlags": [...]
  }
}
```

### 获取扫描状态

```
GET /api/scan/status?address=合约地址
```

响应：

```json
{
  "success": true,
  "data": {
    "cached": true,
    "timestamp": 1234567890
  }
}
```

### 清除缓存

```
DELETE /api/scan/cache?address=合约地址
```

响应：

```json
{
  "success": true,
  "data": {
    "invalidated": true
  }
}
```

## 项目结构

```
backend/
├── src/
│   ├── config/          # 配置文件
│   ├── routes/          # API 路由
│   ├── services/        # 业务逻辑服务
│   ├── types/          # TypeScript 类型定义
│   └── index.ts        # 应用入口
├── .env.example        # 环境变量示例
├── package.json        # 依赖配置
├── tsconfig.json      # TypeScript 配置
└── README.md          # 项目文档
```

## 核心服务

### SolanaService
- 获取代币元数据
- 获取持仓者列表
- 分析交易历史
- 检测钱包标签

### RedisService
- 缓存扫描结果
- 管理缓存 TTL
- 提供缓存查询接口

### CoalScoreCalculator
- 计算 Coal Score
- 生成风险等级
- 识别红旗标识

### BundleDetector
- 检测同区块买入
- 检测同一资金来源
- 检测协调卖出

### ScanService
- 整合所有服务
- 管理扫描流程
- 处理缓存逻辑

## 错误处理

API 使用统一的错误响应格式：

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述"
  }
}
```

常见错误代码：

- `VALIDATION_ERROR`: 请求参数验证失败
- `INVALID_ADDRESS`: 无效的合约地址
- `SCAN_ERROR`: 扫描失败
- `STATUS_ERROR`: 获取状态失败
- `CACHE_ERROR`: 缓存操作失败
- `INTERNAL_ERROR`: 服务器内部错误

## 性能优化

- **缓存**: 扫描结果缓存 2 分钟
- **并发**: 使用异步并发请求
- **限流**: API 请求限流保护

## 开发建议

1. 使用付费 RPC 服务（Helius、QuickNode）以获得更好的性能
2. 配置 Redis 持久化以避免数据丢失
3. 监控 API 调用次数和错误率
4. 实现日志聚合和分析

## 部署

### Docker 部署

```bash
docker build -t coalscan-backend .
docker run -p 3001:3001 --env-file .env coalscan-backend
```

### 云服务部署

可以部署到以下平台：
- Vercel (使用 Serverless Functions)
- Railway
- Render
- Fly.io
- AWS Lambda
