# InVEST-geee — InVEST 模型 Python 包 + Google Earth Engine 移植版

**版本**: 3.20.2 (基于官方 [natcap/invest](https://github.com/natcap/invest) 3.20.2 源码)

本包包含:

1. **完整的 InVEST 模型 Python 源码** (25 个模型, 全部来自官方
   `natcap/invest` 仓库 tag `3.20.2`)
2. **Google Earth Engine JavaScript 移植版** (26 个模型, 位于
   `natcap/invest/gee_port/`, 可直接在 GEE Code Editor 中用
   `require` / `export` 调用)
3. **中文汉化包** (位于
   `natcap/invest/internationalization/locales/zh/`)
4. **命令行工具** `invest` 和 `invest-geee`

## 安装

### 方式一: 开发模式 (推荐, 无需编译 Cython)

```powershell
cd D:\软件\INVEST
pip install -e .
```

> 说明: 本包内置了 6 个 Cython 模块 (`sdr_core`, `ndr_core`,
> `viewshed`, `delineateit_core`, `out_of_core_quadtree`,
> `seasonal_water_yield_core`) 的 **纯 Python 兼容桩**。
> `invest list` / `invest validate` 以及 22 个不依赖 Cython 的模型
> 可以完整运行。依赖 Cython 的 3 个模型 (SDR, NDR, Scenic Quality,
> DelineateIt, Seasonal Water Yield, Recreation) 在调用核心算法时会
> 抛出清晰的错误提示, 指引你安装官方 conda 包。

### 方式二: 官方完整版 (含编译的 Cython 模块)

```powershell
conda install -c conda-forge natcap.invest
```

## 命令行用法

```powershell
# 列出所有模型
invest list

# 校验 datastack
invest validate -d my_datastack.json

# 运行模型
invest run carbon -d my_datastack.json

# 列出 GEE 移植的模型
invest-geee list

# 生成 GEE 脚本
invest-geee run carbon --args "{\"lulc_current\": \"projects/x/lulc\"}"
```

## Python API

```python
import natcap.invest
from natcap.invest.models import pyname_to_module

# 所有可导入的模型
for pyname, mod in pyname_to_module.items():
    print(pyname, mod.MODEL_SPEC['model_id'])

# 设置中文 locale
natcap.invest.set_locale('zh')

# 运行一个模型
from natcap.invest.carbon import execute, validate
args, msg = validate(args_dict)
print(msg)
if not msg:
    execute(args_dict)
```

## GEE JavaScript 用法

### 第 1 步：获取你的 GEE 用户路径

登录 [GEE Code Editor](https://code.earthengine.google.com/)，在左上角 **Scripts** 面板的 **Reader** 或 **Writer** 下，你通常会看到类似 `users/your_username` 的路径。记下 `your_username`，后面构造 `require` 路径时要用。

### 第 2 步：在 GEE Code Editor 中创建脚本仓库

在 **Scripts** 面板中点击 **New** → **Repository**，仓库名称建议就用 `invest-geee`，或者保持与 GitHub 仓库一致的名称。创建后，你会得到一个仓库路径，例如：

```text
users/your_username/invest-geee
```

### 第 3 步：把 `gee_port/` 中的脚本放入 GEE 仓库

`invest-geee` 仓库的顶层有一个 `gee_port/` 目录，它是 GEE 移植版的副本。你需要把其中的 `.js` 文件（至少包括入口文件 `index.js` 及其依赖的模块）放到刚刚创建的 GEE 仓库中。

有两种方式：

**方式 A：手动创建/粘贴（适合文件较少或依赖简单）**

在 GEE Code Editor 的 Scripts 面板中，右键你创建的 `invest-geee` 仓库 → **New** → **File**，按照 `gee_port/` 中的目录结构逐一创建同名 `.js` 文件，然后把 GitHub 上对应文件的内容粘贴进去。入口文件通常是 `index.js`。

**方式 B：使用 `minee` 打包（适合依赖较多、文件分散的情况）**

如果 `gee_port` 内部通过 `require` 互相引用，手动维护路径容易出错。可以在本地用 Node.js 安装 [`minee`](https://github.com/aazuspan/minee) —— 一个专门为 Earth Engine 设计的模块打包器。将 `gee_port` 的入口模块打包成一个单独的 `.js` 文件，再把这个单文件上传到 GEE 仓库。这样只需要维护一个文件，路径问题会少很多。

### 第 4 步：修正 `require` 调用路径

原来 README 中的写法 `require('user:/invest-geee/index.js')` 不符合 GEE 的路径规范。正确的调用方式应该是：

```javascript
var invest = require('users/your_username/invest-geee:index.js');
```

把 `your_username` 替换成你实际的 GEE 用户名。如果 `index.js` 不在仓库根目录，而是在子目录中，路径也要相应调整，例如：

```javascript
var invest = require('users/your_username/invest-geee:gee_port/index.js');
```

**关键点**：`require` 路径中的仓库名和文件名**大小写敏感**，必须和 GEE 仓库中实际看到的完全一致。

### 第 5 步：运行与验证

路径正确后，就可以按照项目原本的设计调用模型了：

```javascript
var invest = require('users/your_username/invest-geee:index.js');

print(invest.models); // 查看可用的 GEE 移植模型

var result = invest.models.carbon.run({
  lulc_current: ee.Image('projects/your_project/assets/lulc'),
  // ... 其他参数
});

export.image(result.outputs['carbon_current'], 'carbon_current');
```

注意 `lulc_current` 等输入数据仍然应该放在 **Assets** 中（`projects/.../assets/...`），这与脚本模块的存放位置是两回事：**数据在 Assets，代码在 Scripts**。

---

## 常见问题排查

| 现象 | 可能原因 | 处理 |
|---|---|---|
| `Module not found` / `Cannot find module` | `require` 路径拼写错误、用户名错误、仓库/文件不存在 | 在 Scripts 面板中逐级核对路径，确认文件确实存在于该仓库中 |
| 路径中有 `user:` 开头 | 使用了非标准前缀 | GEE 要求以 `users/` 开头，而不是 `user:` |
| 调用 `invest.models` 为 `undefined` | `index.js` 没有正确 `exports.models`，或入口文件放错了位置 | 检查 `index.js` 中是否有 `exports.models = {...}`，并确认 `require` 指向的是这个文件 |
| 内部依赖报错 | `gee_port` 中其他 `.js` 文件没有一并上传，或内部相对路径引用未适配 GEE 仓库结构 | 上传全部依赖文件，或使用 `minee` 打包成单文件 |

---

**总结**：`gee_port/` 不是上传到 Assets，而是需要作为**代码编辑器 Scripts 仓库中的脚本文件**来管理；`require` 的路径格式是 `'users/你的GEE用户名/仓库名:文件路径'`，而不是 `'user:/...'`。按上述步骤把 `gee_port` 中的 `.js` 文件放入 GEE 脚本仓库后，原先的模型调用代码就可以正常工作了。

## 目录结构

```
D:\软件\INVEST\
├── src/natcap/invest/        # Python 包源码 (官方 3.20.2)
│   ├── carbon/               # 25 个模型子包
│   ├── sdr/
│   ├── ndr/
│   ├── ...
│   ├── gee_port/             # GEE JavaScript 移植 (26 个模型)
│   ├── internationalization/ # 中文/西语汉化 (zh, es)
│   ├── reports/              # HTML 报告模板
│   ├── cli.py                # 命令行入口
│   ├── models.py             # 模型自动发现
│   ├── datastack.py          # datastack I/O
│   └── geee.py               # GEE 包装器
├── gee_port/                 # GEE 移植版 (顶层副本, 方便直接上传)
├── docs/                     # 从 Workbench 提取的英文文档
├── invest_raw/               # 官方源码 tarball 解包 (参考)
├── InVEST 3.20.2 Workbench/  # 原始 Electron 应用 (参考)
├── pyproject.toml
├── requirements.txt
├── LICENSE.txt               # Apache-2.0 (官方)
└── README.md
```

## 许可

- 模型源码: Apache-2.0 (见 `LICENSE.txt`, 上游 [natcap/invest](https://github.com/natcap/invest))
- GEE 移植版: MIT
- 中文汉化: MIT

## 模型清单 (25 个)

| model_id | 名称 |
|---|---|
| `carbon` | 碳储量与碳汇 |
| `annual_water_yield` | 年水量产出 |
| `seasonal_water_yield` | 季节水量产出 |
| `sdr` | 泥沙输送比例 |
| `ndr` | 营养物输送比例 |
| `crop_production_percentile` | 作物产量 (百分位法) |
| `crop_production_regression` | 作物产量 (回归法) |
| `pollination` | 作物授粉 |
| `habitat_quality` | 栖息地质量 |
| `hra` | 栖息地风险评估 |
| `coastal_vulnerability` | 海岸脆弱性 |
| `coastal_blue_carbon` | 海岸蓝碳 |
| `forest_carbon_edge_effect` | 森林碳边缘效应 |
| `urban_cooling_model` | 城市降温 |
| `urban_nature_access` | 城市自然接触 |
| `urban_mental_health` | 城市心理健康 |
| `urban_flood_risk_mitigation` | 城市洪涝风险缓解 |
| `stormwater` | 城市雨水径流 |
| `recreation` | 户外休闲 |
| `scenic_quality` | 景观质量 |
| `wave_energy` | 波浪能 |
| `wind_energy` | 风能 |
| `routedem` | 坡面汇流 (RouteDEM) |
| `delineateit` | 流域划界 (DelineateIt) |
| `scenario_gen_proximity` | 情景生成 (邻近法) |
| `reservoir_hydropower_production` | 水库水电生产 (仅 GEE) |

## 版权与许可

本项目 **InVEST-geee** 包含来自不同来源的代码、翻译和文档，版权与许可分别如下。使用、复制、修改或分发本项目时，请同时遵守各部分的许可证。

### 1. InVEST 模型 Python 源码

本项目中来自官方 InVEST 的模型源码版权归：

Copyright (c) Natural Capital Project, Stanford University and contributors.

- 上游项目：https://github.com/natcap/invest
- 上游版本：`3.20.2`
- 许可证：Apache License 2.0
- 许可证全文：见根目录 `LICENSE.txt` 及上游仓库 `LICENSE` / `NOTICE`

本仓库不主张对上游 InVEST 源码的版权。对上游源码的修改、移植、封装和汉化由本仓库维护者完成；修改部分应保留上游版权声明，并在相关文件中注明修改说明。

### 2. GEE JavaScript 移植版、CLI 包装与原创工具代码

Copyright (c) [年份] [你的姓名/组织]

- 覆盖范围：`gee_port/`、`src/natcap/invest/gee_port/`、`geee.py`、CLI 包装及由本人完全原创的工具代码和示例代码。
- 许可证：MIT License
- 说明：如某部分是对上游 InVEST 源码的直接翻译、移植或衍生，则该部分仍应遵守 Apache-2.0，并保留上游署名和 NOTICE；MIT 仅覆盖本人完全原创的部分。

### 3. 中文汉化包

Copyright (c) [年份] [你的姓名/组织]

- 覆盖范围：`src/natcap/invest/internationalization/locales/zh/`
- 许可证：MIT License

### 4. 教程与文档

Copyright (c) [年份] [你的姓名/组织]. 本教程文字、插图、示例说明和排版采用 **CC BY-NC-SA 4.0** 许可。

你可以自由分享和改编本教程，但必须：

1. 注明原作者和出处；
2. 不得用于商业用途；
3. 改编作品须采用相同许可证。

教程引用格式建议：

> [你的姓名/组织]. ([年份]). 《InVEST-geee 教程：InVEST 模型 Python 包与 Google Earth Engine 移植版》. [教程网址]. CC BY-NC-SA 4.0.

### 5. 名称与隶属关系声明

InVEST 名称及相关标识归 Natural Capital Project、Stanford University 或其相应权利人所有。本项目为独立项目，与 Stanford University 和 Natural Capital Project 无隶属关系，也未获得其官方背书。本项目对 InVEST 的引用仅用于说明来源和兼容性。

InVEST-geee
Copyright (c) [年份] [你的姓名/组织]

This product includes software developed by the Natural Capital Project,
Stanford University and contributors (https://github.com/natcap/invest),
licensed under the Apache License, Version 2.0.

The upstream InVEST source code is Copyright (c) Natural Capital Project,
Stanford University and contributors. All upstream copyright notices,
license texts, and NOTICE contents are retained in this distribution.

Original portions of this project, including the Google Earth Engine
JavaScript port, Chinese localization, command-line wrappers, and tutorial
documentation, are Copyright (c) [年份] [你的姓名/组织], unless otherwise
stated.

InVEST-geee is an independent project. It is not affiliated with,
endorsed by, or sponsored by Stanford University or the Natural Capital
Project. Names and trademarks remain the property of their respective owners.

© [年份] [你的姓名/组织]. 本教程采用 CC BY-NC-SA 4.0 许可。
InVEST 模型源码版权归 Natural Capital Project, Stanford University 及贡献者所有，依据 Apache-2.0 发布。
本项目与 Stanford University / Natural Capital Project 无隶属或背书关系。

LICENSE.txt                 # Apache-2.0 原文，保留上游
LICENSE-MIT.txt             # 你的原创代码 MIT
LICENSE-CC-BY-NC-SA-4.0.txt # 教程文档 CC 许可
NOTICE                      # 上游署名 + 你的项目声明
README.md                   # 放上面的“版权与许可”章节



