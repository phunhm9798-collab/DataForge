# ⚡ DataForge — Synthetic Data Generator

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://phunhm9798-collab.github.io/DataForge/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Generate realistic synthetic datasets for various industries in seconds. Export to CSV, XLSX, JSON, or SQL format.


## 🌐 Live Demo

**[https://phunhm9798-collab.github.io/DataForge/](https://phunhm9798-collab.github.io/DataForge/)**

## ✨ Features

### 🏭 Industry Templates
Generate data for 8 different industries:
- 🏥 Healthcare — Patient records, diagnoses, treatments
- 💰 Finance — Transactions, accounts, fraud detection
- 🛒 Retail — Orders, products, customers
- 👥 HR — Employees, salaries, performance
- 🏭 Manufacturing — Production, quality, inventory
- 🎓 Education — Students, courses, grades
- 🏠 Real Estate — Properties, listings, agents
- 📦 Logistics — Shipments, tracking, delivery

### 📊 Data Generation
- Generate up to **100,000 rows** with Web Worker support
- Virtual scrolling for smooth table navigation
- Real-time progress tracking
- Advanced options: data quality, variance, null values, outliers

### 📤 Export Options
- **CSV** — Comma-separated values
- **XLSX** — Excel spreadsheet with styled headers
- **JSON** — Formatted JSON data
- **SQL** — INSERT statements for database import

### 🎨 User Experience
- 🌗 Dark/Light theme toggle with persistence
- ⌨️ Keyboard shortcuts for power users
- 📈 Quick statistics (Min, Max, Average)
- 🔍 **Search by Column** — Filter data by specific columns or all columns
- 📋 Column selection for export
- 💾 Save/load configuration templates

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + G` | Generate Data |
| `Ctrl + Shift + C` | Export CSV |
| `Ctrl + Shift + J` | Export JSON |
| `Ctrl + Shift + S` | Export SQL |
| `Ctrl + Shift + X` | Export XLSX |
| `Ctrl + Shift + T` | Toggle Theme |
| `?` | Show Shortcuts |

## 🚀 Getting Started

### Option 1: Use the Live Demo
Visit [https://phunhm9798-collab.github.io/DataForge/](https://phunhm9798-collab.github.io/DataForge/)

### Option 2: Run Locally
```bash
# Clone the repository
git clone https://github.com/phunhm9798-collab/DataForge.git

# Navigate to directory
cd DataForge

# Open in browser (no build required)
# Simply open index.html in your browser
# Or use a local server:
npx serve .
```

## 📁 Project Structure

```
DataForge/
├── index.html          # Main HTML file
├── styles.css          # All CSS styles
├── js/
│   ├── app.js          # Main application logic
│   ├── export.js       # Export functionality
│   ├── storage.js      # IndexedDB caching
│   ├── worker.js       # Web Worker for large datasets
│   └── generators/     # Industry-specific generators
│       ├── base.js     # Base utilities
│       ├── healthcare.js
│       ├── finance.js
│       ├── retail.js
│       ├── hr.js
│       ├── manufacturing.js
│       ├── education.js
│       ├── realestate.js
│       └── logistics.js
└── README.md
```

## 🛠️ Technologies

- **HTML5** — Semantic structure
- **CSS3** — Custom properties, Flexbox, Grid
- **Vanilla JavaScript** — No frameworks required
- **Web Workers** — Background processing
- **IndexedDB** — Client-side data caching
- **SheetJS** — Excel export support

## ♿ Accessibility

- Skip link for keyboard navigation
- ARIA labels on interactive elements
- Focus ring indicators
- High contrast mode support
- Reduced motion preference support

## 📄 License

MIT License — feel free to use for personal or commercial projects.

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

---

Made with ❤️ for data scientists, developers, and testers.
