---
title: "Ghostty and my Mac mini: quick reference"
description: "Connect, detach, and pick up where I left off. The commands and shortcuts for my Mac mini workspace."
pubDate: 2026-10-04
tags: [ghostty, macos, ssh, tmux]
---

Ghostty is the window on my laptop. SSH connects to the Mini. tmux keeps the workspace on the Mini running after I disconnect.

## Reconnect to magerbot

From a laptop terminal:

```sh
ssh -t macmini '/opt/homebrew/bin/tmux -L magerbot attach -t magerbot'
```

This opens my Pydantic workspace. Keep `-L magerbot`: it selects the separate tmux server used by this harness. The `mini` shortcut below connects to a different session on the default server.

**To detach:** press **Ctrl + B**, release both keys, then press **D**. The programs keep running on the Mini. Inside tmux, **Ctrl + B**, then a window number switches windows.

## The shortcuts I need

| Action | Shortcut or command |
| --- | --- |
| Show / hide the drop-down | **Cmd + backtick** |
| Reconnect from its prompt | **Enter** |
| Return to a local shell from its prompt | **q**, then **Enter** |
| Open the default workspace | `mini` |
| Open a named workspace | `mini magerblog` |
| Detach, leaving tmux running | **Cmd + Shift + D** |
| Detach with tmux's default keys | **Ctrl + B**, release, then **D** |
| Reload Ghostty config | **Cmd + Shift + comma** |

The default tmux session is named `harness`. `mini magerblog` attaches to a session named `magerblog`, creating it if necessary. The launcher connects to a shell; it does not start an agent automatically.

These are my custom bindings and scripts, configured for Ghostty 1.3.1. Installing Ghostty alone does not install `mini` or the automatic connection.

My **Cmd + Shift + D** binding replaces Ghostty's split-down shortcut and sends tmux's default detach sequence. I use it while attached to tmux.

## What happens when I open it

The first time a new Ghostty quick terminal opens, my local shell startup script runs `mini`. That connects to the SSH alias `macmini` and attaches to the `harness` session on the Mini.

Hiding and showing the quick terminal preserves that connection. After I detach or the connection ends, the local script offers **Enter to reconnect** or **q for a local shell**. Regular Ghostty windows still open locally.

To check which machine I am on:

```sh
hostname
```

To list the Mini's tmux sessions from my laptop:

```sh
ssh macmini '/opt/homebrew/bin/tmux list-sessions'
```

## If I forget the launcher

From a laptop terminal, this does the essential connection and attachment directly:

```sh
TERM=xterm-256color /usr/bin/ssh -tt -o ConnectTimeout=10 macmini \
  '/opt/homebrew/bin/tmux new-session -A -s harness'
```

`macmini` is my configured SSH alias. The tmux path is the Homebrew installation on my Apple silicon Mini. Someone adapting this setup needs their own SSH destination and tmux path.

`TERM` describes the terminal's capabilities. `xterm-256color` is the compatibility setting used for this connection. I do not export it globally or override tmux's own terminal setting. Ordinary `ssh macmini` also works with Ghostty's configured SSH integration.

## Where I saved the setup

These files are on my **laptop**:

| File | Purpose |
| --- | --- |
| `~/Library/Application Support/com.mitchellh.ghostty/config.ghostty` | Global shortcut, drop-down size, detach binding, SSH integration |
| `~/.local/bin/mini` | SSH launcher with a default session, connection timeout, and keepalives |
| `~/.config/ghostty/mini.zsh` | Shell function and quick-terminal connection/reconnect loop |
| `~/.zshrc` | Sources `mini.zsh` for interactive shells |

The key Ghostty settings are:

```ini
keybind = global:cmd+backquote=toggle_quick_terminal
quick-terminal-size = 65%
quick-terminal-screen = mouse
keybind = cmd+shift+d=text:\x02d
shell-integration-features = ssh-env,ssh-terminfo
```

The automatic connection lives in `mini.zsh`. It checks Ghostty's `GHOSTTY_QUICK_TERMINAL` environment variable and guards against reconnecting from nested shells.

## When something looks wrong

- **The drop-down still shows an ordinary local shell:** after changing the startup script, close just that drop-down with **Cmd + W**, then open it again with **Cmd + backtick**. Reloading configuration does not rerun an existing shell's startup files.
- **SSH times out:** check that the Mini is awake and reachable, and that Tailscale and Remote Login are working. Changing `TERM` cannot fix a network outage.
- **The global shortcut does nothing:** check Ghostty's shortcut configuration and macOS Accessibility permission for Ghostty.
- **The workspace vanished after a Mini reboot:** tmux survives a disconnected client, but not a reboot or a terminated tmux server. Start a new session and resume the relevant application separately.

Closing my laptop or quitting Ghostty can disconnect SSH while work continues inside tmux on an awake Mini. tmux does not prevent the Mini from sleeping. Detaching leaves programs running; exiting a shell or stopping a program can end the work.

## References

- [Ghostty quick-terminal action](https://ghostty.org/docs/config/keybind/reference#toggle_quick_terminal)
- [Ghostty SSH integration](https://ghostty.org/docs/features/ssh)
- [Ghostty 1.3 release notes](https://ghostty.org/docs/install/release-notes/1-3-0)
