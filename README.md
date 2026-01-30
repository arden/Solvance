# Solvance - Solana Token Risk Analysis

基于 Next.js + Bun.js 的前后端分离架构，提供 Solana 代币风险分析服务。

## 项目架构

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                      │
│  - 用户界面 (React + shadcn/ui)                      │
│  - 国际化支持 (中英文)                                 │
│  - 响应式设计                                            │
└─────────────────────────────────────────────────────────────────┘
                          │ HTTP API
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend (Bun.js)                        │
│  - RESTful API (Hono)                                   │
│  - Solana RPC 集成                                      │
│  - Redis 缓存                                            │
│  - 风险评分算法                                          │
└─────────────────────────────────────────────────────────────────┘
```

## 技术栈

### 前端
- **框架**: Next.js 16.1.1 (App Router)
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **样式**: Tailwind CSS v4
- **国际化**: next-intl
- **表单**: React Hook Form + Zod
- **图标**: Lucide React
- **字体**: Geist Sans & Geist Mono
- **包管理器**: pnpm 9+
- **TypeScript**: 5.x

### 后端
- **运行时**: Bun.js
- **Web 框架**: Hono
- **区块链**: Solana Web3.js
- **缓存**: Redis (ioredis)
- **验证**: Zod
- **语言**: TypeScript

## 快速开始

### 前置要求

- Node.js 20.9.0+ (推荐 v22+)
- pnpm 9+
- Redis 6+
- Solana RPC 节点（可使用免费或付费服务）

### 1. 克隆项目

```bash
git clone <repository-url>
cd smrc
```

### 2. 启动后端

```bash
cd backend

# 安装依赖
bun install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置 Solana RPC 和 Redis

# 启动开发服务器
bun run dev
```

后端将在 `http://localhost:3001` 启动。

### 3. 启动前端

```bash
# 返回项目根目录
cd ..

# 安装依赖
pnpm install

# 配置环境变量
cp .env.local.example .env.local
# 编辑 .env.local 文件，设置后端 API 地址

# 启动开发服务器
pnpm dev
```

前端将在 `http://localhost:3000` 启动。

## 项目结构

```
smrc/
├── backend/                  # 后端服务 (Bun.js)
│   ├── src/
│   │   ├── config/          # 配置文件
│   │   ├── routes/          # API 路由
│   │   ├── services/        # 业务逻辑服务
│   │   │   ├── redis.ts          # Redis 缓存服务
│   │   │   ├── solana.ts         # Solana RPC 服务
│   │   │   ├── score-calculator.ts # 评分计算器
│   │   │   ├── bundle-detector.ts # 钱包关联检测
│   │   │   └── scan.ts          # 扫描服务
│   │   ├── types/          # TypeScript 类型定义
│   │   └── index.ts        # 应用入口
│   ├── .env.example        # 环境变量示例
│   ├── package.json        # 依赖配置
│   ├── tsconfig.json      # TypeScript 配置
│   └── README.md          # 后端文档
│
├── src/                      # 前端应用 (Next.js)
│   ├── app/              # Next.js App Router
│   │   ├── en/           # 英文页面
│   │   ├── zh/           # 中文页面
│   │   └── api/          # API 路由
│   ├── components/       # React 组件
│   │   ├── ui/           # shadcn/ui 基础组件
│   │   ├── FAQModal.tsx  # FAQ 模态框
│   │   └── LanguageSwitcher.tsx
│   ├── i18n/            # 国际化配置
│   ├── lib/              # 工具函数库
│   │   ├── api.ts        # API 客户端
│   │   ├── score-calculator.ts  # 评分计算器
│   │   └── utils.ts      # 工具函数
│   └── hooks/            # 自定义 React Hooks
│
├── .env.local.example    # 前端环境变量示例
├── package.json        # 前端依赖配置
├── tsconfig.json      # TypeScript 配置
└── README.md          # 项目文档
```

## API 文档

### 基础 URL

```
http://localhost:3001
```

### 端点

#### 健康检查

```
GET /
GET /health
```

响应：

```json
{
  "success": true,
  "message": "Solvance API is running",
  "version": "1.0.0",
  "timestamp": 1234567890
}
```

