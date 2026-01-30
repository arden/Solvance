# CoalScan 产品需求文档 (PRD)

---

## 文档信息

| 项目 | 内容 |
|------|------|
| 产品名称 | CoalScan |
| 文档版本 | v1.0 |
| 创建日期 | 2025-01-09 |
| 产品类型 | Solana MemeCoin 风险分析工具 |
| 目标平台 | Web 应用 |
| 文档状态 | 待评审 |

---

## 1. 产品概述

### 1.1 产品简介

CoalScan 是一个 Solana meme coin 持仓模式分析工具，旨在帮助用户在投资前识别代币的"dump risk"（抛售风险）。用户只需粘贴合约地址，即可获得一个 Coal Score（1-100分），分数越高表示该代币风险越大（越可能是"coal"——即垃圾代币）。

### 1.2 产品价值主张

- **快速风险识别**：通过算法分析持仓模式，快速识别高风险代币
- **数据透明化**：提供详细的持仓者数据、钱包关联和交易模式
- **节省成本**：帮助用户在购买前避免高风险投资
- **辅助决策**：提供结构化数据，结合用户自身判断做出决策

### 1.3 目标市场

- Solana meme coin 投资者
- 日内交易者
- 加密货币风险规避型投资者
- 区块链数据分析爱好者

### 1.4 核心问题

大多数 meme coin 都是"coal"（垃圾代币），只有少数具备成长为"diamond"（优质代币）的结构。用户在投资前缺乏有效的工具来快速区分这两者，容易在市场操纵中亏损。

### 1.5 解决方案

CoalScan 通过多维度分析持仓者模式、钱包关联、持仓时间、卖出行为等指标，计算出一个综合风险评分，帮助用户快速识别潜在问题。

---

## 2. 用户画像

### 2.1 画像一：Solana Meme Coin 投资者

- **姓名**：Alex
- **年龄**：28 岁
- **职业**：加密货币交易员
- **痛点**：
  - 经常买入后立即遭遇砸盘
  - 难以识别钱包关联和操纵行为
  - 缺乏时间深入分析每个代币
- **期望**：
  - 快速判断代币是否安全
  - 看到详细的数据支撑
  - 了解潜在风险点

### 2.2 画像二：谨慎型投资者

- **姓名**：Sarah
- **年龄**：35 岁
- **职业**：软件工程师
- **痛点**：
  - 对 meme coin 感兴趣但担心风险
  - 缺乏链上数据分析能力
  - 不了解如何识别操纵模式
- **期望**：
  - 获得简单易懂的风险评级
  - 看到详细的数据解释
  - 信任算法的客观性

### 2.3 画像三：数据分析师

- **姓名**：Mike
- **年龄**：42 岁
- **职业**：链上数据分析师
- **痛点**：
  - 需要获取原始数据进行自定义分析
  - 希望看到详细的持仓者和钱包关系
  - 需要验证算法的准确性
- **期望**：
  - 访问详细的原始数据
  - 理解评分算法逻辑
  - 能够发现算法未识别的模式

---

## 3. 用户故事

### 3.1 核心用户故事

| ID | 用户故事 | 优先级 | 验收标准 |
|----|----------|--------|----------|
| US-001 | 作为交易员，我希望能输入合约地址并立即看到风险评分，以便快速做出投资决策 | P0 | 输入地址后 5 秒内显示评分（缓存命中时） |
| US-002 | 作为投资者，我希望能看到详细的持仓者数据，以便了解代币分布情况 | P0 | 显示至少前 50 个持仓者的详细信息 |
| US-003 | 作为用户，我希望能看到钱包标签和关联关系，以便识别潜在操纵 | P0 | 标注 Fresh、Bot、Dormant 和 Named wallets |
| US-004 | 作为谨慎投资者，我希望能理解评分的组成部分，以便评估风险来源 | P1 | 显示各项指标的详细分解 |
| US-005 | 作为用户，我希望能获取最新数据，以便做出实时决策 | P1 | 提供"刷新"按钮绕过缓存 |
| US-006 | 作为数据分析师，我希望能导出持仓者数据，以便进行自定义分析 | P2 | 支持 CSV/JSON 格式导出 |
| US-007 | 作为用户，我希望能查看历史扫描记录，以便对比代币变化 | P2 | 保存最近 10 次扫描记录 |

---

## 4. 功能需求

### 4.1 核心功能（MVP）

#### 4.1.1 合约地址扫描

**功能描述**：用户输入 Solana 合约地址，系统分析并返回风险评估结果。

**用户流程**：
1. 用户在首页输入框粘贴合约地址
2. 点击"扫描"按钮
3. 系统验证地址格式（Solana 地址格式校验）
4. 系统检查缓存（2分钟有效期）
5. 若缓存命中，直接返回缓存数据
6. 若缓存失效，从链上获取数据并计算评分
7. 显示结果页面

**技术要求**：
- 支持标准 Solana 地址格式（Base58 编码，44 字符）
- 地址格式验证在前端和后端双重校验
- 缓存机制：Redis 或内存缓存，2分钟 TTL
- 扫描超时时间：30秒（前端）
- API 响应时间：< 5秒（缓存命中），< 30秒（首次扫描）

**界面元素**：
- 输入框：`<input type="text" placeholder="粘贴 Solana 合约地址...">`
- 扫描按钮：`<button>扫描</button>`
- 历史记录：最近 5 个扫描地址（点击可快速扫描）
- 加载状态：进度条或骨架屏

---

#### 4.1.2 Coal Score 展示

**功能描述**：显示综合风险评分（1-100）和风险等级。

**评分展示**：
- **评分展示**：大号数字 + 仪表盘样式
- **风险等级**：
  - EXTREME (91-100)：红色背景，警告图标
  - HIGH (61-90)：橙色背景，警示图标
  - MEDIUM (38-60)：黄色背景，注意图标
  - LOW (0-37)：绿色背景，安全图标

**界面布局**：
```
┌─────────────────────────────────────┐
│         Coal Score: 78              │
│         [███░░░░░░░] 78/100         │
│         风险等级: HIGH               │
│         ⚠️ 高风险 - 谨慎操作         │
└─────────────────────────────────────┘
```

**技术实现**：
- 评分计算逻辑在后端实现
- 前端仅展示结果
- 支持动画效果（数字滚动）

---

#### 4.1.3 详细指标分解

**功能描述**：展示评分的详细组成部分，帮助用户理解风险来源。

**展示内容**：

