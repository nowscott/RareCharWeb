# 复制符 - 特殊符号查询工具

## 💡 项目灵感

在日常的文字编辑和设计工作中，我们经常需要使用各种特殊符号和字符，比如数学符号（∑、∞、≈）、货币符号（€、¥、₿）、箭头符号（→、⇒、↗）等。然而，这些字符很难通过普通键盘直接输入，每次都需要通过浏览器搜索或者复制粘贴，效率极其低下。

为了解决这个痛点，我开发了「复制符」这个工具。它不仅提供了丰富的特殊符号库，还具备智能搜索和分类浏览功能，让查找和复制特殊符号变得简单高效。

目前项目已经收录了大量常用符号，未来我计划深入研究每个符号的历史背景、使用场景和文化含义，逐步完善详情页的说明，将「复制符」打造成一个符号百科全书，让每个符号都有自己的故事。

## 📖 项目简介

一个现代化的特殊符号查询和复制工具，帮助用户快速查找、浏览和复制各种特殊字符和符号。

## ✨ 功能特性

- 🔍 **智能搜索** - 支持符号名称和描述的模糊搜索
- 📂 **分类浏览** - 按符号类型分类展示，便于查找
- 😊 **Emoji页面** - 专门的表情符号浏览和复制页面
- 📋 **一键复制** - 点击符号卡片或复制按钮快速复制到剪贴板
- 🎨 **现代UI** - 响应式设计，支持深色/浅色主题
- 💫 **毛玻璃效果** - 精美的视觉效果和交互体验
- 📱 **移动友好** - 完美适配各种屏幕尺寸
- ⚡ **快速加载** - 基于Next.js的高性能应用

## 🎯 使用方法

1. **浏览符号**: 在主页面浏览各种特殊符号
2. **分类筛选**: 点击顶部分类标签筛选特定类型的符号
3. **搜索符号**: 使用搜索框输入关键词查找符号
4. **复制符号**: 
   - 点击符号卡片查看详情并复制
   - 悬停卡片时点击右上角复制图标快速复制
5. **查看详情**: 点击符号卡片查看详细信息，包括Unicode编码

## 🎨 主要功能

### 符号分类

- 数学符号
- 货币符号
- 箭头符号
- 标点符号
- 几何图形
- 表情符号
- 其他特殊符号

### 搜索功能

- 支持符号名称搜索
- 支持符号描述搜索
- 实时搜索结果更新
- 搜索结果按Unicode顺序排列

### 复制功能

- 一键复制到剪贴板
- 复制成功视觉反馈
- 支持快捷复制按钮

## 🌙 主题支持

应用支持自动检测系统主题，提供深色和浅色两种模式，确保在不同环境下都有良好的视觉体验。

## 📱 响应式设计

- 桌面端：多列网格布局
- 平板端：自适应列数
- 移动端：单列布局，优化触摸体验

## 🛠️ 技术栈

- **框架**: Next.js 16.1.6 (Webpack)
- **语言**: TypeScript 5.9
- **样式**: Tailwind CSS 4.2
- **UI库**: React 19.2
- **构建工具**: Next.js 生产优化构建
- **代码规范**: ESLint 9.39

## 📦 架构优化 (v1.7.0+)

为了提供极致的加载体验和稳定性，项目近期进行了重大架构升级：

- ⚡ **全站增量静态再生 (ISR)**：所有核心页面（首页、Emoji、关于）均采用 ISR 模式，首页与 Emoji 首屏直接输出 60 张真实卡片，并在服务器端定期自动更新。
- 🎲 **定时随机排列**：首页和 Emoji 页面在服务器端每小时 (`revalidate = 3600`) 自动触发一次随机打乱，用户在享受极致加载速度的同时，每次访问都能获得新鲜感。
- 🛡️ **完美解决水合闪烁**：由于随机化发生在静态页面生成阶段，HTML 与客户端数据始终 100% 匹配，彻底根治了 Hydration 闪烁和报错。
- 🚀 **极简加载逻辑**：首屏无需挂载后再次请求 API，也不依赖骨架屏；后续内容通过 60 条一页的接口按需加载。
- 🎨 **字体加载优化**：针对特殊符号和“得意黑”字体进行了预解析和异步加载优化，提升了首屏视觉稳定性。

