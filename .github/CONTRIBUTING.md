# Contributing

This repository uses several automated checks and governance workflows. This document explains how to configure and run them locally or via GitHub Actions.

## Branch protection and ADMIN_GH_TOKEN

To apply branch protection rules (require successful CI before merge) the repository provides a manual workflow `Apply Branch Protection`.

Steps:
1. Create a personal access token (PAT) with `repo` and `admin:repo_hook` scopes if your organization requires such a token for branch protection changes.
2. In GitHub: Settings → Secrets → Actions, add a secret named `ADMIN_GH_TOKEN` with the PAT value.
3. In the Actions tab, run the `Apply Branch Protection` workflow (workflow_dispatch). The workflow will set `required_status_checks` to include `CI` and require one approving review.

Note: If your organization disallows PAT-based changes, you must set branch protection manually via the GitHub UI or use a token with sufficient permissions.

## Running branch protection workflow locally
You can't run the workflow locally, but you can trigger it from Actions → Run workflow. Ensure `ADMIN_GH_TOKEN` is set.

## Markdown linting
- A `.markdownlint.json` config is present to reduce false positives. CI runs `npx markdownlint "**/*.md"` and will fail on lint errors.

## TODO → TECH_DEBT automation
- A scheduled/manual action scans for TODO markers indicating tech debt (e.g., `TODO: tech-debt:`) and opens issues with the `tech-debt` label.

If you don't want automation to open issues automatically, remove the workflow or disable it in Actions.
