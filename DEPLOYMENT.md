# CoalScan 部署指南

本文档提供 CoalScan 前后端分离架构的详细部署指南。

## 目录

- [本地开发](#本地开发)
- [Docker 部署](#docker-部署)
- [云服务部署](#云服务部署)
- [生产环境配置](#生产环境配置)

## 本地开发

### 前置要求

- Node.js 18+ 或 Bun.js 1.0+
- pnpm 9+
- Redis 6+
- Solana RPC 节点

### 启动步骤

#### 1. 启动 Redis

**选项 A：使用 Docker**

```bash
docker run -d -p 6379:6379 --name coalscan-redis redis:alpine
```

**选项 B：使用本地安装的 Redis**

```bash
# macOS
brew install redis
brew services start redis

# Linux
sudo apt-get install redis-server
sudo systemctl start redis

# Windows
# 下载 Redis for Windows
# 启动 redis-server.exe
```

#### 2. 启动后端

```bash
cd backend

# 安装依赖
bun install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件

# 启动开发服务器
bun run dev
```

后端将在 `http://localhost:3001` 启动。

#### 3. 启动前端

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

#### 4. 一键启动（推荐）

```bash
# 给脚本添加执行权限
chmod +x scripts/start-all.sh

# 启动前后端
./scripts/start-all.sh
```

## Docker 部署

### 使用 Docker Compose（推荐）

Docker Compose 会自动启动 Redis 和后端服务。

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止所有服务
docker-compose down

# 停止并删除所有服务
docker-compose down -v
```

### 单独部署后端

```bash
cd backend

# 构建镜像
docker build -t coalscan-backend .

# 运行容器
docker run -d \
  -p 3001:3001 \
  --env-file .env \
  --name coalscan-backend \
  coalscan-backend
```

## 云服务部署

### Vercel 部署（前端）

#### 1. 安装 Vercel CLI

```bash
npm i -g vercel
```

#### 2. 登录 Vercel

```bash
vercel login
```

#### 3. 部署前端

```bash
# 在项目根目录
vercel

# 按照提示操作
# - 选择项目范围
# - 设置环境变量
# - 确认部署
```

#### 4. 设置环境变量

在 Vercel 控制台中设置：

```
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

### Railway 部署（后端）

#### 1. 安装 Railway CLI

```bash
npm i -g @railway/cli
```

#### 2. 登录 Railway

```bash
railway login
```

#### 3. 创建新项目

```bash
railway init
```

#### 4. 添加 Redis

```bash
railway add redis
```

#### 5. 部署后端

```bash
railway up
```

#### 6. 设置环境变量

在 Railway 控制台中设置：

```env
PORT=3001
NODE_ENV=production
SOLANA_RPC_URL=https://your-rpc-url.com
REDIS_URL=your-redis-url
REDIS_CACHE_TTL=120
CORS_ORIGIN=https://your-frontend-url.com
API_RATE_LIMIT=100
API_RATE_LIMIT_WINDOW=60000
```

### Render 部署

#### 前端部署到 Vercel

参考上面的 Vercel 部署步骤。

#### 后端部署到 Render

1. 在 Render 上创建新项目
2. 连接 GitHub 仓库
3. 选择 `backend` 目录作为根目录
4. 设置环境变量
5. 部署

### Fly.io 部署

#### 1. 安装 Fly CLI

```bash
curl -L https://fly.io/install.sh | sh
```

#### 2. 登录 Fly

```bash
fly auth login
```

#### 3. 部署后端

```bash
cd backend
fly launch
```

#### 4. 添加 Redis

```bash
fly redis create
```

#### 5. 设置环境变量

```bash
fly secrets set SOLANA_RPC_URL
fly secrets set REDIS_URL
fly secrets set REDIS_CACHE_TTL
fly secrets set CORS_ORIGIN
```

## 生产环境配置

### Solana RPC 配置

**免费 RPC（有限制）**：

- Helius（免费层）：https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY
- QuickNode（免费层）：https://YOUR_ENDPOINT.quiknode.pro/YOUR_API_KEY
- Triton：https://rpc.triton.one/YOUR_API_KEY

**付费 RPC（推荐）**：

- Helius（付费层）：https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY
- QuickNode（付费层）：https://YOUR_ENDPOINT.quiknode.pro/YOUR_API_KEY
- Alchemy：https://solana-mainnet.g.alchemy.com/v2/YOUR_API_KEY

### Redis 配置

**生产环境推荐**：

- 使用 Redis Cloud（https://redis.com）
- 使用 AWS ElastiCache
- 使用 Google Cloud Memorystore

### 环境变量清单

#### 前端

```env
NEXT_PUBLIC_API_URL=https://your-backend-api.com
```

#### 后端

```env
PORT=3001
NODE_ENV=production
SOLANA_RPC_URL=https://your-rpc-url.com
REDIS_URL=redis://your-redis-url:6379
REDIS_PASSWORD=your-redis-password
REDIS_CACHE_TTL=120
CORS_ORIGIN=https://your-frontend-url.com
API_RATE_LIMIT=100
API_RATE_LIMIT_WINDOW=60000
```

## 监控和日志

### 后端监控

建议集成以下服务：

- **Sentry**：错误追踪和性能监控
- **LogRocket**：前端错误追踪
- **Vercel Analytics**：前端性能分析
- **Datadog**：全栈监控

### 日志管理

```bash
# 查看后端日志
docker-compose logs backend

# 查看前端日志
vercel logs

# 查看所有日志
docker-compose logs -f
```

## 性能优化

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
6. **SQL 注入防护**：使用参数化查询
7. **XSS 防护**：转义用户输入

### 前端安全

1. **验证 API 响应**：检查 success 字段
2. **不暴露敏感信息**：不在前端存储 API 密钥
3. **使用 CSP**：内容安全策略
4. **启用 HTTPS**：强制使用安全连接
5. **验证用户输入**：防止 XSS 攻击

## 故障排查

### 常见问题

#### 1. 后端无法启动

**问题**：`Error: Cannot connect to Redis`

**解决方案**：
- 检查 Redis 是否运行：`redis-cli ping`
- 检查 REDIS_URL 配置是否正确
- 检查防火墙是否阻止连接

#### 2. 前端无法连接后端

**问题**：`Failed to connect to server`

**解决方案**：
- 检查后端是否运行：访问 `http://localhost:3001/health`
- 检查 NEXT_PUBLIC_API_URL 配置是否正确
- 检查 CORS 配置是否允许前端域名
- 检查防火墙设置

#### 3. Solana RPC 请求失败

**问题**：`Failed to fetch token data`

**解决方案**：
- 检查 SOLANA_RPC_URL 配置是否正确
- 尝试使用不同的 RPC 节点
- 检查 RPC 服务是否正常运行
- 考虑使用付费 RPC 服务

#### 4. 缓存不生效

**问题**：数据没有缓存

**解决方案**：
- 检查 Redis 是否正常运行
- 检查 REDIS_CACHE_TTL 配置
- 检查 Redis 连接配置
- 查看 Redis 日志

## 备份和恢复

### 数据备份

```bash
# 备份 Redis 数据
redis-cli --rdb /path/to/backup/dump.rdb

# 恢复 Redis 数据
redis-cli --rdb /path/to/backup/dump.rdb
```

### 数据库迁移

如果需要迁移数据：

1. 导出现有数据
2. 导入到新系统
3. 验证数据完整性
4. 更新应用配置

## 扩展和自定义

### 添加新的评分指标

1. 在 [`backend/src/services/score-calculator.ts`](backend/src/services/score-calculator.ts) 中添加新指标
2. 更新权重计算逻辑
3. 添加相应的红旗标识
4. 测试新指标的影响

### 添加新的钱包标签

1. 在 [`backend/src/services/solana.ts`](backend/src/services/solana.ts) 中添加检测逻辑
2. 更新 [`WalletLabelType`](backend/src/types/index.ts) 枚举
3. 添加标签样式到前端

### 添加新的 Bundle 类型

1. 在 [`backend/src/services/bundle-detector.ts`](backend/src/services/bundle-detector.ts) 中添加检测逻辑
2. 更新 [`BundleType`](backend/src/types/index.ts) 枚举
3. 添加可视化到前端

## 支持

如有问题或建议，请：

1. 查看 [README.md](README.md) 文档
2. 查看 [backend/README.md](backend/README.md) 后端文档
3. 提交 [GitHub Issues](https://github.com/your-repo/issues)
4. 联系维护团队

## 许可证

MIT License
