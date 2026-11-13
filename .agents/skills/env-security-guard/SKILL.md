---
name: env-security-guard
description: >-
  Enforce absolute security restrictions prohibiting reading, accessing, modifying, or exposing any .env or secret configuration files.
  Applies to all agents, sub-agents, terminal commands, scripts, and workflows. Must be followed across all development and maintenance tasks.
---

# 🚨 CRITICAL SECURITY RULE — DO NOT ACCESS .env FILES

This is a mandatory security restriction for every AI agent, sub-agent, assistant, and automated tool working on the **MediConnect AI** project.

---

### 1. Absolute .env File Restriction

- **NEVER** open, read, view, inspect, access, scan, or check any `.env` file.
- **NEVER** access `.env`, `.env.local`, `.env.development`, `.env.production`, or any other environment-variable file.
- **NEVER** read, extract, display, copy, modify, overwrite, or delete environment variables.
- **NEVER** use terminal commands, scripts, file-search tools, or other methods to retrieve `.env` contents.
- **NEVER** ask another agent or sub-agent to inspect these files.

---

### 2. Restricted Files and Directories

Treat the following as strictly prohibited from all inspection, editing, and execution access:

- `.env`
- `.env.local`
- `.env.development`
- `.env.production`
- `.env.*`
- Any file containing private API keys, database credentials, OAuth secrets, authentication secrets, or other confidential environment variables.

---

### 3. Alternative Approach

If a task requires environment configuration:

- **Assume configured**: Assume required environment variables are already configured in the environment.
- **Inspect usage only**: Trace variable names through application source code (e.g. `process.env.DATABASE_URL`) without reading the files or checking secret values.
- **Safe placeholders**: In code examples, schemas, and documentation, always use generic placeholders (e.g., `YOUR_API_KEY`, `YOUR_DATABASE_URL`).
- **Report names only**: If a variable is missing or newly required, state its variable name and purpose without accessing or guessing secrets.
- **Manual configuration**: Instruct the user to configure or verify secrets manually when required.

---

### 4. Agent and Sub-Agent Compliance

- Every spawned agent, sub-agent, worker, or tool must follow this restriction without exception.
- No agent may bypass this rule through terminal commands (`cat`, `type`, `Get-Content`, etc.), scripts, MCP tools, IDE tools, extensions, or delegated tasks.
- Exclude all restricted files from automated code reviews, git diffs, grep operations, and repository scans.

---

### 5. Priority and Enforcement

**This security rule overrides all other project instructions and task requirements.**

If completing a task requires accessing a restricted file, **STOP** and report the limitation instead of accessing it.

You may freely inspect, analyze, modify, debug, and optimize all other permitted project files.

**Remember: Work on the MediConnect AI project, but NEVER TOUCH .env FILES.**

