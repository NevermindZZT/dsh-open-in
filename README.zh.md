# dsh-open-in

![version](https://badgen.net/badge/version/0.1.0/green)
![license](https://badgen.net/badge/license/MIT/blue)
[![GitHub](https://badgen.net/badge/github/nevermindzzt%2Fdsh-open-in/black)](https://github.com/nevermindzzt/dsh-open-in)

在 DeepSeek Harness Web 界面中直接打开工作区目录到你选择的程序 ——
VS Code、文件管理器、Windows Terminal，或任何你配置的命令行工具。
侧边栏每个真实 Workspace 行的 **…** 菜单里，为每个配置的目标显示一行
（"在 VS Code 中打开"、"在文件管理器中打开"、"在终端中打开"……）。

## 功能

- **目标可配置**：`targets` 数组 —— 每个目标含 `id`、`label`、`command`、
  `args`、可选的 `platforms` 平台白名单和 `enabled` 开关。内置默认目标：
  `vscode`、`explorer`、`terminal`。
- **设置页 UI（增/删/改）**：设置 → 插件 → "打开方式"卡片用结构化表单编辑
  目标 —— 添加一行、修改任意字段、删除一行、保存。修改写入持久化的用户设置
  文档，并立即生效（无需重启）。
- **内置目标按平台映射**：内置目标保持默认命令行时自动跟随宿主平台
  （explorer → macOS 用 `open` / Linux 用 `xdg-open`；terminal →
  `wt -d` / `open -a Terminal` / `gnome-terminal --working-directory`）。
  任何显式自定义都以你的配置为准。
- **两种运行时的菜单集成**：新版 DSH 运行时使用原生
  `sidebar.workspaces.row-menu` 插槽；公开发布的 `0.1.0-rc.6`（没有该插槽）
  由兼容 DOM 适配器接管。两条路径都渲染随语言切换的菜单行（中文 / English）。
- **主机侧启动**：配置的可执行文件以分离进程方式启动，目录作为最后一个参数；
  启动器比服务器活得更久。拒绝相对路径，且只运行**配置里**的命令（客户端只传
  目标 id + 路径）。

## 前置条件

- DSH `0.1.0-rc.6` 或更高版本（web profile）。
- 你配置的工具已安装：VS Code 命令行（`code`）在 PATH 上、`wt`
  （Windows Terminal）在 PATH 上等。Windows 默认 `code` 命令还会自动查找
  VS Code 的标准用户级、系统级安装目录。

## 安装

把插件加入你的 web profile（会在 profile 内执行 pnpm 并合并 bundle 层）：

```sh
dsh plugin --profile web add github:nevermindzzt/dsh-open-in
```

或固定到某个发布 tag：

```sh
dsh plugin --profile web add https://github.com/nevermindzzt/dsh-open-in/archive/refs/tags/v0.1.0.tar.gz
```

仓库自带预构建的 `lib/`，git / tarball 安装无需构建步骤，也无需构建授权。
重启 Web 服务器，然后刷新页面。主机插件挂载在 `dsh-open-in`；
客户端 bundle 由 `/plugins/dsh-open-in/client.js` 提供。

验证层已组合：

```sh
dsh --profile web --dump-config | grep dsh-open-in
```

## 配置

生效的目标由两层组成（后者覆盖前者）：**用户设置文档**（设置页 UI 写入）→
**cordis.yml 条目**（见下）→ **schema 默认值**。日常修改推荐走设置卡片；
`cordis.yml` 保留为部署组合路径。

### 设置页 UI

打开 **设置 → 插件 → "打开方式"**（卡片位于"可配置插件"标签页）。每行对应
一个当前目标：修改任意字段、删除一行，或点 **添加目标** 新增。字段：`id`
（唯一、非空）、`label`（留空 = 内置语言文案）、`command`（可执行文件）、
`args`（逗号/空格分隔）、`platforms`（逗号/空格分隔的 `win32`/`darwin`/`linux`；
空 = 全部平台）、`enabled`。无效行（ID 为空/重复、命令为空）会阻止保存；
**保存** 将整个列表写入持久化的用户设置文档并立即生效。

### cordis.yml

部署相关的选项都是经校验的 `Config` 字段，可在 `cordis.yml`（profile 的
`cordis.patch.yml`）中修改。由于 patch 会整体替换某行的 `config` 值，
自定义时需写全每个键：

```yaml
- update:
    - id: dsh-open-in
      config:
        targets:
          - id: vscode
            label: ''
            command: code
            args: []
            platforms: []
            enabled: true
          - id: explorer
            label: ''
            command: explorer
            args: []
            platforms: []
            enabled: true
          - id: terminal
            label: ''
            command: wt
            args: ['-d']
            platforms: []
            enabled: true
          - id: cursor
            label: 'Cursor'
            command: cursor
            args: []
            platforms: []
            enabled: true
```

| 键 | 默认值 | 含义 |
| --- | --- | --- |
| `targets[].id` | — | 稳定 id；客户端按 id 引用目标（必须唯一）。 |
| `targets[].label` | `''` | 菜单文案；为空时回退到 `target.<id>` 语言键，再回退到 id 本身。 |
| `targets[].command` | 各目标不同 | 打开目录的可执行文件，按 PATH 解析。 |
| `targets[].args` | 各目标不同 | 目录路径前附加的参数。 |
| `targets[].platforms` | `[]` | 平台白名单（`win32`/`darwin`/`linux`）；空 = 全部平台。 |
| `targets[].enabled` | `true` | 禁用的目标不会被列出或启动。 |

可执行文件缺失时会响亮失败并给出修复提示；相对路径会被拒绝。
设置页 UI 中编辑的目标会整体覆盖 `cordis.yml` 条目（设置的用户层替换
`targets` 字段）。

## 能力边界

| 动作 | 在哪里执行 | 是否需要审批 |
| --- | --- | --- |
| 用配置的启动器打开工作区目录 | 主机（用户手势） | 否——用户主动点击了该行 |

本插件不提供工具、技能或任何模型可见面；它只启动用户配置好的程序，
打开用户已经在 DSH 中打开过的目录。

## 开发

```sh
pnpm install
pnpm run check   # typecheck + test + build
```

预构建的 `lib/` 已提交进仓库；发布只需改版本号、构建并打 tag。

## License

MIT
