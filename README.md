# dsh-open-in

![version](https://badgen.net/badge/version/0.1.0/green)
![license](https://badgen.net/badge/license/MIT/blue)
[![GitHub](https://badgen.net/badge/github/nevermindzzt%2Fdsh-open-in/black)](https://github.com/nevermindzzt/dsh-open-in)

Open a DeepSeek Harness workspace directory in a launcher of your choice —
VS Code, File Explorer, Windows Terminal, or any command-line tool you
configure — directly from the web GUI. Every real Workspace row in the
sidebar gets an **…** overflow menu entry per configured target
("Open in VS Code", "Open in File Explorer", "Open in Terminal", …).

## Features

- **Configurable targets**: a `targets` array — each target has `id`, `label`,
  `command`, `args`, an optional `platforms` allowlist and an `enabled`
  switch. Shipped defaults: `vscode`, `explorer`, `terminal`.
- **Settings UI (add / edit / remove)**: Settings → Plugins → the "Open In"
  card edits the targets with a structured form — add a row, change any
  field, remove a row, Save. Edits write the durable user settings document
  and apply to the next launch immediately (no restart).
- **Per-platform mapping for built-ins**: while a built-in target keeps its
  default command line, it follows the host platform automatically
  (explorer → `open` on macOS / `xdg-open` on Linux; terminal → `wt -d` /
  `open -a Terminal` / `gnome-terminal --working-directory`). Any explicit
  customization is authoritative.
- **Menu integration, both runtimes**: newer DSH runtimes use the native
  `sidebar.workspaces.row-menu` slot; the published `0.1.0-rc.6` (which lacks
  that slot) is served by a compatibility DOM adapter. Both paths render
  locale-following rows (中文 / English).
- **Host launch**: the configured executable is spawned detached with the
  directory as the last argument; the launcher outlives the server. Relative
  paths are refused, and only *configured* commands ever run (the client only
  sends a target id + path).

## Prerequisites

- DSH `0.1.0-rc.6` or newer (web profile).
- The tools you configure must be installed: VS Code CLI (`code`) on PATH,
  `wt` (Windows Terminal) on PATH, etc. The Windows default `code` command
  also searches the standard per-user/system VS Code install locations.

## Install

Add the plugin to your web profile (runs pnpm inside the profile and
reconciles the bundle layer):

```sh
dsh plugin --profile web add github:nevermindzzt/dsh-open-in
```

Or pin a release tag:

```sh
dsh plugin --profile web add https://github.com/nevermindzzt/dsh-open-in/archive/refs/tags/v0.1.0.tar.gz
```

The repository ships the prebuilt `lib/`, so git/tarball installs need no
build step and no build approval. Restart the web server, then refresh the
page. The host plugin mounts as `dsh-open-in`; the client bundle is served
at `/plugins/dsh-open-in/client.js`.

Verify the layer composed:

```sh
dsh --profile web --dump-config | grep dsh-open-in
```

## Configure

Two layers compose the effective targets (highest wins): the **user settings
document** (written by the Settings UI) → the **cordis.yml entry** (see
below) → **schema defaults**. The Settings card is the recommended path for
day-to-day changes; `cordis.yml` stays the deployment-composition path.

### Settings UI

Open **Settings → Plugins → "Open In"** (the card sits in the configurable
plugins tab). Rows mirror the current targets: edit any field, remove a row,
or **Add target** for a new one. Fields: `id` (unique, non-empty), `label`
(empty = built-in copy), `command` (executable), `args` (comma/space
separated), `platforms` (comma/space separated `win32`/`darwin`/`linux`;
empty = all), `enabled`. Invalid rows (empty/duplicate id, empty command)
block the Save; **Save** writes the whole list to the durable settings
document and applies immediately.

### cordis.yml

Deployment-varying options are validated `Config` fields editable in
`cordis.yml` (your profile's `cordis.patch.yml`). Because a patch replaces a
row's whole `config` value, spell out every key you customize:

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

| Key | Default | Meaning |
| --- | --- | --- |
| `targets[].id` | — | Stable id; the client references targets by id (must be unique). |
| `targets[].label` | `''` | Menu label; empty falls back to the `target.<id>` locale key, then the id. |
| `targets[].command` | per target | Executable that opens a directory, resolved through PATH. |
| `targets[].args` | per target | Extra arguments passed before the directory path. |
| `targets[].platforms` | `[]` | Platform allowlist (`win32`/`darwin`/`linux`); empty = every platform. |
| `targets[].enabled` | `true` | Disabled targets are never listed or launched. |

A missing executable fails loud with a fix hint; relative paths are rejected.
Targets edited in the Settings UI override the `cordis.yml` entry entirely
(the settings user layer replaces the `targets` field).

## Capability boundary

| Action | Where | Approval |
| --- | --- | --- |
| Open a workspace directory in a configured launcher | Host (user gesture) | No — the user clicked the row |

The plugin contributes no tools, no skills, and no model-visible surface; it
only launches programs the user configured on directories the user already
opened in DSH.

## Development

```sh
pnpm install
pnpm run check   # typecheck + test + build
```

The prebuilt `lib/` is committed; a release only needs a version bump, a
build, and a tag.

## License

MIT
