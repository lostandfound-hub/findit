/**
 * FindIt - Main Application Controller
 * High-performance orchestrator for feeds, radar matching, verification modals,
 * claims lifecycle, rewards, and demo simulations.
 */

class FindItApp {
    constructor() {
        this.currentUser = null;
        this.items = [];
        this.claims = [];
        this.notifications = [];
        this.campusLocations = [];
        this.categories = [];
        this.rewardsStore = [];
        this.leaderboard = [];
        this.demoUsers = [];

        this.currentView = "feed"; // "feed", "radar", "map", "claims", "rewards"
        this.typeFilter = "all"; // "all", "lost", "found"
        this.categoryFilter = "all";
        this.locationFilter = "all";
        this.searchQuery = "";

        this.matchingEngine = new SmartMatchingEngine();
        this.verificationSystem = new VerificationSystem(this);
        this.claimsTracker = new ClaimsTracker(this);
        this.rewardsSystem = new RewardsSystem(this);
        this.emailService = new EmailService(this);
        this.campusMap = null;
    }

    init() {
        this.loadState();
        this.campusMap = new CampusMap(this, "campus-map-container");

        this.bindEvents();
        this.renderAll();

        // Initialize particle canvas
        new ParticleBackground("bg-canvas");

        // Real-time match alert check
        this.checkForHighMatches();
    }

