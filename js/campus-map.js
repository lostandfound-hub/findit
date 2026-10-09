/**
 * FindIt - Interactive Campus Radar Map
 * Smooth SVG interactive campus layout with location pins, match hotspots, and safe-zones.
 */

class CampusMap {
    constructor(app, containerId) {
        this.app = app;
        this.containerId = containerId;
        this.selectedLocationId = null;
    }

    render() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        const locations = this.app.campusLocations || [];
        const items = this.app.items || [];

        // Count lost and found per location
        const locationStats = {};
        locations.forEach(loc => {
            locationStats[loc.id] = { lost: 0, found: 0, items: [] };
        });

        items.forEach(item => {
            if (locationStats[item.locationId]) {
                if (item.type === "lost") locationStats[item.locationId].lost++;
                if (item.type === "found") locationStats[item.locationId].found++;
                locationStats[item.locationId].items.push(item);
            }
        });

        let pinsHTML = locations.map(loc => {
            const stats = locationStats[loc.id] || { lost: 0, found: 0, items: [] };
            const total = stats.lost + stats.found;
            const hasMatch = stats.lost > 0 && stats.found > 0;
            const isSelected = this.selectedLocationId === loc.id;

            return `
                <div class="campus-pin ${hasMatch ? 'pin-hotspot' : ''} ${isSelected ? 'pin-selected' : ''}"
                     style="left: ${loc.x}%; top: ${loc.y}%;"
                     onclick="window.findItApp.campusMap.selectLocation('${loc.id}')"
                     title="${loc.name}">
                    <div class="pin-pulse ${hasMatch ? 'pulse-high' : ''}"></div>
                    <div class="pin-marker">
                        <span class="pin-icon">${loc.id === 'loc_security' ? '🛡️' : (hasMatch ? '⚡' : (stats.found > 0 ? '📦' : '🔍'))}</span>
                        <span class="pin-count">${total}</span>
                    </div>
                    <div class="pin-label">${loc.name.split(' - ')[0]}</div>
                </div>
            `;
        }).join("");

        container.innerHTML = `
            <div class="campus-map-wrapper">
                <div class="campus-map-grid-bg"></div>
                <!-- Interactive SVG Map Graphics -->
                <svg class="campus-svg-canvas" viewBox="0 0 1000 600" preserveAspectRatio="none">
                    <defs>
                        <radialGradient id="quadGlow" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.15" />
                            <stop offset="100%" stop-color="#38bdf8" stop-opacity="0" />
                        </radialGradient>
                        <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.6"/>
                            <stop offset="100%" stop-color="#818cf8" stop-opacity="0.2"/>
                        </linearGradient>
                    </defs>

                    <!-- Campus Green & Pathways -->
                    <circle cx="500" cy="300" r="280" fill="url(#quadGlow)" />
                    
                    <!-- Campus Transit Loop Road -->
                    <path d="M 220 180 Q 500 120 780 180 T 780 480 Q 500 550 220 480 Z" 
                          fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="24" stroke-dasharray="10 8" />
                    
                    <!-- Walkway Connectors -->
                    <line x1="380" y1="210" x2="650" y2="170" stroke="url(#pathGradient)" stroke-width="3" stroke-dasharray="6 4" />
                    <line x1="380" y1="210" x2="500" y2="290" stroke="url(#pathGradient)" stroke-width="3" stroke-dasharray="6 4" />
                    <line x1="650" y1="170" x2="780" y2="330" stroke="url(#pathGradient)" stroke-width="3" stroke-dasharray="6 4" />
                    <line x1="500" y1="290" x2="450" y2="370" stroke="url(#pathGradient)" stroke-width="3" stroke-dasharray="6 4" />
                    <line x1="450" y1="370" x2="220" y2="420" stroke="url(#pathGradient)" stroke-width="3" stroke-dasharray="6 4" />

                    <!-- Building Footprints -->
                    <!-- Library -->
                    <rect x="330" y="180" width="100" height="70" rx="8" fill="rgba(56, 189, 248, 0.08)" stroke="rgba(56, 189, 248, 0.4)" stroke-width="1.5" />
                    <!-- Science Lab -->
                    <rect x="610" y="140" width="90" height="75" rx="8" fill="rgba(168, 85, 247, 0.08)" stroke="rgba(168, 85, 247, 0.4)" stroke-width="1.5" />
                    <!-- Student Union -->
                    <rect x="400" y="340" width="110" height="75" rx="8" fill="rgba(16, 185, 129, 0.08)" stroke="rgba(16, 185, 129, 0.4)" stroke-width="1.5" />
                    <!-- Gym & Rec -->
                    <rect x="180" y="390" width="95" height="70" rx="8" fill="rgba(245, 158, 11, 0.08)" stroke="rgba(245, 158, 11, 0.4)" stroke-width="1.5" />
                    <!-- Engineering -->
                    <rect x="730" y="300" width="100" height="75" rx="8" fill="rgba(236, 72, 153, 0.08)" stroke="rgba(236, 72, 153, 0.4)" stroke-width="1.5" />
                    <!-- Security Safe Zone HQ -->
                    <circle cx="500" cy="290" r="32" fill="rgba(59, 130, 246, 0.15)" stroke="#38bdf8" stroke-width="2" />
                </svg>

                <div class="campus-pins-layer">
                    ${pinsHTML}
                </div>

                <div class="map-legend-glass">
                    <div class="legend-item"><span class="legend-dot dot-cyan"></span> Found Item</div>
                    <div class="legend-item"><span class="legend-dot dot-amber"></span> Lost Item</div>
                    <div class="legend-item"><span class="legend-dot dot-match"></span> Smart Match Hotspot</div>
                    <div class="legend-item"><span class="legend-dot dot-safe"></span> Safe-Zone Locker</div>
                </div>
            </div>
        `;
    }

    selectLocation(locationId) {
        this.selectedLocationId = locationId;
        const loc = this.app.campusLocations.find(l => l.id === locationId);
        if (loc) {
            // Filter the main app grid to this location
            this.app.filterByLocation(locationId, loc.name);
            if (window.soundFX) window.soundFX.playClick();
        }
        this.render();
    }
}

// Export for browser
if (typeof window !== "undefined") {
    window.CampusMap = CampusMap;
}
