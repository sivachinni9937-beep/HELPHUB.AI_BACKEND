# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

The HelpHub AI team takes security and civic privacy seriously. If you discover a vulnerability or security flaw, please follow these guidelines:

1. **Do not open a public GitHub issue.**
2. Send an email to `security@helphub.local` with details, reproduction steps, and any proof of concept.
3. We will acknowledge receipt within 48 hours and work with you on a resolution.

## Security Principles in HelpHub AI

- **Row Level Security (RLS)** is enforced in Supabase PostgreSQL across all tables.
- **Role Elevation Prevention**: Users cannot self-escalate their roles to `moderator` or `admin`.
- **Location Privacy**: Reports publicly display approximate locations or street junctions. Precise coordinates and home addresses are never exposed without explicit consent.
- **Model Output Sandboxing**: Local Gemma 4 model outputs are strictly validated via Pydantic schemas and treated as untrusted strings. They are never executed directly as SQL, shell commands, or authorization decisions.

