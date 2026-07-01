## [1.13.8](https://github.com/nowscott/RareCharWeb/compare/v1.13.7...v1.13.8) (2026-07-01)


### 问题修复

* **搜索框:** 将焦点高亮从输入框矩形盒子迁移到圆角玻璃容器，避免选中搜索框时出现直角边框并遮挡视觉层


## [1.13.7](https://github.com/nowscott/RareCharWeb/compare/v1.13.6...v1.13.7) (2026-06-21)


### 问题修复

* **字体:** 本地托管 Noto Sans Symbols 2 与 Noto Sans Math，提升特殊符号、数学符号和数学字母的字形覆盖，修复 U+27CE/U+27CF 显示为方框的问题
* **Service Worker:** 加固字体缓存消息处理，避免缺少消息端口或缓存检查失败时产生额外 console 报错


## [1.13.6](https://github.com/nowscott/RareCharWeb/compare/v1.13.5...v1.13.6) (2026-06-21)


### 问题修复

* **分类标签:** 稳定分类标签背景层，避免标签行出现矩形色块，并提高非选中标签的文字对比度
* **开发缓存:** 开发环境主动注销旧 Service Worker，减少本地调试时旧 chunk 引发的 hydration 闪烁


## [1.13.5](https://github.com/nowscott/RareCharWeb/compare/v1.13.4...v1.13.5) (2026-06-21)


### 数据

* **符号数据:** 继续清洗并上线 800 条待处理数学符号，覆盖数学运算符、补充数学符号和数学字母数字符号
* **数学命名:** 为复杂数学关系符号和数学字体字母生成中文名称、搜索词和说明文本
* **数据索引:** 重建符号分类分片、ID 索引、随机池和 manifest


## [1.13.4](https://github.com/nowscott/RareCharWeb/compare/v1.13.3...v1.13.4) (2026-06-21)


### 问题修复

* **标签切换:** 修复小概率点击其他标签后激活状态变化但符号列表仍停留在旧数据的问题
* **移动端分类:** 调整分类按钮触摸行为，降低横向滚动容器中点击被手势判定影响的概率


## [1.13.3](https://github.com/nowscott/RareCharWeb/compare/v1.13.2...v1.13.3) (2026-06-21)


### 数据

* **符号数据:** 继续清洗并上线 500 条待处理符号，覆盖补充箭头、形状、天文符号和数学运算符
* **分类归并:** 将混合 block 中的条目按语义拆分到箭头、形状、天文、数学和其他分类
* **数据索引:** 重建符号分类分片、ID 索引、随机池和 manifest


## [1.13.2](https://github.com/nowscott/RareCharWeb/compare/v1.13.1...v1.13.2) (2026-06-20)


### 数据

* **符号数据:** 继续清洗并上线 500 条待处理符号，覆盖封闭字母数字符号和箭头符号
* **分类归并:** 新增箭头分类，并将封闭字母数字符号按语义归入字母、数字和其他
* **数据索引:** 重建符号分类分片、ID 索引、随机池和 manifest


## [1.13.1](https://github.com/nowscott/RareCharWeb/compare/v1.13.0...v1.13.1) (2026-06-19)


### 数据

* **符号数据:** 继续清洗并上线 200 条待处理符号，覆盖带圈、带括号、反白、双圈和方框数字/字母
* **分类归并:** 将字母变体从待处理默认数字分类中拆出，按语义归入字母、数字、货币和其他
* **数据索引:** 重建符号分类分片、ID 索引、随机池和 manifest


## [1.13.0](https://github.com/nowscott/RareCharWeb/compare/v1.12.11...v1.13.0) (2026-06-19)


### 新功能

* **液态玻璃 UI:** 引入现成 Liquid Glass 与 Lenis 滚动库，重构首页、Emoji 页和关于页的玻璃质感、胶囊按钮与卡片视觉
* **平滑滚动:** 使用 Lenis 优化长列表滚动手感，并在高速滚动时仅对符号卡片做渲染降级，降低白闪风险


### 问题修复

* **移动端导航:** 调整顶部导航按钮移动端对齐，避免与左侧标题和描述挤压
* **空结果状态:** 将无匹配结果改为普通文本提示，不再使用胶囊玻璃容器
* **符号卡片:** 优化复制按钮显示逻辑，鼠标悬停卡片时显示无背景图标按钮
* **关于页:** 避免滚动渲染降级影响大面板，防止上下滑动时卡片背景变黑


