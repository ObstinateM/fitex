# LaTeX Compilation

## Purpose

Compiles modified LaTeX source into a PDF. Uses an external compilation service - no local LaTeX installation required.

## Key Characteristics

- External service: `https://latex.ytotech.com/builds/sync`
- Supports multiple compilers: pdflatex, xelatex, lualatex
- Template files (classes, styles, images) sent alongside main content
- Security: dangerous LaTeX commands blocked before sending
- Error logs parsed for user-friendly display

## Sub-features

- [Compilation Service](./compilation-service.md) - External API details
- [Security](./security.md) - Dangerous command blocking
- [Error Parsing](./error-parsing.md) - LaTeX log parsing