| 指标类别 | 权重 | 展示内容 |
|----------|------|----------|
| 持仓时间 | 35% | 平均持仓时间、持仓时间分布 |
| 集中度 | 20% | Top 30 持仓者占比、红旗标识 |
| 钱包关联 | 45% | Bundle 数量、关联钱包数 |
| 卖出行为 | 加分 | 重度卖出者数量、总卖出比例 |
| 代币年龄 | 加分 | 代币存在时间、年龄惩罚 |
| 市值检查 | 覆盖 | 市值、低市值警告 |

**界面设计**：
- 使用卡片式布局展示各指标
- 每个指标显示分数、权重和详细说明
- 红旗指标用红色高亮显示
- 支持展开/收起详细说明

---

#### 4.1.4 持仓者列表

**功能描述**：显示代币持仓者的详细信息和钱包标签。

**展示字段**：

| 字段 | 说明 | 示例 |
|------|------|------|
| 钱包地址 | 持仓者地址（可点击查看详情） | 8xK2...4a7P |
| 持仓占比 | 占总供应量的百分比 | 5.2% |
| 持仓价值 | 当前持仓价值（美元） | $1,250.00 |
| 持仓时间 | 从首次买入到现在的时间 | 2小时15分 |
| 卖出比例 | 已卖出持仓的百分比 | 65% |
| 钱包标签 | Fresh / Bot / Dormant / Named | 🔴 Bot |
| 关联钱包数 | 关联的钱包数量 | 3 |
| 盈亏状态 | 当前 P/L | +$450 (绿色) / -$200 (红色) |

**排序和筛选**：
- 默认按持仓占比降序排列
- 支持按以下字段排序：
  - 持仓占比
  - 持仓时间
  - 卖出比例
  - 关联钱包数
- 支持按钱包标签筛选：All / Fresh / Bot / Dormant / Named

**分页**：
- 每页显示 20 条
- 支持加载更多（无限滚动或分页按钮）

**技术要求**：
- 钱包地址截断显示（显示前 4 + ... + 后 4）
- 点击地址跳转到 Solscan 或 Solana Beach
- 钱包标签实时计算并标注

---

#### 4.1.5 钱包关联分析

**功能描述**：识别和展示钱包之间的关联关系，揭示潜在的操纵行为。

**关联类型**：

| 关联类型 | 检测逻辑 | 分数影响 |
|----------|----------|----------|
| 同区块买入 | 3+ 个钱包在同一区块买入 | +20 |
| 同一资金来源 | 3-5 个钱包由同一地址资助 | +15 / +25 |
| Bundle 检测 | 多个钱包表现出关联交易模式 | +15 ~ +25 |
| 控制供应量 | 同区块买入者控制 >10% 供应量 | +20 |

**展示方式**：
- 使用关系图可视化关联关系
- 节点：钱包地址（大小表示持仓占比）
- 边：关联关系（颜色表示关联类型）
- 支持交互：点击节点查看详情

**技术实现**：
- 使用 D3.js 或 React Flow 实现关系图
- 后端计算关联关系，前端渲染
- 支持缩放、拖拽和节点高亮

---

#### 4.1.6 钱包标签系统

**功能描述**：为钱包分配标签，帮助用户快速识别钱包特征。

**标签类型**：

| 标签 | 定义 | 判断逻辑 |
|------|------|----------|
| Fresh | 钱包交易次数 < 50 | 统计钱包历史交易数 |
| Bot | 60秒内交易 > 100次 | 检测高频交易模式 |
| Dormant | 7天以上无活动 | 检测最后交易时间 |
| Named | 已知 KOL/影响者钱包 | 匹配 KOL 数据库 |

**标签展示**：
- 在持仓者列表中以彩色标签形式展示
- Named wallet 额外显示金色高亮和 X 链接
- 悬停显示标签详细说明

**KOL 钱包数据库**：
- 维护已知 KOL/影响者钱包地址列表
- 支持手动添加/编辑
- 显示 KOL 名称和 X/Twitter 链接
- **注意**：KOL 标签仅提供信息，不影响评分

---

#### 4.1.7 刷新功能

**功能描述**：用户可以手动刷新数据，绕过缓存获取最新信息。

**用户流程**：
1. 用户在结果页面点击"刷新"按钮
2. 系统忽略缓存，强制从链上获取数据
3. 重新计算评分
4. 更新显示

**界面元素**：
- 刷新按钮：位于结果页面顶部
- 显示"上次更新：X 分钟前"
- 刷新时显示加载状态

**技术要求**：
- 刷新按钮绕过缓存
- 刷新后的数据重新缓存 2 分钟
- 刷新操作限流：同一用户每 30 秒最多 1 次刷新

---

### 4.2 扩展功能（Phase 2）

#### 4.2.1 数据导出

**功能描述**：允许用户导出持仓者数据用于自定义分析。

**导出格式**：
- CSV 格式（Excel 兼容）
- JSON 格式（开发者友好）

**导出内容**：
- 持仓者列表（所有字段）
- 评分详情
- 钱包关联关系
- 时间戳

**技术实现**：
- 后端生成文件
- 前端触发下载
- 导出限流：每分钟最多 1 次

---

#### 4.2.2 历史扫描记录

**功能描述**：保存用户的扫描历史，方便回顾和对比。

**展示内容**：
- 扫描时间
- 合约地址
- 评分和风险等级
- 快速重新扫描按钮

**存储方式**：
- 本地存储（LocalStorage）
- 保留最近 10 条记录
- 支持清空历史

---

#### 4.2.3 价格走势图表

**功能描述**：显示代币价格历史，辅助用户评估代币表现。

**展示内容**：
- 价格走势图（1小时、6小时、24小时）
- 成交量
- 市值变化

**技术实现**：
- 集成第三方价格数据源（如 DexScreener API）
- 使用 Chart.js 或 Recharts 渲染图表
- 支持交互式缩放和 hover 显示

---

#### 4.2.4 代币对比

**功能描述**：支持对比多个代币的评分和持仓模式。

**对比维度**：
- Coal Score
- 持仓集中度
- 持仓时间
- 钱包关联数
- 代币年龄

**界面设计**：
- 使用表格对比
- 高亮差异
- 支持添加/删除对比项

---

#### 4.2.5 风险预警通知

**功能描述**：当关注的代币出现高风险变化时通知用户。

**预警条件**：
- 评分上升 > 20 分
- 大量持仓者卖出
- 新增大量关联钱包

**通知方式**：
- 邮件通知（可选）
- 浏览器通知（可选）
- 仪表盘标记

---

### 4.3 高级功能（Phase 3+）

#### 4.3.1 自定义评分权重

**功能描述**：允许用户自定义评分算法的权重，符合个人风险偏好。