## 🔧 后续优化方向

以下为已识别但尚未实施的优化点：

### 数据传输

- **静态资源压缩**：`public/data/` 下的 JSON 文件可启用预压缩（gzip/brotli）减少传输体积。
- **详情按需加载**：目前首批卡片仍携带详情说明，后续可将详情内容拆分为点击后加载，进一步缩小静态页面体积。

### 渲染性能

- **虚拟滚动**：IntersectionObserver 无限滚动已实现基础分批次渲染，可进一步引入虚拟滚动（如 `react-window`）以避免 DOM 节点过多时的卡顿。
- **预取优化**：首页 ↔ Emoji 页面切换时可预加载对方数据，消除导航等待。

### 搜索能力

- **搜索索引**：当前搜索已由 API 在服务端完成，数据量继续增长后可引入专用索引优化复杂模糊匹配和排序。
- **搜索高亮**：搜索结果中高亮显示匹配的关键词。

### 缓存策略

- **Service Worker**：当前 SW 仅缓存字体文件，可扩展至缓存静态页面和数据，实现弱网/离线可用。

## 🔮 功能规划

以下为计划中的功能方向：

### 符号百科

- **详细背景**：为每个符号添加 Unicode 历史、使用场景、文化含义等深度内容，打造符号百科全书。
- **相关符号推荐**：在符号详情中展示形似、义近的符号。

### 用户体验

- **收藏夹**：支持收藏常用符号，本地持久化保存。
- **最近使用**：自动记录近期复制过的符号，便于快速找回。
- **深色模式手动切换**：除跟随系统外，支持手动切换深色/浅色模式。

### 符号数据

- **扩充符号库**：持续收录更多特殊符号、古文字、表意文字等。
- **Emoji 版本标注**：标注每个 Emoji 首次引入的 Unicode 版本。

## 🧩 数据补齐脚本

项目提供了增量数据脚本，用于按 README 中的公开来源补齐本地 JSON 数据：

- Emoji 来源：Emojipedia 中文分类页，增量写入 `public/data/pending/emojis.json`
- 符号来源：SYMBL Unicode block 页面，增量写入 `public/data/pending/symbols.json`

脚本默认只追加缺失条目到待处理数据，不覆盖现有线上展示内容。线上页面只读取 `public/data/symbols/items.json` 和 `public/data/emojis/items.json`，`pending/` 中的条目不会参与展示、搜索和统计。

```bash
# 先预览本次会新增多少，不写文件
npm run data:update:dry

# 默认每个数据源最多新增 500 条
npm run data:update

# 只补 Emoji，且不限制新增数量
npm run data:update -- --source=emoji --max-new=all

# 只补符号；SYMBL 容易限流，可把请求间隔调大后分批运行
npm run data:update -- --source=symbols --max-new=500 --delay-ms=3000

# 生成分片产物；只处理已整理数据，爬取占位数据进入 pending
npm run data:build
```

可用参数：

- `--source=all|emoji|symbols`：选择来源，默认 `all`
- `--max-new=N|all`：限制每次最多追加多少条，默认 `500`
- `--delay-ms=N`：来源页面之间的请求间隔，默认 `1200`
- `--dry-run`：只统计，不写入数据文件

`npm run data:build` 会读取当前线上条目 `public/data/symbols/items.json` 与 `public/data/emojis/items.json`，重建 `manifest.json`、分类分片和 `random-pool.json`。分类分片与 `random-pool.json` 只保存 ID 列表，避免正式展示数据重复存储；爬取得到、仍需分类归并和文案整理的条目保留在 `public/data/pending/`。

