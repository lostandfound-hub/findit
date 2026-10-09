/**
 * FindIt - Smart Multi-Factor Matching Engine
 * Matches items using Category, Color, Location, and Description semantic token analysis.
 */

class SmartMatchingEngine {
    constructor() {
        this.weights = {
            category: 0.25,
            color: 0.20,
            location: 0.25,
            description: 0.30
        };

        this.colorFamilies = {
            "black": ["black", "matte black", "dark", "charcoal", "onyx", "midnight"],
            "gray": ["gray", "grey", "space gray", "silver", "aluminum", "graphite", "slate"],
            "white": ["white", "ivory", "cream", "snow", "pearl"],
            "blue": ["blue", "navy", "royal blue", "sky blue", "cyan", "teal", "midnight blue"],
            "red": ["red", "crimson", "scarlet", "ruby", "maroon", "burgundy"],
            "green": ["green", "forest", "mint", "emerald", "olive", "sage"],
            "yellow": ["yellow", "gold", "amber", "mustard", "lemon"],
            "purple": ["purple", "violet", "lavender", "lilac", "plum", "magenta"],
            "brown": ["brown", "tan", "leather", "camel", "cognac", "khaki", "beige"],
            "pink": ["pink", "rose", "rose gold", "coral", "salmon", "blush"]
        };

        this.stopWords = new Set([
            "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are",
            "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but",
            "by", "can", "could", "did", "do", "does", "doing", "down", "during", "each", "few", "for",
            "from", "further", "had", "has", "have", "having", "he", "her", "here", "hers", "herself",
            "him", "himself", "his", "how", "i", "if", "in", "into", "is", "it", "its", "itself", "just",
            "me", "more", "most", "my", "myself", "no", "nor", "not", "now", "of", "off", "on", "once",
            "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same",
            "she", "should", "so", "some", "such", "than", "that", "the", "their", "theirs", "them",
            "themselves", "then", "there", "these", "they", "this", "those", "through", "to", "too",
            "under", "until", "up", "very", "was", "we", "were", "what", "when", "where", "which",
            "while", "who", "whom", "why", "with", "would", "you", "your", "yours", "yourself"
        ]);
    }

    /**
     * Compute full match score between two items (one Lost, one Found)
     */
    calculateMatch(itemA, itemB) {
        // Factor 1: Category Match
        const categoryResult = this.scoreCategory(itemA.category, itemB.category);

        // Factor 2: Color Match
        const colorResult = this.scoreColor(itemA.color, itemB.color, itemA.description, itemB.description);

        // Factor 3: Location Match
        const locationResult = this.scoreLocation(itemA, itemB);

        // Factor 4: Description / Semantic Keywords Match
        const descriptionResult = this.scoreDescription(
            (itemA.title + " " + itemA.description + " " + (itemA.tags || []).join(" ")),
            (itemB.title + " " + itemB.description + " " + (itemB.tags || []).join(" "))
        );

        // Weighted Overall Score
        const rawScore = (
            categoryResult.score * this.weights.category +
            colorResult.score * this.weights.color +
            locationResult.score * this.weights.location +
            descriptionResult.score * this.weights.description
        );

        // Temporal modifier: if found date is within 0-4 days after lost date, boost confidence slightly
        const temporalBonus = this.scoreDateProximity(itemA.date, itemB.date);
        const finalScore = Math.min(99, Math.max(10, Math.round(rawScore * temporalBonus)));

        let confidence = "Low";
        let confidenceColor = "#ef4444";
        if (finalScore >= 85) {
            confidence = "Critical Match";
            confidenceColor = "#10b981";
        } else if (finalScore >= 70) {
            confidence = "High Match";
            confidenceColor = "#38bdf8";
        } else if (finalScore >= 50) {
            confidence = "Moderate Match";
            confidenceColor = "#f59e0b";
        }

        return {
            totalScore: finalScore,
            confidence: confidence,
            confidenceColor: confidenceColor,
            breakdown: {
                category: {
                    score: Math.round(categoryResult.score),
                    detail: categoryResult.detail,
                    weight: "25%"
                },
                color: {
                    score: Math.round(colorResult.score),
                    detail: colorResult.detail,
                    weight: "20%"
                },
                location: {
                    score: Math.round(locationResult.score),
                    detail: locationResult.detail,
                    weight: "25%"
                },
                description: {
                    score: Math.round(descriptionResult.score),
                    detail: descriptionResult.detail,
                    sharedKeywords: descriptionResult.sharedKeywords,
                    weight: "30%"
                }
            }
        };
    }

    scoreCategory(catA, catB) {
        if (!catA || !catB) return { score: 20, detail: "Unspecified category" };
        if (catA.toLowerCase() === catB.toLowerCase()) {
            return { score: 100, detail: `Exact category match (${catA})` };
        }
        // Related categories (e.g., electronics & accessories)
        const related = {
            "electronics": ["accessories"],
            "accessories": ["electronics", "jewelry"],
            "wallets": ["bags", "personal"],
            "bags": ["wallets", "personal"],
            "keys": ["accessories"]
        };
        if (related[catA] && related[catA].includes(catB)) {
            return { score: 65, detail: `Cross-compatible category (${catA} ↔ ${catB})` };
        }
        return { score: 10, detail: `Category divergence (${catA} vs ${catB})` };
    }

