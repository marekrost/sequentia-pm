# Project management process

This document governs how all other files in this project folder are created, maintained, and changed. It is the first file in the sequence because it precedes and governs all project content.

Both human contributors and AI agents working on this project must follow these rules.

A new project management template can be reconstructed from this document alone by creating empty files that match the sequence, formats, and column structures defined below.

## File sequence and purpose

| Position | File | Format | Role |
|----------|------|--------|------|
| 00 | process | md | How the project is managed (this document) |
| 01 | charter | md | Why the project exists, what it delivers |
| 02 | principles | md | Design constraints and non-negotiable rules |
| 03 | functional-backlog | csv | What the system does (features) |
| 04 | nonfunctional-backlog | csv | How well the system does it (quality attributes) |
| 05 | technical-profile | md | Technology stack and repository / module architecture |
| 06 | effort-estimates | csv | How much work each module costs |
| 07 | scenarios | md | How users interact with the system |
| 08 | data-models | dbml | The domain structure |
| 09 | licensing | csv | Third-party components and their license obligations |
| 10 | tasks | csv | The work breakdown |
| 11 | schedule | csv | When the work happens |

## File structures

### 01-charter.md

Markdown document with the following sections:

- **Key properties** — table of project metadata (name, owner, platform, license, repository, team size, business language, develop language)
- **Overview** — one-paragraph summary of what the project is
- **Core Philosophy** — the guiding idea behind the project's approach
- **Technical Design** — strategic technology decisions and architecture constraints
- **Goals** — numbered list of measurable project objectives

### 02-principles.md

Markdown document containing numbered entries (P-001, P-002, ...) each with a short title and one-paragraph explanation. Principles are non-negotiable design rules that constrain all downstream decisions.

### 03-functional-backlog.csv

| Column | Description |
|--------|-------------|
| ID | Sequential identifier (F-001, F-002, ...) |
| Category | Functional area (e.g., Core Shell, CSV Editor, Navigation) |
| Requirement | Short name for the capability |
| Priority | 1 = must have, 2 = should have, 3 = wish |
| Status | New, In Progress, Done, Wish (out-of-scope idea retained for future consideration) |
| Source | Origin of the requirement (Design, Roadmap, Stakeholder) |
| Detail | One-sentence description of the behavior, free of implementation specifics |

### 04-nonfunctional-backlog.csv

| Column | Description |
|--------|-------------|
| ID | Sequential identifier (NF-001, NF-002, ...) |
| Category | Quality area (Security, Performance, Reliability, Compatibility, Build, UX, Maintainability) |
| Requirement | Short name for the quality attribute |
| Priority | 1 = must have, 2 = should have, 3 = wish |
| Status | New, In Progress, Done, Wish (out-of-scope idea retained for future consideration) |
| Source | Origin of the requirement |
| Metric | Measurable acceptance criterion, free of implementation specifics |
| Verification | How the metric is tested or confirmed |

### 05-technical-profile.md

Markdown document with the following sections:

- **Technology Stack** — table of strategic technology choices (platform, frameworks, key libraries)
- **Module / File Organization** — how the project repository is structured

### 06-effort-estimates.csv

| Column | Description |
|--------|-------------|
| Module | Name of the work module or component (maps to technical profile directory structure) |
| Category | Functional area it belongs to |
| Min MD | Optimistic estimate in man-days |
| Max MD | Pessimistic estimate in man-days |
| Notes | Scope summary and key risks |

The final row should contain a TOTAL with summed Min MD and Max MD.

### 07-scenarios.md

Markdown document containing numbered user scenarios. Each scenario follows this structure:

- **Title** — "Scenario N: [action description]"
- **Actor** — who performs the action
- **Numbered steps** — sequential user actions and system responses
- **Expected result** — the observable outcome

Scenarios are separated by horizontal rules.

### 08-data-models.dbml

