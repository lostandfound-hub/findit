# ⚡ FindIt — Smart Lost & Found Network

A next-generation collegiate web application where students report lost and found items with real-time multi-factor matching, vault-encrypted ownership verification challenges, claim tracking lifecycles, and a campus karma reward economy.

Designed with high visual fidelity: cyber-glassmorphism, 60fps GPU ambient particle canvas, synthesized Web Audio micro-interactions, and instant role simulation switches.

---

## 🌟 The 4 "Crazy Features" Implemented

### 1. ⚡ Multi-Factor Smart Matching Engine
- **Category Correlation (25% Weight)**: Matches exact and cross-compatible equipment categories.
- **Color Spectrum Similarity (20% Weight)**: Hex color distance and collegiate color families (e.g., Space Gray ↔ Silver, Matte Black ↔ Charcoal).
- **Campus Location Proximity (25% Weight)**: Pinpoints matching buildings (Main Library, Science Complex, Student Union, Gym, Engineering Hall, Dorm Quad).
- **Descriptive & Semantic Overlap (30% Weight)**: Jaccard token overlap, keyword filtering, and special weight for identifying brand/model keywords (MacBook, AirPods, Hydroflask, Yoda lanyard, etc.).
- **Live Typing Radar Preview**: As students type a new report, the matching radar updates live to suggest potential matches before submitting!

### 2. 🛡️ Confidential Ownership Verification Vault ("Reveal Secret")
- High-value items (MacBooks, AirPods, Wallets, Dorm Keys) have identifying markings that fraudsters could abuse if publicly exposed.
- **Vault Security Prompt**: Public feed shows only a question:
  - *e.g., "What sticker is located near the trackpad?" or "What laser engraving is on the case?"*
- **Confidential Vault Secret**: The actual answer is encrypted/masked (`•••••••• [REDACTED FOR SECURITY]`).
- **Claimant Challenge**: Potential owners must submit their evidence answering the prompt.
- **Finder "Reveal & Verify" Screen**: Finders and campus officers open the decryption modal comparing the hidden secret against claimant proof side-by-side with an automated percentage accuracy calculation.

### 3. 🗺️ Claims Lifecycle Tracker & Live Notification System
- **Interactive Multi-Stage Timeline**:
  1. `Challenge Submitted` (Date & timestamp logged)
  2. `Secret Details Verified` (Finder matched claimant proof against vault)
  3. `Safe-Zone Locker Pickup` (Assigned designated campus locker with safe-zone pin)
  4. `Handover Completed & Karma Credited`
- **Real-Time Notifications & Toasts**: Instant alerts on high matches (>85%), claim approvals, and points earned.
- **📧 EmailJS Cloud Live Email Pipeline**:
  - Automatically dispatches real email notifications on:
    - ⚡ **High Match Alerts**: Notifies student when their lost item is found.
    - 🛡️ **Ownership Claim Submissions**: Alerts finder to verify secret vault.
    - 🎉 **Claim Approvals**: Sends student safe-zone locker pickup instructions.
    - 🎟️ **Perk Pass Issuance**: Sends digital voucher codes to user inbox.
  - Features an **Email Control Center Modal** (click 📧 in the header) with instant live test email dispatch and an outbox audit log.
- **Interactive Campus Radar Map**: Visual SVG campus layout showing active lost/found density pins and match hotspots.

### 4. 🎁 Campus Karma & Reward Economy
- **Karma Earning**:
  - +50 Karma for reporting a found item
  - +200 Karma for safely returning an item to verified owner
  - Bonus student bounties (+75 to +150 Karma)
- **Campus Perks Catalog**:
  - ☕ Campus Cafe Barista Choice Coffee Voucher (120 pts)
  - 🥪 Student Union Meal Combo Pass (220 pts)
  - 📚 University Bookstore 25% Apparel Discount (350 pts)
  - 🎧 VIP 3-Hour Quiet Study Pod Pass (450 pts)
  - 🅿️ 1-Day VIP Campus Parking Pass (600 pts)
  - 🏆 Chancellor's Golden Guardian Medal & Certificate (1000 pts)
- **Digital Pass Generator**: Instant voucher generation with unique serial codes and validity dates.
- **Honesty Hall of Fame**: Live leaderboard ranking the most honest students on campus with honor badges.

---

## 🚀 How to Run the Website

### Method 1: Python Local Server (Recommended)
Open a terminal in the project directory and run:
```bash
python server.py
```
*Your browser will automatically open to `http://localhost:8080`.*

### Method 2: Double-Click Launcher (Windows)
Double-click `run.bat` in the project folder.

### Method 3: Direct Browser Launch
You can open `index.html` directly in Google Chrome, Microsoft Edge, or Mozilla Firefox. The application has full offline/local storage fallback and will run with 100% of its features intact.

---

## 🎮 Interactive Demo & Simulation Guide

To demonstrate all features effortlessly:
1. **Switch Roles (Top Bar)**:
   - **Maya Lin (Student)**: Lost her Space Gray MacBook Air and AirPods Pro at the Library and Gym.
   - **Jordan Cole (Finder)**: Found the MacBook Air and AirPods, set the hidden verification prompts.
   - **Officer Davis (Admin)**: Campus safety supervisor overseeing safe-zone lockboxes.
2. **Click "⚡ Test Auto-Match"**:
   - Fires a live simulated campus reporting event, calculates a **96% match**, displays high-priority toast alerts, and opens the side-by-side Match Radar HUD!
3. **Verify an Ownership Claim**:
   - Switch to **Jordan Cole** ➔ Go to **Claims Tracker** ➔ Click **"🔓 Reveal Secret & Verify Proof"** ➔ See the decrypted vault secret compared to claimant proof ➔ Click **"✓ Verify & Approve Claim"** to earn +200 Karma points!
4. **Redeem a Perk**:
   - Go to **Rewards & Perks** ➔ Click **"⚡ Redeem Pass"** on the Barista Coffee or Bookstore Discount ➔ Generates a high-tech digital voucher pass!
5. **Interactive Campus Map**:
   - Switch to **Campus Map** tab ➔ Click on the Main Library or Science Complex to filter items to that specific campus building.

---

## 📁 Project Structure

```
findit-lost-and-found/
├── index.html               # Main SPA HTML structure & Modals
├── server.py                # Python HTTP server (zero external pip packages needed)
├── run.bat                  # One-click Windows batch launcher
├── README.md                # Documentation & Architecture Guide
├── css/
│   ├── styles.css           # Glassmorphism, neon glows, ambient lighting, responsiveness
│   └── components.css       # Cards, radar HUD, vault box, campus map, timeline, modals
├── js/
│   ├── app.js               # Application orchestrator, role switcher, event controller
│   ├── matching-engine.js   # Multi-factor algorithmic matching engine
│   ├── verification.js      # Hidden detail vault and proof validation
│   ├── claims-tracker.js    # Multi-stage claim lifecycle and timeline renderer
│   ├── rewards-system.js    # Campus Karma points, voucher redemption & leaderboard
│   ├── campus-map.js        # Interactive SVG collegiate radar map
│   ├── sound-fx.js          # Web Audio API synthesized sound generator
│   └── particles.js         # 60fps GPU ambient constellation background
└── data/
    └── seed-data.js         # Seed collegiate dataset with realistic lost & found scenarios
```