## 🧹 后续数据整理工作流

爬取脚本只负责把缺失条目先补进待处理数据，新增数据仍需要后续工作流继续整理。建议按以下顺序处理，避免一次性大改导致难以审查：

1. **分批抓取**
   - 先运行 `npm run data:update:dry` 预估新增数量。
   - SYMBL 容易限流，符号数据建议用 `--source=symbols --max-new=300 --delay-ms=3000` 分批补齐。
   - 每批完成后单独提交或至少记录本批新增范围，方便回滚和审查。

2. **分类归并**
   - 优先复用现有分类：`数学`、`货币`、`箭头`、`标点`、`形状`、`字母`、`数字`、`天气`、`音乐`、`天文`、`其他` 等。
   - 新增分类前先检查是否能并入现有分类，避免导航栏膨胀。
   - Emoji 的大类可以保留为 `笑脸`、`人物`、`动物`、`食物`、`活动`、`地理`、`物品`、`符号`、`旗帜`。

3. **名称本地化**
   - SYMBL 抓到的符号名称多为英文，应逐批翻译成简洁中文名。
   - 不确定的专业术语保留英文到 `searchTerms`，中文名使用常见叫法。
   - 不要覆盖已有人工整理条目的中文名称，除非确认原名称错误。

4. **搜索词补强**
   - 每个条目的 `searchTerms` 应包含常见中文别名、英文名、Unicode 编码或 Emoji 语义词。
   - 拼音字段由服务端运行时预计算，不需要写入 JSON。
   - 同义词保持短词条，避免把长段说明塞进 `searchTerms`。

5. **说明文本整理**
   - `notes` / `text` 应写成本站自己的简短说明，说明常见用途、语境或 Unicode 编码。
   - 来源站点可作为事实核对和入口索引，但不要批量复制长篇原文描述。
   - 对用途不明确的字符，先保留简短来源说明，后续再人工扩写。

6. **低质量条目清理**
   - 删除不可见控制字符、私用区占位符、无法复制使用的展示占位符。
   - 合并重复符号或同一 emoji 的重复变体；需要保留文本/emoji 展示差异时再拆分。
   - 对字体支持差的新增区块，优先抽样检查卡片显示效果。

7. **版本与验证**
   - 爬取新增只改变 `pending/`，不改变线上展示数量；整理完成后把条目从 `pending/` 挪到对应 `items.json`，再运行 `npm run data:build`。
   - 每批整理后至少运行：

```bash
npm run lint
npm run build
```

   - 额外建议检查主键重复和占位符：

```bash
node - <<'NODE'
const symbols = require('./public/data/symbols/items.json').items;
const emojis = require('./public/data/emojis/items.json').items;
const pendingSymbols = require('./public/data/pending/symbols.json').items;
const pendingEmojis = require('./public/data/pending/emojis.json').items;
const dupes = (items, key) => {
  const seen = new Set();
  return items.filter((item) => {
    const value = item[key];
    if (seen.has(value)) return true;
    seen.add(value);
    return false;
  });
};
const hasPrivateUse = (value) => [...value].some((char) => {
  const cp = char.codePointAt(0);
  return (cp >= 0xe000 && cp <= 0xf8ff) ||
    (cp >= 0xf0000 && cp <= 0xffffd) ||
    (cp >= 0x100000 && cp <= 0x10fffd);
});
console.log({
  symbolCount: symbols.length,
  emojiCount: emojis.length,
  pendingSymbolCount: pendingSymbols.length,
  pendingEmojiCount: pendingEmojis.length,
  duplicateSymbols: dupes(symbols, 'symbol').length,
  duplicateEmojis: dupes(emojis, 'emoji').length,
  privateUseSymbols: symbols.filter((item) => hasPrivateUse(item.symbol)).length
});
NODE
```

## 🧭 当前数据已知问题