## [1.12.11](https://github.com/nowscott/RareCharWeb/compare/v1.12.10...v1.12.11) (2026-06-19)


### 问题修复

* **字体:** 将 Noto Serif 符号兜底字体改为站内托管，避免 Google Fonts 外链不可用导致补充标点继续缺字
* **资源加载:** 更新首页交互 chunk 并增强 Service Worker 对 Next.js chunk 404 的刷新恢复


## [1.12.10](https://github.com/nowscott/RareCharWeb/compare/v1.12.9...v1.12.10) (2026-06-19)


### 问题修复

* **资源加载:** 增加客户端 chunk 加载失败自动恢复，发布切换期间遇到旧资源 404 时自动刷新一次


## [1.12.9](https://github.com/nowscott/RareCharWeb/compare/v1.12.8...v1.12.9) (2026-06-19)


### 问题修复

* **字体:** 引入 Noto Serif 作为冷门标点回退字体，修复补充标点符号显示为方框的问题
* **缓存:** 扩展 Service Worker 字体缓存范围，支持 Google Fonts 与 gstatic 字体资源


## [1.12.8](https://github.com/nowscott/RareCharWeb/compare/v1.12.7...v1.12.8) (2026-06-19)


### 维护

* **关于页:** 移除热门分类统计和版本信息面板，保留更聚焦的数据概览展示
* **数据概览:** 隐藏面向维护的数据版本字段，减少 About 页信息噪音


## [1.12.7](https://github.com/nowscott/RareCharWeb/compare/v1.12.6...v1.12.7) (2026-06-19)


### 数据

* **符号数据:** 继续清洗并上线 100 条待处理符号，覆盖东亚标点、货币、类字母符号和数字形式
* **分类归并:** 将单位符号、数学类字母、货币符号和数字形式归入对应现有分类
* **数据索引:** 重建符号分类分片、ID 索引、随机池和 manifest


## [1.12.6](https://github.com/nowscott/RareCharWeb/compare/v1.12.5...v1.12.6) (2026-06-19)


### 数据

* **符号数据:** 继续清洗并上线 100 条待处理符号，覆盖补充标点和中日韩标点
* **数字分类:** 将汉字数字零与苏州码子一至九归入数字分类，并补充中文搜索词
* **数据索引:** 重建符号分类分片、ID 索引、随机池和 manifest


## [1.12.5](https://github.com/nowscott/RareCharWeb/compare/v1.12.4...v1.12.5) (2026-06-19)


### 新功能

* **关于页:** 新增数据概览模块，展示已上线条目、分类总数、待清洗储备、数据版本和热门分类分布
* **分类标签:** 为符号页和 Emoji 页分类导航新增展开全部/收起功能，长分类列表可直接完整查看


### 问题修复

* **分类标签:** 修复移动端横向滑动手势被按钮触摸行为影响的问题，保留默认横向滚动体验


## [1.12.4](https://github.com/nowscott/RareCharWeb/compare/v1.12.3...v1.12.4) (2026-06-19)


### 数据

* **符号数据:** 清洗并上线 100 条待处理标点类符号，重建分类分片、索引、随机池和 manifest
* **既有数据:** 修正章节符号、段落标记、倒置问号、倒置感叹号和通用货币符号的分类与说明
* **待处理流程:** 新增 pending 符号整理上线流程文档，明确分批清洗、迁移和校验标准


### 问题修复

* **SYMBL 采集:** 放宽字符卡片解析规则，兼容包含额外 class 的 SYMBL 页面结构


## [1.12.3](https://github.com/nowscott/RareCharWeb/compare/v1.12.2...v1.12.3) (2026-06-19)


### 性能优化

* **分类切换:** 首屏预置每个分类约 60 条初始数据，分类切换优先命中客户端缓存


## [1.12.2](https://github.com/nowscott/RareCharWeb/compare/v1.12.1...v1.12.2) (2026-06-19)


### 问题修复

* **Service Worker:** 仅缓存 http/https 字体请求，避免浏览器扩展的 chrome-extension 请求触发 Cache API 报错


## [1.12.1](https://github.com/nowscott/RareCharWeb/compare/v1.12.0...v1.12.1) (2026-06-19)


### 问题修复

* **Emoji 分类:** 将水果类 Emoji 合并回食物分类，避免单独分类数量过少


## [1.12.0](https://github.com/nowscott/RareCharWeb/compare/v1.11.3...v1.12.0) (2026-06-19)


