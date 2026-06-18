# Changelog

## [Unreleased]

### Changed
- Migrated from PrimeNG components to Angular Material components
  - Replaced p-treeTable with custom Angular Material tree implementation
  - Replaced p-overlayPanel with mat-dialog
  - Replaced fa-icon with mat-icon (keeping FontAwesome for status indicators)
  - Replaced p-treeTableToggler with mat-icon buttons
  - Replaced p-treeTableCheckbox with mat-checkbox
  - Replaced p-progressSpinner with mat-progress-spinner
- Updated styling to work with Angular Material
- Maintained all original functionality

### Fixed
- Fixed parent/child checkbox propagation: when a parent node is checked/unchecked, all children now correctly follow the parent state
- Added indeterminate state support for checkboxes when some children are selected
- Fixed TypeScript errors related to null/undefined checks
- Added proper Input decorator import
- Fixed various type mismatches in the TypeScript code
- **Fixed manual selectedData updates in onCheckboxChange that were conflicting with cartChanged updates** - removed manual selectedData array modifications, letting cartChanged handle data synchronization exclusively
- **Fixed logic in onCheckboxChange** - removed redundant selectedData push/splice operations that were causing state conflicts
- **Fixed parent state calculation** - corrected the logic for determining when all/none/some children are selected

### Files Modified
- treetable.component.ts - Complete rewrite to use Angular Material with proper parent/child checkbox propagation and fixed selectedData handling
- treetable.component.html - Updated to use Angular Material syntax with indeterminate state support
- treetable.component.css - Updated styles for Angular Material
- README.md - Updated documentation to reflect Angular Material usage
- SUMMARY.txt - Updated summary to reflect Angular Material usage
- CHANGELOG.md - Updated to document the fixes