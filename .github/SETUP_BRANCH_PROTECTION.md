# 🔒 Branch Protection Setup - Step by Step

## ⚠️ IMPORTANT: Required Setup to Block Merging Until Checks Pass

This guide will help you set up branch protection rules so that the **Merge button is disabled** until all PR validation checks pass.

---

## 📋 Prerequisites

Before setting up branch protection:
1. Push these workflow files to your `main` branch
2. Create a test PR to trigger the workflows at least once
3. Wait for the workflows to complete (this registers the status checks with GitHub)

---

## 🚀 Step-by-Step Setup

### Step 1: Navigate to Repository Settings

1. Open your GitHub repository in a browser
2. Click on **Settings** (top right, next to "About")
   
   ![Settings Location](https://docs.github.com/assets/cb-28266/images/help/repository/repo-actions-settings.png)

### Step 2: Access Branch Protection Rules

1. In the left sidebar, click **Branches** (under "Code and automation")
2. Look for the "Branch protection rules" section
3. Click the **Add rule** button

### Step 3: Configure the Branch Pattern

In the "Branch name pattern" field, enter:
```
main
```

This will apply the rule to your main branch.

### Step 4: Enable Required Settings

Check the following boxes in order:

#### ✅ 1. Require a pull request before merging
- Check this box
- **Required number of approvals before merging**: Set to `1` (or your preferred number)
- ✅ **Dismiss stale pull request approvals when new commits are pushed** (recommended)
- ✅ **Require review from Code Owners** (optional, if you have CODEOWNERS file)

#### ✅ 2. Require status checks to pass before merging
- **This is the CRITICAL setting that disables the merge button!**
- Check this box
- ✅ **Require branches to be up to date before merging** (recommended)

#### 3. Add Required Status Checks
In the search box under "Status checks that are required", search for and add these:

**Required Status Checks (select ALL that apply to your changes):**
- [ ] `Validate Shared Package` - Appears when shared package changes
- [ ] `Validate Backend` - Appears when backend code changes  
- [ ] `Validate Frontend` - Appears when frontend code changes
- [x] `PR Validation Status` - **ALWAYS REQUIRED** (final validation status)

**Important Notes:**
- Status checks only appear in this list AFTER they've run at least once
- If you don't see them, create a test PR first, let it run, then come back here
- You can also type the exact name if it doesn't appear in search

#### ✅ 4. Require conversation resolution before merging (Optional but Recommended)
- Check this box to ensure all PR comments are resolved before merging

#### ✅ 5. Do not allow bypassing the above settings (Recommended)
- Check this box to enforce rules for everyone, including admins
- **OR** use "Allow specified actors to bypass required pull requests" for specific users/teams

#### 6. Other Optional Settings
- [ ] **Require deployments to succeed before merging** - Only if you have deployment environments
- [ ] **Require signed commits** - For additional security
- [ ] **Require linear history** - Prevents merge commits
- [ ] **Lock branch** - Makes branch read-only (not recommended for main)

### Step 5: Restrict Push Access (Highly Recommended)

Scroll down to:

#### ✅ Restrict who can push to matching branches
- Check this box
- Click "Add" and select users/teams who should have direct push access
- **Recommended**: Leave empty or add only CI/CD service accounts
- This prevents direct pushes to main, forcing everyone to use PRs

### Step 6: Save the Rule

1. Scroll to the bottom
2. Click **Create** button
3. Confirm your settings

---

## ✅ Verification

### Test Your Branch Protection:

1. **Create a Test PR:**
   ```bash
   git checkout -b test-branch-protection
   echo "# Test" >> TEST.md
   git add TEST.md
   git commit -m "test: verify branch protection"
   git push origin test-branch-protection
   ```

2. **Open PR on GitHub**
   - Go to your repository
   - Click "Pull requests" → "New pull request"
   - Select your test branch
   - Create the PR

3. **Verify Merge Button is Disabled:**
   - You should see: "Merging is blocked"
   - Required checks are shown with "Required" label
   - Merge button should be **grayed out** or show "Merge when ready"

4. **Wait for Checks to Complete:**
   - Watch the PR checks run
   - Once all pass, you'll see green checkmarks
   - Merge button becomes enabled

---

## 🔍 What You Should See

### ❌ When Checks Are Running or Failed:
```
Merging is blocked
  - Required status check "PR Validation Status" is in progress
  
[Merge pull request] ← Button is DISABLED/Grayed out
```

### ✅ When All Checks Pass:
```
All checks have passed
  ✓ Validate Backend — succeeded
  ✓ Validate Frontend — succeeded  
  ✓ PR Validation Status — succeeded
  
[Merge pull request] ← Button is ENABLED/Green
```

---

## 🐛 Troubleshooting

### Problem: Status checks don't appear in the list

**Solution:**
1. Make sure workflows are in the `main` branch
2. Create a test PR to trigger the workflows
3. Let the workflows complete successfully
4. Go back to branch protection settings
5. The status checks should now appear in the search

**Alternative:** Type the exact status check name manually:
- `PR Validation Status`
- `Validate Backend`
- `Validate Frontend`
- `Validate Shared Package`

### Problem: Merge button is still clickable

**Possible causes:**
1. ❌ Branch protection rule not saved
2. ❌ "Require status checks to pass before merging" not checked
3. ❌ No required status checks selected
4. ❌ You're an admin and "Do not allow bypassing" is unchecked

**Solution:**
1. Verify the branch protection rule exists (Settings → Branches)
2. Click "Edit" on the main branch rule
3. Ensure "Require status checks to pass" is checked
4. Ensure at least "PR Validation Status" is selected
5. Check "Do not allow bypassing" if you're an admin

### Problem: "Resource not accessible by integration" error

**This has been FIXED** - The workflow now includes proper permissions:
```yaml
permissions:
  contents: read
  pull-requests: read
```

### Problem: Checks always skipped

**Cause:** No files changed in the monitored paths

**Solution:** The workflow only runs when these paths change:
- `apps/api/**`
- `apps/web/**`
- `packages/shared/**`
- `.github/workflows/**`

If you change other files, checks are skipped (this is by design).

---

## 📊 Required Status Checks Summary

These are the workflow job names that need to be added as required checks:

| Status Check Name | When It Runs | Required? |
|-------------------|--------------|-----------|
| `Detect Changes` | Always | No (internal) |
| `Validate Shared Package` | When `packages/shared/**` changes | Conditional |
| `Validate Backend` | When `apps/api/**` or shared changes | Conditional |
| `Validate Frontend` | When `apps/web/**` or shared changes | Conditional |
| `PR Validation Status` | Always (final check) | **YES - ALWAYS** |

**Recommendation:** Set `PR Validation Status` as the only required check. It will fail if any of the conditional checks fail.

---

## 🎯 Quick Setup Checklist

- [ ] Workflows pushed to `main` branch
- [ ] Test PR created to register status checks
- [ ] Navigate to Settings → Branches
- [ ] Click "Add rule" for `main` branch
- [ ] ✅ Require pull request before merging
- [ ] ✅ Require status checks to pass before merging
- [ ] ✅ Add `PR Validation Status` as required check
- [ ] ✅ Do not allow bypassing (for admins)
- [ ] ✅ Restrict who can push to matching branches
- [ ] Click "Create" to save
- [ ] Test with a new PR to verify merge button behavior

---

## 🔗 Additional Resources

- [GitHub Docs: Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub Docs: Required Status Checks](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches#require-status-checks-before-merging)
- [GitHub Actions Permissions](https://docs.github.com/en/actions/using-jobs/assigning-permissions-to-jobs)

---

## 💡 Pro Tips

1. **Start with minimal required checks**: Just require `PR Validation Status`
2. **Test thoroughly**: Create test PRs with intentional errors to verify blocking works
3. **Use draft PRs**: For work-in-progress that shouldn't be merged yet
4. **Enable auto-merge**: Once checks pass, PR can auto-merge if enabled
5. **Monitor workflow costs**: GitHub Actions have usage limits on free plans

---

## 🆘 Need Help?

If you're still having issues:
1. Check GitHub Actions logs for detailed error messages
2. Verify repository settings permissions
3. Ensure you have admin access to the repository
4. Check if organization settings override repository settings
5. Create a GitHub support ticket if problems persist

---

**Last Updated:** October 2025
**Workflow Version:** v1.0

