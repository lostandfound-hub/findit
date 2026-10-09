/**
 * FindIt - Claims Tracker & Live Notification System
 * Tracks multi-stage claim lifecycles, safe-zone handovers, and match alerts.
 */

class ClaimsTracker {
    constructor(app) {
        this.app = app;
    }

    /**
     * Submit a new claim for an item
     */
    submitClaim(itemId, proofText) {
        const item = this.app.items.find(i => i.id === itemId);
        if (!item) return { success: false, error: "Item not found" };

        const currentUser = this.app.currentUser;

        // Find if claimant already has a matching lost item
        const matchingLostItem = this.app.items.find(i =>
            i.type === "lost" && i.reporterId === currentUser.id && i.category === item.category
        );

        const newClaim = {
            id: `claim_${Date.now()}`,
            itemId: item.id,
            lostItemId: matchingLostItem ? matchingLostItem.id : null,
            claimantId: currentUser.id,
            claimantName: currentUser.name,
            claimantEmail: currentUser.email,
            finderId: item.reporterId,
            itemTitle: item.title,
            claimDate: new Date().toISOString(),
            status: "pending_verification", // "pending_verification", "verified", "ready_for_pickup", "returned"
            submittedProof: proofText,
            finderNotes: "Challenge response submitted. Awaiting verification from finder or campus safety officer.",
            matchScore: 94,
            pickupLocation: item.storageLocation || "Campus Security Central Safe-Zone (Desk 1)",
            rewardAwarded: false,
            rewardPoints: item.rewardOffered || 150
        };

        this.app.claims.unshift(newClaim);
        this.app.saveState();

        // Push notification to finder / campus
        this.app.addNotification({
            id: `notif_${Date.now()}`,
            title: "New Ownership Claim Submitted",
            message: `${currentUser.name} submitted proof of ownership for "${item.title}". Verify challenge to approve.`,
            type: "claim",
            date: "Just now",
            unread: true,
            claimId: newClaim.id,
            itemId: item.id
        });

        if (window.soundFX) window.soundFX.playSuccess();
        return { success: true, claim: newClaim };
    }

    /**
     * Finder or Admin approves claim after verifying the hidden details
     */
    approveClaim(claimId, customNotes = "") {
        const claim = this.app.claims.find(c => c.id === claimId);
        if (!claim) return false;

        claim.status = "ready_for_pickup";
        claim.finderNotes = customNotes || "Ownership verified successfully! Item placed in designated safe locker.";
        
        // Update item status
        const item = this.app.items.find(i => i.id === claim.itemId);
        if (item) {
            item.status = "claimed";
        }

        // Award reward points to finder
        if (!claim.rewardAwarded) {
            claim.rewardAwarded = true;
            this.app.rewardsSystem.awardPoints(
                claim.finderId,
                claim.rewardPoints || 200,
                `Successfully verified and returned ${claim.itemTitle}`
            );
        }

        // Notify claimant
        this.app.addNotification({
            id: `notif_${Date.now()}`,
            title: "🎉 Claim Verified & Approved!",
            message: `Your ownership proof for "${claim.itemTitle}" was approved! Ready for pickup at ${claim.pickupLocation}.`,
            type: "claim",
            date: "Just now",
            unread: true,
            claimId: claim.id
        });

        this.app.saveState();
        if (window.soundFX) window.soundFX.playReward();
        return true;
    }

    /**
     * Reject fraudulent or incorrect claim
     */
    rejectClaim(claimId, reason = "") {
        const claim = this.app.claims.find(c => c.id === claimId);
        if (!claim) return false;

        claim.status = "rejected";
        claim.finderNotes = reason || "Submitted proof did not match the hidden identifying markers.";

        this.app.addNotification({
            id: `notif_${Date.now()}`,
            title: "Claim Verification Declined",
            message: `Proof submitted for "${claim.itemTitle}" did not match secret item details.`,
            type: "claim",
            date: "Just now",
            unread: true,
            claimId: claim.id
        });

        this.app.saveState();
        return true;
    }

    /**
     * Mark claim as fully completed (handover finished)
     */
    completeReturn(claimId) {
        const claim = this.app.claims.find(c => c.id === claimId);
        if (!claim) return false;

        claim.status = "returned";
        const item = this.app.items.find(i => i.id === claim.itemId);
        if (item) item.status = "returned";

        this.app.saveState();
        if (window.soundFX) window.soundFX.playSuccess();
        return true;
    }

    /**
     * Render the visual timeline for a claim
     */
    renderTimelineHTML(claim) {
        const steps = [
            {
                key: "submitted",
                title: "Challenge Submitted",
                desc: "Owner answered security challenge",
                done: true,
                current: claim.status === "pending_verification"
            },
            {
                key: "verified",
                title: "Secret Details Verified",
                desc: "Finder unlocked & matched hidden vault",
                done: claim.status === "verified" || claim.status === "ready_for_pickup" || claim.status === "returned",
                current: claim.status === "verified"
            },
            {
                key: "pickup",
                title: "Safe-Zone Locker Pickup",
                desc: claim.pickupLocation,
                done: claim.status === "ready_for_pickup" || claim.status === "returned",
                current: claim.status === "ready_for_pickup"
            },
            {
                key: "returned",
                title: "Handed Over & Karma Credited",
                desc: `+${claim.rewardPoints || 200} Karma awarded to finder`,
                done: claim.status === "returned",
                current: claim.status === "returned"
            }
        ];

        return `
            <div class="claim-timeline">
                ${steps.map((s, idx) => `
                    <div class="timeline-step ${s.done ? "step-done" : ""} ${s.current ? "step-current" : ""}">
                        <div class="step-dot">
                            ${s.done ? "✓" : (idx + 1)}
                        </div>
                        <div class="step-content">
                            <h4 class="step-title">${s.title}</h4>
                            <p class="step-desc">${s.desc}</p>
                        </div>
                    </div>
                `).join("")}
            </div>
        `;
    }
}

// Export for browser
if (typeof window !== "undefined") {
    window.ClaimsTracker = ClaimsTracker;
}