### 新功能

* **Emoji:** 补齐 Unicode Emoji 17.0 fully-qualified 官方数据，保留本地发色组件项
* **Emoji 肤色:** 将肤色变体折叠到基础 Emoji 卡片，在详情弹窗内选择具体肤色并复制
* **数据审计:** 新增 Emoji 覆盖审计与缺口补全脚本，便于后续跟进 Unicode 官方更新


### 性能优化

* **标签切换:** 为分类结果增加客户端缓存、请求去重和预取，减少重复等待
* **路由切换:** 空闲时预取 /home、/emoji、/about，改善顶部页面切换速度
* **字体:** 生产环境默认关闭字体诊断，移除卡片级重复字体 DOM 处理


### 数据

* **Emoji:** 原始线上 Emoji 增至 3948 条，折叠后展示 1918 个可见卡片
* **Emoji:** 清理 🪔 尾随空格重复项，并重建分类分片、索引、随机池和 manifest


## [1.11.3](https://github.com/nowscott/RareCharWeb/compare/v1.11.2...v1.11.3) (2026-06-18)


### 数据

* **Emoji 分类:** 将 Emoji 分类统一为两个字，并把人物细分为人物、行为、角色、家庭
* **身体部位:** 将手和身体部位归入身体，并按 Unicode RGI 数据补齐肤色变体
* **虫类数据:** 合并虫类、虫子到动物分类，同时保留虫类和昆虫搜索词


## [1.11.2](https://github.com/nowscott/RareCharWeb/compare/v1.11.1...v1.11.2) (2026-06-18)


### 数据

* **分类分片:** 分类分片改为保存完整条目，`random-pool.json` 保持仅保存 ID
* **ID 索引:** 为符号与 Emoji 生成轻量 `index.json`，记录 ID 到分类分片的定位信息
* **Emoji:** 将待处理 Emoji 清理后入库，去除展示文案中的来源前缀和链接
* **搜索词:** 补齐线上符号 `searchTerms`，并规范化 Emoji `keywords`


## [1.11.1](https://github.com/nowscott/RareCharWeb/compare/v1.11.0...v1.11.1) (2026-06-18)


### 数据

* **数据分层:** 线上展示数据切换为 `public/data/symbols/items.json` 与 `public/data/emojis/items.json`，待处理爬取数据单独保存在 `public/data/pending/`
* **数据索引:** 新增 `manifest.json`、分类 ID 索引和随机池索引，避免分类分片重复存储完整条目
* **采集流程:** 新增 `data:update` 与 `data:build` 脚本，后续爬取只追加到 pending，整理完成后再进入线上 items


## [1.11.0](https://github.com/nowscott/RareCharWeb/compare/v1.10.1...v1.11.0) (2026-06-15)


### 新功能

* **首屏渲染:** 首页与 Emoji 页面通过 ISR 直接输出首批 60 张真实卡片，不再依赖骨架屏


### 性能优化

* **请求链:** 移除首屏挂载后的重复 API 请求，首屏由两次请求缩减为一次静态页面请求
* **分页:** 每批数据由 200 条调整为 60 条，降低 API 响应体积与客户端渲染压力
* **数据传输:** API 和首屏数据不再传输仅服务端搜索使用的拼音预计算字段
* **交互:** 分类和搜索更新期间保留现有卡片，仅显示轻量更新提示


### 维护

* **骨架屏:** 删除不再使用的骨架组件及动画样式

## [1.10.1](https://github.com/nowscott/RareCharWeb/compare/v1.10.0...v1.10.1) (2026-06-15)


### 问题修复

* **骨架屏:** 按响应式列数显示四行占位卡片，大屏最多展示 24 张，避免首屏底部留白

## [1.10.0](https://github.com/nowscott/RareCharWeb/compare/v1.9.2...v1.10.0) (2026-06-15)


### 问题修复

* **SSR:** 修复服务端渲染时分类统计未定义导致的运行时错误
* **SymbolList:** 避免在渲染阶段调用 `Date.now()`，恢复 React 组件纯度
* **SymbolList:** 使用请求状态派生加载与错误展示，避免 effect 中同步重置状态导致级联渲染
* **SymbolList:** 简化失败重试流程，由新的请求键统一触发数据重新加载
* **统计:** “全部”分类使用唯一符号总数，避免多分类符号被重复计数


### 新功能

