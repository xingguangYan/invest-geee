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

## 直接调用我的INVEST模型

INVEST 是一个托管在 Google Earth Engine Git 仓库中的项目。拥有仓库访问权限的用户可以通过 Earth Engine Code Editor 直接加载，也可以在本地终端中克隆仓库。
<img width="2560" height="1271" alt="ScreenShot_2026-10-21_112605_391" src="https://github.com/user-attachments/assets/3eee17f2-20e8-432d-a9f4-4c7372ad3ff5" />


## 访问方式

### 方式一：在 Earth Engine Code Editor 中加载

拥有该仓库访问权限的用户，可以通过以下链接将其添加到 Code Editor：

https://code.earthengine.google.com/?accept_repo=users/bqt2000204051/INVEST

### 方式二：克隆 Git 仓库

在终端中运行以下命令克隆仓库：

```bash
git clone https://earthengine.googlesource.com/users/bqt2000204051/INVEST


## 自己安装到自己的script中方法

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

## 重要说明
在GEE中部署的25个GEE模型与斯坦福官方Python之间的差异。** 差异主要集中在**算法核心逻辑的简化**和**关键驱动变量的缺失**上，而不仅仅是参数默认值的不同。

---

### Annual Water Yield (年产水量)

**差异点**：官方模型基于 Budyko 曲线，其核心公式依赖 **植物有效含水量 (PAWC)** 和 **根系限制层深度 (root restricting layer depth)** 作为必须的输入栅格。你的GEE实现中，这两个参数是可选的，且默认值被设为了 `ee.Image(0)`，这意味着在未显式提供时，Budyko曲线的土壤水分限制项会失效，退化为一个更简化的降水-蒸散差公式。

**是否影响结果**：**是，且影响显著。** PAWC和根系深度是Budyko框架中控制“有多少降水能转化为径流”的关键变量。缺失它们会系统性地改变产水量的空间格局，尤其是在土壤条件差异大的区域。

**官方对应位置**：`natcap.invest.hydropower.hydropower_water_yield` 的参数中，`depth_to_root_rest_layer_uri` 和 `pawc_uri` 均标注为 **required**。


### SDR (泥沙输送比) & NDR (营养物输送比)

**差异点**：这是差异最大的两个模型。官方SDR模型严格遵循 **RUSLE (修正通用土壤流失方程)** 框架，需要**降雨侵蚀力 (erosivity)** 和**土壤可蚀性 (erodibility)** 作为强制输入栅格，并包含 `k_param`、`sdr_max`、`ic_0_param` 等多个校准参数来控制泥沙输移过程。你的GEE实现中，`computeSDR` 函数直接使用 `slope.divide(100).clamp(0, 1)` 作为SDR值，完全跳过了RUSLE的侵蚀计算和汇流路径模拟。

NDR同理，官方实现基于地形和土地利用的养分滞留/输移过程，而你的代码目前仅根据生物物理表中的 `n_retention` 和 `n_export` 结合坡度做了一个极简的代数运算。

**是否影响结果**：**是，本质上算法不同，结果不可直接比较。** 你的SDR结果实质上是“坡度归一化值”，而非真正的泥沙输移比。NDR结果也缺乏水文连通性的空间逻辑。

**官方对应位置**：SDR的 `args['erosivity_path']` 和 `args['erodibility_path']` 为必需项，`k_param` 等为校准核心。


### Carbon (碳储量)

**差异点**：官方模型的逻辑非常直接——对四个碳库（地上、地下、土壤、枯死）的碳密度**直接求和**，然后与LULC面积相乘得到总碳储量。你的GEE实现 `computeCarbonStorage` 通过 `remap` 将LULC代码映射到四个碳库之和，**算法上与官方一致**。

**是否影响结果**：**算法逻辑无实质差异。** 结果差异将完全取决于你硬编码的 `carbonPools` 参数值是否与官方推荐值或你的研究区实测值一致。官方用户指南的GitHub仓库中提供了参考参数表（`data-sources`目录）。


### Habitat Quality (生境质量)

**差异点**：官方模型需要两类表格：**威胁表**（包含每个威胁的 `MAX_DIST`、`WEIGHT`、`DECAY`）和**敏感度表**（每个LULC类型对每个威胁的敏感度）。威胁的空间衰减函数明确分为**线性**或**指数**两种。你的GEE实现中，`computeHabitatQuality` 函数使用了一个简化的指数衰减公式，但**完全绕过了敏感度表**，直接将 `habitat` 影像与威胁压力相乘。

**是否影响结果**：**是，机制不完整。** 官方模型中，不同生境类型对同一威胁的敏感度差异是决定质量格局的核心，你的实现没有体现这一层。此外，你的衰减函数形式（`exp(-distance/maxDistance)`）与官方常用的指数/线性衰减在数学形式上也存在差异。


### 其他模型的关键差异

*   **Coastal Blue Carbon**：官方是**时间序列分析**，追踪碳库随时间的累积、排放和土地利用转换。你的GEE版本仅对首末两期做了静态差值，**缺失了时间动态过程**。
*   **Crop Pollination**：官方基于Lonsdorf模型，包含**多个蜂种**的筑巢适宜性、飞行距离和资源需求，是一个物种级别的空间显式模型。你的GEE版本使用单一距离衰减核进行简化，**物种异质性完全丢失**。
*   **Urban Cooling**：官方模型的热缓解指数由**蒸散发、遮荫、反照率**按特定权重（如0.4、0.4、0.2）综合计算。你的GEE实现仅通过植被覆盖度乘以一个固定系数（3）来估算温度变化，**物理机制简化较多**。


### 总结：影响程度与使用建议

| 模型 | 差异性质 | 对结果的潜在影响 | 建议 |
| :--- | :--- | :--- | :--- |
| **Carbon** | 算法一致，参数依赖 | 低（若参数值合理） | 可直接使用，但需核对碳密度参数来源 |
| **Habitat Quality** | 机制不完整（缺敏感度层） | **中至高** | 结果仅供趋势参考，不宜用于精确评估 |
| **Annual Water Yield** | 关键变量缺失（PAWC/根系深度） | **高** | 若未提供PAWC/根系深度，结果偏差可能较大 |
| **SDR / NDR** | **算法本质不同** | **极高** | 你的结果与官方InVEST不可比，实质是简化指标 |
| **Coastal Blue Carbon** | 时间动态缺失 | **高** | 无法反映碳累积/排放的时序过程 |
| **Crop Pollination / Urban Cooling** | 机制/参数高度简化 | **中至高** | 适用于示意性可视化，不适用于定量归因 |

**核心建议**：你部署的GEE版本在**计算效率和可视化便捷性**上有明显优势，非常适合快速探索和教学演示。但如果目标是产出可发表的定量结果，**Carbon模型是其中相对最可靠的一个**（前提是参数值经过校准），而 **SDR、NDR 和 Annual Water Yield 的结果需要格外谨慎**。最稳妥的做法是，在正式分析前，用官方InVEST在局部区域跑一次基准结果，与你的GEE输出进行空间对比，量化简化带来的偏差。官方参数参考表可以在 `natcap/invest.users-guide` 仓库的 `data-sources` 目录中找到。


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

INVEST, Google Earth Engine repository.
Repository: users/bqt2000204051/INVEST
Code Editor: https://code.earthengine.google.com/?accept_repo=users/bqt2000204051/INVEST
Git clone: https://earthengine.googlesource.com/users/bqt2000204051/INVEST

© [年份] [你的姓名/组织]. 本教程采用 CC BY-NC-SA 4.0 许可。
InVEST 模型源码版权归 Natural Capital Project, Stanford University 及贡献者所有，依据 Apache-2.0 发布。
本项目与 Stanford University / Natural Capital Project 无隶属或背书关系。

LICENSE.txt                 # Apache-2.0 原文，保留上游
LICENSE-MIT.txt             # 你的原创代码 MIT
LICENSE-CC-BY-NC-SA-4.0.txt # 教程文档 CC 许可
NOTICE                      # 上游署名 + 你的项目声明
README.md                   # 放上面的“版权与许可”章节



