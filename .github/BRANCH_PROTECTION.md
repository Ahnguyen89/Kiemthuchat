# Branch Protection Setup

## Overview

This repository uses GitHub Actions to validate PRs before they can be merged. This document explains how to set up branch protection rules to enforce these checks.

## Workflows

### 1. PR Validation (`pr-check.yml`)
Runs automatically on every pull request to `main`:
- ✅ Type checking
- ✅ Build validation
- Runs for: Backend, Frontend, and Shared package (based on changed files)

### 2. Production Release (`deploy.yml`)
Runs automatically when code is pushed to `main`:
- ✅ Lint and type check
- 🚀 Build and push Docker images to ECR
- 🚀 Deploy to AWS ECS
- 📊 Run database migrations (backend only)

## Setting Up Branch Protection

To require PR validation checks before merging, follow these steps:

### 1. Navigate to Branch Protection Settings
1. Go to your repository on GitHub
2. Click **Settings** → **Branches**
3. Under "Branch protection rules", click **Add rule**

### 2. Configure Protection Rule

**Branch name pattern:**
```
main
```

**Required Settings:**

✅ **Require a pull request before merging**
   - Required approvals: 1 (optional, adjust as needed)
   - Dismiss stale pull request approvals when new commits are pushed: ✅

✅ **Require status checks to pass before merging**
   - Require branches to be up to date before merging: ✅
   
   **Required status checks** (add these):
   - `Validate Shared Package`
   - `Validate Backend`
   - `Validate Frontend`
   - `PR Validation Status`

✅ **Require conversation resolution before merging** (optional)

✅ **Do not allow bypassing the above settings**

✅ **Restrict who can push to matching branches** (optional)
   - Add specific users/teams who can push directly to main

### 3. Save Changes
Click **Create** or **Save changes**

## How It Works

### When a PR is Created/Updated:
1. GitHub automatically runs the `pr-check.yml` workflow
2. The workflow detects which parts of the codebase changed
3. It runs validation for the affected areas:
   - **Shared Package Changed**: Runs lint, type-check, and build for shared package
   - **Backend Changed**: Runs lint, type-check, and build for backend (+ shared)
   - **Frontend Changed**: Runs lint, type-check, and build for frontend (+ shared)
4. If any check fails, the "Merge" button is disabled
5. Once all checks pass, the PR can be merged

### When a PR is Merged:
1. Code is pushed to `main` branch
2. GitHub automatically runs the `deploy.yml` workflow
3. The workflow:
   - Runs validation tests
   - Builds Docker images
   - Pushes to Amazon ECR
   - Deploys to AWS ECS
   - Runs database migrations (if backend changed)

## Status Check Names

The following status checks will appear on your PRs:

- **Detect Changes**: Determines which parts of the codebase changed
- **Validate Shared Package**: Validates shared package (if changed)
- **Validate Backend**: Validates backend code (if changed)
- **Validate Frontend**: Validates frontend code (if changed)
- **PR Validation Status**: Overall validation status (required)

## Troubleshooting

### Status checks not appearing?
- Make sure you've pushed the workflow files to the `main` branch
- Create a test PR to trigger the workflow for the first time
- Wait a few minutes for GitHub to recognize the new workflows

### Can't find status checks when setting up branch protection?
- The status checks only appear after they've run at least once
- Create and push a test PR first, then set up branch protection

### Want to skip checks for urgent hotfixes?
- Admin users can bypass branch protection if enabled in settings
- Alternatively, create an "Allow specified actors to bypass required pull requests" rule

## Best Practices

1. **Always create PRs** for changes to `main` - never push directly
2. **Wait for all checks to pass** before requesting review
3. **Fix validation errors** locally before pushing to save CI time
4. **Keep PRs small** for faster validation and review
5. **Run checks locally** before pushing:
   ```bash
   # Shared package
   cd packages/shared && npm run lint && npm run type-check && npm run build
   
   # Backend
   cd apps/api && npm run lint && npm run type-check && npm run build
   
   # Frontend
   cd apps/web && npm run lint && npm run type-check && npm run build
   ```

## Local Development Tips

### Pre-push Validation Script
Add this to your `package.json` scripts (root level):

```json
{
  "scripts": {
    "validate": "npm run validate:shared && npm run validate:api && npm run validate:web",
    "validate:shared": "cd packages/shared && npm run lint && npm run type-check && npm run build",
    "validate:api": "cd apps/api && npm run lint && npm run type-check",
    "validate:web": "cd apps/web && npm run lint && npm run type-check"
  }
}
```

Then run before pushing:
```bash
npm run validate
```

## Need Help?

If you encounter any issues with the CI/CD pipeline, check:
1. GitHub Actions logs in the repository
2. AWS CloudWatch logs for deployment issues
3. Contact the DevOps team for AWS access issues

