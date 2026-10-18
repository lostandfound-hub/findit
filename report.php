<?php
/**
 * FindIt - Report Item Handler (PHP Backend)
 * Handles POST requests from HTML forms to create lost or found items.
 */
require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = 'item_' . time();
    $type = trim($_POST['type'] ?? 'lost');
    $title = trim($_POST['title'] ?? '');
    $category = trim($_POST['category'] ?? 'electronics');
    $color = trim($_POST['color'] ?? 'Standard');
    $location = trim($_POST['location'] ?? 'Campus Grounds');
    $description = trim($_POST['description'] ?? '');
    $prompt = trim($_POST['prompt'] ?? '');
    $secret = trim($_POST['secret'] ?? '');
    $reporter = trim($_POST['reporter'] ?? 'Student');
    $reward = intval($_POST['reward'] ?? 0);
    $date = date('Y-m-d');
    $imageUrl = ($type === 'lost') 
        ? 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80'
        : 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=600&q=80';

    if (!empty($title) && !empty($description)) {
        $stmt = $pdo->prepare("INSERT INTO items (id, type, title, category, color, locationName, date, description, imageUrl, reporterName, rewardOffered, hiddenDetailsPrompt, hiddenDetailsSecret) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$id, $type, $title, $category, $color, $location, $date, $description, $imageUrl, $reporter, $reward, $prompt, $secret]);
        
        // Return JSON response if requested via AJAX, else redirect
        if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
            header('Content-Type: application/json');
            echo json_encode(['success' => true, 'id' => $id]);
            exit;
        }
    }
    
    header('Location: index.php?msg=reported');
    exit;
}
?>
