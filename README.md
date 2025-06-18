# 📊 Interactive Data Table with Range Selection

A React implementation of a data table with drag-to-select functionality, inspired by spreadsheet applications like Excel or Google Sheets.

## ✨ Core Features

- **🖱️ Multi-cell range selection** with visual feedback
- **📋 Clipboard integration** for copying selected data
- **📁 CSV export** of selected ranges
- **🔀 Column sorting** with visual indicators
- **🔍 Role-based filtering** with modal interface
- **⌨️ Keyboard shortcuts** (Escape to clear selection)
- **👆 Click-outside detection** for UX polish

## 🛠️ Technical Implementation

### 🎯 Range Selection Logic

The selection system uses a coordinate-based approach with alpha/omega cell tracking. This maintains selection state independent of data mutations (sorting/filtering) and enables efficient range calculations using coordinate bounds.

### ⚡ Event Handling Strategy

Uses `onMouseDown` to initialize, `onMouseEnter` to extend selection during drag, and `onMouseUp` to finalize. Chose `onMouseEnter` over `onMouseMove` to reduce event frequency during drag operations.

### 🚀 Performance Considerations

- Event listeners are properly cleaned up to prevent memory leaks
- Selection is cleared on sort/filter operations to prevent stale coordinate references
- Coordinate-based highlighting runs O(1) calculations per cell

### 📤 CSV Export

Handles CSV escaping for strings containing commas/quotes using RFC 4180 compliant formatting. Creates programmatic downloads without server round-trip and includes proper cleanup of object URLs.

### 🎛️ Filtering Architecture

Uses a two-stage approach with local state in the modal, allowing users to preview filter changes before applying and enabling cancel functionality.

## 🐛 Known Issues & Future Improvements

### ⚠️ Current Limitations
1. **🔄 Select All Bug**: Currently selects from original dataset instead of filtered data
2. **📏 No Column Virtualization**: Would be needed for tables with 50+ columns
3. **📱 Mobile Support**: Touch events not implemented for mobile drag selection

### 🔮 Potential Enhancements
- **🖱️ Multi-selection**: Ctrl+click for non-contiguous ranges
- **⌨️ Keyboard navigation**: Arrow keys for selection extension
- **🎨 Copy formatting**: Include cell styling in clipboard data
- **↩️ Undo/redo**: For destructive operations

## 📦 Dependencies

- React 18+ (uses modern hooks)
- CSS Modules (for styling)
- Modern browser (for Clipboard API and Blob downloads)

## 💡 Usage Notes

This implementation prioritizes code clarity and maintainability over performance optimization. For production use with large datasets (1000+ rows), consider:

- **♻️ Virtual scrolling** for row rendering
- **⏱️ Debounced selection updates**
- **👷 Web Workers** for CSV generation
- **👀 Intersection Observer** for lazy loading

The coordinate-based selection system scales well to any table size since it operates on indices rather than DOM references.