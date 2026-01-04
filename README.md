# DataForge — Synthetic Data Generator

A browser-based tool for generating realistic synthetic datasets across multiple industries. Export to CSV, Excel, JSON, or SQL format.

**Live Demo**: [https://phunhm9798-collab.github.io/DataForge/](https://phunhm9798-collab.github.io/DataForge/)

---

## What It Does

DataForge generates fake but realistic data for testing, development, and demos. Choose an industry, specify how many rows you need, and export in your preferred format.

### Supported Industries

- **Healthcare** — Patient records, diagnoses, treatments
- **Finance** — Transactions, accounts, fraud detection data
- **Retail** — Orders, products, customers
- **HR** — Employees, salaries, performance reviews
- **Manufacturing** — Production batches, quality metrics
- **Education** — Students, courses, grades
- **Real Estate** — Property listings, agents
- **Logistics** — Shipments, tracking, delivery status

---

## Features

### Data Generation
- Generate up to 100,000 rows using Web Workers
- Configure data quality, variance, and outlier frequency
- Add missing values to test null handling
- Virtual scrolling keeps large tables responsive

### Data Preview
- Search and filter generated data
- Sort by any column (click headers)
- Drag columns to reorder them
- Row numbers for easy reference
- Quick statistics with distribution charts

### Export Options
- **CSV** — Standard comma-separated values
- **Excel** — Styled .xlsx with headers
- **JSON** — Formatted for APIs
- **SQL** — INSERT statements ready for databases

### Productivity
- Save and load configuration templates
- Generation history with quick reload
- Undo/Redo (Ctrl+Z / Ctrl+Y)
- Dark and light themes
- Keyboard shortcuts for power users

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl + G | Generate data |
| Ctrl + Shift + C | Export CSV |
| Ctrl + Shift + J | Export JSON |
| Ctrl + Shift + S | Export SQL |
| Ctrl + Shift + X | Export Excel |
| Ctrl + Shift + T | Toggle theme |
| Ctrl + Z | Undo |
| Ctrl + Y | Redo |
| ? | Show shortcuts help |

---

## Getting Started

### Use Online
Visit [https://phunhm9798-collab.github.io/DataForge/](https://phunhm9798-collab.github.io/DataForge/)

### Run Locally
```bash
git clone https://github.com/phunhm9798-collab/DataForge.git
cd DataForge
# Open index.html in your browser, or use a local server:
npx serve .
```

No build step required — it's plain HTML, CSS, and JavaScript.

---

## Project Structure

```
DataForge/
├── index.html          # Main page
├── styles.css          # All styles
├── js/
│   ├── app.js          # Application logic
│   ├── export.js       # Export functionality
│   ├── storage.js      # IndexedDB caching
│   ├── worker.js       # Background data generation
│   └── generators/     # Industry-specific generators
│       ├── base.js
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

---

## Technologies

- HTML5, CSS3, vanilla JavaScript
- Web Workers for background processing
- IndexedDB for local data caching
- SheetJS library for Excel export

---

## Accessibility

- Skip link for keyboard navigation
- ARIA labels on interactive elements
- Visible focus indicators
- Respects reduced motion preferences
- High contrast mode support

---

## License

MIT License — free for personal and commercial use.

---

## Contributing

Issues and pull requests are welcome.