**可调权重**：
- 持仓时间权重（0-100%）
- 集中度权重（0-100%）
- 钱包关联权重（0-100%）
- 红旗敏感度（低/中/高）

**存储方式**：
- 用户账户系统
- 保存用户偏好设置

---

#### 4.3.2 API 服务

**功能描述**：提供 API 接口供第三方开发者集成。

**API 端点**：
- `POST /api/scan` - 扫描合约地址
- `GET /api/score/:address` - 获取评分
- `GET /api/holders/:address` - 获取持仓者列表
- `GET /api/bundles/:address` - 获取钱包关联

**认证方式**：
- API Key 认证
- 速率限制：100 请求/分钟

---

#### 4.3.3 多链支持

**功能描述**：扩展到其他区块链（Ethereum、BSC 等）。

**实现步骤**：
1. 设计多链数据架构
2. 集成各链 RPC 节点
3. 适配不同链的地址格式和交易结构
4. 更新评分算法

---

## 5. 非功能需求

### 5.1 性能要求

| 指标 | 要求 |
|------|------|
| 首次扫描响应时间 | < 30 秒 |
| 缓存命中响应时间 | < 5 秒 |
| 页面加载时间 | < 3 秒（首次访问） |
| 并发处理能力 | 支持 100 并发扫描请求 |
| API 响应时间 | < 2 秒（缓存命中） |

### 5.2 可用性要求

| 指标 | 要求 |
|------|------|
| 系统可用性 | 99.5% |
| 计划内维护窗口 | 每周日凌晨 2:00-4:00 UTC |
| 错误率 | < 0.1% |

### 5.3 安全要求

- **数据传输**：全站 HTTPS 加密
- **输入验证**：所有用户输入严格验证和过滤
- **速率限制**：防止 API 滥用（每 IP 每分钟最多 10 次扫描）
- **敏感信息**：不存储用户私钥或钱包连接信息
- **日志记录**：记录所有 API 调用和错误日志

### 5.4 兼容性要求

| 平台 | 最低版本 |
|------|----------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |
| 移动端浏览器 | iOS Safari 14+, Chrome Mobile 90+ |

### 5.5 扩展性要求

- 支持水平扩展（可通过增加实例提升并发能力）
- 数据库支持分片
- 缓存层支持集群
- API 支持版本控制

---

## 6. 数据模型

### 6.1 核心数据结构

#### 6.1.1 代币扫描结果（TokenScanResult）

```typescript
interface TokenScanResult {
  contractAddress: string;        // 合约地址
  scanTimestamp: number;          // 扫描时间戳
  coalScore: number;              // Coal Score (1-100)
  riskLevel: 'EXTREME' | 'HIGH' | 'MEDIUM' | 'LOW';
  marketCap: number;              // 市值（美元）
  tokenAge: number;               // 代币年龄（秒）
  
  // 评分详情
  scoreBreakdown: {
    holdTimeScore: number;        // 持仓时间分数
    concentrationScore: number;   // 集中度分数
    walletConnectionScore: number;// 钱包关联分数
    baseScore: number;            // 基础分数
    redFlagBonus: number;         // 红旗加分
    sellBonus: number;            // 卖出加分
    agePenalty: number;           // 年龄惩罚
    maturityBonus: number;        // 成熟度奖励
  };
  
  // 持仓者列表
  holders: Holder[];
  
  // 钱包关联
  bundles: Bundle[];
  
  // 缓存信息
  isCached: boolean;
  cacheExpiry: number;
}
```

#### 6.1.2 持仓者（Holder）

```typescript
interface Holder {
  walletAddress: string;          // 钱包地址
  balance: number;                // 持仓数量
  supplyPercentage: number;       // 供应量占比
  valueUsd: number;               // 持仓价值（美元）
  
  // 持仓信息
  firstHoldTime: number;          // 首次买入时间戳
  holdDuration: number;           // 持仓时长（秒）
  
  // 交易行为
  totalBought: number;            // 总买入量
  totalSold: number;              // 总卖出量
  soldPercentage: number;         // 卖出比例
  profitLoss: number;             // 盈亏（美元）
  profitLossPercentage: number;   // 盈亏百分比
  
  // 钱包标签
  labels: WalletLabel[];
  transactionCount: number;       // 钱包总交易数
  lastActivityTime: number;       // 最后活动时间
  
  // 关联信息
  connectedWallets: string[];     // 关联钱包地址列表
  bundleId: string | null;        // 关联的 Bundle ID
}
```

#### 6.1.3 钱包标签（WalletLabel）

```typescript
enum WalletLabelType {
  FRESH = 'FRESH',                // 新钱包（<50 tx）
  BOT = 'BOT',                    // 机器人钱包
  DORMANT = 'DORMANT',            // 休眠钱包
  NAMED = 'NAMED'                 // 已知名钱包
}

interface WalletLabel {
  type: WalletLabelType;
  confidence: number;             // 置信度（0-1）
  kolInfo?: {                     // KOL 信息（仅 Named 类型）
    name: string;
    twitterHandle: string;
    twitterUrl: string;
  };
}
```

#### 6.1.4 钱包关联（Bundle）

```typescript
enum BundleType {
  SAME_BLOCK_BUY = 'SAME_BLOCK_BUY',     // 同区块买入
  SAME_FUNDER = 'SAME_FUNDER',           // 同一资金来源
  COORDINATED_SELL = 'COORDINATED_SELL', // 协调卖出
}

interface Bundle {
  bundleId: string;               // Bundle ID
  type: BundleType;
  walletAddresses: string[];      // 关联钱包列表
  totalSupplyPercentage: number;  // 总供应量占比
  detectionScore: number;         // 检测分数影响
  
  // 检测详情
  blockHeight?: number;           // 区块高度（同区块买入）
  funderAddress?: string;         // 资金来源地址（同资金）
  detectionTime: number;          // 检测时间戳
}
```

#### 6.1.5 KOL 钱包数据库（KOLWallet）

```typescript
interface KOLWallet {
  walletAddress: string;          // 钱包地址
  name: string;                   // KOL 名称
  twitterHandle: string;          // X/Twitter 账号
  twitterUrl: string;             // X/Twitter 链接
  category: string;               // 分类（trader/influencer/project）
  verified: boolean;              // 是否已验证
  addedAt: number;                // 添加时间
}
```

### 6.2 缓存数据结构

```typescript
interface CacheEntry {
  contractAddress: string;        // 合约地址（key）
  scanResult: TokenScanResult;    // 扫描结果
  createdAt: number;              // 创建时间
  expiresAt: number;              // 过期时间
  accessCount: number;            // 访问次数
}
```