* **API:** 符号与 Emoji 接口支持分页、分类筛选、搜索和确定性随机种子
* **SymbolList:** 使用 IntersectionObserver 实现分页无限滚动
* **UI:** 数据加载期间显示与真实卡片结构一致的响应式骨架屏


### 性能优化

* **数据传输:** 首次请求限制为 200 条记录，后续按需加载，避免一次传输全部数据
* **依赖:** 移除不适用于当前 SSR 方案的 `react-window`
* **骨架屏:** 使用柔和高光动画并适配减少动态效果偏好，降低加载切换时的视觉跳变

## [1.9.2](https://github.com/nowscott/RareCharWeb/compare/v1.9.1...v1.9.2) (2026-06-15)


### 问题修复

* **SymbolDetail:** 修复关闭按钮定位漂移 — 为模态框容器添加 relative 类 ([93cce5e](https://github.com/nowscott/RareCharWeb/commit/93cce5e))
* **SymbolList:** 修复 IntersectionObserver 闭包捕获过时数据 — 改用 ref 存储最新长度 ([93cce5e](https://github.com/nowscott/RareCharWeb/commit/93cce5e))
* **SymbolList:** 修复 visibleCount 重置时的竞态条件 — 移除 setTimeout 延迟 ([93cce5e](https://github.com/nowscott/RareCharWeb/commit/93cce5e))
* **layout:** 添加 suppressHydrationWarning 消除浏览器扩展导致的 hydration 报错 ([93cce5e](https://github.com/nowscott/RareCharWeb/commit/93cce5e))


### 性能优化

* **localData:** 添加模块级内存缓存，消除 API 重复读盘、JSON 解析、emoji 映射和分类统计计算 ([93cce5e](https://github.com/nowscott/RareCharWeb/commit/93cce5e))
* **symbolUtils:** 服务端预计算拼音搜索字段，客户端搜索零 pinyin() 调用 ([93cce5e](https://github.com/nowscott/RareCharWeb/commit/93cce5e))
* **page:** ISR shuffle 使用按小时确定性种子，确保多节点部署结果一致 ([93cce5e](https://github.com/nowscott/RareCharWeb/commit/93cce5e))

## [1.9.1](https://github.com/nowscott/RareCharWeb/compare/v1.9.0...v1.9.1) (2026-03-16)


### 问题修复

* **nav:** 将按钮跳转改为 Link 组件以修复导航时的浏览器刷新样式 ([ed4cbe2](https://github.com/nowscott/RareCharWeb/commit/ed4cbe22dad92eb3c04535dc87648cde2777ed98))

# [1.9.0](https://github.com/nowscott/RareCharWeb/compare/v1.8.0...v1.9.0) (2026-03-16)


### 新功能

* **pages:** 实现 ISR 定期随机打乱符号 ([93d4c39](https://github.com/nowscott/RareCharWeb/commit/93d4c397773465c48ea35aca741c64cab973e03f))

# [1.8.0](https://github.com/nowscott/RareCharWeb/compare/v1.7.0...v1.8.0) (2026-03-16)


### 问题修复

* **layout:** 恢复外部字体样式表的 crossOrigin 属性 ([01605db](https://github.com/nowscott/RareCharWeb/commit/01605db93d461fa7cc1e91028fe54cc0565567bf))


### 新功能

* **symbols:** 实现符号列表服务端随机打乱并修复水合闪烁问题 ([b02b27e](https://github.com/nowscott/RareCharWeb/commit/b02b27e3f489fbd062860f8ad89e4c51a3f3e2c8))

# [1.7.0](https://github.com/nowscott/RareCharWeb/compare/v1.6.2...v1.7.0) (2026-03-16)


### 新功能

* **ssr:** 重构为服务端组件以直接加载本地数据，移除客户端缓存 ([0172c91](https://github.com/nowscott/RareCharWeb/commit/0172c91380c08d1974c7101cc951e6f031101494))

## [1.6.2](https://github.com/nowscott/RareCharWeb/compare/v1.6.1...v1.6.2) (2026-03-16)


### 问题修复

* 修复 React Server Components CVE 安全漏洞 ([7fdd754](https://github.com/nowscott/RareCharWeb/commit/7fdd754))


### 重构

* 重构数据获取逻辑并优化客户端渲染 ([bcf386d](https://github.com/nowscott/RareCharWeb/commit/bcf386d))


### 构建系统

* 将 Next.js 脚本迁移至 Webpack 构建器 ([07eaad0](https://github.com/nowscott/RareCharWeb/commit/07eaad0))

## [1.6.1](https://github.com/nowscott/rarecharweb/compare/v1.6.0...v1.6.1) (2025-07-02)


### 重构

* **components:** 重构组件目录结构，将导航和UI组件分组 ([cd1ca44](https://github.com/nowscott/rarecharweb/commit/cd1ca44))
* **components:** 将符号相关组件移动到 symbols 子目录 ([a5f4459](https://github.com/nowscott/rarecharweb/commit/a5f4459))
* **core:** 重构项目目录结构，将核心模块移动到 lib/core 目录下 ([6f5d29c](https://github.com/nowscott/rarecharweb/commit/6f5d29c))
* **app:** 重构项目结构和路由配置 ([9b400ea](https://github.com/nowscott/rarecharweb/commit/9b400ea))
* **components:** 重构关于页面组件结构，将组件拆分到独立文件并统一导出 ([08e2f8e](https://github.com/nowscott/rarecharweb/commit/08e2f8e))

# [1.6.0](https://github.com/nowscott/rarecharweb/compare/v1.5.0...v1.6.0) (2025-07-01)


### 新功能

* **性能优化:** 实现字体缓存系统和Service Worker集成 ([2f68766](https://github.com/nowscott/rarecharweb/commit/2f687669b01931507aa1a1e8e266f168ad120173))

# [1.5.0](https://github.com/nowscott/rarecharweb/compare/v1.4.0...v1.5.0) (2025-07-01)


### 新功能

* **about:** 添加其他作品展示区块 ([cd5e15b](https://github.com/nowscott/rarecharweb/commit/cd5e15b42389eb5e8768314305afe6e8eb6af376))

# [1.4.0](https://github.com/nowscott/rarecharweb/compare/v1.3.0...v1.4.0) (2025-06-27)


### 新功能

* **组件:** 改进复制按钮的视觉反馈效果 ([c34596d](https://github.com/nowscott/rarecharweb/commit/c34596def2f1aa7f1bbb9a189163a96bed9f977d))

# [1.3.0](https://github.com/nowscott/rarecharweb/compare/v1.2.0...v1.3.0) (2025-06-27)


### 问题修复

* **about:** 添加clickCount的void语句避免ESLint警告 ([40b3432](https://github.com/nowscott/rarecharweb/commit/40b3432a858d15fc99ffece39a1fb1e6be531567))


### 新功能

* **about:** 优化分类统计合并逻辑并更新UI样式 ([5563da8](https://github.com/nowscott/rarecharweb/commit/5563da817f1dac2d504d1512efc43a70652d056a))
* **about:** 实现关于页面功能模块化重构 ([bf257f7](https://github.com/nowscott/rarecharweb/commit/bf257f7f83bd4552979c2b923bae72b16e94b065))
* 添加快捷清理缓存功能 ([5cb7cd6](https://github.com/nowscott/rarecharweb/commit/5cb7cd6657a61286bec7acf5a8bd1a734fa4f353))

# [1.2.0](https://github.com/nowscott/rarecharweb/compare/v1.1.6...v1.2.0) (2025-06-27)


### 新功能

* **SymbolDetail:** 为说明文本添加滚动提示和指示器 ([8f3ea64](https://github.com/nowscott/rarecharweb/commit/8f3ea64d7ef4f57d2c8ae38e61b57fbefaf8ff7c))
* **SymbolDetail:** 添加说明内容滚动检测和渐变提示 ([1354e11](https://github.com/nowscott/rarecharweb/commit/1354e1146ad4844cec9fe1aefd6ceda266e7c6e3))

## [1.1.6](https://github.com/nowscott/rarecharweb/compare/v1.1.5...v1.1.6) (2025-06-27)


### 问题修复

* **SymbolDetail:** 修复符号详情弹出时页面滚动问题 ([50f15cc](https://github.com/nowscott/rarecharweb/commit/50f15cc5a8bddc8dd2d213b4a0e39d871d0d5290))

## [1.1.5](https://github.com/nowscott/rarecharweb/compare/v1.1.4...v1.1.5) (2025-06-26)


### 问题修复

* **SearchBar:** 禁用输入框自动完成功能以避免干扰搜索 ([afca43b](https://github.com/nowscott/rarecharweb/commit/afca43bdc7ffbc73cca76d7cfb20260500ca0f21))

## [1.1.4](https://github.com/nowscott/rarecharweb/compare/v1.1.3...v1.1.4) (2025-06-25)


### 样式

* **font:** 调整字体栈顺序并统一字体粗细为 500 ([0555d9f](https://github.com/nowscott/rarecharweb/commit/0555d9f))

## [1.1.3](https://github.com/nowscott/rarecharweb/compare/v1.1.2...v1.1.3) (2025-06-25)


### 问题修复

* **fonts:** 调整字体栈顺序并添加Segoe UI Symbol字体 ([95f0d6f](https://github.com/nowscott/rarecharweb/commit/95f0d6f46464bffbf788b50b36a1569ebd3399f1))

## [1.1.2](https://github.com/nowscott/rarecharweb/compare/v1.1.1...v1.1.2) (2025-06-25)


### 问题修复

* 更新符号数据URL从beta版本到正式版本 ([8f3f012](https://github.com/nowscott/rarecharweb/commit/8f3f012e15ff6f5733d4e5203a4b51a28f1c4765))

## [1.1.1](https://github.com/nowscott/rarecharweb/compare/v1.1.0...v1.1.1) (2025-06-25)


### 问题修复

* 移除本地Noto Sans Symbols 2字体依赖，仅使用CDN ([df95bd6](https://github.com/nowscott/rarecharweb/commit/df95bd6ef36d9e605affb93c942b80c7352c55a6))

# [1.1.0](https://github.com/nowscott/rarecharweb/compare/v1.0.1...v1.1.0) (2025-06-25)


### 问题修复

* **SymbolDetail:** 修复多字符符号的Unicode显示问题 ([d69dc31](https://github.com/nowscott/rarecharweb/commit/d69dc3183869463cf9d24cb876acf0af624f4b0e))
* **HomeClient:** 修正Emoji按钮激活状态判断条件 ([b887eb0](https://github.com/nowscott/rarecharweb/commit/b887eb04fac14ec85b630b036882d9fa7b6cdeb0))


### 新功能

* **字体:** 添加Noto Sans Symbols 2字体支持象棋符号显示 ([ddc2b4e](https://github.com/nowscott/rarecharweb/commit/ddc2b4e7f4a527e6ef8402e9f82f1f16c2e55237))

## [1.0.1](https://github.com/nowscott/rarecharweb/compare/v1.0.0...v1.0.1) (2025-06-25)


### 问题修复

* **about:** 使用package.json中的版本号替换硬编码版本 ([ebd649a](https://github.com/nowscott/rarecharweb/commit/ebd649ad76a3223dc6d88834426c21eeea9e2b05))

# [1.0.0](https://github.com/nowscott/rarecharweb/releases/tag/v1.0.0) (2025-06-25)


### 问题修复

* **组件:** 修复SymbolDetail组件点击事件冒泡和样式问题 ([2ec6375](https://github.com/nowscott/rarecharweb/commit/2ec6375b96d558715c88c0dcaa9e3bed5b6ed1e7))
* **symbolUtils:** 修复客户端和服务端排序不一致问题 ([3387709](https://github.com/nowscott/rarecharweb/commit/3387709567641713ec72fbfd37bad7da2f3cf1e8))
* **useSymbolData:** 修复搜索时分类过滤的触发问题 ([c74974b](https://github.com/nowscott/rarecharweb/commit/c74974be7afcf0f4201cbabd2c461b820bcb4c18))
* **assets:** 将favicon.ico移动到public目录并更新引用 ([2e6114e](https://github.com/nowscott/rarecharweb/commit/2e6114e612e9164820f2b8767c36bb96a0b2da15))
* 延长符号数据缓存时间至10小时并更新关于页面的时间显示 ([eb22a16](https://github.com/nowscott/rarecharweb/commit/eb22a167d8828497a717b00c0813e19a7d732a08))
* **HomeClient:** 添加客户端状态检查避免hydration不匹配 ([a4f8740](https://github.com/nowscott/rarecharweb/commit/a4f8740fde721a0ddd4c34d9987892a486abd762))


### 新功能

* 为页面添加 ISR 并优化数据获取逻辑 ([7cce28b](https://github.com/nowscott/rarecharweb/commit/7cce28bc19e61aa1da2c42cabe8830af5ab7988d))
* **about:** 从API获取并显示数据版本号 ([cbcaadb](https://github.com/nowscott/rarecharweb/commit/cbcaadbf35702fadf92934eb57be0b80dc4099ed))
* **ui:** 优化移动端响应式布局和交互体验 ([f3b791c](https://github.com/nowscott/rarecharweb/commit/f3b791c4ffea85ab11442368550efd848cbc23b7))
* **字体:** 优化符号显示并添加跨域支持 ([ca97f7e](https://github.com/nowscott/rarecharweb/commit/ca97f7eb97c6e68ba2600e028bb6188021041f10))
* **组件:** 优化符号详情弹窗的UI设计和交互体验 ([4547397](https://github.com/nowscott/rarecharweb/commit/4547397f7aaf02485ab14eddc25d38408908aaa6))
* **缓存:** 实现全局缓存系统并优化数据加载 ([ba382b2](https://github.com/nowscott/rarecharweb/commit/ba382b2f15be6bc22b2dc342a96b6463fd5550c4))
* 实现客户端数据获取并添加加载状态 ([31aadf3](https://github.com/nowscott/rarecharweb/commit/31aadf3171a4ecce8686b1efdee1d3792f5ae479))
* **符号展示:** 实现客户端符号随机排序功能并优化数据缓存 ([bd2e189](https://github.com/nowscott/rarecharweb/commit/bd2e1892d1cccb760acd42bdf67672b7a3dd6426))
* **缓存:** 实现智能缓存策略和后台数据更新 ([d7fff0c](https://github.com/nowscott/rarecharweb/commit/d7fff0ca0f307d81cc6a31b5d53cf09f6ebca38c))
* 实现智能缓存系统并优化导航组件 ([0bc967a](https://github.com/nowscott/rarecharweb/commit/0bc967a2434dedc9bee047fc4eeb87c0e9621c1c))
* 实现特殊符号查询工具的核心功能 ([12cd966](https://github.com/nowscott/rarecharweb/commit/12cd966e907348eb1e80169212b11461801721b9))
* **ui:** 更新社交媒体图标为图片并优化符号显示样式 ([f82b3d5](https://github.com/nowscott/rarecharweb/commit/f82b3d5fa96f63178f0793a30b2475a16f3dc489))
* **about:** 更新联系我们页面的社交媒体链接 ([017efff](https://github.com/nowscott/rarecharweb/commit/017efffb1a2c6ab52b3f9940712890ed3d821a5d))
* **types:** 添加 EmojiData 和 EmojiDataResponse 类型定义 ([89e0538](https://github.com/nowscott/rarecharweb/commit/89e0538475ca5bcac7c910913608d2d8c3cf6b3e))
* **emoji:** 添加emoji表情符号页面和API接口 ([cade1bb](https://github.com/nowscott/rarecharweb/commit/cade1bb0aa8685e8fff20ffd7fc1d7766f30c402))
* **字体:** 添加Noto符号字体并优化加载方式 ([7c3502d](https://github.com/nowscott/rarecharweb/commit/7c3502d79938247d3310dd43fd83b4d62f872ada))
* **SymbolDetail:** 添加复制成功提示并改进说明文本显示 ([feb5f31](https://github.com/nowscott/rarecharweb/commit/feb5f3108311ddbb85ed704114b906bee3827d82))
* **字体:** 添加字体健康检查工具并优化字体栈 ([78eebc3](https://github.com/nowscott/rarecharweb/commit/78eebc3c1f168edbfd2b6003e3c5c8093c9b993d))
* **搜索:** 添加拼音搜索功能并实现实时搜索 ([3162743](https://github.com/nowscott/rarecharweb/commit/3162743b50d60e41cb208db60459162c0918d610))
* **SearchBar:** 添加清除按钮功能 ([2cc1aec](https://github.com/nowscott/rarecharweb/commit/2cc1aecda99ff7140af5fce2bb0224e25e5f82e5))
* **about:** 添加表情数据版本显示并合并分类统计 ([cc4e62c](https://github.com/nowscott/rarecharweb/commit/cc4e62c6b0fc6a3b3123f7d6e3b3be221a3b0751))
* **ci:** 添加语义化发布和工作流配置 ([235688e](https://github.com/nowscott/rarecharweb/commit/235688ef6ae2da38ea0b77c38cabd89b5363422c))
* **组件:** 添加通用组件和钩子实现数据加载状态管理 ([8ab5276](https://github.com/nowscott/rarecharweb/commit/8ab5276d3467857b3b84d7f66dd45d33e02fde30))