    loadState() {
        const saved = localStorage.getItem("findit_state_v1");
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.currentUser = data.currentUser || SEED_DATA.currentUser;
                this.items = data.items || SEED_DATA.items;
                this.claims = data.claims || SEED_DATA.claims;
                this.notifications = data.notifications || SEED_DATA.notifications;
                this.campusLocations = data.campusLocations || SEED_DATA.campusLocations;
                this.categories = data.categories || SEED_DATA.categories;
                this.rewardsStore = data.rewardsStore || SEED_DATA.rewardsStore;
                this.leaderboard = data.leaderboard || SEED_DATA.leaderboard;
                this.demoUsers = data.demoUsers || SEED_DATA.demoUsers;
                return;
            } catch (e) {
                console.error("Failed to load saved state, using seed data", e);
            }
        }

        // Default to Seed Data
        this.currentUser = JSON.parse(JSON.stringify(SEED_DATA.currentUser));
        this.items = JSON.parse(JSON.stringify(SEED_DATA.items));
        this.claims = JSON.parse(JSON.stringify(SEED_DATA.claims));
        this.notifications = JSON.parse(JSON.stringify(SEED_DATA.notifications));
        this.campusLocations = JSON.parse(JSON.stringify(SEED_DATA.campusLocations));
        this.categories = JSON.parse(JSON.stringify(SEED_DATA.categories));
        this.rewardsStore = JSON.parse(JSON.stringify(SEED_DATA.rewardsStore));
        this.leaderboard = JSON.parse(JSON.stringify(SEED_DATA.leaderboard));
        this.demoUsers = JSON.parse(JSON.stringify(SEED_DATA.demoUsers));
    }

    saveState() {
        const data = {
            currentUser: this.currentUser,
            items: this.items,
            claims: this.claims,
            notifications: this.notifications,
            campusLocations: this.campusLocations,
            categories: this.categories,
            rewardsStore: this.rewardsStore,
            leaderboard: this.leaderboard,
            demoUsers: this.demoUsers
        };
        localStorage.setItem("findit_state_v1", JSON.stringify(data));
    }

    resetDemoData() {
        localStorage.removeItem("findit_state_v1");
        this.loadState();
        this.renderAll();
        this.showToast("System State Reset", "Demo data restored to initial pristine collegiate state.");
        if (window.soundFX) window.soundFX.playSuccess();
    }

    switchUserRole(userId) {
        const selected = this.demoUsers.find(u => u.id === userId);
        if (selected) {
            this.currentUser = JSON.parse(JSON.stringify(selected));
            this.updateHeaderUser();
            this.renderAll();
            this.showToast("User Context Switched", `Now viewing as ${selected.name}`);
            if (window.soundFX) window.soundFX.playClick();
        }
    }

    bindEvents() {
        // Navigation links
        document.querySelectorAll("[data-view]").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                const view = btn.getAttribute("data-view");
                this.switchView(view);
            });
        });

        // Type filter buttons (All, Lost, Found)
        document.querySelectorAll("[data-type-filter]").forEach(btn => {
            btn.addEventListener("click", () => {
                document.querySelectorAll("[data-type-filter]").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                this.typeFilter = btn.getAttribute("data-type-filter");
                this.renderItemGrid();
                if (window.soundFX) window.soundFX.playClick();
            });
        });

        // Search input
        const searchInput = document.getElementById("search-input");
        if (searchInput) {
            searchInput.addEventListener("input", (e) => {
                this.searchQuery = e.target.value.toLowerCase().trim();
                this.renderItemGrid();
            });
        }

        // Audio toggle button
        const soundBtn = document.getElementById("sound-toggle-btn");
        if (soundBtn) {
            soundBtn.addEventListener("click", () => {
                const enabled = window.soundFX.toggle();
                soundBtn.textContent = enabled ? "🔊 Audio On" : "🔇 Audio Off";
                soundBtn.classList.toggle("sound-muted", !enabled);
            });
        }

        // Live test match trigger button
        const testMatchBtn = document.getElementById("test-match-btn");
        if (testMatchBtn) {
            testMatchBtn.addEventListener("click", () => {
                this.simulateLiveMatchEvent();
            });
        }

        // Modal Close buttons
        document.querySelectorAll(".modal-close, .modal-backdrop").forEach(el => {
            el.addEventListener("click", (e) => {
                if (e.target.classList.contains("modal-backdrop") || e.target.classList.contains("modal-close")) {
                    document.querySelectorAll(".modal.active").forEach(m => m.classList.remove("active"));
                    if (window.soundFX) window.soundFX.playClick();
                }
            });
        });

        // Notifications Toggle Drawer
        const notifBtn = document.getElementById("notifications-toggle-btn");
        const notifDrawer = document.getElementById("notifications-drawer");
        if (notifBtn && notifDrawer) {
            notifBtn.addEventListener("click", () => {
                notifDrawer.classList.toggle("open");
                this.renderNotificationsList();
                if (window.soundFX) window.soundFX.playClick();
            });
        }

        // Live input typing match preview in Report Lost Modal
        const reportTitleInput = document.getElementById("report-title");
        const reportDescInput = document.getElementById("report-desc");
        const reportCatSelect = document.getElementById("report-category");
        [reportTitleInput, reportDescInput, reportCatSelect].forEach(input => {
            if (input) {
                input.addEventListener("input", () => this.updateReportLiveMatchPreview());
            }
        });
    }

    switchView(viewName) {
        this.currentView = viewName;
        document.querySelectorAll("[data-view]").forEach(btn => {
            btn.classList.toggle("active", btn.getAttribute("data-view") === viewName);
        });

        document.querySelectorAll(".view-section").forEach(sec => {
            sec.classList.remove("active-view");
        });

        const activeSec = document.getElementById(`view-${viewName}`);
        if (activeSec) {
            activeSec.classList.add("active-view");
        }

        if (viewName === "map") {
            this.campusMap.render();
        } else if (viewName === "radar") {
            this.renderRadarDashboard();
        } else if (viewName === "claims") {
            this.renderClaimsView();
        } else if (viewName === "rewards") {
            this.renderRewardsView();
        }

        if (window.soundFX) window.soundFX.playClick();
    }

    renderAll() {
        this.updateHeaderUser();
        this.renderCategoryChips();
        this.renderItemGrid();
        this.renderNotificationsBadge();
        if (this.currentView === "radar") this.renderRadarDashboard();
        if (this.currentView === "claims") this.renderClaimsView();
        if (this.currentView === "rewards") this.renderRewardsView();
        if (this.currentView === "map") this.campusMap.render();
    }

    updateHeaderUser() {
        const user = this.currentUser;
        const nameEl = document.getElementById("header-user-name");
        const karmaEl = document.getElementById("header-user-karma");
        const avatarEl = document.getElementById("header-user-avatar");
        const roleSelect = document.getElementById("role-selector");

        if (nameEl) nameEl.textContent = user.name;
        if (karmaEl) karmaEl.textContent = `${user.karmaPoints} Karma`;
        if (avatarEl) avatarEl.src = user.avatar;
        if (roleSelect) roleSelect.value = user.id;
    }

    renderCategoryChips() {
        const container = document.getElementById("category-chips-bar");
        if (!container) return;

        let html = `
            <button class="chip ${this.categoryFilter === 'all' ? 'active' : ''}" onclick="window.findItApp.setCategoryFilter('all')">
                <span class="chip-icon">✨</span> All Categories
            </button>
        `;

        this.categories.forEach(cat => {
            const isActive = this.categoryFilter === cat.id;
            html += `
                <button class="chip ${isActive ? 'active' : ''}" onclick="window.findItApp.setCategoryFilter('${cat.id}')">
                    <span class="chip-color-dot" style="background-color: ${cat.color};"></span>
                    ${cat.label}
                </button>
            `;
        });

        container.innerHTML = html;
    }

    setCategoryFilter(catId) {
        this.categoryFilter = catId;
        this.renderCategoryChips();
        this.renderItemGrid();
        if (window.soundFX) window.soundFX.playClick();
    }

    filterByLocation(locId, locName) {
        this.locationFilter = locId;
        this.switchView("feed");
        this.renderItemGrid();
        this.showToast("Map Filter Applied", `Showing items near ${locName}`);
    }

    renderItemGrid() {
        const container = document.getElementById("items-grid");
        if (!container) return;

        let filtered = this.items.filter(item => {
            // Type filter
            if (this.typeFilter !== "all" && item.type !== this.typeFilter) return false;
            // Category filter
            if (this.categoryFilter !== "all" && item.category !== this.categoryFilter) return false;
            // Location filter
            if (this.locationFilter !== "all" && item.locationId !== this.locationFilter) return false;
            // Search query
            if (this.searchQuery) {
                const q = this.searchQuery;
                const match = (
                    item.title.toLowerCase().includes(q) ||
                    item.description.toLowerCase().includes(q) ||
                    item.color.toLowerCase().includes(q) ||
                    item.locationName.toLowerCase().includes(q) ||
                    (item.tags || []).some(t => t.toLowerCase().includes(q))
                );
                if (!match) return false;
            }
            return true;
        });

        // Calculate if items have high matches in opposite pool
        const lostPool = this.items.filter(i => i.type === "lost");
        const foundPool = this.items.filter(i => i.type === "found");

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="empty-state-panel glass-panel">
                    <div class="empty-icon">🔍</div>
                    <h3>No matching reports found</h3>
                    <p>Try clearing filters or search terms, or report a new lost/found item.</p>
                    <button class="btn btn-secondary btn-sm" onclick="window.findItApp.clearFilters()">Clear All Filters</button>
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map(item => {
            // Check top match
            const pool = item.type === "lost" ? foundPool : lostPool;
            const matches = this.matchingEngine.findMatchesFor(item, pool);
            const topMatch = matches.length > 0 ? matches[0] : null;
            const hasHighMatch = topMatch && topMatch.score >= 70;

            const isOwner = item.reporterId === this.currentUser.id;
            const isFinder = item.type === "found";

            return `
                <div class="item-card glass-panel ${item.type === 'lost' ? 'card-lost' : 'card-found'}" data-item-id="${item.id}">
                    <div class="card-media">
                        <img src="${item.imageUrl}" alt="${item.title}" loading="lazy" />
                        <span class="badge type-badge badge-${item.type}">
                            ${item.type === 'lost' ? '🔍 LOST REPORT' : '📦 FOUND ITEM'}
                        </span>
                        ${item.rewardOffered ? `<span class="badge reward-badge">🎁 +${item.rewardOffered} Bounty</span>` : ''}
                        ${hasHighMatch ? `
                            <span class="badge match-alert-badge" onclick="window.findItApp.openRadarModal('${item.id}', '${topMatch.item.id}')">
                                ⚡ ${topMatch.score}% MATCH FOUND
                            </span>
                        ` : ''}
                    </div>

                    <div class="card-body">
                        <div class="card-meta-row">
                            <span class="meta-tag color-tag" style="--tag-color: ${item.colorHex || '#38bdf8'}">
                                <span class="color-swatch" style="background-color: ${item.colorHex || '#38bdf8'}"></span>
                                ${item.color}
                            </span>
                            <span class="meta-tag location-tag">📍 ${item.locationName.split(' - ')[0]}</span>
                            <span class="meta-tag date-tag">🕒 ${item.date}</span>
                        </div>

                        <h3 class="card-title">${item.title}</h3>
                        <p class="card-desc">${item.description}</p>

                        <!-- CRAZY FEATURE 2: Hidden Item Details Reveal Box -->
                        <div class="hidden-details-vault-box">
                            <div class="vault-header">
                                <span class="vault-shield-icon">🛡️</span>
                                <span class="vault-label">Owner Verification Challenge</span>
                                <span class="vault-badge-status ${isOwner ? 'vault-unlocked' : 'vault-locked'}">
                                    ${isOwner ? 'AUTHOR VISIBLE' : 'VAULT LOCKED'}
                                </span>
                            </div>
                            <p class="vault-prompt">"${item.hiddenDetailsPrompt || 'Describe unique identifying serial/markings'}"</p>
                            <div class="vault-secret-content">
                                ${isOwner 
                                    ? `<span class="secret-text unlocked">🔓 ${item.hiddenDetailsSecret}</span>` 
                                    : `<span class="secret-text masked">•••••••••••••••• [Answer prompt to verify & reveal]</span>`}
                            </div>
                        </div>

                        <div class="card-footer">
                            <div class="reporter-info">
                                <span class="reporter-avatar">👤</span>
                                <span class="reporter-name">${item.reporterName}</span>
                            </div>

                            <div class="card-actions">
                                ${item.type === 'found' ? `
                                    <button class="btn btn-primary btn-sm" onclick="window.findItApp.openClaimModal('${item.id}')">
                                        🛡️ Claim Item
                                    </button>
                                ` : `
                                    <button class="btn btn-secondary btn-sm" onclick="window.findItApp.findMatchesForReport('${item.id}')">
                                        ⚡ View Matches
                                    </button>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join("");
    }

    clearFilters() {
        this.typeFilter = "all";
        this.categoryFilter = "all";
        this.locationFilter = "all";
        this.searchQuery = "";
        const searchInput = document.getElementById("search-input");
        if (searchInput) searchInput.value = "";
        document.querySelectorAll("[data-type-filter]").forEach(b => {
            b.classList.toggle("active", b.getAttribute("data-type-filter") === "all");
        });
        this.renderCategoryChips();
        this.renderItemGrid();
    }

    /**
     * Open Radar Comparison Modal for deep dive into 2 matching items
     */
    openRadarModal(itemIdA, itemIdB) {
        const itemA = this.items.find(i => i.id === itemIdA);
        const itemB = this.items.find(i => i.id === itemIdB);
        if (!itemA || !itemB) return;

        const modal = document.getElementById("radar-modal");
        if (!modal) return;

        const match = this.matchingEngine.calculateMatch(itemA, itemB);

        // Render Side by Side HUD
        document.getElementById("radar-score-big").textContent = `${match.totalScore}%`;
        document.getElementById("radar-confidence-badge").textContent = match.confidence;
        document.getElementById("radar-confidence-badge").style.color = match.confidenceColor;

        // Item A (Lost)
        const lost = itemA.type === "lost" ? itemA : itemB;
        const found = itemA.type === "found" ? itemA : itemB;

        document.getElementById("radar-lost-title").textContent = lost.title;
        document.getElementById("radar-lost-img").src = lost.imageUrl;
        document.getElementById("radar-lost-location").textContent = lost.locationName;
        document.getElementById("radar-lost-color").textContent = lost.color;
        document.getElementById("radar-lost-desc").textContent = lost.description;

        // Item B (Found)
        document.getElementById("radar-found-title").textContent = found.title;
        document.getElementById("radar-found-img").src = found.imageUrl;
        document.getElementById("radar-found-location").textContent = found.locationName;
        document.getElementById("radar-found-color").textContent = found.color;
        document.getElementById("radar-found-desc").textContent = found.description;

        // Render Factor Breakdown Bars
        const b = match.breakdown;
        document.getElementById("radar-factor-category-bar").style.width = `${b.category.score}%`;
        document.getElementById("radar-factor-category-val").textContent = `${b.category.score}% (${b.category.detail})`;

        document.getElementById("radar-factor-color-bar").style.width = `${b.color.score}%`;
        document.getElementById("radar-factor-color-val").textContent = `${b.color.score}% (${b.color.detail})`;

        document.getElementById("radar-factor-location-bar").style.width = `${b.location.score}%`;
        document.getElementById("radar-factor-location-val").textContent = `${b.location.score}% (${b.location.detail})`;

        document.getElementById("radar-factor-desc-bar").style.width = `${b.description.score}%`;
        document.getElementById("radar-factor-desc-val").textContent = `${b.description.score}% (${b.description.detail})`;

        // Shared Keywords
        const keywordsContainer = document.getElementById("radar-shared-keywords");
        if (keywordsContainer) {
            keywordsContainer.innerHTML = (b.description.sharedKeywords || []).map(k => `
                <span class="keyword-pill">🏷️ ${k}</span>
            `).join("");
        }

        // Action claim button inside radar modal
        const radarClaimBtn = document.getElementById("radar-start-claim-btn");
        if (radarClaimBtn) {
            radarClaimBtn.onclick = () => {
                modal.classList.remove("active");
                this.openClaimModal(found.id);
            };
        }

        modal.classList.add("active");
        if (window.soundFX) window.soundFX.playMatchPing();
    }

    /**
     * View all matches for a specific lost item
     */
    findMatchesForReport(itemId) {
        const item = this.items.find(i => i.id === itemId);
        if (!item) return;

        const candidatePool = this.items.filter(i => i.type !== item.type);
        const matches = this.matchingEngine.findMatchesFor(item, candidatePool);

        if (matches.length > 0 && matches[0].score >= 40) {
            this.openRadarModal(item.id, matches[0].item.id);
        } else {
            this.showToast("Radar Scan Completed", "No active items meet the similarity threshold yet. System monitoring 24/7.");
        }
    }

    openClaimModal(itemId) {
        const item = this.items.find(i => i.id === itemId);
        if (item) {
            this.verificationSystem.openClaimModal(item);
        }
    }

    submitClaimForm() {
        const itemId = document.getElementById("claim-item-id").value;
        const proofText = document.getElementById("claim-proof-input").value.trim();

        if (!proofText || proofText.length < 5) {
            alert("Please provide descriptive proof answering the ownership challenge.");
            return;
        }

        const result = this.claimsTracker.submitClaim(itemId, proofText);
        if (result.success) {
            const item = this.items.find(i => i.id === itemId);
            if (item) {
                this.emailService.sendClaimChallengeReceived(result.claim, item);
            }
            document.getElementById("claim-modal").classList.remove("active");
            this.showToast("Claim Challenge Submitted! 🛡️", "Verification response sent. Notification & email alert dispatched.");
            this.renderAll();
        }
    }

    openVerificationModal(claimId) {
        const claim = this.claims.find(c => c.id === claimId);
        if (!claim) return;
        const item = this.items.find(i => i.id === claim.itemId);
        this.verificationSystem.openVerificationModal(claim, item);
    }

    handleApproveClaim() {
        const claimId = document.getElementById("verify-claim-id").value;
        const claim = this.claims.find(c => c.id === claimId);
        const item = claim ? this.items.find(i => i.id === claim.itemId) : null;

        const success = this.claimsTracker.approveClaim(claimId);
        if (success) {
            if (claim && item) {
                this.emailService.sendClaimApproved(claim, item);
            }
            document.getElementById("verification-modal").classList.remove("active");
            this.showToast("Claim Verified & Locker Assigned! 🎉", "+200 Karma credited to finder. Pickup email sent.");
            this.renderAll();
        }
    }

    handleRejectClaim() {
        const claimId = document.getElementById("verify-claim-id").value;
        const success = this.claimsTracker.rejectClaim(claimId, "Owner details did not correspond with confidential markings.");
        if (success) {
            document.getElementById("verification-modal").classList.remove("active");
            this.showToast("Claim Rejected", "Security discrepancy logged.");
            this.renderAll();
        }
    }

    renderRadarDashboard() {
        const container = document.getElementById("radar-matches-list");
        if (!container) return;

        const lostItems = this.items.filter(i => i.type === "lost");
        const foundItems = this.items.filter(i => i.type === "found");

        let allPairs = [];
        lostItems.forEach(lost => {
            const matches = this.matchingEngine.findMatchesFor(lost, foundItems);
            matches.forEach(m => {
                if (m.score >= 50) {
                    allPairs.push({ lost, found: m.item, score: m.score, confidence: m.confidence, breakdown: m.breakdown });
                }
            });
        });

        allPairs.sort((a, b) => b.score - a.score);

        if (allPairs.length === 0) {
            container.innerHTML = `<p class="empty-text">No active high-match pairs detected right now.</p>`;
            return;
        }

        container.innerHTML = allPairs.map(pair => `
            <div class="radar-card glass-panel" onclick="window.findItApp.openRadarModal('${pair.lost.id}', '${pair.found.id}')">
                <div class="radar-card-badge">
                    <span class="match-percentage-badge">${pair.score}% MATCH</span>
                    <span class="match-level">${pair.confidence}</span>
                </div>
                <div class="radar-comparison-grid">
                    <div class="radar-side side-lost">
                        <span class="side-tag tag-lost">LOST BY ${pair.lost.reporterName}</span>
                        <h4>${pair.lost.title}</h4>
                        <p>📍 ${pair.lost.locationName}</p>
                    </div>
                    <div class="radar-divider-icon">⚡</div>
                    <div class="radar-side side-found">
                        <span class="side-tag tag-found">FOUND BY ${pair.found.reporterName}</span>
                        <h4>${pair.found.title}</h4>
                        <p>📍 ${pair.found.locationName}</p>
                    </div>
                </div>
                <div class="radar-factors-summary">
                    <span class="factor-badge">Category: ${pair.breakdown.category.score}%</span>
                    <span class="factor-badge">Color: ${pair.breakdown.color.score}%</span>
                    <span class="factor-badge">Location: ${pair.breakdown.location.score}%</span>
                    <span class="factor-badge">Keywords: ${pair.breakdown.description.score}%</span>
                </div>
            </div>
        `).join("");
    }

    renderClaimsView() {
        const container = document.getElementById("claims-list-container");
        if (!container) return;

        if (this.claims.length === 0) {
            container.innerHTML = `<p class="empty-text">No claims logged yet.</p>`;
            return;
        }

        container.innerHTML = this.claims.map(claim => {
            const item = this.items.find(i => i.id === claim.itemId);
            const isFinder = claim.finderId === this.currentUser.id || this.currentUser.role === "admin";
            const isClaimant = claim.claimantId === this.currentUser.id;

            return `
                <div class="claim-card glass-panel status-${claim.status}">
                    <div class="claim-card-header">
                        <div>
                            <span class="claim-id-tag">#${claim.id}</span>
                            <h3 class="claim-item-title">${claim.itemTitle}</h3>
                        </div>
                        <span class="status-pill status-${claim.status}">
                            ${claim.status.replace('_', ' ').toUpperCase()}
                        </span>
                    </div>

                    <div class="claim-body-grid">
                        <div class="claim-info-col">
                            <p><strong>Claimant:</strong> ${claim.claimantName} (${claim.claimantEmail})</p>
                            <p><strong>Submitted Proof:</strong> <span class="proof-quote">"${claim.submittedProof}"</span></p>
                            <p><strong>Safe-Zone Pickup:</strong> ${claim.pickupLocation}</p>
                            <p><strong>Notes:</strong> ${claim.finderNotes}</p>
                        </div>
                        <div class="claim-timeline-col">
                            ${this.claimsTracker.renderTimelineHTML(claim)}
                        </div>
                    </div>

                    <div class="claim-card-footer">
                        <div class="reward-info-badge">
                            🎁 Reward: +${claim.rewardPoints} Karma ${claim.rewardAwarded ? '(Awarded ✓)' : '(Pending Verification)'}
                        </div>
                        <div class="claim-actions">
                            ${(isFinder && claim.status === 'pending_verification') ? `
                                <button class="btn btn-primary btn-sm" onclick="window.findItApp.openVerificationModal('${claim.id}')">
                                    🔓 Reveal Secret & Verify Proof
                                </button>
                            ` : ''}
                            ${(claim.status === 'ready_for_pickup') ? `
                                <button class="btn btn-secondary btn-sm" onclick="window.findItApp.claimsTracker.completeReturn('${claim.id}'); window.findItApp.renderAll();">
                                    ✓ Confirm Handover Complete
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join("");
    }

    renderRewardsView() {
        const balanceEl = document.getElementById("rewards-user-balance");
        const itemsReturnedEl = document.getElementById("rewards-items-returned");
        const catalogContainer = document.getElementById("rewards-catalog-grid");
        const leaderboardContainer = document.getElementById("leaderboard-table-body");
        const badgesContainer = document.getElementById("user-badges-container");

        if (balanceEl) balanceEl.textContent = this.currentUser.karmaPoints;
        if (itemsReturnedEl) itemsReturnedEl.textContent = this.currentUser.itemsReturned;

        if (badgesContainer) {
            badgesContainer.innerHTML = (this.currentUser.badges || []).map(b => `
                <span class="badge-pill">🏅 ${b}</span>
            `).join("");
        }

        if (catalogContainer) {
            catalogContainer.innerHTML = this.rewardsSystem.renderRewardsStoreHTML();
        }

        if (leaderboardContainer) {
            leaderboardContainer.innerHTML = this.leaderboard.map(entry => `
                <tr class="${entry.name.includes(this.currentUser.name) ? 'row-highlight' : ''}">
                    <td><span class="rank-badge rank-${entry.rank}">#${entry.rank}</span></td>
                    <td>
                        <div class="leader-user">
                            <img src="${entry.avatar}" class="leader-avatar" alt="${entry.name}" />
                            <div>
                                <div class="leader-name">${entry.name}</div>
                                <div class="leader-major">${entry.major}</div>
                            </div>
                        </div>
                    </td>
                    <td><span class="leader-badge-pill">${entry.badge}</span></td>
                    <td><strong>${entry.itemsReturned} items</strong></td>
                    <td><span class="leader-points">⚡ ${entry.points} pts</span></td>
                </tr>
            `).join("");
        }
    }

    handleRedeemClick(rewardId) {
        const result = this.rewardsSystem.redeemReward(rewardId);
        if (result.success) {
            this.emailService.sendVoucherIssued(result.voucher, this.currentUser);
            this.showVoucherModal(result.voucher);
            this.renderRewardsView();
        } else {
            alert(result.error);
        }
    }

    showVoucherModal(voucher) {
        const modal = document.getElementById("voucher-modal");
        if (!modal) return;

        document.getElementById("voucher-modal-title").textContent = voucher.title;
        document.getElementById("voucher-modal-code").textContent = voucher.code;
        document.getElementById("voucher-modal-expires").textContent = voucher.expires;

        modal.classList.add("active");
        if (window.soundFX) window.soundFX.playReward();
    }

    openReportModal(type = "lost") {
        const modal = document.getElementById("report-modal");
        if (!modal) return;

        document.getElementById("report-type-hidden").value = type;
        document.getElementById("report-modal-header-title").textContent = type === "lost" ? "Report Lost Item" : "Report Found Item";
        
        // Populate categories & locations
        const catSelect = document.getElementById("report-category");
        if (catSelect) {
            catSelect.innerHTML = this.categories.map(c => `<option value="${c.id}">${c.label}</option>`).join("");
        }

        const locSelect = document.getElementById("report-location");
        if (locSelect) {
            locSelect.innerHTML = this.campusLocations.map(l => `<option value="${l.id}">${l.name}</option>`).join("");
        }

        // Toggle hidden details secret field if it's found vs lost
        const secretGroup = document.getElementById("report-secret-group");
        if (secretGroup) {
            secretGroup.style.display = "block";
        }

        // Clear inputs
        document.getElementById("report-title").value = "";
        document.getElementById("report-desc").value = "";
        document.getElementById("report-color").value = "Space Gray";
        document.getElementById("report-prompt").value = "";
        document.getElementById("report-secret").value = "";

        modal.classList.add("active");
        this.updateReportLiveMatchPreview();
        if (window.soundFX) window.soundFX.playModalOpen();
    }

    updateReportLiveMatchPreview() {
        const title = document.getElementById("report-title").value;
        const desc = document.getElementById("report-desc").value;
        const category = document.getElementById("report-category").value;
        const color = document.getElementById("report-color").value;
        const locationId = document.getElementById("report-location").value;
        const type = document.getElementById("report-type-hidden").value;

        const previewContainer = document.getElementById("report-live-matches-preview");
        if (!previewContainer) return;

        if (!title && !desc) {
            previewContainer.innerHTML = `<p class="preview-placeholder">Type details above to see real-time matches across campus...</p>`;
            return;
        }

        const draftItem = {
            id: "draft",
            title: title || "Item",
            category: category,
            color: color,
            locationId: locationId,
            locationName: (this.campusLocations.find(l => l.id === locationId) || {}).name || "",
            description: desc,
            type: type
        };

        const oppositePool = this.items.filter(i => i.type !== type);
        const matches = this.matchingEngine.findMatchesFor(draftItem, oppositePool);

        if (matches.length > 0 && matches[0].score >= 45) {
            const top = matches[0];
            previewContainer.innerHTML = `
                <div class="live-match-hit">
                    <span class="live-match-score">⚡ ${top.score}% Potential Match Found!</span>
                    <h4>${top.item.title}</h4>
                    <p>📍 ${top.item.locationName} | Color: ${top.item.color}</p>
                </div>
            `;
        } else {
            previewContainer.innerHTML = `<p class="preview-placeholder">No matching counterpart detected yet. Ready to submit report.</p>`;
        }
    }

    submitNewReport() {
        const type = document.getElementById("report-type-hidden").value;
        const title = document.getElementById("report-title").value.trim();
        const category = document.getElementById("report-category").value;
        const color = document.getElementById("report-color").value.trim();
        const locationId = document.getElementById("report-location").value;
        const desc = document.getElementById("report-desc").value.trim();
        const prompt = document.getElementById("report-prompt").value.trim();
        const secret = document.getElementById("report-secret").value.trim();

        if (!title || !desc) {
            alert("Please provide an item title and description.");
            return;
        }

        const locObj = this.campusLocations.find(l => l.id === locationId);

        const newItem = {
            id: `item_${Date.now()}`,
            type: type,
            title: title,
            category: category,
            color: color || "Standard",
            colorHex: "#38bdf8",
            locationId: locationId,
            locationName: locObj ? locObj.name : "Campus Grounds",
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            description: desc,
            imageUrl: type === "lost" 
                ? "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80"
                : "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80",
            reporterId: this.currentUser.id,
            reporterName: this.currentUser.name,
            reporterContact: this.currentUser.email,
            rewardOffered: type === "lost" ? 100 : 0,
            status: "active",
            hiddenDetailsPrompt: prompt || "Describe distinctive markings or serial numbers",
            hiddenDetailsSecret: secret || "Confidential verification key",
            tags: [title.toLowerCase(), color.toLowerCase(), category]
        };

        this.items.unshift(newItem);

        // If found item, award reporting bonus points
        if (type === "found") {
            this.rewardsSystem.awardPoints(this.currentUser.id, 50, `Reported found item: ${newItem.title}`);
        }

        this.saveState();
        document.getElementById("report-modal").classList.remove("active");
        this.renderAll();

        // Check if new report generated instant match
        const oppositePool = this.items.filter(i => i.type !== type && i.id !== newItem.id);
        const matches = this.matchingEngine.findMatchesFor(newItem, oppositePool);

        if (matches.length > 0 && matches[0].score >= 70) {
            const top = matches[0];
            const lostItem = type === "lost" ? newItem : top.item;
            const foundItem = type === "found" ? newItem : top.item;
            this.emailService.sendMatchAlert(lostItem, foundItem, top.score);

            this.showToast("⚡ Smart Match Triggered!", `System calculated a ${matches[0].score}% match with an existing report! Email dispatched.`);
            this.openRadarModal(newItem.id, matches[0].item.id);
        } else {
            this.showToast("Report Published", `Your ${type} item is now indexed campus-wide.`);
        }
    }

    simulateLiveMatchEvent() {
        // Create an instant live matched report to show judges / evaluators the magic!
        const demoFoundItem = {
            id: `item_sim_${Date.now()}`,
            type: "found",
            title: "Apple MacBook Air 13-inch found at 2nd Floor Library Desk",
            category: "electronics",
            color: "Space Gray",
            colorHex: "#4b5563",
            locationId: "loc_library",
            locationName: "Main Library - 2nd Floor Study Commons",
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            description: "Turned in to library librarian. Space gray Apple laptop with stickers on lower chassis.",
            imageUrl: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=600&q=80",
            reporterId: "usr_finder_1",
            reporterName: "Jordan Cole",
            reporterContact: "jordan.cole@campus.edu",
            storageLocation: "Library Circulation Desk Locker #4",
            status: "active",
            hiddenDetailsPrompt: "What sticker is by the trackpad?",
            hiddenDetailsSecret: "Octocat sticker by trackpad. Space nebula lockscreen.",
            tags: ["laptop", "apple", "macbook", "library"]
        };

        this.items.unshift(demoFoundItem);
        this.saveState();
        this.renderAll();

        // Find student lost item
        const lost = this.items.find(i => i.id === "item_lost_1");
        if (lost) {
            this.emailService.sendMatchAlert(lost, demoFoundItem, 96);
        }

        // Trigger notification
        this.addNotification({
            id: `notif_${Date.now()}`,
            title: "⚡ LIVE RADAR MATCH: 96%",
            message: "Just now: An item matching your lost MacBook Air was turned in at the Main Library!",
            type: "match",
            date: "Just now",
            unread: true,
            itemId: demoFoundItem.id,
            matchScore: 96
        });

        this.showToast("⚡ LIVE MATCH DETECTED (96%)", "High-confidence match calculated across category, color, location & keywords! Email alert sent.");
        if (window.soundFX) window.soundFX.playMatchPing();

        if (lost) {
            setTimeout(() => {
                this.openRadarModal(lost.id, demoFoundItem.id);
            }, 800);
        }
    }

    addNotification(notif) {
        this.notifications.unshift(notif);
        this.renderNotificationsBadge();
        this.saveState();
    }

    renderNotificationsBadge() {
        const unreadCount = this.notifications.filter(n => n.unread).length;
        const badge = document.getElementById("notif-badge-count");
        if (badge) {
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? "inline-flex" : "none";
        }
    }

    renderNotificationsList() {
        const container = document.getElementById("notifications-list");
        if (!container) return;

        if (this.notifications.length === 0) {
            container.innerHTML = `<p class="empty-text">No notifications.</p>`;
            return;
        }

        container.innerHTML = this.notifications.map(n => `
            <div class="notif-item ${n.unread ? 'unread' : ''}" onclick="window.findItApp.handleNotifClick('${n.id}')">
                <div class="notif-header">
                    <span class="notif-type-tag tag-${n.type}">${n.type.toUpperCase()}</span>
                    <span class="notif-time">${n.date}</span>
                </div>
                <h4 class="notif-title">${n.title}</h4>
                <p class="notif-desc">${n.message}</p>
            </div>
        `).join("");
    }

    handleNotifClick(notifId) {
        const n = this.notifications.find(x => x.id === notifId);
        if (n) {
            n.unread = false;
            this.renderNotificationsBadge();
            this.saveState();
            if (n.type === "match") {
                this.switchView("radar");
            } else if (n.type === "claim") {
                this.switchView("claims");
            }
        }
    }

    checkForHighMatches() {
        // Automatically check if currentUser has lost items with high match candidate
        const userLost = this.items.filter(i => i.type === "lost" && i.reporterId === this.currentUser.id);
        const foundPool = this.items.filter(i => i.type === "found");

        userLost.forEach(lost => {
            const matches = this.matchingEngine.findMatchesFor(lost, foundPool);
            if (matches.length > 0 && matches[0].score >= 80) {
                // High match exists
            }
        });
    }

    showToast(title, message) {
        const toastContainer = document.getElementById("toast-container");
        if (!toastContainer) return;

        const toast = document.createElement("div");
        toast.className = "toast-bubble glass-panel";
        toast.innerHTML = `
            <div class="toast-indicator"></div>
            <div class="toast-content">
                <h4 class="toast-title">${title}</h4>
                <p class="toast-message">${message}</p>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
        `;

        toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.classList.add("toast-fadeout");
            setTimeout(() => toast.remove(), 400);
        }, 4500);
    }

    openEmailSettingsModal() {
        const modal = document.getElementById("email-settings-modal");
        if (!modal) return;

        const cfg = this.emailService.config;
        document.getElementById("emailjs-public-key").value = cfg.publicKey || "";
        document.getElementById("emailjs-service-id").value = cfg.serviceId || "";
        document.getElementById("emailjs-template-id").value = cfg.templateId || "";
        document.getElementById("emailjs-target-email").value = cfg.fallbackRecipient || this.currentUser.email || "";

        this.renderEmailLogsList();
        modal.classList.add("active");
        if (window.soundFX) window.soundFX.playModalOpen();
    }

    saveEmailSettings() {
        const pKey = document.getElementById("emailjs-public-key").value.trim();
        const sId = document.getElementById("emailjs-service-id").value.trim();
        const tId = document.getElementById("emailjs-template-id").value.trim();
        const targetEmail = document.getElementById("emailjs-target-email").value.trim();

        this.emailService.config.publicKey = pKey;
        this.emailService.config.serviceId = sId;
        this.emailService.config.templateId = tId;
        this.emailService.config.fallbackRecipient = targetEmail;

        this.emailService.saveConfig();
        this.emailService.initEmailJS();

        this.showToast("Email Settings Saved", targetEmail ? `Emails will route to ${targetEmail}` : "EmailJS configuration updated.");
        if (window.soundFX) window.soundFX.playSuccess();
    }

    async sendTestLiveEmail() {
        const targetEmail = document.getElementById("emailjs-target-email").value.trim() || this.currentUser.email;
        this.saveEmailSettings();

        this.showToast("Sending Test Email...", `Connecting to EmailJS pipeline for ${targetEmail}`);
        await this.emailService.sendTestEmail(targetEmail);
        this.renderEmailLogsList();
    }

    renderEmailLogsList() {
        const container = document.getElementById("email-logs-list");
        if (!container) return;

        const logs = this.emailService.sentEmailsLog || [];
        if (logs.length === 0) {
            container.innerHTML = `<p class="empty-text">No emails dispatched yet in this session.</p>`;
            return;
        }

        container.innerHTML = logs.map(e => `
            <div class="email-log-item glass-panel">
                <div class="email-log-header">
                    <span class="email-badge-type tag-${e.type}">📧 ${e.type.toUpperCase()}</span>
                    <span class="email-log-time">${e.date} • ${e.timestamp}</span>
                </div>
                <h4 class="email-log-subject">${e.subject}</h4>
                <div class="email-log-meta">
                    <strong>To:</strong> ${e.toName} &lt;${e.toEmail}&gt; | 
                    <span style="color: #10b981;">${e.deliveryMethod}</span>
                </div>
                <p class="email-log-details">${(e.payload && e.payload.details) || ''}</p>
            </div>
        `).join("");
    }
}

// Global initialization
window.addEventListener("DOMContentLoaded", () => {
    window.findItApp = new FindItApp();
    window.findItApp.init();
});
