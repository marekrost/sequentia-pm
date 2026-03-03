# Project instructions

## Project management

This project is managed via structured files in `project/`.

**Always read `project/00-process.md` at the start of any PM-related work.** It defines the file sequence, formats, column structures, tiered immutability rules, and AI agent rules that govern all project files.

Key rules from the process:

- **Tier 1 (00–02)**: Frozen. Never modify unless the project owner explicitly instructs it.
- **Tier 2 (03–09)**: Baselined. Flag needed changes to the human; do not edit directly.
- **Tier 3 (10–11)**: Living. Freely update tasks and schedule as work progresses.
- Respect the cascade: upstream changes invalidate downstream files.

When creating or modifying any PM file, follow the exact column structures and formats defined in `00-process.md`.
