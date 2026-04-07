#!/usr/bin/env bash
# Publish Script for SFSec SDK

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
${NC}"    echo -e "\n${BLUE}
    echo -e "${BLUE}  $1${NC}"
${NC}\n"    echo -e "${BLUE}
}

print_success() { echo -e "${ $1${NC}"; }GREEN}
print_error() { echo -e "${ $1${NC}"; }RED}
print_info() { echo -e "${         $1${NC}"; }BLUE}

check_branch() {
    print_header "Checking Git Branch"
    local current_branch=$(git rev-parse --abbrev-ref HEAD)
    if [ "$current_branch" != "main" ]; then
        print_error "Must be on 'main' branch to publish"
        exit 1
    fi
    print_success "On main branch"
}

check_git_status() {
    print_header "Checking Git Status"
    if ! git diff-index --quiet HEAD --; then
        print_error "Uncommitted changes detected"
        exit 1
    fi
    print_success "Working directory clean"
}

run_tests() {
    print_header "Running Tests"
    if ! npm test; then
        print_error "Tests failed"
        exit 1
    fi
    print_success "All tests passed"
}

publish_packages() {
    print_header "Publishing Packages"
    if ! npx lerna publish; then
        print_error "Publish failed"
        exit 1
    fi
    print_success "Packages published!"
}

main() {
    echo -e "\n${GREEN}SFSec SDK Publishing Script${NC}\n"
    check_branch
    check_git_status
    run_tests
    publish_packages
}

main
