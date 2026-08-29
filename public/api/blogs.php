<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        if (isset($_GET['slug'])) {
            $slug = $_GET['slug'];
            $stmt = $pdo->prepare("SELECT * FROM blogs WHERE slug = ?");
            $stmt->execute([$slug]);
            $blog = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($blog) {
                echo json_encode($blog);
            } else {
                header('HTTP/1.1 404 Not Found');
                echo json_encode(['error' => 'Blog not found']);
            }
        } else {
            $stmt = $pdo->query("SELECT * FROM blogs ORDER BY created_at DESC");
            $blogs = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($blogs);
        }
    } catch (PDOException $e) {
        header('HTTP/1.1 500 Internal Server Error');
        echo json_encode(['error' => 'Failed to fetch blogs', 'details' => $e->getMessage()]);
    }
} 
else if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        header('HTTP/1.1 400 Bad Request');
        echo json_encode(['error' => 'Invalid JSON input']);
        exit;
    }
    
    $title = $input['title'] ?? '';
    $slug = $input['slug'] ?? '';
    $content = $input['content'] ?? '';
    $excerpt = $input['excerpt'] ?? '';
    $category_id = $input['category_id'] ?? null;
    $image_url = $input['image_url'] ?? '';
    $author = $input['author'] ?? 'Admin';
    $status = $input['status'] ?? 'Published';
    $tags = isset($input['tags']) ? (is_array($input['tags']) ? json_encode($input['tags']) : $input['tags']) : '[]';
    
    if (empty($title) || empty($slug) || empty($content)) {
        header('HTTP/1.1 400 Bad Request');
        echo json_encode(['error' => 'Title, slug, and content are required']);
        exit;
    }
    
    try {
        $stmt = $pdo->prepare("INSERT INTO blogs (title, slug, content, excerpt, category_id, image_url, author, status, tags, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");
        $stmt->execute([$title, $slug, $content, $excerpt, $category_id, $image_url, $author, $status, $tags]);
        $newId = $pdo->lastInsertId();
        
        echo json_encode(['success' => true, 'id' => $newId]);
    } catch (PDOException $e) {
        header('HTTP/1.1 500 Internal Server Error');
        echo json_encode(['error' => 'Failed to create blog', 'details' => $e->getMessage()]);
    }
}
else if ($method === 'PUT') {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        header('HTTP/1.1 400 Bad Request');
        echo json_encode(['error' => 'Blog ID is required']);
        exit;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        header('HTTP/1.1 400 Bad Request');
        echo json_encode(['error' => 'Invalid JSON input']);
        exit;
    }
    
    $title = $input['title'] ?? '';
    $slug = $input['slug'] ?? '';
    $content = $input['content'] ?? '';
    $excerpt = $input['excerpt'] ?? '';
    $category_id = $input['category_id'] ?? null;
    $image_url = $input['image_url'] ?? '';
    $author = $input['author'] ?? 'Admin';
    $status = $input['status'] ?? 'Published';
    $tags = isset($input['tags']) ? (is_array($input['tags']) ? json_encode($input['tags']) : $input['tags']) : '[]';
    
    if (empty($title) || empty($slug) || empty($content)) {
        header('HTTP/1.1 400 Bad Request');
        echo json_encode(['error' => 'Title, slug, and content are required']);
        exit;
    }
    
    try {
        $stmt = $pdo->prepare("UPDATE blogs SET title = ?, slug = ?, content = ?, excerpt = ?, category_id = ?, image_url = ?, author = ?, status = ?, tags = ?, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$title, $slug, $content, $excerpt, $category_id, $image_url, $author, $status, $tags, $id]);
        
        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        header('HTTP/1.1 500 Internal Server Error');
        echo json_encode(['error' => 'Failed to update blog', 'details' => $e->getMessage()]);
    }
}
else if ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        header('HTTP/1.1 400 Bad Request');
        echo json_encode(['error' => 'Blog ID is required']);
        exit;
    }
    
    try {
        $stmt = $pdo->prepare("DELETE FROM blogs WHERE id = ?");
        $stmt->execute([$id]);
        
        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        header('HTTP/1.1 500 Internal Server Error');
        echo json_encode(['error' => 'Failed to delete blog', 'details' => $e->getMessage()]);
    }
}
?>
