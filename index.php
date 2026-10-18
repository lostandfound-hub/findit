<?php
/**
 * FindIt — Smart Lost & Found Network (PHP Edition)
 * College Project Implementation using PHP, HTML, CSS, JavaScript, and SQLite.
 */
require_once __DIR__ . '/db.php';

// Seed initial items if empty
$count = $pdo->query("SELECT COUNT(*) FROM items")->fetchColumn();
if ($count == 0) {
    $seedItems = [
        ['item_lost_1', 'lost', 'MacBook Air M2 - Space Gray with GitHub Sticker', 'electronics', 'Space Gray', 'Main Library - 2nd Floor Study Commons', '2026-10-09', 'Left my MacBook Air on desk #42 next to the large glass window facing the quad.', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80', 'Maya Lin', 150, 'Provide the serial number last 4 digits or specify lock screen user initials', 'Serial ends in 99X4, lockscreen shows profile named Maya L.'],
        ['item_found_1', 'found', 'Apple MacBook Air 13" Space Gray found at Study Desk', 'electronics', 'Space Gray', 'Main Library - 2nd Floor Study Commons', '2026-10-09', 'Turned in to library front desk. Space gray aluminum MacBook found unattended on desk 42.', 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=600&q=80', 'Jordan Cole', 0, 'What sticker is located near the trackpad and what is the lockscreen user profile name?', 'Small Octocat / GitHub sticker near lower-right trackpad. Lockscreen username is Maya L.'],
        ['item_found_2', 'found', 'Apple AirPods Pro (2nd Gen) with MagSafe Case', 'accessories', 'White', 'Campus Recreation Center & Gym', '2026-10-08', 'Discovered on bench in weight room locker hallway. Case has carabiner clip.', 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80', 'Jordan Cole', 0, 'What custom laser engraving or initials are on the case lid?', 'Case engraved with initials ML-2025.'],
        ['item_lost_2', 'lost', 'AirPods Pro 2 - Custom Engraved Case', 'accessories', 'White', 'Campus Recreation Center & Gym', '2026-10-08', 'Fell out of my gym shorts pocket either in locker room or near cardio machines.', 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=600&q=80', 'Maya Lin', 100, 'What is engraved on the case?', 'Case has ML-2025 laser engraved.']
    ];

    $insertStmt = $pdo->prepare("INSERT INTO items (id, type, title, category, color, locationName, date, description, imageUrl, reporterName, rewardOffered, hiddenDetailsPrompt, hiddenDetailsSecret) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    foreach ($seedItems as $s) {
        $insertStmt->execute($s);
    }
}

// Fetch all active items from PHP SQLite database
$items = $pdo->query("SELECT * FROM items ORDER BY date DESC")->fetchAll();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FindIt — Smart Lost & Found Network (PHP Edition)</title>
    <!-- Modern Pure White Styling -->
    <link rel="stylesheet" href="css/styles.css">
    <link rel="stylesheet" href="css/components.css">
</head>
<body>
    <!-- Hardware Accelerated Background Canvas -->
    <canvas id="bg-canvas"></canvas>
    <div class="ambient-blob blob-1"></div>
    <div class="ambient-blob blob-2"></div>
    <div class="ambient-blob blob-3"></div>

    <!-- Application Top Navigation Bar -->
    <header class="app-header">
        <div class="brand-wrapper" onclick="window.findItApp.switchView('feed')">
            <div class="brand-logo-icon">⚡</div>
            <div>
                <span class="brand-name">FindIt</span>
                <span class="brand-tag">PHP & HTML EDITION</span>
            </div>
        </div>

        <!-- Navigation Tabs -->
        <nav class="main-nav">
            <button class="nav-link active" data-view="feed">
                <span>🔍</span> Feed
            </button>
            <button class="nav-link" data-view="radar">
                <span>⚡</span> Match Radar
            </button>
            <button class="nav-link" data-view="map">
                <span>🗺️</span> Campus Map
            </button>
            <button class="nav-link" data-view="claims">
                <span>🛡️</span> Claims Tracker
            </button>
            <button class="nav-link" data-view="rewards">
                <span>🎁</span> Rewards & Perks
            </button>
        </nav>

        <!-- User Role Switcher & Header Actions -->
        <div class="header-actions">
            <!-- Perspective Demo Switcher -->
            <div class="role-switcher-box" title="Switch viewpoint to test student, finder, or security officer perspectives">
                <span class="role-label">Role:</span>
                <select id="role-selector" class="role-select" onchange="window.findItApp.switchUserRole(this.value)">
                    <option value="usr_student_1">Maya Lin (Student - Lost MacBook)</option>
                    <option value="usr_finder_1">Jordan Cole (Finder - Found Items)</option>
                    <option value="usr_admin_1">Officer Davis (Campus Security Desk)</option>
                </select>
            </div>

            <!-- Simulation Demo Match Trigger -->
            <button id="test-match-btn" class="btn btn-sm btn-sim-pulse" title="Simulate a live match event across campus">
                ⚡ Test Auto-Match
            </button>

            <!-- Audio Toggle -->
            <button id="sound-toggle-btn" class="btn btn-secondary btn-sm">
                🔊 Audio On
            </button>

            <!-- Email Live Notifications Center Button -->
            <button id="email-center-btn" class="btn icon-btn btn-round" title="EmailJS Live Notifications" onclick="window.findItApp.openEmailSettingsModal()">
                <span>📧</span>
            </button>

            <!-- Notifications Drawer Button -->
            <button id="notifications-toggle-btn" class="btn icon-btn btn-round" title="Notifications">
                <span>🔔</span>
                <span id="notif-badge-count" class="badge-counter" style="display: none;">0</span>
            </button>

            <!-- User Karma Pill -->
            <div class="user-profile-badge">
                <img id="header-user-avatar" src="" alt="Avatar" class="user-avatar-mini" />
                <span id="header-user-name" style="font-size: 0.82rem; font-weight: 700;">User</span>
                <div id="header-user-karma" class="user-karma-pill">0 Karma</div>
            </div>
        </div>
    </header>

    <!-- Main Content Container -->
    <main class="app-container">
        <!-- Hero Banner Showcase -->
        <section class="hero-banner glass-panel">
            <div class="hero-content">
                <h1>Smart Lost & Found <span class="hero-highlight">Intelligent Network</span></h1>
                <p>
                    Report misplaced items and let our multi-factor matching engine pinpoint exact matches 
                    across category, color, location, and semantic description. Built with PHP backend processing and Pure HTML/CSS.
                </p>
                <div class="hero-actions">
                    <button class="btn btn-primary" onclick="window.findItApp.openReportModal('lost')">
                        <span>🔍</span> Report Lost Item
                    </button>
                    <button class="btn btn-emerald" onclick="window.findItApp.openReportModal('found')">
                        <span>📦</span> Report Found Item
                    </button>
                    <button class="btn btn-secondary" onclick="window.findItApp.switchView('radar')">
                        <span>⚡</span> View Match Radar
                    </button>
                </div>
            </div>

            <div class="hero-stats-row">
                <div class="hero-stat-box">
                    <div class="stat-num">96%</div>
                    <div class="stat-label">Match Accuracy</div>
                </div>
                <div class="hero-stat-box">
                    <div class="stat-num">1,850+</div>
                    <div class="stat-label">Karma Awarded</div>
                </div>
                <div class="hero-stat-box">
                    <div class="stat-num">8</div>
                    <div class="stat-label">Safe-Zone Lockers</div>
                </div>
            </div>
        </section>

        <!-- VIEW 1: Main Feed & Cards Grid -->
        <section id="view-feed" class="view-section active-view">
            <div class="feed-toolbar">
                <div class="search-filter-row">
                    <!-- Search Bar -->
                    <div class="search-bar-box">
                        <span>🔍</span>
                        <input type="text" id="search-input" placeholder="Search by item name, color, campus building, or tags (e.g. 'AirPods', 'Library', 'Gray')..." />
                    </div>

                    <!-- Type Filter (All, Lost, Found) -->
                    <div class="segmented-type-toggle">
                        <button class="type-toggle-btn active" data-type-filter="all">All Items</button>
                        <button class="type-toggle-btn" data-type-filter="lost">🔍 Lost</button>
                        <button class="type-toggle-btn" data-type-filter="found">📦 Found</button>
                    </div>
                </div>

                <!-- Category Chips Horizontal Bar -->
                <div class="chips-bar-wrapper" id="category-chips-bar">
                    <!-- Dynamic chips rendered by app.js -->
                </div>
            </div>

            <!-- Items Cards Grid -->
            <div class="items-grid-layout" id="items-grid">
                <!-- Dynamic cards rendered by app.js -->
            </div>
        </section>

        <!-- VIEW 2: Match Radar Dashboard -->
        <section id="view-radar" class="view-section">
            <div class="radar-dashboard-view">
                <div class="radar-banner glass-panel">
                    <div>
                        <h2>⚡ Smart Match Radar</h2>
                        <p style="color: var(--text-muted); font-size: 0.9rem;">
                            Live AI-powered matching algorithm analyzing <strong>Category (25%)</strong>, 
                            <strong>Color (20%)</strong>, <strong>Location (25%)</strong>, and <strong>Descriptive Semantics (30%)</strong>.
                        </p>
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="window.findItApp.simulateLiveMatchEvent()">
                        ⚡ Simulate Instant Match
                    </button>
                </div>

                <div id="radar-matches-list">
                    <!-- Dynamic radar comparison cards -->
                </div>
            </div>
        </section>

        <!-- VIEW 3: Interactive Campus Map -->
        <section id="view-map" class="view-section">
            <div style="margin-bottom: 1.2rem;">
                <h2 style="font-size: 1.5rem; font-weight: 800;">🗺️ Interactive Campus Radar Map</h2>
                <p style="color: var(--text-muted); font-size: 0.88rem;">
                    Click any collegiate facility to inspect lost & found item density, match hotspots, and safe-zone locker stations.
                </p>
            </div>
            <div id="campus-map-container">
                <!-- SVG map rendered by campus-map.js -->
            </div>
        </section>

        <!-- VIEW 4: Claims Tracker -->
        <section id="view-claims" class="view-section">
            <div style="margin-bottom: 1.2rem; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h2 style="font-size: 1.5rem; font-weight: 800;">🛡️ Ownership Claims Center</h2>
                    <p style="color: var(--text-muted); font-size: 0.88rem;">
                        Track verification challenges, hidden detail reveals, and campus safe-zone pickups.
                    </p>
                </div>
            </div>

            <div class="claims-layout" id="claims-list-container">
                <!-- Dynamic claim cards rendered by app.js -->
            </div>
        </section>

        <!-- VIEW 5: Rewards & Perks Economy -->
        <section id="view-rewards" class="view-section">
            <!-- User Balance & Badges Card -->
            <div class="rewards-header-card glass-panel">
                <div>
                    <span style="font-size: 0.78rem; font-weight: 800; color: #059669; text-transform: uppercase;">Campus Honesty Wallet</span>
                    <div class="rewards-balance-num" id="rewards-user-balance">420</div>
                    <div style="font-size: 0.9rem; color: var(--text-muted); margin-top: 4px;">
                        Available Karma Points • <strong id="rewards-items-returned">3</strong> Items Successfully Returned
                    </div>
                    <div class="user-badges-row" id="user-badges-container">
                        <!-- Dynamic badges -->
                    </div>
                </div>

                <div style="text-align: right; max-width: 360px;">
                    <p style="font-size: 0.85rem; color: var(--text-muted);">
                        Earn points for reporting found items (+50 pts) and returning them to verified owners (+200 pts). 
                        Redeem points for exclusive campus dining, bookstore discounts, and VIP study passes!
                    </p>
                </div>
            </div>

            <h3 style="font-size: 1.3rem; font-weight: 800; margin-bottom: 1.2rem;">🎁 Campus Perks Catalog</h3>
            <div class="rewards-grid" id="rewards-catalog-grid">
                <!-- Dynamic reward perk cards -->
            </div>

            <!-- Campus Leaderboard -->
            <div class="leaderboard-section glass-panel">
                <h3 class="leaderboard-title">🏆 Campus Honesty Hall of Fame</h3>
                <table class="leaderboard-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Student</th>
                            <th>Honor Badge</th>
                            <th>Items Returned</th>
                            <th>Total Karma</th>
                        </tr>
                    </thead>
                    <tbody id="leaderboard-table-body">
                        <!-- Dynamic leaderboard rows -->
                    </tbody>
                </table>
            </div>
        </section>
    </main>

    <!-- Modals -->
    <!-- 1. Report Modal -->
    <div id="report-modal" class="modal">
        <div class="modal-backdrop"></div>
        <div class="modal-dialog glass-panel">
            <div class="modal-header">
                <h3 class="modal-title" id="report-modal-header-title">Report Item</h3>
                <button class="modal-close">✕</button>
            </div>
            
            <input type="hidden" id="report-type-hidden" value="lost" />

            <div class="form-group">
                <label class="form-label">Item Title & Model</label>
                <input type="text" id="report-title" class="form-input" placeholder="e.g. MacBook Air M2 Space Gray, AirPods Pro, or Brass Dorm Keys" />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                    <label class="form-label">Category</label>
                    <select id="report-category" class="form-select"></select>
                </div>
                <div class="form-group">
                    <label class="form-label">Primary Color</label>
                    <input type="text" id="report-color" class="form-input" placeholder="e.g. Space Gray, Red, Matte Black" />
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">Campus Location</label>
                <select id="report-location" class="form-select"></select>
            </div>

            <div class="form-group">
                <label class="form-label">Public Description</label>
                <textarea id="report-desc" class="form-textarea" placeholder="Provide general details visible to everyone (approximate time, desk number, general appearance)..."></textarea>
            </div>

            <!-- Hidden Details Vault -->
            <div class="hidden-details-vault-box" id="report-secret-group">
                <div class="vault-header">
                    <span class="vault-shield-icon">🛡️</span>
                    <span class="vault-label">Ownership Verification Vault (Anti-Theft)</span>
                </div>
                <p style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 0.8rem;">
                    Set a security question that only the genuine owner would know (e.g. lockscreen wallpaper, engravings, serial number, or secret contents).
                </p>

                <div class="form-group">
                    <label class="form-label">Public Security Prompt (Everyone Sees This)</label>
                    <input type="text" id="report-prompt" class="form-input" placeholder="e.g. 'What sticker is by the trackpad?' or 'What initials are engraved?'" />
                </div>

                <div class="form-group">
                    <label class="form-label">Confidential Secret Answer (Hidden in Vault)</label>
                    <input type="text" id="report-secret" class="form-input" placeholder="e.g. 'Octocat GitHub sticker' or 'Serial ending in 99X4'" />
                    <span class="form-hint">🔒 This secret is masked from the public and only revealed to verify authentic ownership claims!</span>
                </div>
            </div>

            <!-- Real-Time Match Radar Preview -->
            <div style="margin-bottom: 1.5rem;">
                <label class="form-label">⚡ Live Campus Match Radar</label>
                <div id="report-live-matches-preview" class="glass-panel" style="padding: 0.8rem;">
                    <p class="preview-placeholder">Type details above to see real-time matches across campus...</p>
                </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 0.8rem;">
                <button class="btn btn-secondary modal-close">Cancel</button>
                <button class="btn btn-primary" onclick="window.findItApp.submitNewReport()">Publish to Campus Network</button>
            </div>
        </div>
    </div>

    <!-- 2. Claim Modal -->
    <div id="claim-modal" class="modal">
        <div class="modal-backdrop"></div>
        <div class="modal-dialog glass-panel">
            <div class="modal-header">
                <div>
                    <h3 class="modal-title">🛡️ Submit Ownership Challenge</h3>
                    <span id="claim-item-badge" class="badge-pill" style="color: #059669;">FOUND ITEM</span>
                </div>
                <button class="modal-close">✕</button>
            </div>

            <input type="hidden" id="claim-item-id" value="" />

            <div style="margin-bottom: 1.2rem;">
                <h4 id="claim-item-title" style="font-size: 1.15rem; color: #0f172a;">Item Title</h4>
                <p id="claim-item-location" style="font-size: 0.84rem; color: var(--text-muted);">Location</p>
            </div>

            <div class="hidden-details-vault-box" style="margin-bottom: 1.4rem;">
                <div class="vault-header">
                    <span class="vault-shield-icon">🔒</span>
                    <span class="vault-label">Finder's Verification Challenge</span>
                </div>
                <p id="claim-security-prompt" style="font-size: 0.95rem; font-weight: 700; color: #0284c7; margin-top: 0.4rem;">
                    "What is engraved on the case?"
                </p>
            </div>

            <div class="form-group">
                <label class="form-label">Your Proof of Ownership</label>
                <textarea id="claim-proof-input" class="form-textarea" placeholder="Answer the question accurately. Mention unique scratches, wallpapers, serial numbers, engravings, or contents to prove this is yours..."></textarea>
                <span class="form-hint">Your response will be compared against the finder's encrypted vault details.</span>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 0.8rem;">
                <button class="btn btn-secondary modal-close">Cancel</button>
                <button class="btn btn-primary" onclick="window.findItApp.submitClaimForm()">Submit Verification Challenge</button>
            </div>
        </div>
    </div>

    <!-- 3. Verification Modal -->
    <div id="verification-modal" class="modal">
        <div class="modal-backdrop"></div>
        <div class="modal-dialog glass-panel" style="max-width: 720px;">
            <div class="modal-header">
                <div>
                    <h3 class="modal-title">🔓 Vault Decrypt: Verify Genuine Owner</h3>
                    <p style="font-size: 0.8rem; color: var(--text-muted);">Compare confidential markers against claimant's submitted proof.</p>
                </div>
                <button class="modal-close">✕</button>
            </div>

            <input type="hidden" id="verify-claim-id" value="" />

            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem; background: #f8fafc; padding: 0.85rem; border-radius: 8px; border: 1px solid #e2e8f0;">
                <div>
                    <h4 id="verify-item-title" style="color: #0f172a; font-size: 1.1rem;">Item</h4>
                    <span style="font-size: 0.82rem; color: var(--text-muted);">Claimant: <strong id="verify-claimant-name" style="color: #0284c7;">Name</strong> • <span id="verify-claim-date">Date</span></span>
                </div>
                <div style="text-align: right;">
                    <span id="verify-accuracy-score" class="badge-pill" style="font-size: 0.9rem; font-weight: 800;">96% Accuracy</span>
                    <div id="verify-verdict" style="font-size: 0.75rem; font-weight: 700; margin-top: 4px;">Authentic Owner Confirmed</div>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                <div class="glass-panel" style="padding: 1rem; border-color: rgba(220, 38, 38, 0.3); background: #fef2f2;">
                    <span style="font-size: 0.72rem; font-weight: 800; color: #dc2626; text-transform: uppercase;">🔒 Confidential Vault Secret</span>
                    <p id="verify-secret-prompt" style="font-size: 0.78rem; font-style: italic; color: #475569; margin: 4px 0 8px 0;">Prompt</p>
                    <div id="verify-secret-vault" style="font-size: 0.88rem; color: #0f172a; font-family: monospace; background: #ffffff; border: 1px solid #fecaca; padding: 8px; border-radius: 6px;">
                        Secret Answer
                    </div>
                </div>

                <div class="glass-panel" style="padding: 1rem; border-color: rgba(2, 132, 199, 0.3); background: #f0f9ff;">
                    <span style="font-size: 0.72rem; font-weight: 800; color: #0284c7; text-transform: uppercase;">📝 Claimant's Submitted Proof</span>
                    <div id="verify-claimant-proof" style="font-size: 0.88rem; color: #0f172a; font-family: monospace; background: #ffffff; border: 1px solid #bae6fd; padding: 8px; border-radius: 6px; margin-top: 24px;">
                        Claimant Submission
                    </div>
                </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 1.2rem;">
                <button class="btn btn-secondary" onclick="window.findItApp.handleRejectClaim()">
                    ✕ Reject Claim (Imposter)
                </button>
                <div style="display: flex; gap: 0.8rem;">
                    <button class="btn btn-emerald" onclick="window.findItApp.handleApproveClaim()">
                        ✓ Verify & Approve Claim (+200 Karma)
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- 4. Radar HUD Modal -->
    <div id="radar-modal" class="modal">
        <div class="modal-backdrop"></div>
        <div class="modal-dialog glass-panel" style="max-width: 780px;">
            <div class="modal-header">
                <div>
                    <h3 class="modal-title">⚡ Match Radar Deep-Dive</h3>
                    <p style="font-size: 0.8rem; color: var(--text-muted);">Multi-factor algorithmic correlation breakdown</p>
                </div>
                <button class="modal-close">✕</button>
            </div>

            <div class="radar-modal-score-box">
                <div class="radar-score-huge" id="radar-score-big">96%</div>
                <div id="radar-confidence-badge" style="font-size: 0.95rem; font-weight: 800; text-transform: uppercase; margin-top: 4px;">CRITICAL MATCH</div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem; margin-bottom: 1.5rem;">
                <div class="glass-panel" style="padding: 1rem;">
                    <span class="side-tag tag-lost">🔍 LOST REPORT</span>
                    <img id="radar-lost-img" src="" style="width: 100%; height: 120px; object-fit: cover; border-radius: 6px; margin-bottom: 0.6rem;" />
                    <h4 id="radar-lost-title" style="font-size: 0.95rem; color: #0f172a;">Title</h4>
                    <p id="radar-lost-location" style="font-size: 0.78rem; color: #64748b;">Location</p>
                    <p id="radar-lost-color" style="font-size: 0.78rem; color: #0284c7;">Color</p>
                    <p id="radar-lost-desc" style="font-size: 0.76rem; color: #475569; margin-top: 4px;">Desc</p>
                </div>

                <div class="glass-panel" style="padding: 1rem;">
                    <span class="side-tag tag-found">📦 FOUND ITEM</span>
                    <img id="radar-found-img" src="" style="width: 100%; height: 120px; object-fit: cover; border-radius: 6px; margin-bottom: 0.6rem;" />
                    <h4 id="radar-found-title" style="font-size: 0.95rem; color: #0f172a;">Title</h4>
                    <p id="radar-found-location" style="font-size: 0.78rem; color: #64748b;">Location</p>
                    <p id="radar-found-color" style="font-size: 0.78rem; color: #0284c7;">Color</p>
                    <p id="radar-found-desc" style="font-size: 0.76rem; color: #475569; margin-top: 4px;">Desc</p>
                </div>
            </div>

            <div class="radar-bars-list">
                <div class="factor-bar-row">
                    <div class="factor-bar-header">
                        <span>Category Match (Weight: 25%)</span>
                        <span id="radar-factor-category-val">100%</span>
                    </div>
                    <div class="progress-track"><div id="radar-factor-category-bar" class="progress-fill" style="width: 100%;"></div></div>
                </div>

                <div class="factor-bar-row">
                    <div class="factor-bar-header">
                        <span>Color Spectrum Match (Weight: 20%)</span>
                        <span id="radar-factor-color-val">95%</span>
                    </div>
                    <div class="progress-track"><div id="radar-factor-color-bar" class="progress-fill" style="width: 95%;"></div></div>
                </div>

                <div class="factor-bar-row">
                    <div class="factor-bar-header">
                        <span>Location Proximity (Weight: 25%)</span>
                        <span id="radar-factor-location-val">100%</span>
                    </div>
                    <div class="progress-track"><div id="radar-factor-location-bar" class="progress-fill" style="width: 100%;"></div></div>
                </div>

                <div class="factor-bar-row">
                    <div class="factor-bar-header">
                        <span>Description Semantic Keywords (Weight: 30%)</span>
                        <span id="radar-factor-desc-val">90%</span>
                    </div>
                    <div class="progress-track"><div id="radar-factor-desc-bar" class="progress-fill" style="width: 90%;"></div></div>
                </div>
            </div>

            <div style="margin-bottom: 1.5rem;">
                <label class="form-label">Correlated Descriptive Markers</label>
                <div id="radar-shared-keywords" style="display: flex; flex-wrap: wrap; gap: 0.4rem;"></div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 0.8rem;">
                <button class="btn btn-secondary modal-close">Dismiss</button>
                <button id="radar-start-claim-btn" class="btn btn-primary">
                    🛡️ Proceed to Claim Verification
                </button>
            </div>
        </div>
    </div>

    <!-- 5. Voucher Modal -->
    <div id="voucher-modal" class="modal">
        <div class="modal-backdrop"></div>
        <div class="modal-dialog glass-panel" style="max-width: 480px;">
            <div class="voucher-pass-card">
                <span style="font-size: 2.2rem;">🎟️</span>
                <h3 id="voucher-modal-title" style="font-size: 1.3rem; margin-top: 0.5rem; color: #0f172a;">Campus Voucher</h3>
                <p style="font-size: 0.82rem; color: var(--text-muted);">Present this digital pass at the campus checkout station.</p>
                <div class="voucher-code-huge" id="voucher-modal-code">FIT-98A72-4019</div>
                <div id="voucher-modal-expires" style="font-size: 0.78rem; color: #059669; font-weight: 700;">Valid for 30 Days</div>
                <button class="btn btn-primary" style="margin-top: 1.2rem; width: 100%;" onclick="document.getElementById('voucher-modal').classList.remove('active')">
                    Save to Wallet & Close
                </button>
            </div>
        </div>
    </div>

    <!-- 6. Email Settings Modal -->
    <div id="email-settings-modal" class="modal">
        <div class="modal-backdrop"></div>
        <div class="modal-dialog glass-panel" style="max-width: 680px;">
            <div class="modal-header">
                <div>
                    <h3 class="modal-title">📧 EmailJS Live Notifications</h3>
                    <p style="font-size: 0.8rem; color: var(--text-muted);">Real-time email dispatch pipeline for matches, claims, and perk vouchers.</p>
                </div>
                <button class="modal-close">✕</button>
            </div>

            <div class="email-settings-guide">
                <h4>🚀 Connect Real Email Delivery (Optional)</h4>
                <p>
                    FindIt dispatches live emails via <strong>EmailJS Cloud</strong>. You can test immediately using the outbox log below, or connect your free EmailJS account:
                </p>
                <ol>
                    <li>Create a free account at <strong>emailjs.com</strong>.</li>
                    <li>Add an Email Service (Gmail / Outlook) and copy your <strong>Service ID</strong>.</li>
                    <li>Create an Email Template and copy your <strong>Template ID</strong>.</li>
                    <li>Paste your keys below.</li>
                </ol>
            </div>

            <div class="form-group">
                <label class="form-label">Send Live Emails To (Your Real Email Address)</label>
                <input type="email" id="emailjs-target-email" class="form-input" placeholder="e.g. yourname@gmail.com or student@campus.edu" />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.8rem; margin-bottom: 1.2rem;">
                <div class="form-group">
                    <label class="form-label">Public Key</label>
                    <input type="text" id="emailjs-public-key" class="form-input" placeholder="e.g. user_xxx / key" />
                </div>
                <div class="form-group">
                    <label class="form-label">Service ID</label>
                    <input type="text" id="emailjs-service-id" class="form-input" placeholder="e.g. service_xxx" />
                </div>
                <div class="form-group">
                    <label class="form-label">Template ID</label>
                    <input type="text" id="emailjs-template-id" class="form-input" placeholder="e.g. template_xxx" />
                </div>
            </div>

            <div style="display: flex; gap: 0.8rem; margin-bottom: 1.5rem;">
                <button class="btn btn-secondary btn-sm" onclick="window.findItApp.saveEmailSettings()">
                    💾 Save Credentials
                </button>
                <button class="btn btn-primary btn-sm" onclick="window.findItApp.sendTestLiveEmail()">
                    ⚡ Send Live Test Email Now
                </button>
            </div>

            <div>
                <label class="form-label">📬 Campus Email Dispatch Log</label>
                <div id="email-logs-list" class="email-logs-container"></div>
            </div>
        </div>
    </div>

    <!-- Notifications Drawer -->
    <div id="notifications-drawer" class="notifications-drawer glass-panel">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem;">
            <h4 style="font-size: 0.95rem; font-weight: 800; color: #0f172a;">🔔 Notifications</h4>
            <span style="font-size: 0.75rem; color: var(--text-dim);">Live Campus Feed</span>
        </div>
        <div id="notifications-list"></div>
    </div>

    <!-- Toast Container -->
    <div id="toast-container"></div>

    <!-- External EmailJS Cloud SDK -->
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>

    <!-- Scripts -->
    <script src="data/seed-data.js"></script>
    <script src="js/sound-fx.js"></script>
    <script src="js/particles.js"></script>
    <script src="js/matching-engine.js"></script>
    <script src="js/verification.js"></script>
    <script src="js/claims-tracker.js"></script>
    <script src="js/rewards-system.js"></script>
    <script src="js/email-service.js"></script>
    <script src="js/campus-map.js"></script>
    <script src="js/app.js"></script>
</body>
</html>
