# Straw Programming Language

A modern, efficient, and web-first programming language designed for simplicity and performance.

## Overview

Straw is a new programming language specifically designed for web development, offering:
- Simple and intuitive syntax
- Built-in DOM manipulation
- Advanced performance optimizations
- Strong type system
- First-class web platform integration

## Getting Started

### Prerequisites
- Node.js >= 16
- npm >= 7

### Installation
```bash
npm install -g straw-lang
```

### Quick Start
```straw
component HelloWorld {
    render {
        return create("div") {
            text = "Hello, World!"
        }
    }
}
```

## Development

### Setup
```bash
git clone https://github.com/straw-lang/straw.git
cd straw
npm install
npm run bootstrap
```

### Build
```bash
npm run build
```

### Test
```bash
npm run test
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## Architecture

The project is structured as a monorepo using Lerna, with the following main packages:
- `@straw/compiler`: The Straw compiler
- `@straw/runtime`: The runtime environment
- `@straw/core`: Core language features
- `@straw/cli`: Command-line tools

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
```

## First Steps

1. **Create the repository:**
```bash
mkdir straw-lang
cd straw-lang
git init
```

2. **Initial setup:**
```bash
npm init -y
npm install --save-dev lerna typescript jest @types/node
npx lerna init
```

3. **Configure TypeScript:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist"
  }
}
```

4. **Setup CI:**
```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: actions/setup-node@v2
      with:
        node-version: '16'
    - run: npm ci
    - run: npm run bootstrap
    - run: npm run build
    - run: npm test
```

5. **Create core packages:**
```bash
npx lerna create @straw/compiler
npx lerna create @straw/runtime
npx lerna create @straw/core
npx lerna create @straw/cli
```

6. **Initial compiler implementation:**
```typescript
// packages/compiler/src/index.ts
export class Compiler {
  constructor() {
    // Initialize compiler
  }

  compile(source: string): string {
    // Implement compilation
    return ''
  }
}
```