#### 扫描代币

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
    "holders": [
      {
        "walletAddress": "...",
        "balance": 10000,
        "supplyPercentage": 10.5,
        "valueUsd": 5000,
        "firstHoldTime": 1234567890,
        "holdDuration": 86400,
        "totalBought": 15000,
        "totalSold": 5000,
        "soldPercentage": 33.3,
        "profitLoss": -2500,
        "profitLossPercentage": -16.7,
        "labels": ["FRESH", "BOT"],
        "transactionCount": 50,
        "lastActivityTime": 1234567890,
        "connectedWallets": 2
      }
    ],
    "bundles": [
      {
        "bundleId": "same-block-123456",
        "type": "SAME_BLOCK_BUY",
        "walletAddresses": ["...", "..."],
        "totalSupplyPercentage": 15.5,
        "detectionScore": 20,
        "blockHeight": 24567890,
        "detectionTime": 1234567890
      }
    ],
    "redFlags": [
      {
        "type": "CONCENTRATION",
        "description": "Top 10 holders own >40% supply (+5)",
        "score": 5
      }
    ]
  }
}
```

#### 获取扫描状态

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

#### 清除缓存

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

## 核心功能

### 1. Solana RPC 集成

- 获取代币元数据（名称、符号、供应量、价格）
- 获取持仓者列表
- 分析交易历史
- 检测钱包标签（Fresh、Bot、Dormant、KOL）

### 2. Redis 缓存

- 扫描结果缓存 2 分钟
- 减少 API 调用成本
- 提升响应速度
- 支持强制刷新

### 3. 风险评分算法

#### 基础评分（加权指标）

- **持仓时间**（35%）：位置加权平均，前10名3倍权重
- **集中度**（20%）：前30名持仓者供应量占比
- **钱包关联**（45%）：同区块买入、同一资金来源等

#### 风险加分项

- **集中度红旗**（最高+25）：前10持仓>40%、大持仓者短期持有
- **卖出行为**（最高+25）：重度卖出者、中度卖出者、总抛售量
- **代币年龄惩罚**：<1小时+25，1-2小时+20，2-4小时+12，4-8小时+6
- **成熟度奖励**：已建立代币可减分（-5到-15）

#### 特殊规则

- 市值<$15k 直接设为90分（极度危险）

### 4. 钱包关联检测

- **同区块买入**：3个以上钱包在同一区块买入
- **同一资金来源**：3个以上钱包由同一地址资助
- **协调卖出**：2个以上重度卖出者在同一时间窗口卖出

### 5. 前端功能

- 多语言支持（中文、英文）
- 响应式设计（桌面、平板、手机）
- 实时数据刷新
- 详细持仓者列表
- 评分分解展示
- 红旗标识展示
- 钱包关联可视化
- 错误处理和用户反馈

## 开发指南

### 前端开发

```bash
# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start

# 类型检查
pnpm ts-check

# 代码检查
pnpm lint
```

### 后端开发

```bash
# 启动开发服务器
bun run dev

# 启动生产服务器
bun run start

# 运行测试
bun test
```

## 部署

### 前端部署

可以部署到以下平台：
- Vercel（推荐）
- Netlify
- Cloudflare Pages
- AWS Amplify

### 后端部署

可以部署到以下平台：
- Railway
- Render
- Fly.io
- AWS Lambda
- DigitalOcean App Platform

## 环境变量

### 前端 (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 后端 (.env)

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

## 性能优化

- **缓存**: 扫描结果缓存 2 分钟
- **并发**: 使用异步并发请求
- **限流**: API 请求限流保护
- **懒加载**: 前端数据分页和虚拟滚动

## 监控

- **错误追踪**: 建议集成 Sentry
- **性能监控**: 建议集成 Vercel Analytics
- **日志**: 后端使用结构化日志

## 贡献

欢迎贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

MIT License

## 联系方式

- 项目主页: [GitHub Repository]
- 问题反馈: [GitHub Issues]

## 致谢

- Next.js 团队
- shadcn/ui 团队
- Solana 社区
- Bun.js 团队
