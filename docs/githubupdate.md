# GitHub Contribution & Version Control Guide — NESTOR AI

> **Repository Root**: `c:\PC\Hardik\Projects\Nestor AI\nestor-ai\`  
> **Master Branch**: `main`  
> **Policy**: Never automatically commit or push without explicit user consent.  
> **Last Verified**: 2026-11-10

---

## 1. Initial Repository Setup

If Git has not yet been initialized in `nestor-ai/`:

```powershell
# Navigate to the repository root
Set-Location "c:\PC\Hardik\Projects\Nestor AI\nestor-ai"

# Initialize Git repository
git init -b main

# Verify .gitignore is in place
git status
```

Verify that `.gitignore` prevents datasets, models, `.venv`, and `node_modules` from being tracked.

---

## 2. Branching & Naming Conventions

All development must follow structured branch naming:

| Prefix | Usage | Example |
|---|---|---|
| `feature/` | New functional capability or algorithm | `feature/ml-histgbm-training` |
| `fix/` | Bug fixes or issue resolution | `fix/zod-coercion-type-mismatch` |
| `docs/` | Documentation additions or updates | `docs/knowledge-base-init` |
| `refactor/` | Code refactoring without changing behavior | `refactor/backend-router-sync-defs` |
| `test/` | Adding or updating automated test suites | `test/add-valuation-schema-tests` |
| `chore/` | Dependency bumps or build tool configuration | `chore/update-tailwind-v4-tokens` |

### Branch Commands
```powershell
# Create and switch to a feature branch
git checkout -b feature/ml-histgbm-training

# Switch back to main
git checkout main

# Synchronize branch with main
git pull --rebase origin main
```

---

## 3. Commit Message Standards (Conventional Commits)

Commit messages must adhere strictly to the [Conventional Commits](https://www.conventionalcommits.org/) standard:

```
<type>(<scope>): <short imperative description>

[optional detailed body explaining context and architectural reason]

[optional footer referencing issue or milestone]
```

### Commit Types
- `feat`: A new user-facing feature or API endpoint.
- `fix`: A bug fix.
- `docs`: Documentation updates only.
- `style`: Formatting, missing semi-colons, no code change.
- `refactor`: Refactoring production code without changing external API contracts.
- `test`: Adding missing tests or refactoring test suites.
- `chore`: Updating tooling, dependencies, or git ignores.

### High-Quality Commit Examples
```
feat(frontend): implement 13-field residential valuation form with zod validation
fix(backend): resolve project root path resolution for model service
docs(kb): create comprehensive architecture and system knowledge base
test(backend): add direct endpoint verification suite in test_api.py
```

---

## 4. Staging, Reviewing Diffs, and Committing

```powershell
# 1. Review status of modified and untracked files
git status

# 2. Inspect line-by-line diffs before staging
git diff

# 3. Stage specific files (avoid blanket `git add .` if unintended files exist)
git add docs/ AGENTS.md README.md

# 4. Review staged diffs
git diff --staged

# 5. Commit with structured message
git commit -m "docs: establish complete project knowledge base and master agent manual"
```

---

## 5. Pushing to GitHub & Pull Requests

```powershell
# Set remote origin (if not already set)
git remote add origin https://github.com/<org-or-user>/nestor-ai.git

# Push main branch with upstream tracking
git push -u origin main

# Push a feature branch
git push -u origin feature/ml-histgbm-training
```

---

## 6. Reusable GitHub Pull Request & Update Template

When opening a Pull Request or writing an issue/release update, use this standard template:

```markdown
## Summary
A concise 2-3 sentence overview of what this PR introduces and why it was built.

## Features Added
- [ ] Feature 1 description
- [ ] Feature 2 description

## Files Changed
- `path/to/file1.tsx`: Description of modification
- `path/to/file2.py`: Description of modification

## Bugs Fixed
- Resolved issue where ...

## Tests Performed
- [ ] `npx tsc --noEmit` passed with 0 errors
- [ ] `npm run build` completed clean Turbopack build
- [ ] `python test_api.py` passed all backend endpoint assertions

## Known Limitations / Issues
- Explain any pending items, stubbed functions, or degraded states

## Next Milestones
- Next planned technical implementation step
```

---

## 7. Version Tagging & Releases

When completing a major project milestone:

```powershell
# Tag a milestone release
git tag -a v0.1.0 -m "Release v0.1.0: Foundation, Next.js UI, and FastAPI skeleton"

# Push tag to GitHub
git push origin v0.1.0
```

