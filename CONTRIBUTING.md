# Contributing to Lingo Lotus 🪷

Thank you for your interest in contributing to Lingo Lotus! This guide will help you get started with our development workflow.

## 📋 Development Workflow

We use GitHub Projects to track all work. Follow this workflow to avoid merge conflicts and maintain a clean history.

### 1. Pick an Issue

1. Go to the [Lingo Lotus Project Board](https://github.com/users/cloudy-native/projects/2)
2. Choose an issue from the **To Do** column
3. Move it to **In Progress**
4. Click on the issue to open it

### 2. Create and Checkout Branch

**IMPORTANT:** Always start from an up-to-date `main` branch!

```bash
# 1. Switch to main
git checkout main

# 2. Pull latest changes
git pull origin main

# 3. Create branch in GitHub or locally for the issue
git checkout -b 123-add-new-feature

# Verify you're on the new branch
git branch
```

### 3. Make Your Changes

```bash
# Make your code changes
# Test thoroughly

# Check what changed
git status
git diff

# Add files
git add .

# Commit with descriptive message
git commit -m "Add feature X to solve Y

- Implemented Z
- Fixed issue with W
- Updated tests

Closes #123"
```

### 4. Push Your Branch

```bash
# Push the issue branch to remote
git push origin 123-add-new-feature

# If this is your first push, Git will suggest:
git push --set-upstream origin 123-add-new-feature
```

### 5. Create Pull Request

1. Go to GitHub - you'll see a prompt to create PR
2. Click **"Compare & pull request"**
3. Fill in the PR template:
   - **Title:** Brief description of changes
   - **Description:** What changed and why
   - **Closes:** Link to issue (e.g., "Closes #123")
4. Click **"Create pull request"**

### 6. After PR is Merged

**CRITICAL:** Clean up and sync immediately!

```bash
# 1. Switch back to main
git checkout main

# 2. Pull the merged changes
git pull origin main

# 3. Delete the local branch (it's merged!)
git branch -d 123-add-new-feature

# 4. Delete the remote branch (optional, GitHub can auto-delete)
git push origin --delete 123-add-new-feature
```

---

## 🚨 Avoiding Merge Conflicts

### The Problem

Merge conflicts happen when:
1. You merge a PR on GitHub
2. Your local `main` is now **behind** remote `main`
3. You create a new branch from **outdated** local `main`
4. When you try to merge the next PR, it conflicts with the previous one

### The Solution

**ALWAYS sync `main` before creating a new branch:**

```bash
# ✅ CORRECT WORKFLOW
git checkout main
git pull origin main          # ← CRITICAL! Updates your local main
git checkout -b new-feature   # ← Now based on latest code

# ❌ WRONG WORKFLOW (causes conflicts)
git checkout main
# (skipping git pull)         # ← Your main is outdated!
git checkout -b new-feature   # ← Based on old code = conflicts later
```

### Quick Reference

```bash
# Starting new work? Run this EVERY TIME:
git checkout main && git pull origin main && git checkout -b issue-branch

# Finished work? Clean up:
git checkout main && git pull origin main && git branch -d issue-branch
```

---

## 📝 Commit Message Guidelines

Write clear, descriptive commit messages:

### Format

```
Short summary (50 chars or less)

More detailed explanation if needed. Wrap at 72 characters.
Explain what changed and why, not how.

- Bullet points are fine
- Use present tense ("Add feature" not "Added feature")
- Reference issues with #123

Closes #123
```

### Examples

**Good:**
```
Add lazy loading to images on homepage

Implemented LazyImage component with Intersection Observer
to improve initial page load performance. Images now load
only when they enter the viewport.

Closes #45
```

**Bad:**
```
fixed stuff
```

---

## 🧪 Testing

Before creating a PR:

```bash
# Run type checking
pnpm run typecheck

# Run linting
pnpm run lint

# Fix formatting
pnpm run format:fix

# Test the build
pnpm run build

# Test locally
pnpm run develop
```

---

## 🔄 Handling Merge Conflicts

If you do encounter conflicts:

### During Rebase

```bash
# If you get conflicts during git pull --rebase
git status                    # See conflicting files
# Edit files to resolve conflicts
git add .                     # Stage resolved files
git rebase --continue         # Continue the rebase

# If you want to abort
git rebase --abort
```

### During PR Merge

If GitHub shows conflicts:

```bash
# 1. Update your branch with latest main
git checkout your-branch
git fetch origin
git rebase origin/main        # Or: git merge origin/main

# 2. Resolve conflicts
# Edit conflicting files
git add .
git rebase --continue         # If using rebase
# Or: git commit              # If using merge

# 3. Force push (rebase changes history)
git push --force-with-lease origin your-branch
```

---

## 🎯 Best Practices

### Do's ✅

- **Always** pull `main` before creating a new branch
- **Always** work in feature branches, never directly on `main`
- Write descriptive commit messages
- Keep commits focused and atomic
- Test your changes before pushing
- Delete branches after they're merged
- Link PRs to issues with "Closes #123"

### Don'ts ❌

- **Never** work directly on `main` branch
- **Never** force push to `main`
- **Never** create branches from outdated `main`
- **Never** commit without testing
- **Never** leave merged branches hanging around
- **Never** skip `git pull` before starting new work

---

## 🆘 Common Issues

### "Your branch has diverged"

```bash
# Your local main is behind remote main
git checkout main
git pull origin main
```

### "Cannot delete branch - not fully merged"

```bash
# Branch was merged via PR but Git doesn't know
git branch -D branch-name     # Force delete (safe if merged on GitHub)
```

### "Merge conflict in..."

```bash
# You forgot to sync main before creating branch
git checkout main
git pull origin main
git checkout your-branch
git rebase main              # Rebase onto latest main
# Resolve conflicts, then:
git add .
git rebase --continue
git push --force-with-lease origin your-branch
```

---

## 📚 Additional Resources

- [GitHub Flow Guide](https://guides.github.com/introduction/flow/)
- [Git Branching Best Practices](https://git-scm.com/book/en/v2/Git-Branching-Branching-Workflows)
- [Writing Good Commit Messages](https://chris.beams.io/posts/git-commit/)

---

## 🤝 Questions?

If you have questions or run into issues:
1. Check this guide first
2. Search existing issues
3. Ask in the issue you're working on
4. Create a new issue if needed

---

**Happy coding! 🪷**
