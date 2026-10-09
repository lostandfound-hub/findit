/**
 * FindIt - Ownership Verification & Hidden Detail Vault
 * Manages secret prompts, masked details, claimant challenge responses,
 * and finder/admin verification workflows.
 */

class VerificationSystem {
    constructor(app) {
        this.app = app;
    }

    /**
     * Masks the secret details unless user is authorized (finder, admin, or verified owner)
     */
    maskHiddenDetails(secret, isAuthorized = false) {
        if (isAuthorized) {
            return {
                isMasked: false,
                content: secret,
                badge: "UNLOCKED BY VERIFICATION"
            };
        }

        // Return redacted secure representation
        return {
            isMasked: true,
            content: "•••••••••••••••••••••••••••••••• [CONFIDENTIAL: SECURED IN OWNER VAULT]",
            badge: "LOCKED • REQUIRES PROOF"
        };
    }

    /**
     * Compute accuracy score between claimant's submission and finder's secret detail
     */
    verifyProofAccuracy(secret, submittedProof) {
        if (!secret || !submittedProof) return { score: 0, verdict: "Insufficient proof" };

        const normalize = text => text.toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/).filter(w => w.length > 2);
        const secretWords = normalize(secret);
        const proofWords = normalize(submittedProof);

        let matches = 0;
        proofWords.forEach(w => {
            if (secretWords.includes(w)) matches++;
        });

        const ratio = secretWords.length > 0 ? (matches / secretWords.length) : 0;
        const confidenceScore = Math.min(100, Math.round(ratio * 130));

        let verdict = "Needs Manual Review";
        let color = "#f59e0b";
        let isHighConfidence = false;

        if (confidenceScore >= 75) {
            verdict = "Authentic Owner Confirmed";
            color = "#10b981";
            isHighConfidence = true;
        } else if (confidenceScore >= 45) {
            verdict = "Probable Match - Verify ID";
            color = "#38bdf8";
        } else {
            verdict = "Proof Divergence - Discrepancy Found";
            color = "#ef4444";
        }

        return {
            score: confidenceScore,
            verdict: verdict,
            color: color,
            isHighConfidence: isHighConfidence
        };
    }

    /**
     * Open Claim Challenge Modal for student to submit proof
     */
    openClaimModal(item) {
        const modal = document.getElementById("claim-modal");
        if (!modal) return;

        document.getElementById("claim-item-id").value = item.id;
        document.getElementById("claim-item-title").textContent = item.title;
        document.getElementById("claim-item-location").textContent = item.locationName;
        document.getElementById("claim-item-badge").textContent = item.type.toUpperCase();
        document.getElementById("claim-security-prompt").textContent = item.hiddenDetailsPrompt || "Describe distinguishing scratches, engravings, stickers, or contents.";

        // Clear previous input
        const proofInput = document.getElementById("claim-proof-input");
        if (proofInput) proofInput.value = "";

        modal.classList.add("active");
        if (window.soundFX) window.soundFX.playModalOpen();
    }

    /**
     * Open Finder's "Reveal & Verify" Vault Modal
     */
    openVerificationModal(claim, item) {
        const modal = document.getElementById("verification-modal");
        if (!modal) return;

        document.getElementById("verify-claim-id").value = claim.id;
        document.getElementById("verify-item-title").textContent = item ? item.title : claim.itemTitle;
        document.getElementById("verify-claimant-name").textContent = claim.claimantName;
        document.getElementById("verify-claim-date").textContent = new Date(claim.claimDate).toLocaleString();

        // The Secret prompt and secret vault answer
        document.getElementById("verify-secret-prompt").textContent = item ? item.hiddenDetailsPrompt : "Ownership prompt";
        document.getElementById("verify-secret-vault").textContent = item ? item.hiddenDetailsSecret : "No secret registered";

        // The Claimant's submitted answer
        document.getElementById("verify-claimant-proof").textContent = claim.submittedProof;

        // Run automated verification score
        const verificationCheck = this.verifyProofAccuracy(
            item ? item.hiddenDetailsSecret : "",
            claim.submittedProof
        );

        const scorePill = document.getElementById("verify-accuracy-score");
        if (scorePill) {
            scorePill.textContent = `${verificationCheck.score}% Accuracy`;
            scorePill.style.backgroundColor = `${verificationCheck.color}22`;
            scorePill.style.color = verificationCheck.color;
            scorePill.style.borderColor = verificationCheck.color;
        }

        const verdictPill = document.getElementById("verify-verdict");
        if (verdictPill) {
            verdictPill.textContent = verificationCheck.verdict;
            verdictPill.style.color = verificationCheck.color;
        }

        modal.classList.add("active");
        if (window.soundFX) window.soundFX.playUnlock();
    }
}

// Export for browser
if (typeof window !== "undefined") {
    window.VerificationSystem = VerificationSystem;
}
