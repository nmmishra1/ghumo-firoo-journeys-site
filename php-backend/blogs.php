<?php
error_reporting(0);
ini_set('display_errors', 0);
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth_middleware.php';

// Enforce rate limiting across all requests (120 req/min per IP)
checkRateLimit(120, 60);

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method !== 'GET') {
    $user = authenticate();
    $pdo = getDb();
    $profile = requireRole($user, $pdo, ['admin', 'manager', 'agent']);
}

try {
    $pdo = getDb();

    if ($method === 'GET') {
        if (isset($_GET['categories'])) {
            $stmt = $pdo->query("SELECT * FROM blog_categories ORDER BY name");
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($rows);
            exit;
        }

        $slug = isset($_GET['slug']) ? trim($_GET['slug']) : null;
        $id = isset($_GET['id']) ? trim($_GET['id']) : null;

        if ($slug !== null) {
            $query = "
                SELECT b.*, c.name AS category, c.slug AS category_slug,
                       (SELECT GROUP_CONCAT(tag) FROM blog_tags WHERE blog_id = b.id) AS tags_list
                FROM blogs b
                LEFT JOIN blog_categories c ON b.category_id = c.id
                WHERE b.slug = ?
            ";
            $stmt = $pdo->prepare($query);
            $stmt->execute([$slug]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$row) {
                http_response_code(404);
                echo json_encode(['error' => 'blog_not_found']);
                exit;
            }

            $row['tags'] = $row['tags_list'] ? explode(',', $row['tags_list']) : [];
            $row['metaDescription'] = $row['seo_description'];
            $row['imageTitle'] = $row['image_title'];
            $row['imageAlt'] = $row['image_alt'];
            $row['readTime'] = $row['read_time'];
            $row['seoTitle'] = $row['seo_title'];
            $row['seoKeywords'] = $row['seo_keywords'];
            $row['canonicalUrl'] = $row['canonical_url'];
            $row['schemaMarkup'] = $row['schema_markup'] ? json_decode($row['schema_markup'], true) : null;
            $row['relatedDestination'] = $row['related_destination'];
            $row['relatedPackage'] = $row['related_package'];
            $row['publishDate'] = $row['publish_date'];

            echo json_encode($row);
            exit;
        } else {
            $category = $_GET['category'] ?? '';
            $search = $_GET['search'] ?? '';
            $all = $_GET['all'] ?? '';

            $query = "
                SELECT b.*, c.name AS category, c.slug AS category_slug,
                       (SELECT GROUP_CONCAT(tag) FROM blog_tags WHERE blog_id = b.id) AS tags_list
                FROM blogs b
                LEFT JOIN blog_categories c ON b.category_id = c.id
                WHERE 1=1
            ";
            $params = [];

            if ($all !== 'true') {
                $query .= " AND b.status = 'Published' AND (b.publish_date IS NULL OR b.publish_date <= NOW())";
            }

            if (!empty($category) && $category !== 'All' && $category !== 'all') {
                $query .= " AND (c.name = ? OR c.slug = ?)";
                $params[] = $category;
                $params[] = $category;
            }

            if (!empty($search)) {
                $query .= " AND (b.title LIKE ? OR b.excerpt LIKE ? OR b.content LIKE ?)";
                $searchWild = "%{$search}%";
                $params[] = $searchWild;
                $params[] = $searchWild;
                $params[] = $searchWild;
            }

            $query .= " ORDER BY b.date DESC, b.created_at DESC";

            $stmt = $pdo->prepare($query);
            $stmt->execute($params);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $blogs = [];
            foreach ($rows as $row) {
                $row['tags'] = $row['tags_list'] ? explode(',', $row['tags_list']) : [];
                $row['metaDescription'] = $row['seo_description'];
                $row['imageTitle'] = $row['image_title'];
                $row['imageAlt'] = $row['image_alt'];
                $row['readTime'] = $row['read_time'];
                $row['seoTitle'] = $row['seo_title'];
                $row['seoKeywords'] = $row['seo_keywords'];
                $row['canonicalUrl'] = $row['canonical_url'];
                $row['schemaMarkup'] = $row['schema_markup'] ? json_decode($row['schema_markup'], true) : null;
                $row['relatedDestination'] = $row['related_destination'];
                $row['relatedPackage'] = $row['related_package'];
                $row['publishDate'] = $row['publish_date'];
                $blogs[] = $row;
            }

            echo json_encode($blogs);
            exit;
        }
    } elseif ($method === 'POST') {
        $p = json_decode(file_get_contents('php://input'), true) ?? [];
        $blogId = $p['id'] ?? ('blog-' . time() . '-' . rand(1000, 9999));
        $finalImage = $p['image'] ?? $p['image_url'] ?? '';

        $pdo->beginTransaction();

        $stmt = $pdo->prepare("
            INSERT INTO blogs (
                id, title, slug, excerpt, content, category_id, author, date,
                image, image_title, image_alt, read_time, seo_title, seo_description,
                seo_keywords, canonical_url, schema_markup, related_destination,
                related_package, status, publish_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $blogId, $p['title'] ?? '', $p['slug'] ?? '', $p['excerpt'] ?? '', $p['content'] ?? '',
            $p['category_id'] ?? null, $p['author'] ?? '', $p['date'] ?? date('Y-m-d'),
            $finalImage, $p['image_title'] ?? null, $p['image_alt'] ?? null, $p['read_time'] ?? '10 min read',
            $p['seo_title'] ?? null, $p['seo_description'] ?? null, $p['seo_keywords'] ?? null,
            $p['canonical_url'] ?? null, !empty($p['schema_markup']) ? json_encode($p['schema_markup']) : null,
            $p['related_destination'] ?? null, $p['related_package'] ?? null, $p['status'] ?? 'Draft',
            !empty($p['publish_date']) ? date('Y-m-d H:i:s', strtotime($p['publish_date'])) : null
        ]);

        if (!empty($p['tags']) && is_array($p['tags'])) {
            $tagStmt = $pdo->prepare("INSERT INTO blog_tags (blog_id, tag) VALUES (?, ?)");
            foreach ($p['tags'] as $tag) {
                if (trim($tag)) {
                    $tagStmt->execute([$blogId, trim($tag)]);
                }
            }
        }

        $pdo->commit();
        $realAction = $action ?: 'create_blog';
        $blogTitle = $p['title'] ?? $blogId;
        writeAuditLog($pdo, 'blogs', $blogId, strtoupper($realAction), null, "Created blog: {$blogTitle}", $user ?? null);

        echo json_encode([
            'success' => true,
            'inserted' => true,
            'action' => $realAction,
            'table' => 'blogs',
            'id' => $blogId,
            'item_name' => $blogTitle,
            'status' => 'INSERTED_INTO_DATABASE',
            'affected_rows' => 1,
            'audit_logged' => true,
            'message' => "Successfully created blog '{$blogTitle}' (ID: {$blogId}) in database."
        ]);
        exit;
    } elseif ($method === 'PUT') {
        $id = $_GET['id'] ?? '';
        if (empty($id)) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing blog id']);
            exit;
        }

        $p = json_decode(file_get_contents('php://input'), true) ?? [];
        $finalImage = $p['image'] ?? $p['image_url'] ?? '';

        $pdo->beginTransaction();

        $stmt = $pdo->prepare("
            UPDATE blogs SET
                title = ?, slug = ?, excerpt = ?, content = ?, category_id = ?, author = ?, date = ?,
                image = ?, image_title = ?, image_alt = ?, read_time = ?, seo_title = ?, seo_description = ?,
                seo_keywords = ?, canonical_url = ?, schema_markup = ?, related_destination = ?,
                related_package = ?, status = ?, publish_date = ?
            WHERE id = ?
        ");
        $stmt->execute([
            $p['title'] ?? '', $p['slug'] ?? '', $p['excerpt'] ?? '', $p['content'] ?? '',
            $p['category_id'] ?? null, $p['author'] ?? '', $p['date'] ?? date('Y-m-d'),
            $finalImage, $p['image_title'] ?? null, $p['image_alt'] ?? null, $p['read_time'] ?? '10 min read',
            $p['seo_title'] ?? null, $p['seo_description'] ?? null, $p['seo_keywords'] ?? null,
            $p['canonical_url'] ?? null, !empty($p['schema_markup']) ? json_encode($p['schema_markup']) : null,
            $p['related_destination'] ?? null, $p['related_package'] ?? null, $p['status'] ?? 'Draft',
            !empty($p['publish_date']) ? date('Y-m-d H:i:s', strtotime($p['publish_date'])) : null, $id
        ]);

        $pdo->prepare("DELETE FROM blog_tags WHERE blog_id = ?")->execute([$id]);

        if (!empty($p['tags']) && is_array($p['tags'])) {
            $tagStmt = $pdo->prepare("INSERT INTO blog_tags (blog_id, tag) VALUES (?, ?)");
            foreach ($p['tags'] as $tag) {
                if (trim($tag)) {
                    $tagStmt->execute([$id, trim($tag)]);
                }
            }
        }

        $pdo->commit();
        $realAction = $action ?: 'update_blog';
        $blogTitle = $p['title'] ?? $id;
        writeAuditLog($pdo, 'blogs', $id, strtoupper($realAction), null, "Updated blog: {$blogTitle}", $user ?? null);

        echo json_encode([
            'success' => true,
            'updated' => true,
            'action' => $realAction,
            'table' => 'blogs',
            'id' => $id,
            'item_name' => $blogTitle,
            'status' => 'UPDATED_IN_DATABASE',
            'affected_rows' => $stmt->rowCount(),
            'audit_logged' => true,
            'message' => "Successfully updated blog '{$blogTitle}' (ID: {$id}) in database."
        ]);
        exit;
    } elseif ($method === 'DELETE') {
        $id = $_GET['id'] ?? '';
        if (empty($id)) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing blog id']);
            exit;
        }

        $deletedTitle = $id;
        try {
            $lookup = $pdo->prepare("SELECT title FROM blogs WHERE id = ?");
            $lookup->execute([$id]);
            $found = $lookup->fetchColumn();
            if ($found) $deletedTitle = $found;
        } catch (Throwable $ignore) {}

        $stmt = $pdo->prepare("DELETE FROM blogs WHERE id = ?");
        $stmt->execute([$id]);
        $affected = $stmt->rowCount();

        $realAction = $action ?: 'delete_blog';
        writeAuditLog($pdo, 'blogs', $id, strtoupper($realAction), $deletedTitle, "Deleted from database", $user ?? null);

        echo json_encode([
            'success' => true,
            'action' => $realAction,
            'table' => 'blogs',
            'id' => $id,
            'item_name' => $deletedTitle,
            'affected_rows' => $affected,
            'status' => 'DELETED_FROM_DATABASE',
            'audit_logged' => true,
            'message' => "Successfully deleted blog '{$deletedTitle}' (ID: {$id}) from database."
        ]);
        exit;
    }
} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['error' => 'Server Error: ' . $e->getMessage()]);
}
