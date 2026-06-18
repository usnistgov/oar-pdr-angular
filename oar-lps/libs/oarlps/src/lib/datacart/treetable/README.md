# Treetable Component

## Overview
The TreetableComponent is an Angular component that displays hierarchical data from a data cart using Angular Material components. It provides a file browser interface for browsing and managing files in a data cart with download capabilities.

## Key Features

### Data Structure
- **CartTreeData Interface**: Defines the data structure for tree nodes with properties like key, name, filetype, cartItem, mediaType, size, zipFile, etc.
- **CartTreeNode Class**: Extends functionality with:
  - `upsertNodeFor()`: Inserts or updates nodes based on DataCartItem
  - `updateData()`: Updates node data from DataCartItem
  - `findNode()`: Finds node by key
  - `cleanNodes()`: Removes nodes not present in the data cart

### Component Functionality
- **Tree Display**: Shows files and collections in a hierarchical tree structure using Angular Material
- **Selection Management**: Allows checkbox selection of files/collections with automatic parent/child selection propagation
- **Dynamic Updates**: Automatically refreshes when the underlying data cart changes (additions, removals, modifications)
- **Download Integration**: 
  - Shows download status with color-coded indicators
  - Provides download links for available files
  - Tracks download progress with spinners
  - Integrates with Google Analytics for download tracking
- **Expand/Collapse Controls**: 
  - Toggle to expand/collapse all nodes
  - Individual node expand/collapse via tree togglers
- **Conditional Display**: 
  - Show/hide zip file names toggle
  - File details popup on click
  - Download details popup for error/status information

### UI Components
- **Header**: Contains expand/collapse all toggle, show/hide zip files toggle, and column headers
- **Body Rows**: For each node:
  - Tree toggler and selection checkbox (with indeterminate state support)
  - File name (clickable for details if in cart)
  - Conditional zip filename display
  - Media type, size columns
  - Download action column with status indicators
- **Responsive Design**: Adjusts column widths and font sizes based on screen width breakpoints
- **Popup Dialogs**: 
  - File details overlay showing name, type, size, description
  - Download details overlay showing file path, download URL, and messages

### Key Behaviors
- Maintains synchronization between UI selections and data cart selection state
- Handles responsive layout changes via window resize events
- Manages download status updates and visual indicators
- Provides keyboard/mouse interactions for expand/collapse and detail viewing
- Clears download statuses via reset functionality
- Tracks platform browser status for environment-specific behavior
- Properly handles parent/child checkbox propagation (checking/unchecking parents affects children)
- Supports indeterminate state for partial selections
- Correctly manages selection state synchronization with data cart (removed conflicting manual updates)

### Dependencies
- Angular framework components
- Angular Material: Tree Table, Dialog, Icon, Checkbox, Progress Spinner
- FontAwesome icons (for status indicators)
- Internal services: CartService, DownloadService, GoogleAnalyticsService
- Utility functions: formatBytes, DisplayPrefs, CartConstants

## Migration Notes
This component has been migrated from using PrimeNG components (p-treeTable, p-overlayPanel, fa-icon) to Angular Material components:
- PrimeNG TreeTable → Angular Material Tree with custom implementation
- PrimeNG OverlayPanel → Angular Material Dialog
- PrimeNG Icons → Angular Material Icons with FontAwesome for status indicators
- PrimeNG Checkbox → Angular Material Checkbox with indeterminate state support
- PrimeNG ProgressSpinner → Angular Material ProgressSpinner

## Usage
The component serves as a file browser interface for the data cart, displaying files in their natural hierarchy (based on file paths) while providing download capabilities, status tracking, and interactive file management features.