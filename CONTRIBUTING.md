# Contributing to HelpHub AI

Thank you for your interest in contributing to **HelpHub AI — Community Problem Solver**! We warmly welcome contributions from citizens, students, developers, designers, and open-source enthusiasts.

## Code of Conduct

All contributors and maintainers are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting Started

1. **Fork the repository** on GitHub.
2. **Clone your fork**:
   ```bash
   git clone https://github.com/your-username/helphub-ai.git
   cd helphub-ai
   ```
3. **Follow the Setup Guide** in [README.md](README.md) to install backend and frontend dependencies.

## Good First Issues

If you are a newcomer to open source, look for issues tagged with `good first issue` or `hacktoberfest`. These are beginner-friendly tasks such as:
- Adding additional Odia or Hindi translations in `src/lib/i18n.ts`
- Expanding accessibility tests for WCAG 2.2 AA compliance
- Improving mobile responsive layouts
- Adding civic issue categories in PostgreSQL migration schemas

## Development Workflow

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Run backend tests:
   ```bash
   backend\.venv\Scripts\pytest backend\tests -v
   ```
3. Run frontend tests & build checks:
   ```bash
   cd frontend
   npm run test
   npm run build
   ```
4. Commit your changes using conventional commit messages (e.g., `feat: add Odia translations for complaint generator`).
5. Push to your branch and open a Pull Request using the [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md).

## Security & Responsible AI

- Never commit real private keys, Supabase service-role keys, or tokens.
- Keep Ollama Gemma 4 prompts grounded in citizen observation. Do not ask the model to invent facts, laws, or official government endorsements.