### 6.3 数据库表设计（SQL）

```sql
-- 扫描历史表
CREATE TABLE scan_history (
  id BIGSERIAL PRIMARY KEY,
  contract_address VARCHAR(44) NOT NULL,
  coal_score INTEGER NOT NULL,
  risk_level VARCHAR(10) NOT NULL,
  scan_timestamp BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_contract_address (contract_address),
  INDEX idx_scan_timestamp (scan_timestamp)
);

-- KOL 钱包表
CREATE TABLE kol_wallets (
  id BIGSERIAL PRIMARY KEY,
  wallet_address VARCHAR(44) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  twitter_handle VARCHAR(255),
  twitter_url TEXT,
  category VARCHAR(50),
  verified BOOLEAN DEFAULT FALSE,
  added_at TIMESTAMP DEFAULT NOW()
);

-- 用户扫描历史表（需用户系统）
CREATE TABLE user_scan_history (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  contract_address VARCHAR(44) NOT NULL,
  scan_result JSONB NOT NULL,
  scan_timestamp BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_id (user_id)
);
```

---

## 7. API 设计

### 7.1 API 端点

#### 7.1.1 扫描合约地址

```http
POST /api/v1/scan
Content-Type: application/json

{
  "contractAddress": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  "forceRefresh": false
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "contractAddress": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "scanTimestamp": 1704812345678,
    "coalScore": 78,
    "riskLevel": "HIGH",
    "marketCap": 250000,
    "tokenAge": 7200,
    "scoreBreakdown": {
      "holdTimeScore": 25,
      "concentrationScore": 30,
      "walletConnectionScore": 35,
      "baseScore": 33,
      "redFlagBonus": 25,
      "sellBonus": 15,
      "agePenalty": 0,
      "maturityBonus": 0
    },
    "holders": [
      {
        "walletAddress": "8xK2...4a7P",
        "balance": 1000000,
        "supplyPercentage": 5.2,
        "valueUsd": 1250.00,
        "firstHoldTime": 1704805145678,
        "holdDuration": 7200,
        "totalBought": 2500000,
        "totalSold": 1500000,
        "soldPercentage": 60.0,
        "profitLoss": 450.00,
        "profitLossPercentage": 56.25,
        "labels": [
          {
            "type": "FRESH",
            "confidence": 0.95
          }
        ],
        "transactionCount": 32,
        "lastActivityTime": 1704809145678,
        "connectedWallets": ["9yL3...5b8Q", "0zM4...7c9R"],
        "bundleId": "bundle-123"
      }
    ],
    "bundles": [
      {
        "bundleId": "bundle-123",
        "type": "SAME_BLOCK_BUY",
        "walletAddresses": ["8xK2...4a7P", "9yL3...5b8Q", "0zM4...7c9R"],
        "totalSupplyPercentage": 15.3,
        "detectionScore": 20,
        "blockHeight": 24567890,
        "detectionTime": 1704812345678
      }
    ],
    "isCached": false,
    "cacheExpiry": 1704812465678
  }
}
```

**错误响应**：
```json
{
  "success": false,
  "error": {
    "code": "INVALID_ADDRESS",
    "message": "无效的 Solana 合约地址"
  }
}
```

---

#### 7.1.2 获取评分（简化版）

```http
GET /api/v1/score/:contractAddress
```

**响应**：
```json
{
  "success": true,
  "data": {
    "contractAddress": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "coalScore": 78,
    "riskLevel": "HIGH",
    "scanTimestamp": 1704812345678
  }
}
```

---

#### 7.1.3 获取持仓者列表

```http
GET /api/v1/holders/:contractAddress?page=1&limit=20&sortBy=supplyPercentage&sortOrder=desc&labels=FRESH,BOT
```

**参数**：
- `page`: 页码（默认 1）
- `limit`: 每页数量（默认 20，最大 100）
- `sortBy`: 排序字段（supplyPercentage, holdDuration, soldPercentage, connectedWalletsCount）
- `sortOrder`: 排序顺序（asc, desc）
- `labels`: 标签过滤（逗号分隔）