DBML (Database Markup Language) file defining the domain objects that flow through the system. For applications that do not use a database, this file documents the conceptual data model — the structures that exist at runtime, not physical tables.

Each table represents a domain object with typed fields, primary keys, references, and descriptive notes.

### 09-licensing.csv

| Column | Description |
|--------|-------------|
| Component | Package or library name |
| Version | Currently used version |
| License | SPDX license identifier (e.g., MIT, GPL-3.0-only, Apache-2.0) |
| Scope | Runtime or Dev |
| Copyleft | Yes or No — whether the license imposes copyleft obligations |
| Note | Impact on the project's license or other remarks |

The final row should contain a CONCLUSION stating the most restrictive license and its effect on the project's own license.

### 10-tasks.csv

| Column | Description |
|--------|-------------|
| ID | Sequential identifier (T-001, T-002, ...) |
| Task | Short description of the work |
| Phase | Which delivery phase this task belongs to |
| Status | New, In Progress, Done |
| Estimate MD | Estimated effort in man-days |
| Dependencies | Task IDs that must be completed first (e.g., T-001 T-003) |
| Definition of Done | Observable condition that confirms completion |

### 11-schedule.csv

| Column | Description |
|--------|-------------|
| Phase | Phase name (e.g., Phase 0: Scaffolding) |
| Start | Start date (YYYY-MM-DD) |
| End | End date (YYYY-MM-DD) |
| Duration | Elapsed time (e.g., 1d, 2w) |
| Tasks | Space-separated task IDs included in this phase |
| Dependencies | Phase names that must complete first |
| Status | New, In Progress, Done |

## Tiered immutability

The numbered sequence represents a dependency chain. Each file is derived from the ones above it. A change to an earlier file cascades through all later files, making upstream changes progressively more expensive.

The files are grouped into three tiers:

### Tier 1 — Frozen (00–02)

**Process, charter, principles.**

These files define *what the project is*. They are written during project inception and do not change during the development cycle. If these need to change, you are effectively redefining the project — treat it as a new inception.

- Changes require explicit stakeholder sign-off
- Any change invalidates all files in Tier 2 and Tier 3, which must be reviewed for impact
- The bar for change is deliberately high

### Tier 2 — Baselined (03–09)

**Backlogs, technical profile, estimates, scenarios, data models, licensing.**

These files define *what the project delivers and how*. They are elaborated during planning and baselined before execution begins. Changes during execution are possible but controlled.

- Changes must be justified and recorded
- Each change should be assessed for impact on downstream files (especially 10–11)
- Scope additions to backlogs should be flagged as post-baseline and tracked separately (e.g., new priority tier, status marker)
- The data model and scenarios should remain consistent with the backlog — a backlog change may require updates to both
- The licensing file must be updated when dependencies are added or removed, and reviewed for impact on the project's own license

### Tier 3 — Living (10–11)

**Tasks, schedule.**

These files reflect *current operational reality*. They change frequently during execution and are expected to diverge from initial plans.

- Tasks are added, completed, reordered, and re-estimated as work progresses
- The schedule is updated to reflect actual progress
- No approval process required — these are working documents
- However, if task changes reveal that Tier 2 assumptions are wrong, that is a signal to revisit the baseline

## Rules for AI agents

When working on this project, AI agents must:

1. **Never modify Tier 1 files** unless explicitly instructed by the project owner
2. **Flag Tier 2 changes** — if work reveals that a backlog item, estimate, or scenario needs updating, surface it to the human rather than editing directly
3. **Freely update Tier 3 files** — mark tasks as done, add new tasks, update the schedule as work is completed
4. **Respect the cascade** — when a Tier 2 change is approved, check all downstream files for consistency before considering the change complete

## Adding new files

New files may be added to the sequence at any position, but:

- They inherit the tier of their position (e.g., a file at position 04 is Baselined)
- Existing files must be re-numbered to maintain the sequence
- The file sequence table and file structures section in this document must be updated accordingly