以下问题基于当前线上数据 `public/data/symbols/items.json`、`public/data/emojis/items.json` 和待处理数据 `public/data/pending/` 的抽样和统计结果，后续工作流应优先处理这些质量缺口：

1. **搜索词覆盖不足**
   - 当前仍有大量符号条目的 `searchTerms` 为空，历史人工数据和新抓取数据的搜索能力不一致。
   - 旧 Emoji 中也存在 `keywords` 为空的情况，导致只能依赖名称和说明匹配。
   - 后续应优先给常用符号补中文别名、英文名、Unicode 编码和常见输入关键词。

2. **符号名称中英文混杂**
   - SYMBL 新增条目目前多数保留英文名称，例如 `Hyphen`、`Left Single Quotation Mark` 等。
   - 旧数据中也有部分希腊字母等条目使用英文名但中文说明较完整，命名风格不统一。
   - 后续应把 `name` 统一整理为简洁中文名，英文名放入 `searchTerms`。

3. **说明文本质量不均**
   - 新抓取的符号说明多为模板句：名称、Unicode 编码和来源链接，缺少实际用途说明。
   - 新抓取的 Emoji `text` 也是来源分类模板，适合作为占位，不适合作为最终百科说明。
   - 后续应逐步改写为本站原创简短说明，避免直接批量复制来源站点长文。

4. **分类粒度不一致**
   - 符号分类既有大类（如 `数学`、`标点`、`数字`），也有较细类别（如 `娱乐`、`信仰`、`环保`）。
   - Emoji 分类同时存在 `动物`、`植物`、`水果`、`虫子`、`虫类` 等粒度不一致的旧分类。
   - 后续应先制定一份稳定分类表，再批量归并；尤其需要合并 `虫子` / `虫类` 这类近似分类。

5. **覆盖仍不完整**
   - 当前只完成了一批增量导入，SYMBL 因限流需要继续分批补齐，箭头、数学扩展、几何图形、象形符号等区块仍需继续导入和整理。
   - Emojipedia 分类页能补一部分缺失项，但不等同于完整 Unicode Emoji 数据库。
   - 后续若要追求完整覆盖，应增加 Unicode 官方 emoji-test / CLDR 数据作为覆盖校验基准，再用 Emojipedia 做中文名称和含义参考。

6. **变体与重复语义未整理**
   - 当前主键只按字符精确去重，无法识别 `文本展示` / `Emoji 展示`、带 Variation Selector、ZWJ 序列等语义近似项。
   - 后续需要决定哪些变体合并显示，哪些作为独立条目保留。
   - 对旗帜、肤色、性别、家庭等 ZWJ 组合，应单独制定整理规则。

7. **来源信息混在展示文案中**
   - 目前新增数据把来源 URL 写进 `notes` / `text`，对用户详情页不够自然。
   - 更合理的结构是后续增加内部字段，例如 `sourceName`、`sourceUrl`、`unicodeCodepoint`，展示文案只保留用户可读说明。
   - 如果增加内部字段，需要确认 API 返回时继续过滤，避免不必要字段进入首屏数据。

8. **Unicode 元数据缺失**
   - 符号缺少结构化的 Unicode code point、block、版本、官方名称等字段。
   - Emoji 缺少 Emoji/Unicode 首次引入版本、CLDR short name、annotation keywords 等结构化字段。
   - 后续补齐这些字段后，搜索、排序、筛选和详情页扩展都会更稳定。

9. **字体与平台支持未验证**
   - 新增字符不一定在所有系统字体中都能显示，部分稀有符号可能只显示方框或 fallback glyph。
   - 现有 `systemRanges` 配置很窄，需要结合实际字体支持重新评估。
   - 后续应对新增区块做抽样截图或浏览器端字体健康检查，再决定是否默认展示。

