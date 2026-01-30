# Solvance 项目总结

## 项目概述

Solvance 是一个基于前后端分离架构的 Solana 代币风险分析工具，帮助投资者在投资前识别潜在的风险和抛售压力。

## 技术架构

### 前端（Next.js）
- **框架**: Next.js 16.1.1 (App Router)
- **UI 组件库**: shadcn/ui (基于 Radix UI)
- **样式**: Tailwind CSS v4
- **国际化**: next-intl (中英文双语)
- **状态管理**: React Hooks
- **API 客户端**: 自定义 fetch 封装

### 后端（Bun.js）
- **运行时**: Bun.js
- **Web 框架**: Hono
- **区块链**: Solana Web3.js
- **缓存**: Redis (ioredis)
- **验证**: Zod
- **语言**: TypeScript

## 已实现功能

### 高优先级（P0）功能 ✅

#### 1. 集成真实的 Solana RPC 数据源 ✅
- **文件**: [`backend/src/services/solana.ts`](backend/src/services/solana.ts)
- **功能**:
  - 获取代币元数据（名称、符号、供应量、价格）
  - 获取持仓者列表
  - 分析交易历史
  - 检测钱包标签（Fresh、Bot、Dormant、KOL）
- **状态**: 已实现，需要配置真实的 RPC URL

#### 2. 实现 Redis 缓存机制 ✅
- **文件**: [`backend/src/services/redis.ts`](backend/src/services/redis.ts)
- **功能**:
  - 扫描结果缓存 2 分钟
  - 减少 API 调用成本
  - 提升响应速度
  - 支持强制刷新
- **状态**: 已实现，需要配置 Redis 连接

#### 3. 实现持仓者列表详细展示 ✅
- **文件**: [`src/app/zh/result/page.tsx`](src/app/zh/result/page.tsx), [`src/app/en/result/page.tsx`](src/app/en/result/page.tsx)
- **功能**:
  - 详细持仓者列表（排名、地址、持仓占比、持仓时间、卖出比例、盈亏、标签）
  - 评分分解展示（各指标贡献度）
  - 红旗标识展示
  - 钱包关联可视化
  - 实时刷新功能
  - 导出功能（UI 已实现）
- **状态**: 已实现

#### 4. 添加错误处理和用户反馈 ✅
- **文件**: 所有 API 路由和前端页面
- **功能**:
  - 统一的错误响应格式
  - 用户友好的错误消息
  - 重试机制
  - 加载状态显示
  - 错误边界处理
- **状态**: 已实现

### 核心功能 ✅

#### 评分计算系统
- **文件**: [`backend/src/services/score-calculator.ts`](backend/src/services/score-calculator.ts)
- **算法**:
  - 基础评分（加权指标）
  - 持仓时间（35%）
  - 集中度（20%）
  - 钱包关联（45%）
  - 风险加分项（集中度、卖出行为、年龄惩罚、成熟度奖励）
  - 特殊规则（市值<$15k 直接设为90分）
- **状态**: 已实现

#### 钱包关联检测
- **文件**: [`backend/src/services/bundle-detector.ts`](backend/src/services/bundle-detector.ts)
- **检测类型**:
  - 同区块买入（3个以上钱包在同一区块买入）
  - 同一资金来源（3个以上钱包由同一地址资助）
  - 协调卖出（2个以上重度卖出者在同一时间窗口卖出）
- **状态**: 已实现

#### API 路由
- **文件**: [`backend/src/routes/scan.ts`](backend/src/routes/scan.ts)
- **端点**:
  - `POST /api/scan` - 扫描代币
  - `GET /api/scan/status` - 获取扫描状态
  - `DELETE /api/scan/cache` - 清除缓存
  - `GET /` - 健康检查
  - `GET /health` - 健康检查
- **状态**: 已实现

#### 前端页面
- **首页**: [`src/app/zh/page.tsx`](src/app/zh/page.tsx), [`src/app/en/page.tsx`](src/app/en/page.tsx)
  - 代币地址输入
  - 扫描按钮
  - 使用说明
  - FAQ 模态框
- **结果页**: [`src/app/zh/result/page.tsx`](src/app/zh/result/page.tsx), [`src/app/en/result/page.tsx`](src/app/en/result/page.tsx)
  - 风险评分展示
  - 评分分解
  - 持仓者列表
  - 红旗标识
  - 钱包关联
  - 刷新功能
