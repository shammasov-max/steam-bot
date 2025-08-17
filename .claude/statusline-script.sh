#!/bin/bash

# Comprehensive Claude Code Status Line
# Displays: Model | User@Host | Directory/Project | Git Branch/Status | Date/Time | Tech Stack | Version

input=$(cat)

# Extract JSON data
model_name=$(echo "$input" | jq -r '.model.display_name // "Unknown Model"')
current_dir=$(echo "$input" | jq -r '.workspace.current_dir // pwd')
project_dir=$(echo "$input" | jq -r '.workspace.project_dir // pwd')
version=$(echo "$input" | jq -r '.version // "Unknown"')

# Directory context
current_dir_name=$(basename "$current_dir")
project_name=$(basename "$project_dir")

# Git information
cd "$current_dir" 2>/dev/null || cd "$project_dir" 2>/dev/null || true
git_branch=$(git branch --show-current 2>/dev/null || echo "no-git")
git_status=""
if git rev-parse --git-dir >/dev/null 2>&1; then
    if ! git diff-index --quiet HEAD -- 2>/dev/null; then
        git_status=" [modified]"
    elif [ -n "$(git status --porcelain 2>/dev/null)" ]; then
        git_status=" [staged]"
    fi
fi

# System info
username=$(whoami)
hostname=$(hostname)
timestamp=$(date +"%H:%M:%S")
date_info=$(date "+%a %b %d")

# Tech stack detection
node_version=""
if command -v node >/dev/null 2>&1; then
    node_version=" | Node $(node --version)"
fi

package_manager=""
if [ -f "$project_dir/yarn.lock" ]; then
    package_manager=" | Yarn"
elif [ -f "$project_dir/package-lock.json" ]; then
    package_manager=" | npm"
elif [ -f "$project_dir/pnpm-lock.yaml" ]; then
    package_manager=" | pnpm"
fi

# Build colorized status line
printf "\033[1;36m%s\033[0m @ \033[1;32m%s\033[0m:\033[1;34m%s\033[0m" "$model_name" "$username" "$hostname"
printf " | \033[1;33m%s\033[0m in \033[1;35m%s\033[0m" "$current_dir_name" "$project_name"
printf " | \033[1;31mgit:\033[0m\033[1;37m%s\033[0m%s" "$git_branch" "$git_status"
printf " | \033[1;90m%s %s\033[0m" "$date_info" "$timestamp"
printf "%s%s" "$node_version" "$package_manager"
printf " | \033[1;90mClaude Code %s\033[0m\n" "$version"