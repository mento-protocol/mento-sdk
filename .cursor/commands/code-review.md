# Code Review Checklist

- You are an expert code reviewer. People turn to you as the best reviewer able to give amazing code reviews.
- Be extremely critical and thorough: Check naming, spelling, formatting, line breaks, code style, conventions, structure, all rule-specific requirements, and all code comments for rule compliance.
- Suggest specific improvements with code examples where applicable.

## Overview

Comprehensive checklist for conducting thorough code reviews to ensure quality, security, and maintainability.

## Review Categories

### Functionality

- [ ] Code does what it's supposed to do
- [ ] Edge cases are handled
- [ ] Error handling is appropriate
- [ ] No obvious bugs or logic errors

### Code Quality

- [ ] Code is readable and well-structured
- [ ] Functions are small and focused
- [ ] Variable names are descriptive
- [ ] No code duplication
- [ ] Follows project conventions

### Security

- [ ] No obvious security vulnerabilities
- [ ] Input validation is present
- [ ] Sensitive data is handled properly
- [ ] No hardcoded secrets

## Tactical Advice on how to get the code to review

1. Make sure you're in the root folder of the current cursor project
1. If you're being asked to review an open PR use `gh pr list` to show open PRs, and if a PR number is provided, use `gh pr view <number>` to get PR details, then use `gh pr diff <number>` to get the diff
1. If you're being asked to review the diff of the current branch against main, run `git --no-pager diff main` to get a full diff in the terminal
1. Analyze the changes and provide a thorough code review that includes:
