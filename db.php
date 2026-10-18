<?php
/**
 * FindIt - Database Connection (PHP & SQLite / MySQL)
 * Compatible with XAMPP, WAMP, and PHP Built-in Server.
 * Uses zero-configuration SQLite by default, or connect to MySQL.
 */

// Use local SQLite database file (works immediately with zero setup)
$dbFile = __DIR__ . '/findit.sqlite';

try {
    $pdo = new PDO("sqlite:" . $dbFile);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    // Initialize items table if not exists
    $pdo->exec("CREATE TABLE IF NOT EXISTS items (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        color TEXT NOT NULL,
        locationName TEXT NOT NULL,
        date TEXT NOT NULL,
        description TEXT NOT NULL,
        imageUrl TEXT,
        reporterName TEXT NOT NULL,
        rewardOffered INTEGER DEFAULT 0,
        hiddenDetailsPrompt TEXT,
        hiddenDetailsSecret TEXT,
        status TEXT DEFAULT 'active'
    )");

    // Initialize claims table
    $pdo->exec("CREATE TABLE IF NOT EXISTS claims (
        id TEXT PRIMARY KEY,
        itemId TEXT NOT NULL,
        claimantName TEXT NOT NULL,
        claimantEmail TEXT NOT NULL,
        submittedProof TEXT NOT NULL,
        status TEXT DEFAULT 'pending_verification',
        date TEXT NOT NULL
    )");

} catch (PDOException $e) {
    die("Database Connection Error: " . $e->getMessage());
}
?>
