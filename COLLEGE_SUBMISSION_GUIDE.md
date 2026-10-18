# 🎓 FindIt — College Project Submission Guide (HTML & PHP)

This project has been designed with **two submission modes** to satisfy any professor/examiner requirements:

---

## 🌟 Mode 1: Pure HTML Mode (`index.html`) — 100% Zero-Setup
* **Main File**: `index.html`
* **Styling**: `css/styles.css` (Clean Pure White Theme) & `css/components.css`
* **Frontend Logic**: `js/app.js`, `js/matching-engine.js`, `js/verification.js`, `js/claims-tracker.js`, `js/rewards-system.js`
* **How to Run**: Simply **double-click `index.html`** or drag it into Chrome/Edge.
* **Why it's great**: Runs on any computer, anywhere, offline, with 0 dependencies, 0 server installations, and 0 database configuration.

---

## 🐘 Mode 2: PHP & HTML Mode (`index.php`) — Full Stack College Submission
* **Main Entry File**: `index.php`
* **Database Script**: `db.php` (Creates `findit.sqlite` database automatically with `items` and `claims` tables using PHP PDO)
* **Report Handler**: `report.php` (Processes POST requests from HTML forms to insert reports into database)
* **How to Run in College / XAMPP**:
  1. Copy the `findit-lost-and-found` folder into your XAMPP `htdocs` directory:
     `C:\xampp\htdocs\findit`
  2. Open XAMPP Control Panel and start **Apache**.
  3. In your browser, open:
     `http://localhost/findit/index.php`
* **Or Run with PHP Built-in Server**:
  ```bash
  php -S localhost:8000
  ```
  Visit: `http://localhost:8000/index.php`

---

## 🎨 Theme Details
- **Background**: Pure Crisp White (`#ffffff`)
- **Typography**: Dark high-contrast slate (`#0f172a` / `#334155`)
- **Card Styling**: Clean white frosted panels with soft subtle shadows
- **Interactive Features**: 
  1. Multi-factor smart matching (Category, Color, Location, Keywords)
  2. Owner verification challenge vault (Masked secret reveal)
  3. Claims lifecycle tracker (4-stage progress timeline)
  4. Campus karma rewards store (Voucher generator & Leaderboard)
  5. EmailJS live email dispatch pipeline