10. **数据体积与首屏性能压力会继续增加**
    - 数据继续扩充后，当前 JSON 和首屏卡片数据会越来越大。
    - 详情说明、来源信息、搜索索引等字段不宜长期全部进入首屏 payload。
    - 后续整理数据时，应同步评估“详情按需加载”“静态压缩”“搜索索引拆分”等优化项。

## 🧱 数据分段与加载优化建议

当前首页和 Emoji 页已经只把首屏 60 条卡片传给客户端，但服务端仍会在首次访问时读取完整 JSON、预计算拼音、统计分类，并在分类筛选和搜索时扫描全量数组。现在两份数据约 1MB，尚可接受；如果继续补齐 Unicode 区块、Emoji 版本和详情说明，应该尽早把数据整理成可分段加载的结构。

建议后续按以下优先级改造：

1. **先建立数据清单 manifest**
   - 新增 `public/data/manifest.json`，只记录数据版本、总数、分类列表、每个分类数量、分片文件名和更新时间。
   - 首页和 Emoji 页的分类导航只读 manifest，不再为了拿分类统计而解析完整数据。
   - manifest 也是后续工作流的校验入口，能快速发现分类数量异常、分片缺失、版本不同步等问题。

2. **按数据类型和分类拆分列表数据**
   - 当前符号线上条目保存在 `public/data/symbols/items.json`，分类索引保存在 `public/data/symbols/by-category/数学.json`、`标点.json` 等。
   - Emoji 同样使用 `public/data/emojis/items.json` 和 `public/data/emojis/by-category/笑脸.json`、`旗帜.json` 等。
   - `all` 页面不要长期依赖一个超大的 all 文件，可以额外生成轻量的 `featured.json` 或 `random-pool.json`，只放首页随机展示需要的字段。

3. **列表字段和详情字段分离**
   - 列表分片只保留 `id`、`symbol`、`name`、`category`、必要的短搜索词和极短说明。
   - 长说明、来源 URL、Unicode 版本、历史背景、跨平台支持等信息放到 `details/{id}.json` 或按区块合并的详情分片中，用户打开详情弹窗时再加载。
   - 这样可以避免每个卡片列表请求都携带大量暂时用不到的百科内容。

4. **生成独立搜索索引**
   - 不要让搜索直接扫描展示数据。后续可生成 `public/data/index/symbols-search.json` 和 `public/data/index/emojis-search.json`。
   - 搜索索引只保留 `id`、归一化名称、别名、拼音、Unicode 编码和分类，命中后再回列表分片或详情分片取展示内容。
   - 数据量继续增大时，再考虑 MiniSearch / FlexSearch 这类专用索引；在此之前，结构化轻量索引已经能解决大部分性能问题。

5. **按 Unicode block 保留底层分段**
   - 除了面向用户的分类，还应保留 `block` 字段和 `by-block` 分片，例如 `latin-1-supplement.json`、`arrows.json`、`mathematical-operators.json`。
   - 用户分类适合浏览，Unicode block 适合数据维护、来源对账、增量抓取和排错。
   - 一个符号可以有多个用户分类，但只能有一个主要 Unicode block，这有助于后续校验覆盖率。

6. **不要把“分类”当成唯一分片维度**
   - 当前符号存在多分类，例如 `单位,数学`、`货币,字母`。如果只按分类物理拆分，会出现重复存储和更新困难。
   - 更稳妥的方式是：主数据按 `id` 或 `block` 分片保存；分类文件保存 ID 列表；API 组合返回需要的分页数据。
   - 小规模阶段可以先直接按分类复制数据，等数量明显扩大后再切换为 ID 索引。

7. **分页策略从“数组 slice”升级为“分片游标”**
   - 当前 API 是先过滤完整数组，再 `slice` 分页。分片后应让 API 根据 `category + page` 定位具体文件或 ID 段。
   - 对稳定排序的分类页，可以预生成 `category/{name}/page-1.json`、`page-2.json`。
   - 对随机首页，可以继续使用小时 seed，但随机池应从轻量数据中抽取，避免每小时对完整数据打乱。

