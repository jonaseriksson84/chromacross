# Disabled API Routes

This directory contains development/debug API routes that are disabled for production but kept for future use.

## Available Routes (when enabled)

### `analysis.ts`
- **Original path**: `/api/puzzle/analysis`
- **Purpose**: Deep intersection pattern analysis
- **Returns**: Statistics on edge vs middle intersections, position frequencies, letter frequencies
- **Usage**: Analyzing word list intersection patterns for algorithm optimization

### `preview.ts` 
- **Original path**: `/api/puzzle/preview`
- **Purpose**: Generate puzzles for the next 90 days
- **Returns**: Array of 90 daily puzzles with dates, word pairs, intersections
- **Usage**: Testing puzzle generation consistency over time

### `debug-date.ts`
- **Original path**: `/api/puzzle/debug/[date]` (dynamic route)
- **Purpose**: Generate puzzle for any specific date
- **Returns**: Full puzzle with debug information (attempt count, seed, etc.)
- **Usage**: Testing specific dates, debugging algorithm issues
- **Example**: `/api/puzzle/debug/2025-08-20`

## To Re-enable Routes

1. Move the desired `.ts` file back to `/src/pages/api/puzzle/`
2. For `debug-date.ts`, create `/src/pages/api/puzzle/debug/[date].ts`
3. Restart the dev server

## Notes

- Routes are disabled by moving them out of the `/src/pages/` directory
- Files remain intact and ready for immediate use
- No code changes needed - just file location changes
- Keeps production API clean while preserving development tools