**响应**：
```json
{
  "success": true,
  "data": {
    "holders": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

---

#### 7.1.4 获取钱包关联

```http
GET /api/v1/bundles/:contractAddress
```

**响应**：
```json
{
  "success": true,
  "data": {
    "bundles": [...]
  }
}
```

---

#### 7.1.5 导出数据

```http
GET /api/v1/export/:contractAddress?format=csv
```

**参数**：
- `format`: 导出格式（csv, json）

**响应**：
- CSV: `Content-Type: text/csv`
- JSON: `Content-Type: application/json`

---

### 7.2 错误码定义

| 错误码 | HTTP 状态 | 说明 |
|--------|-----------|------|
| INVALID_ADDRESS | 400 | 无效的合约地址格式 |
| TOKEN_NOT_FOUND | 404 | 代币不存在或未部署 |
| RATE_LIMIT_EXCEEDED | 429 | 超过速率限制 |
| SCAN_TIMEOUT | 504 | 扫描超时 |
| INTERNAL_ERROR | 500 | 服务器内部错误 |
| SERVICE_UNAVAILABLE | 503 | 服务暂时不可用 |

---

### 7.3 速率限制

| 端点 | 限制 | 窗口 |
|------|------|------|
| POST /api/v1/scan | 10 请求 | 1 分钟（每 IP） |
| GET /api/v1/score | 100 请求 | 1 分钟（每 IP） |
| GET /api/v1/holders | 100 请求 | 1 分钟（每 IP） |
| GET /api/v1/export | 1 请求 | 1 分钟（每 IP） |

---

## 8. UI/UX 设计

### 8.1 页面结构

#### 8.1.1 首页（扫描页）

**布局**：
```
┌─────────────────────────────────────────────┐
│  Header                                     │
│  [Logo] CoalScan  [Navigation]              │
├─────────────────────────────────────────────┤
│                                             │
│  Hero Section                               │
│  ┌───────────────────────────────────────┐ │
│  │   🎯 识别 Solana Meme Coin 风险       │ │
│  │                                       │ │
│  │   [输入合约地址________________]      │ │
│  │   [扫描]                              │ │
│  │                                       │ │
│  │   最近扫描:                           │ │
│  │   • 8xK2...4a7P (78分) 2分钟前       │ │
│  │   • 9yL3...5b8Q (45分) 5分钟前       │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  How It Works                               │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐    │
│  │ 1. 输入 │→ │ 2. 分析 │→ │ 3. 查看结果 │  │
│  └─────────┘  └─────────┘  └─────────┘    │
│                                             │
│  Footer                                     │
└─────────────────────────────────────────────┘
```

**组件**：
- Navbar（Logo + 导航）
- Hero Section（标题 + 输入框 + 按钮 + 历史记录）
- How It Works（步骤说明）
- Footer

---

#### 8.1.2 结果页面

**布局**：
```
┌─────────────────────────────────────────────┐
│  Header                                     │
│  [← 返回] CoalScan  [刷新]  [导出]         │
├─────────────────────────────────────────────┤
│  Score Card                                 │
│  ┌───────────────────────────────────────┐ │
│  │     Coal Score: 78                    │ │
│  │     [███░░░░░░░] 78/100               │ │
│  │     ⚠️ HIGH - 高风险                  │ │
│  │     合约: EPjFWdd5AufqSSqeM2qN1xzy... │ │
│  │     更新时间: 2分钟前                 │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  Score Breakdown (Tabs)                     │
│  ┌───────────────────────────────────────┐ │
│  │ [概述] [持仓者] [关联钱包] [详情]    │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  Tab Content                                │
│  ┌───────────────────────────────────────┐ │
│  │   • 持仓时间: ████████████░░░░ 35%    │ │
│  │   • 集中度:   ██████░░░░░░░░░░ 20%    │ │
│  │   • 钱包关联: ███████████████░░ 45%    │ │
│  │                                       │ │
│  │   🚩 红旗标识:                        │ │
│  │   • Top 10 持仓 >40% 供应量 (+10)     │ │
│  │   • 3个同区块买入 (+20)               │ │
│  │   • 2个重度卖出者 (+12)               │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  Holders Table                              │
│  ┌───────────────────────────────────────┐ │
│  │ 钱包地址  持仓  卖出  标签  关联  盈亏│ │
│  │ 8xK2...  5.2%  60%   Bot   3    +$450│ │
│  │ 9yL3...  3.8%  25%   Fresh  2    +$120│ │
│  │ ...                                    │ │
│  └───────────────────────────────────────┘ │
│                                             │
└─────────────────────────────────────────────┘
```

**组件**：
- Header（返回 + 刷新 + 导出）
- Score Card（评分展示）
- Tabs（概述/持仓者/关联钱包/详情）
- Score Breakdown（评分分解）
- Holders Table（持仓者列表）
- Bundle Graph（关联关系图）
- Footer

---

### 8.2 交互设计

#### 8.2.1 扫描流程

1. **输入阶段**：
   - 用户输入地址，实时验证格式（绿色✓ / 红色✗）
   - 显示最近扫描历史（点击可快速填充）

2. **扫描阶段**：
   - 显示加载动画
   - 显示进度提示：
     - "正在获取链上数据..."
     - "正在分析持仓者..."
     - "正在计算评分..."
   - 预计时间显示（基于历史数据）

3. **结果阶段**：
   - 评分数字滚动动画（0 → 目标分数）
   - 风险等级淡入效果
   - 数据卡片依次加载

#### 8.2.2 钱包关联图交互

- **悬停**：显示钱包详情（地址、持仓、标签）
- **点击**：高亮选中节点及其关联边
- **缩放**：鼠标滚轮缩放
- **拖拽**：拖动节点调整布局
- **筛选**：点击图例筛选特定类型的关系

#### 8.2.3 持仓者列表交互

- **排序**：点击表头排序（升序/降序切换）
- **筛选**：点击标签筛选对应类型钱包
- **详情**：点击地址展开详细信息
- **导出**：支持选中/全选导出

---

### 8.3 响应式设计

| 设备 | 布局调整 |
|------|----------|
| Desktop (>1024px) | 完整布局，三列内容 |
| Tablet (768-1024px) | 双列布局，精简图表 |
| Mobile (<768px) | 单列布局，折叠菜单 |

---

### 8.4 颜色方案

| 用途 | 颜色 | Hex |
|------|------|-----|
| 主要品牌色 | 深蓝 | #1E40AF |
| 极高风险 | 红色 | #DC2626 |
| 高风险 | 橙色 | #F97316 |
| 中风险 | 黄色 | #EAB308 |
| 低风险 | 绿色 | #16A34A |
| 文本主要 | 深灰 | #1F2937 |
| 文本次要 | 中灰 | #6B7280 |
| 背景 | 浅灰 | #F3F4F6 |
| 卡片背景 | 白色 | #FFFFFF |

---

### 8.5 图标系统

- 使用 Heroicons 或 Lucide Icons
- 统一风格：outline 或 filled
- 常用图标：
  - 🎯 扫描
  - ⚠️ 警告
  - ✅ 安全
  - ❌ 高风险
  - 🔄 刷新
  - 📊 图表
  - 🔗 关联
  - 👤 钱包

---

## 9. 技术架构

### 9.1 整体架构

```
┌─────────────────────────────────────────────────────┐
│                   Client Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │ Web Browser  │  │ Mobile App   │  │ 3rd Party  │ │
│  └──────────────┘  └──────────────┘  └────────────┘ │
└─────────────────────────────────────────────────────┘
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────┐
│                   API Gateway                        │
│  (Rate Limiting, Load Balancing, SSL Termination)    │
└─────────────────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Scan API   │  │  Score API  │  │  Data API   │
└─────────────┘  └─────────────┘  └─────────────┘
        │                │                │
        └────────────────┼────────────────┘
                         ▼
┌─────────────────────────────────────────────────────┐
│               Business Logic Layer                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │ Score Calc  │  │ Label Detect│  │ Bundle Find │ │
│  └─────────────┘  └─────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Redis     │  │ PostgreSQL  │  │   Solana    │
│   Cache     │  │   Database  │  │   RPC Node  │
└─────────────┘  └─────────────┘  └─────────────┘
```

---

### 9.2 技术栈选择

#### 9.2.1 前端技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 框架 | Next.js 16 (App Router) | React 框架，支持 SSR/SSG |
| UI 组件 | shadcn/ui | 现代化组件库 |
| 样式 | Tailwind CSS 4 | 原子化 CSS |
| 图表 | Recharts / D3.js | 数据可视化 |
| 状态管理 | React Context / Zustand | 轻量级状态管理 |
| HTTP 客户端 | fetch / axios | API 请求 |
| 表单处理 | React Hook Form | 表单验证 |

#### 9.2.2 后端技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 运行时 | Node.js 24 | JavaScript 运行环境 |
| 框架 | Next.js API Routes / Express | API 开发框架 |
| 缓存 | Redis | 结果缓存（2分钟 TTL） |
| 数据库 | PostgreSQL | 持久化存储 |
| ORM | Prisma | 数据库 ORM |
| Solana SDK | @solana/web3.js | Solana 链上交互 |
| 消息队列 | RabbitMQ / Bull | 异步任务处理 |

#### 9.2.3 基础设施

| 组件 | 技术 | 说明 |
|------|------|------|
| 容器化 | Docker | 应用容器化 |
| 部署 | Vercel / AWS | 云服务部署 |
| 监控 | Datadog / Sentry | 性能监控和错误追踪 |
| 日志 | ELK Stack | 日志收集和分析 |
| CDN | Cloudflare | 静态资源加速 |

---

### 9.3 核心算法实现

#### 9.3.1 评分计算流程

```typescript
class CoalScoreCalculator {
  // 计算基础分数
  calculateBaseScore(holders: Holder[]): number {
    const holdTimeScore = this.calculateHoldTimeScore(holders) * 0.35;
    const concentrationScore = this.calculateConcentrationScore(holders) * 0.20;
    const connectionScore = this.calculateConnectionScore(holders) * 0.45;
    
    return holdTimeScore + concentrationScore + connectionScore;
  }
  
