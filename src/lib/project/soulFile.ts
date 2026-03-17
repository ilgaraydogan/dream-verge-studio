const DEFAULT_SOUL_CONTENT = `# Core Themes

## Primary Patterns
(This section will be populated through analysis)

# Symbols

## Recurring Symbols
(Symbols identified across sessions)

# Flags

## Important Observations
(Clinical observations and flags)

# Notes

## General Notes
(Additional clinical notes and observations)
`;

export function createDefaultSoulFile(): string {
  return DEFAULT_SOUL_CONTENT;
}

export function parseSoulFile(content: string): string {
  return content;
}
