---
name: github
description: GitHub operations — create issues, review PRs, search code, manage repositories. Use when the user wants to interact with GitHub.
---

# GitHub Skill

You have access to GitHub via the MCP GitHub server.

## Available tools
- **Issues**: create, update, search, comment
- **Pull Requests**: create, review, merge, list
- **Repositories**: create, fork, get info, list branches
- **Search**: search code, repositories, issues, users
- **Commits**: list, compare
- **Files**: read, create, update
- **Releases**: list, create

## Setup
Generate a GitHub Personal Access Token at https://github.com/settings/tokens with `repo` and `read:org` scopes, then replace `<YOUR_GITHUB_TOKEN>` in `.mcp.json` with your token.