8. **给整理脚本增加构建产物步骤**
   - 后续 `npm run data:update` 只负责采集原始数据到 `pending/`，`npm run data:build` 负责根据线上 `items.json` 生成 manifest、分类分片、block 分片、搜索索引和详情分片。
   - 线上只读取 `public/data/symbols/items.json` 和 `public/data/emojis/items.json`；待处理数据不进入线上展示。
   - 这样人工整理、自动抓取和线上加载可以解耦，避免直接修改线上消费格式导致页面代码频繁变化。

9. **加载层面配合 HTTP 缓存**
   - 分片文件名可以带版本或内容 hash，例如 `symbols-category-math.v1.6.3.json`，便于长缓存。
   - API 返回可以加 `Cache-Control`，静态 JSON 可以依赖 CDN/浏览器缓存。
   - Service Worker 后续优先缓存 manifest、首屏随机池、热门分类第一页，而不是缓存完整数据库。

10. **建议的近期落地顺序**
    - 第一阶段：保留现有 API，对数据脚本增加 `data:build`，先生成 manifest 和分类统计，页面仍兼容旧 JSON。
    - 第二阶段：让分类页 API 优先读取分类分片，搜索仍走全量缓存，降低浏览场景成本。
    - 第三阶段：拆出详情分片，列表 payload 删除长说明和来源 URL。
    - 第四阶段：引入搜索索引，搜索 API 不再扫描完整展示数据。
    - 第五阶段：按 Unicode block 做覆盖率校验和增量导入状态追踪。

这套方案的关键是把数据分成两层：`items.json` 作为线上展示事实，`pending/` 作为爬取后待整理数据；`manifest/index` 作为导航和搜索入口。不要直接把爬虫抓到的数据当成最终前端数据结构，否则数据越补越多时，分类、搜索、详情和性能会互相拖住。

### 技术与工程

- **PWA 支持**：添加 manifest 和服务端离线回退，实现接近原生 App 的体验。
- **国际化 (i18n)**：支持英文等多语言界面。
- **单元测试**：为核心搜索、过滤、排序逻辑补齐测试用例。

## 📦 安装与运行

### 环境要求

- Node.js 18.0 或更高版本 (推荐 20.0+)
- npm 包管理器

### 克隆项目

```bash
git clone https://github.com/your-username/rarecharweb.git
cd rarecharweb
```

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
npm run start
```

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进这个项目！

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 📄 许可证

本项目采用 [GNU Affero General Public License v3.0 (AGPL-3.0)](LICENSE) 开源协议。

### 主要条款

- ✅ **商业使用** - 允许用于商业目的
- ✅ **修改** - 允许修改源代码
- ✅ **分发** - 允许分发原始或修改后的代码
- ✅ **专利使用** - 提供专利授权
- ✅ **私人使用** - 允许私人使用

### 义务要求

- 📋 **包含许可证** - 分发时必须包含许可证和版权声明
- 📋 **源码开放** - 分发时必须提供源代码
- 📋 **相同许可证** - 衍生作品必须使用相同许可证
- 📋 **状态变更说明** - 修改文件时必须说明变更
- 🌐 **网络使用披露** - 通过网络提供服务时也必须提供源代码

### 重要提醒

AGPL-3.0 是一个强 Copyleft 许可证，特别适用于网络服务。如果您修改了本项目并通过网络向用户提供服务，您必须向这些用户提供修改后的源代码。

详细条款请参阅 [LICENSE](LICENSE) 文件。

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架
- [Heroicons](https://heroicons.com/) - 图标库
- [SYMBL](https://symbl.cc/cn/) - 符号和Unicode字符参考
- [Emojipedia](https://emojipedia.org/zh) - 表情符号百科全书

---

如果这个项目对你有帮助，请给它一个 ⭐️！
