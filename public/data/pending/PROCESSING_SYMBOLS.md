# Pending 符号整理上线流程

本文档用于后续工作流分批整理 `public/data/pending/symbols.json` 中的待处理符号，并逐步迁入线上符号数据。

## 当前目标

- 待处理数据源：`public/data/pending/symbols.json`
- 线上数据源：`public/data/symbols/items.json`
- 处理方式：分批清洗、审核、上线
- 不建议一次性全量上线 pending 数据
- `pending` 是原始待处理池，`online` 是可展示数据

## 推荐处理顺序

优先处理低风险、容易判断的分类：

1. 货币
2. 字母
3. 标点
4. 数字
5. 箭头
6. 形状、盲文、地理
7. 数学
8. 符号、其他
9. emoji-like pictograph 数据最后处理，单独判断是否保留在 symbols，还是转入 emoji 流程

每批建议处理 50–200 条。

## 单条记录清洗规则

每条记录至少检查并规范以下字段：

- `symbol`：保留原符号，不要改写
- `id`：保留原 ID，除非发现冲突
- `name`：从英文名改成简洁中文名
- `pronunciation`：通常保持空字符串
- `category`：使用现有中文分类体系
- `searchTerms`：保留英文名、Unicode 编码，同时加入中文名、中文分类、常用别名
- `notes`：改成中文说明，不要只保留机械来源文案

建议保留 Unicode 编码和必要来源信息，但前端展示说明应以中文用户可读为主。

## 暂缓上线的数据

以下类型不要强行上线，保留在 pending 或单独标记：

- 控制字符、不可见字符
- 字体兼容性极差的符号
- 仅用于内部编码、普通用户无明显价值的符号
- 与 emoji 数据重复且更适合放在 emoji 区的数据
- 名称或用途无法可靠解释的符号

## 迁移步骤

对确认上线的记录：

1. 从 `public/data/pending/symbols.json.items` 移除
2. 追加到 `public/data/symbols/items.json.items`
3. 更新两个文件的 `total`
4. 不要手动修改 `by-category`、`index.json`、`random-pool.json`
5. 运行数据构建脚本：

```bash
npm run data:build
```

该脚本会重建：

- `public/data/symbols/by-category/*.json`
- `public/data/symbols/index.json`
- `public/data/symbols/random-pool.json`
- `public/data/manifest.json`

## 数据一致性校验

每批处理后至少校验：

- `public/data/symbols/items.json.total === items.length`
- `public/data/pending/symbols.json.total === items.length`
- online 内无重复 `symbol`
- pending 内无重复 `symbol`
- online 与 pending 没有重复 `symbol`
- 所有上线项都有完整字段：
  - `id`
  - `symbol`
  - `name`
  - `pronunciation`
  - `category`
  - `searchTerms`
  - `notes`

## 项目校验

每批完成后运行：

```bash
npm run lint
npm run build
```

## 抽样人工检查

每批至少抽样检查：

- 中文名是否自然
- 分类是否正确
- 搜索词是否覆盖常见叫法
- `notes` 是否适合前端展示
- 是否误把 emoji-like 数据放进普通 symbols

## Diff 检查重点

提交前确认：

- `by-category` 仍是完整 item，不是 ID-only
- `random-pool.json` 仍然只放 ID
- `index.json` 仍是嵌套 `items` 结构
- 没有误改 emoji 数据
- 没有误改线上 symbols 之外的无关文件

## 每批完成标准

一批处理完成需要满足：

- 合格项已经从 pending 移除并进入 online
- 不合格项仍留在 pending 或被单独标记
- `npm run data:build` 成功
- `npm run lint` 成功
- `npm run build` 成功
- 数据一致性校验通过