  // 计算持仓时间分数（加权）
  private calculateHoldTimeScore(holders: Holder[]): number {
    let totalWeightedScore = 0;
    let totalWeight = 0;
    
    holders.forEach((holder, index) => {
      const weight = this.getPositionWeight(index); // Top 10: 3x, Mid 10: 2x, Bottom: 1x
      const score = this.getHoldTimeScore(holder.holdDuration);
      totalWeightedScore += score * weight;
      totalWeight += weight;
    });
    
    return totalWeightedScore / totalWeight;
  }
  
  // 计算集中度分数
  private calculateConcentrationScore(holders: Holder[]): number {
    const top30Supply = holders.slice(0, 30).reduce((sum, h) => sum + h.supplyPercentage, 0);
    return Math.min(top30Supply * 2, 100); // 50% 供应量 = 100 分
  }
  
  // 计算钱包关联分数
  private calculateConnectionScore(holders: Holder[], bundles: Bundle[]): number {
    let score = 0;
    
    // 同区块买入
    const sameBlockBundles = bundles.filter(b => b.type === 'SAME_BLOCK_BUY');
    score += sameBlockBundles.length * 20;
    
    // 同一资金来源
    const sameFunderBundles = bundles.filter(b => b.type === 'SAME_FUNDER');
    sameFunderBundles.forEach(bundle => {
      score += bundle.walletAddresses.length >= 5 ? 25 : 15;
    });
    
    return Math.min(score, 100);
  }
  
  // 计算红旗加分
  calculateRedFlagBonus(holders: Holder[]): number {
    let bonus = 0;
    
    // Top 10 持仓 > 40%
    const top10Supply = holders.slice(0, 10).reduce((sum, h) => sum + h.supplyPercentage, 0);
    if (top10Supply > 40) {
      bonus += Math.min(15, (top10Supply - 40) / 2);
    }
    
    // 2+ 大持仓者（>5%）且持仓 < 2天
    const largeHolders = holders.filter(h => h.supplyPercentage > 5 && h.holdDuration < 172800);
    if (largeHolders.length >= 2) {
      bonus += Math.min(12, largeHolders.length * 6);
    }
    
    return Math.min(bonus, 25);
  }
  
  // 计算卖出行为加分
  calculateSellBonus(holders: Holder[]): number {
    let bonus = 0;
    
    // 重度卖出者（50%+）
    const heavySellers = holders.filter(h => h.soldPercentage >= 50);
    heavySellers.forEach(holder => {
      const weight = this.getPositionWeight(holders.indexOf(holder));
      bonus += 6 * weight;
    });
    
    // 中度卖出者（25-50%）
    const moderateSellers = holders.filter(h => h.soldPercentage >= 25 && h.soldPercentage < 50);
    moderateSellers.forEach(holder => {
      const weight = this.getPositionWeight(holders.indexOf(holder));
      bonus += 4 * weight;
    });
    
    return Math.min(bonus, 25);
  }
  
  // 计算年龄惩罚
  calculateAgePenalty(tokenAge: number): number {
    if (tokenAge < 3600) return 25;      // < 1小时
    if (tokenAge < 7200) return 20;      // 1-2小时
    if (tokenAge < 14400) return 12;     // 2-4小时
    if (tokenAge < 28800) return 6;      // 4-8小时
    return 0;                             // > 8小时
  }
  
  // 计算成熟度奖励
  calculateMaturityBonus(tokenAge: number, marketCap: number): number {
    if (tokenAge > 2592000) { // > 30天
      if (marketCap > 1000000) return -15;
      if (marketCap > 500000) return -10;
      return -5;
    }
    return 0;
  }
  
  // 获取位置权重
  private getPositionWeight(index: number): number {
    if (index < 10) return 3;   // Top 10
    if (index < 20) return 2;   // Mid 10
    return 1;                   // Bottom
  }
  
  // 计算持仓时间分数（0-100）
  private getHoldTimeScore(duration: number): number {
    if (duration < 3600) return 100;       // < 1小时
    if (duration < 86400) return 80;       // < 1天
    if (duration < 604800) return 50;      // < 1周
    if (duration < 2592000) return 30;     // < 30天
    return 10;                             // > 30天
  }
}
```

---

#### 9.3.2 钱包标签检测

```typescript
class WalletLabelDetector {
  async detectLabels(walletAddress: string): Promise<WalletLabel[]> {
    const labels: WalletLabel[] = [];
    const walletData = await this.fetchWalletData(walletAddress);
    
    // 检测 Fresh 钱包
    if (walletData.transactionCount < 50) {
      labels.push({
        type: WalletLabelType.FRESH,
        confidence: 1 - (walletData.transactionCount / 50)
      });
    }
    
    // 检测 Bot 钱包
    if (this.isBot(walletData)) {
      labels.push({
        type: WalletLabelType.BOT,
        confidence: 0.9
      });
    }
    
    // 检测 Dormant 钱包
    if (this.isDormant(walletData)) {
      labels.push({
        type: WalletLabelType.DORMANT,
        confidence: 0.8
      });
    }
    
    // 检测 Named 钱包（KOL）
    const kolInfo = await this.checkKOLWallet(walletAddress);
    if (kolInfo) {
      labels.push({
        type: WalletLabelType.NAMED,
        confidence: 1.0,
        kolInfo: kolInfo
      });
    }
    
    return labels;
  }
  
