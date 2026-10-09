/**
 * FindIt - Seed Data & Static Default State
 * Realistic collegiate dataset showcasing all 4 core features
 */

const SEED_DATA = {
    currentUser: {
        id: "usr_student_1",
        name: "Maya Lin",
        role: "student", // "student", "finder", "admin"
        email: "maya.lin@campus.edu",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        karmaPoints: 420,
        itemsReturned: 3,
        badges: ["Good Samaritan", "Eagle Eye", "Campus Honest", "Speedy Returner"]
    },
    demoUsers: [
        {
            id: "usr_student_1",
            name: "Maya Lin (Student - Lost MacBook)",
            role: "student",
            email: "maya.lin@campus.edu",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
            karmaPoints: 420,
            itemsReturned: 3,
            badges: ["Good Samaritan", "Eagle Eye"]
        },
        {
            id: "usr_finder_1",
            name: "Jordan Cole (Finder - Found AirPods & Keys)",
            role: "finder",
            email: "jordan.cole@campus.edu",
            avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80",
            karmaPoints: 650,
            itemsReturned: 5,
            badges: ["Good Samaritan", "Eagle Eye", "Master Returner", "Campus Legend"]
        },
        {
            id: "usr_admin_1",
            name: "Officer Davis (Campus Security Desk)",
            role: "admin",
            email: "davis.security@campus.edu",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
            karmaPoints: 1250,
            itemsReturned: 18,
            badges: ["Campus Guardian", "Verification Authority", "Security Lead"]
        }
    ],
    campusLocations: [
        { id: "loc_library", name: "Main Library - 2nd Floor Study Commons", code: "LIB-2F", x: 38, y: 35 },
        { id: "loc_science", name: "Science Complex - Lab 402 & Atrium", code: "SCI-LAB", x: 65, y: 28 },
        { id: "loc_union", name: "Student Union & Dining Hall", code: "STU-UNION", x: 45, y: 62 },
        { id: "loc_rec", name: "Campus Recreation Center & Gym", code: "GYM-REC", x: 22, y: 70 },
        { id: "loc_engineering", name: "Engineering Hall - MakerSpace", code: "ENG-MAKER", x: 78, y: 55 },
        { id: "loc_dorms", name: "North Quad Dormitories (Maple Hall)", code: "DORM-QUAD", x: 25, y: 25 },
        { id: "loc_shuttle", name: "Campus Shuttle Bus Loop & Transit Hub", code: "TRANSIT", x: 52, y: 82 },
        { id: "loc_security", name: "Campus Security HQ (Central Safe-Zone)", code: "HQ-SAFEZONE", x: 50, y: 48 }
    ],
    categories: [
        { id: "electronics", label: "Electronics & Laptops", icon: "laptop", color: "#38bdf8" },
        { id: "accessories", label: "Headphones & Audio", icon: "headphones", color: "#818cf8" },
        { id: "keys", label: "Keys & Dorm Access", icon: "key", color: "#f59e0b" },
        { id: "wallets", label: "Wallets & Cards / ID", icon: "credit-card", color: "#10b981" },
        { id: "bags", label: "Backpacks & Pouches", icon: "briefcase", color: "#ec4899" },
        { id: "jewelry", label: "Jewelry & Watches", icon: "watch", color: "#a855f7" },
        { id: "books", label: "Books & Study Supplies", icon: "book", color: "#06b6d4" },
        { id: "personal", label: "Bottles, Umbrellas & Personal", icon: "coffee", color: "#f97316" }
    ],
    items: [
        {
            id: "item_lost_1",
            type: "lost", // "lost" or "found"
            title: "MacBook Air M2 - Space Gray with GitHub Sticker",
            category: "electronics",
            color: "Space Gray",
            colorHex: "#4b5563",
            locationId: "loc_library",
            locationName: "Main Library - 2nd Floor Study Commons",
            date: "2026-10-09",
            time: "14:30",
            description: "Left my MacBook Air on desk #42 next to the large glass window facing the quad. Has a small octocat sticker near trackpad and slight scratch on charger port.",
            imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
            reporterId: "usr_student_1",
            reporterName: "Maya Lin",
            reporterContact: "maya.lin@campus.edu",
            rewardOffered: 150, // student offers bounty points
            status: "active", // "active", "matched", "claimed", "returned"
            hiddenDetailsPrompt: "Provide the serial number last 4 digits or specify lock screen user initials",
            hiddenDetailsSecret: "Serial ends in 99X4, lockscreen shows profile named 'Maya L.' with purple nebula wallpaper",
            tags: ["laptop", "apple", "macbook", "space gray", "sticker", "library"]
        },
        {
            id: "item_found_1",
            type: "found",
            title: "Apple MacBook Air 13\" Space Gray found at Study Desk",
            category: "electronics",
            color: "Space Gray",
            colorHex: "#4b5563",
            locationId: "loc_library",
            locationName: "Main Library - 2nd Floor Study Commons",
            date: "2026-10-09",
            time: "17:15",
            description: "Turned in to library front desk. Space gray aluminum MacBook found unattended on second floor desk 42. In great condition with cosmetic decals.",
            imageUrl: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=600&q=80",
            reporterId: "usr_finder_1",
            reporterName: "Jordan Cole",
            reporterContact: "jordan.cole@campus.edu",
            storageLocation: "Library Main Circulation Desk (Safe Locker #B3)",
            status: "active",
            // CRAZY FEATURE: Reveal hidden item details only to help verify real owner!
            hiddenDetailsPrompt: "What sticker is located near the trackpad and what is the lockscreen user profile name?",
            hiddenDetailsSecret: "Small Octocat / GitHub sticker near lower-right trackpad. Lockscreen username is Maya L. with purple space galaxy wallpaper.",
            tags: ["laptop", "apple", "macbook", "library", "desk", "gray"]
        },
        {
            id: "item_found_2",
            type: "found",
            title: "Apple AirPods Pro (2nd Gen) with MagSafe Case",
            category: "accessories",
            color: "White",
            colorHex: "#f8fafc",
            locationId: "loc_rec",
            locationName: "Campus Recreation Center & Gym",
            date: "2026-10-08",
            time: "18:45",
            description: "Discovered on bench in weight room locker hallway. Case has a matte silicone carabiner clip.",
            imageUrl: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80",
            reporterId: "usr_finder_1",
            reporterName: "Jordan Cole",
            reporterContact: "jordan.cole@campus.edu",
            storageLocation: "Recreation Center Front Equipment Desk",
            status: "active",
            hiddenDetailsPrompt: "What custom laser engraving or initials are on the case lid, and what color is the silicone tip?",
            hiddenDetailsSecret: "Case engraved with initials 'ML-2025'. Right earbud silicone tip is purple replacement.",
            tags: ["airpods", "apple", "gym", "earbuds", "white", "case"]
        },
        {
            id: "item_lost_2",
            type: "lost",
            title: "AirPods Pro 2 - Custom Engraved Case",
            category: "accessories",
            color: "White",
            colorHex: "#f8fafc",
            locationId: "loc_rec",
            locationName: "Campus Recreation Center & Gym",
            date: "2026-10-08",
            time: "18:10",
            description: "Fell out of my gym shorts pocket either in locker room or near cardio machines. Very important for classes!",
            imageUrl: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=600&q=80",
            reporterId: "usr_student_1",
            reporterName: "Maya Lin",
            reporterContact: "maya.lin@campus.edu",
            rewardOffered: 100,
            status: "active",
            hiddenDetailsPrompt: "What is engraved on the case?",
            hiddenDetailsSecret: "Case has 'ML-2025' laser engraved.",
            tags: ["airpods", "gym", "headphones", "white", "engraved"]
        },
        {
            id: "item_found_3",
            type: "found",
            title: "Vintage Brown Leather Tri-Fold Wallet & Student ID",
            category: "wallets",
            color: "Brown",
            colorHex: "#78350f",
            locationId: "loc_union",
            locationName: "Student Union & Dining Hall",
            date: "2026-10-07",
            time: "13:00",
            description: "Found on booth bench near Panda Express counter in the dining court. Handed over to Campus Security.",
            imageUrl: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80",
            reporterId: "usr_finder_1",
            reporterName: "Jordan Cole",
            reporterContact: "jordan.cole@campus.edu",
            storageLocation: "Campus Security Safe Box #14",
            status: "active",
            hiddenDetailsPrompt: "What rare bill or specific gift card is tucked inside the secret zippered pocket?",
            hiddenDetailsSecret: "A crisp 1976 bicentennial two-dollar bill and a Starbucks card ending in #4019.",
            tags: ["wallet", "leather", "brown", "cash", "id", "union"]
        },
        {
            id: "item_lost_3",
            type: "lost",
            title: "Dorm Room Keys on Red Yoda Lanyard",
            category: "keys",
            color: "Red",
            colorHex: "#ef4444",
            locationId: "loc_science",
            locationName: "Science Complex - Lab 402 & Atrium",
            date: "2026-10-08",
            time: "11:20",
            description: "Lost my dorm room brass key, mailbox key, and bike lock key attached to a red lanyard with a rubber baby Yoda keychain.",
            imageUrl: "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80",
            reporterId: "usr_student_1",
            reporterName: "Maya Lin",
            reporterContact: "maya.lin@campus.edu",
            rewardOffered: 75,
            status: "active",
            hiddenDetailsPrompt: "What number is stamped on the main brass key?",
            hiddenDetailsSecret: "Key stamped with 'RM-314' and a small yellow plastic gym barcode #8849.",
            tags: ["keys", "red", "lanyard", "dorm", "science"]
        },
        {
            id: "item_found_4",
            type: "found",
            title: "Set of Brass Keys with Green Figurine Keychain",
            category: "keys",
            color: "Red",
            colorHex: "#ef4444",
            locationId: "loc_science",
            locationName: "Science Complex - Lab 402 & Atrium",
            date: "2026-10-08",
            time: "16:00",
            description: "Found on high-top chair in Science Atrium lounge. Has red fabric strap and a character charm.",
            imageUrl: "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80",
            reporterId: "usr_finder_1",
            reporterName: "Jordan Cole",
            reporterContact: "jordan.cole@campus.edu",
            storageLocation: "Science Building Security Desk",
            status: "active",
            hiddenDetailsPrompt: "What is the key number stamped on the brass key and what is on the lanyard?",
            hiddenDetailsSecret: "Dorm key stamped RM-314, yellow barcode tab #8849 on red lanyard.",
            tags: ["keys", "science", "lanyard", "red"]
        },
        {
            id: "item_lost_4",
            type: "lost",
            title: "Hydro Flask 32oz Wide Mouth - Pastel Lilac",
            category: "personal",
            color: "Purple",
            colorHex: "#c084fc",
            locationId: "loc_engineering",
            locationName: "Engineering Hall - MakerSpace",
            date: "2026-10-09",
            time: "15:45",
            description: "Forgot bottle on 3D printer workbench. Lilac color with boot protector and National Parks stickers.",
            imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80",
            reporterId: "usr_student_1",
            reporterName: "Maya Lin",
            reporterContact: "maya.lin@campus.edu",
            rewardOffered: 50,
            status: "active",
            hiddenDetailsPrompt: "Name two stickers on the bottle",
            hiddenDetailsSecret: "Yellowstone Geyser sticker and a NASA Artemis holographic sticker.",
            tags: ["water bottle", "hydro flask", "purple", "stickers", "engineering"]
        },
        {
            id: "item_found_5",
            type: "found",
            title: "Hydro Flask Bottle with Mountain Decals",
            category: "personal",
            color: "Purple",
            colorHex: "#c084fc",
            locationId: "loc_engineering",
            locationName: "Engineering Hall - MakerSpace",
            date: "2026-10-09",
            time: "18:00",
            description: "Insulated pastel purple flask found on workbench near laser cutter in MakerSpace.",
            imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80",
            reporterId: "usr_finder_1",
            reporterName: "Jordan Cole",
            reporterContact: "jordan.cole@campus.edu",
            storageLocation: "Engineering Hall MakerSpace Tool Crib",
            status: "active",
            hiddenDetailsPrompt: "Describe at least two specific stickers on the bottle surface",
            hiddenDetailsSecret: "Yellowstone Geyser sticker and NASA Artemis metallic foil sticker.",
            tags: ["bottle", "flask", "engineering", "stickers", "purple"]
        }
    ],
    claims: [
        {
            id: "claim_101",
            itemId: "item_found_1",
            lostItemId: "item_lost_1",
            claimantId: "usr_student_1",
            claimantName: "Maya Lin",
            claimantEmail: "maya.lin@campus.edu",
            finderId: "usr_finder_1",
            itemTitle: "Apple MacBook Air 13\" Space Gray",
            claimDate: "2026-10-09T18:00:00Z",
            status: "verified", // "pending_verification", "verified", "ready_for_pickup", "returned"
            submittedProof: "GitHub Octocat decal near right trackpad corner. Lockscreen is Maya L. with deep purple nebula wallpaper. Serial ending 99X4.",
            finderNotes: "Matches hidden detail 100%! Safe pickup arranged.",
            matchScore: 96,
            pickupLocation: "Main Library Circulation Desk (Safe Locker #B3)",
            rewardAwarded: true,
            rewardPoints: 200
        },
        {
            id: "claim_102",
            itemId: "item_found_2",
            lostItemId: "item_lost_2",
            claimantId: "usr_student_1",
            claimantName: "Maya Lin",
            claimantEmail: "maya.lin@campus.edu",
            finderId: "usr_finder_1",
            itemTitle: "Apple AirPods Pro (2nd Gen)",
            claimDate: "2026-10-09T20:15:00Z",
            status: "pending_verification",
            submittedProof: "Laser engraving says 'ML-2025' on the back of the case. Right tip has a soft purple rubber replacement tip.",
            finderNotes: "Awaiting finder verification check.",
            matchScore: 92,
            pickupLocation: "Campus Recreation Center & Gym",
            rewardAwarded: false,
            rewardPoints: 150
        }
    ],
    rewardsStore: [
        {
            id: "rw_coffee",
            title: "Campus Cafe Barista Coffee Voucher",
            description: "Enjoy any free artisan beverage (hot or iced) at the Student Union Espresso Bar.",
            pointsCost: 120,
            icon: "coffee",
            category: "Food & Drinks",
            badge: "Instant Digital Pass",
            color: "#f59e0b"
        },
        {
            id: "rw_meal",
            title: "Campus Dining Meal Combo Upgrade",
            description: "Free gourmet meal combo voucher valid at any campus dining hall or food court.",
            pointsCost: 220,
            icon: "utensils",
            category: "Food & Drinks",
            badge: "Popular Pick",
            color: "#10b981"
        },
        {
            id: "rw_bookstore",
            title: "University Bookstore 25% Off Coupon",
            description: "25% discount on collegiate hoodies, apparel, supplies, and electronics accessories.",
            pointsCost: 350,
            icon: "shopping-bag",
            category: "Merchandise",
            badge: "High Value",
            color: "#6366f1"
        },
        {
            id: "rw_pod",
            title: "VIP 3-Hour Quiet Study Pod Pass",
            description: "Guaranteed priority access to soundproof acoustic private study pods in the Library.",
            pointsCost: 450,
            icon: "headphones",
            category: "Campus Perks",
            badge: "Exam Season Special",
            color: "#ec4899"
        },
        {
            id: "rw_parking",
            title: "1-Day Campus Reserved Parking Pass",
            description: "Reserved premium parking spot in Faculty/Visitor Lot A directly next to lectures.",
            pointsCost: 600,
            icon: "car",
            category: "Campus Perks",
            badge: "Exclusive",
            color: "#38bdf8"
        },
        {
            id: "rw_medal",
            title: "Chancellor's Golden Guardian Certificate",
            description: "Official university leadership commendation for extraordinary civic honesty and campus integrity.",
            pointsCost: 1000,
            icon: "award",
            category: "Honors",
            badge: "Prestige Award",
            color: "#eab308"
        }
    ],
    leaderboard: [
        { rank: 1, name: "Marcus Vance", major: "Computer Science '27", itemsReturned: 9, points: 1140, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80", badge: "Legendary Guardian" },
        { rank: 2, name: "Priya Patel", major: "Biomedical Eng '26", itemsReturned: 7, points: 920, avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80", badge: "Campus Hero" },
        { rank: 3, name: "Jordan Cole (You)", major: "Software Eng '27", itemsReturned: 5, points: 650, avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80", badge: "Master Returner" },
        { rank: 4, name: "Maya Lin", major: "Design & Media '28", itemsReturned: 3, points: 420, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80", badge: "Good Samaritan" },
        { rank: 5, name: "Liam Chen", major: "Business Admin '26", itemsReturned: 2, points: 310, avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80", badge: "Eagle Eye" }
    ],
    notifications: [
        {
            id: "notif_1",
            title: "High Match Detected! (96%)",
            message: "A MacBook Air Space Gray found at Main Library matches your reported lost item.",
            type: "match",
            date: "10 mins ago",
            unread: true,
            itemId: "item_found_1",
            matchScore: 96
        },
        {
            id: "notif_2",
            title: "Claim Verification Ready",
            message: "Your ownership challenge for MacBook Air has been verified by Jordan Cole. Safe locker #B3 assigned.",
            type: "claim",
            date: "35 mins ago",
            unread: true,
            itemId: "item_found_1"
        },
        {
            id: "notif_3",
            title: "+200 Karma Points Earned!",
            message: "You returned the Vintage Leather Wallet. Your honesty bonus has been credited.",
            type: "reward",
            date: "2 hours ago",
            unread: false
        }
    ]
};

// Export for browser window
if (typeof window !== "undefined") {
    window.SEED_DATA = SEED_DATA;
}
