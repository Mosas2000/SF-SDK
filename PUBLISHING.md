# Release Checklist

This checklist ensures smooth and secure releases of SFSec SDK packages.

## Pre-Release

### Code Quality
- [ ] All tests passing (`npm test`)
- [ ] Build succeeds for all packages (`npm run build`)
- [ ] No TypeScript errors
- [ ] Linter checks pass (`npm run lint`)
- [ ] No console.log or debug statements in production code

### Security
- [ ] Run security audit (`npm audit --workspaces`)
- [ ] No high/critical vulnerabilities
- [ ] Snyk scan passes (if configured)
- [ ] Review dependency updates
- [ ] Check for leaked secrets/credentials

### Documentation
- [ ] README files updated for changed packages
- [ ] API documentation reflects new changes
- [ ] CHANGELOG updated with release notes
- [ ] Breaking changes clearly documented
- [ ] Migration guide provided (if breaking changes)

### Version Management
- [ ] Decide on version bump (patch/minor/major)
- [ ] Update version in affected package.json files
- [ ] Version follows semver conventions
- [ ] Git tag matches version number

## Release

### Preparation
```bash
# 1. Ensure working directory is clean
git status

# 2. Pull latest changes
git checkout main
git pull origin main

# 3. Create release branch
git checkout -b release/v0.1.0

# 4. Install dependencies
npm ci

# 5. Build all packages
npm run build

# 6. Run all tests
npm test

# 7. Run security audit
npm audit --workspaces --audit-level=moderate
```

### Versioning with Lerna

```bash
# Interactive version bump (recommended)
npx lerna version --conventional-commits

# Or specify version manually
npx lerna version patch   # 0.1.0 -> 0.1.1
npx lerna version minor   # 0.1.0 -> 0.2.0
npx lerna version major   # 0.1.0 -> 1.0.0

# Preview changes without committing
npx lerna version --no-push --no-git-tag-version
```

### Publishing to NPM

```bash
# Option 1: Publish with Lerna (recommended)
npx lerna publish from-package

# Option 2: Publish via Git tag (triggers GitHub Actions)
git tag v0.1.0
git push origin v0.1.0
# GitHub Actions will automatically publish

# Option 3: Manual publish (not recommended)
cd packages/security && npm publish
cd packages/core && npm publish
cd packages/contracts && npm publish
cd packages/metrics && npm publish
```

### Create GitHub Release

```bash
# Tag the release
git tag -a v0.1.0 -m "Release v0.1.0"
git push origin v0.1.0

# Or use GitHub CLI
gh release create v0.1.0 \
  --title "v0.1.0" \
  --notes "$(cat CHANGELOG.md)"
```

## Post-Release

### Verification
- [ ] Check packages on NPM
  - [ ] @sfsec/core
  - [ ] @sfsec/security
  - [ ] @sfsec/contracts
  - [ ] @sfsec/metrics
- [ ] Verify package versions match
- [ ] Test installation: `npm install @sfsec/core@latest`
- [ ] Verify README displays correctly on NPM
- [ ] Check package size is reasonable

### Communication
- [ ] Update GitHub release notes
- [ ] Post announcement (if applicable)
- [ ] Update documentation site (if live)
- [ ] Notify stakeholders/users

### Cleanup
- [ ] Merge release branch to main
- [ ] Delete release branch
- [ ] Update develop branch
- [ ] Archive old versions (if needed)

## Rollback Procedure

If a release needs to be rolled back:

### NPM Deprecation
```bash
# Deprecate a version
npm deprecate @sfsec/core@0.1.0 "This version has been deprecated. Please upgrade to 0.1.1"

# Unpublish within 24 hours (use sparingly)
npm unpublish @sfsec/core@0.1.0
```

### Git Revert
```bash
# Revert the tag
git tag -d v0.1.0
git push origin :refs/tags/v0.1.0

# Revert commits if needed
git revert <commit-hash>
git push origin main
```

## Release Types

### Patch Release (0.1.0 → 0.1.1)
- Bug fixes
- Documentation updates
- Performance improvements
- No breaking changes

**Example Changelog:**
```markdown
## [0.1.1] - 2026-04-07
### Fixed
- Fixed validation edge case in isPrincipal
- Corrected sanitization for nested HTML

### Changed
- Improved error messages in ContractConverter
```

### Minor Release (0.1.0 → 0.2.0)
- New features
- New APIs (backward compatible)
- Deprecations (with migration path)

**Example Changelog:**
```markdown
## [0.2.0] - 2026-04-07
### Added
- New pollTxStatusBatch for parallel polling
- Added staking rewards calculator

### Deprecated
- oldMethodName (use newMethodName instead)
```

### Major Release (0.1.0 → 1.0.0)
- Breaking changes
- API redesign
- Major new features

**Example Changelog:**
```markdown
## [1.0.0] - 2026-04-07
### Breaking Changes
- Renamed InputValidator to SecurityValidator
- Changed sanitizeText return type from string to SanitizedText
- Removed deprecated methods

### Migration Guide
See MIGRATION.md for upgrade instructions
```

## Troubleshooting

### Common Issues

**NPM publish fails with authentication error:**
```bash
# Login to NPM
npm login

# Verify authentication
npm whoami

# Check NPM token
echo $NPM_TOKEN
```

**Lerna version fails:**
```bash
# Ensure main branch is up to date
git checkout main
git pull origin main

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Tests fail in CI but pass locally:**
```bash
# Use exact Node version from CI
nvm use 20

# Clear caches
npm cache clean --force
rm -rf node_modules package-lock.json
npm ci
```

## Emergency Hotfix Procedure

For critical security or bug fixes:

```bash
# 1. Create hotfix branch from main
git checkout main
git checkout -b hotfix/security-fix

# 2. Make fix and test
# ... make changes ...
npm test

# 3. Commit with descriptive message
git commit -m "security: fix XSS vulnerability in sanitizeText"

# 4. Version as patch
npx lerna version patch --yes

# 5. Publish immediately
npx lerna publish from-package --yes

# 6. Merge to main and develop
git checkout main
git merge hotfix/security-fix
git push origin main

git checkout develop
git merge hotfix/security-fix
git push origin develop

# 7. Create GitHub release with security notice
gh release create v0.1.1 \
  --title "Security Release v0.1.1" \
  --notes "SECURITY FIX: Addresses XSS vulnerability. Please upgrade immediately."
```

## Checklist Template

Copy this for each release:

```markdown
## Release v0.x.x Checklist

**Pre-Release**
- [ ] Tests passing
- [ ] Build succeeds
- [ ] Security audit clean
- [ ] Documentation updated
- [ ] Changelog updated

**Release**
- [ ] Version bumped
- [ ] Published to NPM
- [ ] Git tagged
- [ ] GitHub release created

**Post-Release**
- [ ] Verified on NPM
- [ ] Installation tested
- [ ] Announcement posted
- [ ] Branches cleaned up
```

## Resources

- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Lerna Documentation](https://lerna.js.org/)
- [NPM Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
