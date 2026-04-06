# Git Workflow and Branching Strategy

## Branch Structure

### Main Branches
- **`main`** - Production releases only. Protected branch.
- **`develop`** - Development integration branch. All features merge here first.

### Supporting Branches

#### Feature Branches
- **Naming**: `feature/<feature-name>`
- **Purpose**: New features and enhancements
- **Branch from**: `develop`
- **Merge to**: `develop`

#### Fix Branches
- **Naming**: `fix/<bug-description>`
- **Purpose**: Bug fixes
- **Branch from**: `develop`
- **Merge to**: `develop`

#### Security Branches
- **Naming**: `security/<security-issue>`
- **Purpose**: Security patches (fast-tracked)
- **Branch from**: `main` or `develop` (depending on severity)
- **Merge to**: `main` (then back to `develop`)

#### Release Branches
- **Naming**: `release/v<version>`
- **Purpose**: Release preparation
- **Branch from**: `develop`
- **Merge to**: `main` and `develop`

## Workflow

### Starting a New Feature
```bash
git checkout develop
git pull origin develop
git checkout -b feature/my-feature
# Make changes
git add .
git commit -m "feat: add my feature"
git push -u origin feature/my-feature
# Create PR to develop
```

### Bug Fix
```bash
git checkout develop
git pull origin develop
git checkout -b fix/bug-description
# Fix bug
git add .
git commit -m "fix: resolve bug description"
git push -u origin fix/bug-description
# Create PR to develop
```

### Security Patch (Critical)
```bash
git checkout main
git pull origin main
git checkout -b security/security-issue
# Fix security issue
git add .
git commit -m "security: patch vulnerability"
git push -u origin security/security-issue
# Create PR to main (expedited review)
```

### Release Process
```bash
# 1. Create release branch
git checkout develop
git pull origin develop
git checkout -b release/v1.0.0

# 2. Update versions and changelog
npm run version:bump
# Update CHANGELOG.md

git add .
git commit -m "chore(release): prepare v1.0.0"

# 3. Merge to main
git checkout main
git merge release/v1.0.0
git tag v1.0.0
git push origin main --tags

# 4. Merge back to develop
git checkout develop
git merge release/v1.0.0
git push origin develop

# 5. Publish packages
npm run publish
```

## Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style/formatting (no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding/updating tests
- `build`: Build system changes
- `ci`: CI/CD changes
- `chore`: Maintenance tasks
- `security`: Security fixes

### Scope (Optional)
- `core`: Core package
- `security`: Security package
- `contracts`: Contracts package
- `metrics`: Metrics package
- `docs`: Documentation
- `deps`: Dependencies

### Examples
```bash
feat(core): add proposal creation client
fix(security): resolve XSS vulnerability in sanitizer
docs: update getting started guide
security(deps): upgrade vulnerable dependency
chore(release): prepare v1.2.0
```

## Protected Branches

### `main` Branch Protection Rules
- Require pull request reviews (1 minimum)
- Require status checks to pass
- Require branches to be up to date
- No direct commits
- Require linear history

### `develop` Branch Protection Rules
- Require pull request reviews (1 minimum)
- Require status checks to pass
- Allow squash merging

## Pull Request Guidelines

1. **Title**: Use conventional commit format
2. **Description**: Explain what and why
3. **Testing**: Document how changes were tested
4. **Breaking Changes**: Clearly mark breaking changes
5. **Related Issues**: Link to related issues/tickets
6. **Screenshots**: Include for UI changes

## Version Tagging

- Tags are created on `main` branch only
- Format: `v<major>.<minor>.<patch>` (e.g., `v1.2.3`)
- Pre-releases: `v<version>-<prerelease>` (e.g., `v1.0.0-beta.1`)
- Follow [Semantic Versioning](https://semver.org/)

## Best Practices

1. **Keep branches short-lived**: Merge within 1-2 days
2. **Small, focused commits**: One logical change per commit
3. **Descriptive commit messages**: Explain why, not just what
4. **Rebase before merging**: Keep history clean
5. **Delete merged branches**: Clean up after merge
6. **Test before pushing**: Ensure tests pass locally
7. **Review your own PR**: Self-review before requesting reviews
