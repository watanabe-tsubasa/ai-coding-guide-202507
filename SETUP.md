## Install

```bash
curl -sS https://starship.rs/install.sh | sh
mise use -g node@24
mise use -g rust
```

## Bash

```bash
echo 'eval "$(~/.local/bin/mise activate bash)"' >> ~/.bashrc
eval "$(starship init bash)"
```

## Zsh

```bash
echo 'eval "$(~/.local/bin/mise activate zsh)"' >> ~/.zshrc
eval "$(starship init zsh)"
```
