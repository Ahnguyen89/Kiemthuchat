# ⚡ Quick Setup Guide - Branch Protection

## 🎯 Goal
**Disable merge button until all PR checks pass**

---

## ✅ 3-Minute Setup

### 1. Push Workflows to Main ✓
```bash
git add .github/workflows/
git commit -m "ci: add PR validation and deployment workflows"
git push origin main
```

### 2. Create Test PR
```bash
git checkout -b test-pr
echo "test" >> README.md
git add README.md
git commit -m "test: branch protection"
git push origin test-pr
```
Then open a PR on GitHub and let it run.

### 3. Set Up Branch Protection

Go to: **GitHub.com → Your Repo → Settings → Branches → Add Rule**

**Copy-paste these settings:**

```
Branch name pattern: main

☑️ Require a pull request before merging
   Number of approvals: 1

☑️ Require status checks to pass before merging
   ☑️ Require branches to be up to date before merging
   
   Required status checks (search and add):
   - PR Validation Status

☑️ Do not allow bypassing the above settings

☑️ Restrict who can push to matching branches
   (Leave empty to force everyone to use PRs)
```

Click **Create**.

---

## 🧪 Test It

1. Open your test PR
2. Check if merge button is disabled
3. Wait for checks to complete
4. Merge button should become enabled

---

## ❌ Still not working?

See detailed guide: `.github/SETUP_BRANCH_PROTECTION.md`

---

## 📝 Status Check Names

If they don't appear in search, type manually:
- `PR Validation Status` ← **Required (always)**
- `Validate Backend` ← Optional (conditional)
- `Validate Frontend` ← Optional (conditional)
- `Validate Shared Package` ← Optional (conditional)

**Pro tip:** Only require `PR Validation Status`. It will fail if any conditional check fails.

---

## 🔧 What We Fixed

✅ Added `permissions` to workflows to fix "Resource not accessible" error
✅ Created PR validation workflow with type-check and build
✅ Updated deploy workflow to only run on main branch push
✅ Created comprehensive documentation

---

**Need help?** Read `.github/SETUP_BRANCH_PROTECTION.md` for detailed troubleshooting.