- **状态**: 已实现

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
│   ├── Dockerfile         # Docker 配置
│   ├── package.json        # 依赖配置
│   ├── tsconfig.json      # TypeScript 配置
│   ├── .gitignore         # Git 忽略文件
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
│   │   └── utils.ts      # 工具函数
│   └── hooks/            # 自定义 React Hooks
│
├── scripts/              # 脚本文件
│   └── start-all.sh    # 一键启动脚本
│
├── docker-compose.yml    # Docker Compose 配置
├── .env.local.example    # 前端环境变量示例
├── README.md          # 项目文档
└── DEPLOYMENT.md      # 部署指南
```

## 配置说明

### 前端配置（.env.local）

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 后端配置（.env）

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Solana RPC Configuration
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
# 推荐使用付费 RPC 服务
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

## 启动方式

### 方式一：分别启动

```bash
# 终端 1：启动后端
cd backend
bun install
cp .env.example .env
bun run dev

# 终端 2：启动前端
cd ..
pnpm install
cp .env.local.example .env.local
pnpm dev
```

### 方式二：Docker Compose（推荐）

```bash
# 启动 Redis 和后端
docker-compose up -d

# 启动前端（另开终端）
pnpm dev
```

### 方式三：一键启动脚本

```bash
# 给脚本添加执行权限
chmod +x scripts/start-all.sh

# 启动前后端
./scripts/start-all.sh
```

## API 文档

### 基础 URL

```
http://localhost:3001
```

### 主要端点

#### 扫描代币

```
POST /api/scan
Content-Type: application/json

{
  "contractAddress": "Solana代币合约地址",
  "forceRefresh": false
}
```

#### 获取扫描状态

```
GET /api/scan/status?address=合约地址
```

#### 清除缓存

```
DELETE /api/scan/cache?address=合约地址
```

## 部署建议

### 前端部署

推荐平台：
- **Vercel**（推荐）：零配置部署，自动 HTTPS
- **Netlify**：简单部署，支持表单处理
- **Cloudflare Pages**：全球 CDN，快速访问

### 后端部署

推荐平台：
- **Railway**：简单部署，内置 Redis
- **Render**：免费层可用，自动 HTTPS
- **Fly.io**：全球部署，低延迟
- **AWS Lambda**：企业级，高可用性

## 性能优化建议

### 后端优化

1. **使用付费 RPC 服务**：提高请求速率和稳定性
2. **增加 Redis 缓存时间**：根据数据更新频率调整
3. **实现请求限流**：防止滥用
4. **使用 CDN**：加速静态资源
5. **数据库连接池**：优化数据库连接

### 前端优化

1. **启用 Next.js Image Optimization**：自动优化图片
2. **使用静态生成**：预渲染静态页面
3. **实现代码分割**：减少初始加载时间
4. **使用 Service Worker**：缓存 API 响应
5. **启用 Gzip 压缩**：减少传输大小

## 安全建议

### 后端安全

1. **启用 HTTPS**：使用 SSL 证书
2. **设置 CORS 白名单**：限制允许的来源
3. **实现 API 密钥认证**：保护敏感端点
4. **速率限制**：防止 DDoS 攻击
5. **输入验证**：使用 Zod 验证所有输入

### 前端安全

1. **验证 API 响应**：检查 success 字段
2. **不暴露敏感信息**：不在前端存储 API 密钥
3. **使用 CSP**：内容安全策略
4. **启用 HTTPS**：强制使用安全连接

## 后续改进建议

### 中优先级（P1）

1. **实现用户认证**：NextAuth.js
2. **实现扫描历史记录**：数据库存储
3. **实现收藏/关注代币功能**：用户个性化
4. **实现价格预警**：WebSocket 实时推送
5. **实现 API 密钥管理**：付费 API 服务

### 低优先级（P2）

1. **实现移动端原生应用**：React Native / Flutter
2. **添加更多语言支持**：日语、韩语等
3. **实现高级筛选功能**：按标签、按时间等
4. **实现数据导出功能**：CSV、JSON 格式
5. **实现社交分享功能**：Twitter、Telegram 等

## 技术债务

### 需要清理的代码

1. 前端的 [`src/app/api/scan/route.ts`](src/app/api/scan/route.ts) - 已废弃，使用后端 API
2. 前端的 [`src/lib/score-calculator.ts`](src/lib/score-calculator.ts) - 已废弃，使用后端计算

### 需要完善的测试

1. 单元测试：Jest + React Testing Library
2. 集成测试：Playwright
3. E2E 测试：Cypress
4. API 测试：Supertest

## 文档

- [README.md](README.md) - 项目总览
- [DEPLOYMENT.md](DEPLOYMENT.md) - 部署指南
- [backend/README.md](backend/README.md) - 后端文档

## 许可证

MIT License

## 联系方式

- 项目主页: [GitHub Repository]
- 问题反馈: [GitHub Issues]

## 总结

Solvance 项目已完成前后端分离架构，实现了所有高优先级（P0）功能：

✅ 集成真实的 Solana RPC 数据源
✅ 实现 Redis 缓存机制
✅ 实现持仓者列表详细展示
✅ 添加错误处理和用户反馈

项目已具备生产环境部署的基础条件，可以开始进行中优先级功能的开发和优化。