    scoreColor(colorA, colorB, descA = "", descB = "") {
        const cA = (colorA || "").toLowerCase().trim();
        const cB = (colorB || "").toLowerCase().trim();

        if (cA && cB && cA === cB) {
            return { score: 100, detail: `Exact hue match: ${colorA}` };
        }

        // Check color families
        let familyA = null;
        let familyB = null;

        for (const [family, members] of Object.entries(this.colorFamilies)) {
            if (members.some(m => cA.includes(m))) familyA = family;
            if (members.some(m => cB.includes(m))) familyB = family;
        }

        if (familyA && familyB && familyA === familyB) {
            return { score: 88, detail: `Identical color family spectrum (${familyA})` };
        }

        // Check if color is referenced in alternate description
        const dA = descA.toLowerCase();
        const dB = descB.toLowerCase();
        if (cA && dB.includes(cA)) {
            return { score: 80, detail: `Found item description highlights '${colorA}'` };
        }
        if (cB && dA.includes(cB)) {
            return { score: 80, detail: `Lost item description highlights '${colorB}'` };
        }

        return { score: 25, detail: `Contrasting color scheme (${colorA || "N/A"} vs ${colorB || "N/A"})` };
    }

    scoreLocation(itemA, itemB) {
        if (itemA.locationId && itemB.locationId && itemA.locationId === itemB.locationId) {
            return { score: 100, detail: `Same pinpoint campus zone: ${itemA.locationName || "Identical"}` };
        }

        const nameA = (itemA.locationName || "").toLowerCase();
        const nameB = (itemB.locationName || "").toLowerCase();

        // Substring / building level match
        const buildings = ["library", "science", "union", "rec", "gym", "engineering", "dorm", "shuttle", "security"];
        for (const b of buildings) {
            if (nameA.includes(b) && nameB.includes(b)) {
                return { score: 85, detail: `Same collegiate facility cluster (${b})` };
            }
        }

        return { score: 30, detail: `Different campus zones` };
    }

    tokenize(text) {
        if (!text) return [];
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, " ")
            .split(/\s+/)
            .filter(word => word.length > 2 && !this.stopWords.has(word));
    }

    scoreDescription(textA, textB) {
        const tokensA = this.tokenize(textA);
        const tokensB = this.tokenize(textB);

        if (tokensA.length === 0 || tokensB.length === 0) {
            return { score: 40, detail: "Basic description match", sharedKeywords: [] };
        }

        const setA = new Set(tokensA);
        const setB = new Set(tokensB);
        const intersection = [];

        for (const token of setA) {
            if (setB.has(token)) {
                intersection.push(token);
            }
        }

        // Jaccard similarity
        const unionSize = new Set([...tokensA, ...tokensB]).size;
        const jaccard = unionSize > 0 ? (intersection.length / unionSize) : 0;

        // Weighted for high-value distinctive keywords
        const highValueKeywords = ["macbook", "airpods", "iphone", "hydro", "flask", "yoda", "sticker", "lanyard", "leather", "wallet", "engraved", "case"];
        let highValueHits = 0;
        intersection.forEach(k => {
            if (highValueKeywords.includes(k)) highValueHits++;
        });

        const adjustedScore = Math.min(100, Math.round((jaccard * 160) + (highValueHits * 18)));
        const finalScore = Math.max(20, adjustedScore);

        return {
            score: finalScore,
            detail: `${intersection.length} overlapping descriptive keywords identified`,
            sharedKeywords: intersection.slice(0, 6)
        };
    }

    scoreDateProximity(dateA, dateB) {
        if (!dateA || !dateB) return 1.0;
        try {
            const dA = new Date(dateA);
            const dB = new Date(dateB);
            const diffHours = Math.abs(dB - dA) / (1000 * 60 * 60);

            if (diffHours <= 24) return 1.05; // boost if found within 24 hours of lost
            if (diffHours <= 72) return 1.02;
            if (diffHours > 240) return 0.95; // older report
        } catch (e) {
            return 1.0;
        }
        return 1.0;
    }

    /**
     * Find best candidate matches in a target item pool
     */
    findMatchesFor(targetItem, candidatePool) {
        const matches = [];

        for (const candidate of candidatePool) {
            // Compare lost against found, or found against lost
            if (targetItem.type === candidate.type) continue;
            if (targetItem.id === candidate.id) continue;

            const matchResult = this.calculateMatch(targetItem, candidate);
            matches.push({
                item: candidate,
                score: matchResult.totalScore,
                confidence: matchResult.confidence,
                confidenceColor: matchResult.confidenceColor,
                breakdown: matchResult.breakdown
            });
        }

        // Sort descending by match score
        matches.sort((a, b) => b.score - a.score);
        return matches;
    }
}

// Export for browser
if (typeof window !== "undefined") {
    window.SmartMatchingEngine = SmartMatchingEngine;
}
