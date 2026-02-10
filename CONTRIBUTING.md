# Contributing to LiteGUI.ts

Thank you for your interest in contributing to LiteGUI.ts! This document outlines the guidelines for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Submitting Changes](#submitting-changes)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

### Prerequisites

- Node.js >= 24.13.0
- npm >= 11.6.0

### Setting Up Development Environment

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/litegui.ts.git
   cd litegui.ts
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Development Workflow

### Building the Project

```bash
npm run build
```

This will create the distribution files in the `dist/` directory.

### Running Development Server

```bash
npm run dev
```

This will start a local development server with hot reloading.

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
npm run lint -- --fix  # Auto-fix issues where possible
```

## Coding Standards

### TypeScript Style Guide

- Use TypeScript strict mode
- Prefer interfaces over type aliases for object definitions
- Use `const` over `let` where possible
- Use async/await over raw promises
- Add type annotations for function parameters and return types

### File Organization

- Source files go in `src/`
- Tests go in `tests/`
- Each component should have its own directory when it has multiple files

### Naming Conventions

- **Files**: kebab-case for files (`my-component.ts`)
- **Classes**: PascalCase (`class MyComponent {}`)
- **Constants**: UPPER_SNAKE_CASE
- **Variables/Functions**: camelCase

### Documentation

- Use JSDoc comments for public APIs
- Include parameter descriptions and return types
- Add examples for complex functions

## Submitting Changes

### Pull Request Process

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/my-new-feature
   ```

2. Make your changes and commit them, the commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) standard:
   ```bash
   git add .
   git commit -m "feat(inspector): add color picker widget"
   ```

3. Push to your fork:
   ```bash
   git push origin feature/my-new-feature
   ```

4. Open a Pull Request against the `main` branch

5. Ensure all tests pass and CI checks are green

### Commit Message Guidelines

Commit messages are automatically validated using [commitlint](https://commitlint.js.org/).

**Format:**

```
<type>(<scope>): <description>
```

**Common types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`, `build`, `perf`.

**Examples:**

```
feat(inspector): add color picker widget
fix(tree): prevent infinite loop on drag
docs: update contributing guidelines
chore: upgrade TypeScript to 5.9
```

- Keep the first line under 72 characters
- Reference issues using `#123` syntax

### Code Review

All submissions require review before merging. Please be patient and responsive to feedback.

## Reporting Bugs

When reporting bugs, please include:

1. A clear description of the problem
2. Steps to reproduce the issue
3. Expected behavior vs actual behavior
4. Version information (Node.js, npm, litegui.ts)
5. Browser/OS if applicable
6. A minimal reproduction example if possible

Use the [GitHub Issues](https://github.com/AlvaroEstradaDev/litegui.ts/issues) page to report bugs.

## Feature Requests

Feature requests are welcome! Please:

- Clearly describe the feature
- Explain the use case and motivation
- Consider if it aligns with the project goals
- Provide pseudo-code or examples if helpful

## Questions?

If you have questions, feel free to open an issue for discussion.
