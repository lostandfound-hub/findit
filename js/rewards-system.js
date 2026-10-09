/**
 * FindIt - Reward System & Campus Karma Economy
 * Manages karma points, perk voucher redemption, badges, and leaderboards.
 */

class RewardsSystem {
    constructor(app) {
        this.app = app;
        this.transactions = [];
    }

    /**
     * Award karma points to a user
     */
    awardPoints(userId, amount, reason) {
        // Find user in demo users or current user
        let targetUser = this.app.demoUsers.find(u => u.id === userId);
        if (!targetUser && this.app.currentUser.id === userId) {
            targetUser = this.app.currentUser;
        }

        if (targetUser) {
            targetUser.karmaPoints = (targetUser.karmaPoints || 0) + amount;
            targetUser.itemsReturned = (targetUser.itemsReturned || 0) + 1;

            // Check badges
            if (targetUser.itemsReturned >= 1 && !targetUser.badges.includes("Good Samaritan")) {
                targetUser.badges.push("Good Samaritan");
            }
            if (targetUser.itemsReturned >= 3 && !targetUser.badges.includes("Eagle Eye")) {
                targetUser.badges.push("Eagle Eye");
            }
            if (targetUser.karmaPoints >= 500 && !targetUser.badges.includes("Campus Legend")) {
                targetUser.badges.push("Campus Legend");
            }
        }

        if (this.app.currentUser.id === userId) {
            this.app.currentUser.karmaPoints = targetUser.karmaPoints;
            this.app.currentUser.itemsReturned = targetUser.itemsReturned;
        }

        this.transactions.unshift({
            id: `tx_${Date.now()}`,
            userId: userId,
            amount: amount,
            type: "earn",
            reason: reason,
            date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        // Trigger UI pulse update
        this.app.updateHeaderUser();
        this.app.saveState();
        return true;
    }

    /**
     * Redeem a reward voucher from the catalog
     */
    redeemReward(rewardId) {
        const reward = this.app.rewardsStore.find(r => r.id === rewardId);
        if (!reward) return { success: false, error: "Reward not found" };

        const user = this.app.currentUser;
        if (user.karmaPoints < reward.pointsCost) {
            return {
                success: false,
                error: `Insufficient Karma. You need ${reward.pointsCost} pts (You have ${user.karmaPoints} pts).`
            };
        }

        // Deduct points
        user.karmaPoints -= reward.pointsCost;

        // Update corresponding demo user
        const demoUser = this.app.demoUsers.find(u => u.id === user.id);
        if (demoUser) {
            demoUser.karmaPoints = user.karmaPoints;
        }

        const voucherCode = `FIT-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Date.now().toString().slice(-4)}`;

        const voucher = {
            id: `vouch_${Date.now()}`,
            rewardId: reward.id,
            title: reward.title,
            code: voucherCode,
            date: new Date().toLocaleDateString(),
            expires: "Valid for 30 Days",
            status: "active"
        };

        this.transactions.unshift({
            id: `tx_${Date.now()}`,
            userId: user.id,
            amount: -reward.pointsCost,
            type: "spend",
            reason: `Redeemed: ${reward.title}`,
            date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        this.app.saveState();
        this.app.updateHeaderUser();

        if (window.soundFX) window.soundFX.playReward();

        return {
            success: true,
            voucher: voucher,
            newBalance: user.karmaPoints
        };
    }

    /**
     * Render the rewards catalog grid HTML
     */
    renderRewardsStoreHTML() {
        const user = this.app.currentUser;
        return this.app.rewardsStore.map(r => {
            const canAfford = user.karmaPoints >= r.pointsCost;
            return `
                <div class="reward-card glass-panel ${canAfford ? 'affordable' : 'locked'}">
                    <div class="reward-card-header">
                        <span class="reward-badge-tag">${r.badge}</span>
                        <div class="reward-cost">
                            <span class="cost-number">${r.pointsCost}</span>
                            <span class="cost-unit">PTS</span>
                        </div>
                    </div>
                    <div class="reward-icon-wrapper" style="color: ${r.color};">
                        <i class="icon-${r.icon} custom-svg-icon"></i>
                    </div>
                    <h3 class="reward-title">${r.title}</h3>
                    <p class="reward-desc">${r.description}</p>
                    <div class="reward-footer">
                        <span class="reward-category-label">${r.category}</span>
                        <button class="btn btn-primary btn-sm redeem-btn ${canAfford ? '' : 'btn-disabled'}"
                            onclick="window.findItApp.handleRedeemClick('${r.id}')"
                            ${canAfford ? '' : 'disabled'}>
                            ${canAfford ? '⚡ Redeem Pass' : '🔒 Need ' + (r.pointsCost - user.karmaPoints) + ' Pts'}
                        </button>
                    </div>
                </div>
            `;
        }).join("");
    }
}

// Export for browser
if (typeof window !== "undefined") {
    window.RewardsSystem = RewardsSystem;
}
