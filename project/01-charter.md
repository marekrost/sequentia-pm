# Sequentia PM — Project charter

## Key properties

| Property | Value |
|----------|-------|
| Name | Sequentia Project Manager |
| Business owner (customer) | Marek Rost |
| Business language | English |
| Developer | Marek Rost |
| Developer team size | 1 |
| Development language | English |
| Platform | Electron (cross-platform desktop) |
| License | GPL-3.0 |
| Repository | github: @marekrost/sequentia-pm |

## Overview

Sequentia Project Manager (Sequentia PM) is a local-first, air-gapped, file-driven interface. It transforms a project directory into a unified dashboard by scanning for prefix-numbered files and rendering them as tabs with purpose-built, embedded editors.

## Core Philosophy

Instead of fragmented SaaS tools, Sequentia centralizes project state within a structured sequence of local files. The application acts as a high-performance router, mapping file extensions to specialized editors (e.g., Markdown, CSV, DBML).

## Technical Design

- Version Control Optimized: Default file types are chosen for human-readable diffs, high data density, and zero styling overhead.
- Modular Architecture: The system is built to be extensible; new file types can be integrated as long as a web-compatible viewer or editor exists.
- Process Agnostic: Sequentia provides the toolbox but imposes no specific methodology. It empowers the project architect to design the organizational structure that best fits their needs.

## Goals

1. Provide a unified native interface for software project documentation
2. Enable project management structure that lives inside the project repository
3. Support version control tracking of all project artifacts
4. Operate fully offline with zero network dependencies