  private isBot(walletData: any): boolean {
    // 检测 60 秒内超过 100 笔交易
    const transactions = walletData.transactions;
    const oneMinute = 60000;
    
    for (let i = 0; i < transactions.length - 100; i++) {
      const timeDiff = transactions[i + 100].timestamp - transactions[i].timestamp;
      if (timeDiff <= oneMinute) {
        return true;
      }
    }
    
    return false;
  }
  
  private isDormant(walletData: any): boolean {
    const oneWeek = 604800000; // 7天（毫秒）
    const now = Date.now();
    const lastActivity = walletData.transactions[0]?.timestamp || 0;
    
    return (now - lastActivity) > oneWeek;
  }
  
  private async checkKOLWallet(walletAddress: string): Promise<KOLWallet | null> {
    // 从数据库查询 KOL 钱包
    return await prisma.kOLWallet.findUnique({
      where: { walletAddress }
    });
  }
}
```

---

#### 9.3.3 Bundle 检测

```typescript
class BundleDetector {
  async detectBundles(holders: Holder[], tokenAddress: string): Promise<Bundle[]> {
    const bundles: Bundle[] = [];
    
    // 检测同区块买入
    const sameBlockBundles = await this.detectSameBlockBuys(holders, tokenAddress);
    bundles.push(...sameBlockBundles);
    
    // 检测同一资金来源
    const sameFunderBundles = await this.detectSameFunders(holders);
    bundles.push(...sameFunderBundles);
    
    // 检测协调卖出
    const coordinatedSells = await this.detectCoordinatedSells(holders, tokenAddress);
    bundles.push(...coordinatedSells);
    
    return bundles;
  }
  
  private async detectSameBlockBuys(holders: Holder[], tokenAddress: string): Promise<Bundle[]> {
    // 按区块分组买入交易
    const blockGroups = new Map<number, string[]>();
    
    for (const holder of holders) {
      const buyTransactions = await this.fetchBuyTransactions(holder.walletAddress, tokenAddress);
      buyTransactions.forEach(tx => {
        if (!blockGroups.has(tx.blockHeight)) {
          blockGroups.set(tx.blockHeight, []);
        }
        blockGroups.get(tx.blockHeight)!.push(holder.walletAddress);
      });
    }
    
    // 识别 3+ 个钱包在同一区块买入
    const bundles: Bundle[] = [];
    blockGroups.forEach((wallets, blockHeight) => {
      if (wallets.length >= 3) {
        const totalSupply = holders
          .filter(h => wallets.includes(h.walletAddress))
          .reduce((sum, h) => sum + h.supplyPercentage, 0);
        
        bundles.push({
          bundleId: `block-${blockHeight}`,
          type: BundleType.SAME_BLOCK_BUY,
          walletAddresses: wallets,
          totalSupplyPercentage: totalSupply,
          detectionScore: totalSupply > 10 ? 20 : 15,
          blockHeight: blockHeight,
          detectionTime: Date.now()
        });
      }
    });
    
    return bundles;
  }
  
  private async detectSameFunders(holders: Holder[]): Promise<Bundle[]> {
    // 获取每个钱包的资金来源
    const funderMap = new Map<string, string[]>();
    
    for (const holder of holders) {
      const funder = await this.fetchFunder(holder.walletAddress);
      if (funder) {
        if (!funderMap.has(funder)) {
          funderMap.set(funder, []);
        }
        funderMap.get(funder)!.push(holder.walletAddress);
      }
    }
    
    // 识别 3+ 个钱包由同一地址资助
    const bundles: Bundle[] = [];
    funderMap.forEach((wallets, funderAddress) => {
      if (wallets.length >= 3) {
        const totalSupply = holders
          .filter(h => wallets.includes(h.walletAddress))
          .reduce((sum, h) => sum + h.supplyPercentage, 0);
        
        bundles.push({
          bundleId: `funder-${funderAddress}`,
          type: BundleType.SAME_FUNDER,
          walletAddresses: wallets,
          totalSupplyPercentage: totalSupply,
          detectionScore: wallets.length >= 5 ? 25 : 15,
          funderAddress: funderAddress,
          detectionTime: Date.now()
        });
      }
    });
    
    return bundles;
  }
  
  private async detectCoordinatedSells(holders: Holder[], tokenAddress: string): Promise<Bundle[]> {
    // 检测在短时间内多个钱包大量卖出
    const timeWindow = 60000; // 1分钟
    const sellThreshold = 0.5; // 50% 卖出
    
    const bundles: Bundle[] = [];
    // ... 实现逻辑
    
    return bundles;
  }
}
```

---

### 9.4 数据流设计

#### 9.4.1 扫描流程

```
用户请求
  ↓
API Gateway
  ↓
检查缓存 (Redis)
  ├─ 缓存命中 → 返回缓存数据
  └─ 缓存失效
    ↓
从 Solana RPC 获取数据
  ├─ 获取代币信息
  ├─ 获取持仓者列表
  ├─ 获取交易历史
  └─ 获取钱包信息
    ↓
数据处理
  ├─ 计算持仓时间
  ├─ 计算卖出比例
  ├─ 计算盈亏
  └─ 计算市值
    ↓
标签检测
  ├─ Fresh 钱包检测
  ├─ Bot 钱包检测
  ├─ Dormant 钱包检测
  └─ KOL 钱包匹配
    ↓
Bundle 检测
  ├─ 同区块买入检测
  ├─ 同一资金来源检测
  └─ 协调卖出检测
    ↓
评分计算
  ├─ 计算基础分数
  ├─ 计算红旗加分
  ├─ 计算卖出加分
  ├─ 计算年龄惩罚
  └─ 计算成熟度奖励
    ↓
存入缓存 (Redis, 2分钟 TTL)
  ↓
返回结果
```

---

### 9.5 性能优化策略

| 策略 | 说明 |
|------|------|
| 缓存 | Redis 缓存扫描结果，2分钟 TTL |
| 并行处理 | 并行获取持仓者数据和交易历史 |
| 分页 | 持仓者列表分页返回，每页 20 条 |
| 增量更新 | 只更新变化的数据，减少链上查询 |
| CDN | 静态资源 CDN 加速 |
| 代码分割 | Next.js 动态导入，减少初始加载 |
| 图片优化 | 使用 Next.js Image 组件优化图片 |

---

## 10. 测试策略

### 10.1 测试类型

#### 10.1.1 单元测试

**目标覆盖率**：80%+

**测试范围**：
- 评分计算算法
- 钱包标签检测
- Bundle 检测逻辑
- 工具函数

**工具**：Jest

---

#### 10.1.2 集成测试

**测试范围**：
- API 端点
- 数据库操作
- 缓存机制
- Solana RPC 集成

**工具**：Supertest

---

#### 10.1.3 端到端测试

**测试场景**：
- 用户扫描合约地址
- 用户查看评分详情
- 用户筛选持仓者
- 用户刷新数据
- 用户导出数据

**工具**：Playwright

---

#### 10.1.4 性能测试

**测试指标**：
- API 响应时间
- 并发处理能力
- 缓存命中率
- 数据库查询性能

**工具**：k6, Artillery

---

#### 10.1.5 安全测试

**测试范围**：
- 输入验证
- SQL 注入
- XSS 攻击
- CSRF 攻击
- 速率限制

**工具**：OWASP ZAP

---

### 10.2 测试用例示例

#### 10.2.1 评分计算测试

```typescript
describe('CoalScoreCalculator', () => {
  it('should calculate correct score for high-risk token', () => {
    const holders = createTestHolders({
      concentration: 0.45, // Top 30 持仓 45%
      holdTime: 3600,      // 1小时
      sellers: 0.3,        // 30% 卖出
      bundles: 2           // 2 个 Bundle
    });
    
    const score = calculator.calculate(holders);
    
    expect(score.coalScore).toBeGreaterThan(60);
    expect(score.riskLevel).toBe('HIGH');
  });
  
  it('should apply age penalty for new token', () => {
    const score = calculator.calculate({
      tokenAge: 1800, // 30分钟
      holders: [...]
    });
    
    expect(score.scoreBreakdown.agePenalty).toBe(25);
  });
  
  it('should set score to 90 for low market cap', () => {
    const score = calculator.calculate({
      marketCap: 10000, // $10k
      holders: [...]
    });
    
    expect(score.coalScore).toBe(90);
  });
});
```

---

#### 10.2.2 钱包标签检测测试

```typescript
describe('WalletLabelDetector', () => {
  it('should detect fresh wallet', async () => {
    const labels = await detector.detectLabels({
      transactionCount: 32
    });
    
    expect(labels).toContainEqual({
      type: WalletLabelType.FRESH,
      confidence: expect.any(Number)
    });
  });
  
  it('should detect bot wallet', async () => {
    const botWalletData = createBotWalletData();
    const labels = await detector.detectLabels(botWalletData);
    
    expect(labels).toContainEqual({
      type: WalletLabelType.BOT,
      confidence: 0.9
    });
  });
  
  it('should detect dormant wallet', async () => {
    const dormantWalletData = createDormantWalletData();
    const labels = await detector.detectLabels(dormantWalletData);
    
    expect(labels).toContainEqual({
      type: WalletLabelType.DORMANT,
      confidence: 0.8
    });
  });
});
```

---

## 11. 发布计划

### 11.1 版本规划

| 版本 | 阶段 | 功能 | 目标日期 |
|------|------|------|----------|
| v0.1.0 | Alpha | 内部测试 | Week 1-2 |
| v0.5.0 | Beta | 有限公测 | Week 3-4 |
| v1.0.0 | MVP | 核心功能发布 | Week 5-6 |
| v1.1.0 | Post-MVP | 数据导出、历史记录 | Week 7-8 |
| v1.2.0 | Post-MVP | 价格图表、代币对比 | Week 9-10 |
| v2.0.0 | Major | 自定义评分、API 服务 | Week 11-14 |

---

### 11.2 发布检查清单

- [ ] 所有核心功能通过测试
- [ ] 性能测试通过
- [ ] 安全测试通过
- [ ] 文档完整
- [ ] 监控和日志配置完成
- [ ] 备份和恢复流程测试
- [ ] 用户反馈渠道建立
- [ ] 部署流程验证

---

## 12. 风险与假设

### 12.1 风险

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| Solana RPC 不稳定 | 高 | 中 | 使用多个 RPC 节点，实现故障转移 |
| API 成本过高 | 高 | 高 | 实施缓存策略，优化查询次数 |
| 评分算法不准确 | 中 | 高 | 收集用户反馈，持续优化算法 |
| 数据质量问题 | 中 | 中 | 数据验证和清洗机制 |
| 安全漏洞 | 高 | 低 | 定期安全审计，渗透测试 |
| 市场接受度低 | 高 | 中 | 用户调研，快速迭代 |

---

### 12.2 假设

- Solana 网络稳定，可提供可靠的链上数据
- 用户愿意等待 30 秒获取扫描结果
- 算法能够有效识别大部分风险代币
- 用户具备基本的加密货币知识
- 市场对风险分析工具有需求
- KOL 钱包数据库可以持续维护和更新

---

## 13. 成功指标

### 13.1 产品指标

| 指标 | 目标值 | 衡量周期 |
|------|--------|----------|
| 日活跃用户 (DAU) | 1,000+ | 3个月 |
| 扫描次数 | 5,000+/天 | 3个月 |
| 用户留存率 (7天) | 30%+ | 3个月 |
| 用户满意度 (NPS) | 40+ | 6个月 |
| API 响应时间 (P95) | < 5秒 | 持续 |
| 系统可用性 | 99.5%+ | 持续 |

---

### 13.2 业务指标

| 指标 | 目标值 | 衡量周期 |
|------|--------|----------|
| 月活跃用户 (MAU) | 10,000+ | 6个月 |
| 付费用户数 | 500+ | 6个月 |
| 营收 | $5,000/月 | 6个月 |
| 用户增长率 | 20%/月 | 前6个月 |

---

## 14. 附录

### 14.1 术语表

| 术语 | 定义 |
|------|------|
| Coal Score | CoalScan 计算的风险评分（1-100） |
| Coal | 高风险垃圾代币 |
| Diamond | 低风险优质代币 |
| Dump Risk | 抛售风险 |
| Bundle | 关联钱包组 |
| Holder | 持仓者 |
| Fresh Wallet | 新创建的钱包（<50 交易） |
| Bot Wallet | 机器人钱包 |
| Dormant Wallet | 休眠钱包 |
| Named Wallet | 已知 KOL/影响者钱包 |
| Meme Coin | 迷因代币 |
| RPC | Remote Procedure Call（区块链节点接口） |

---

### 14.2 参考资料

- Solana 文档: https://docs.solana.com/
- Solana Web3.js: https://solana-labs.github.io/solana-web3.js/
- DexScreener API: https://docs.dexscreener.com/
- Redis 文档: https://redis.io/docs/
- PostgreSQL 文档: https://www.postgresql.org/docs/

---

### 14.3 变更历史

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|----------|------|
| v1.0 | 2025-01-09 | 初始版本 | AI |

---

**文档结束**
