<?php
// expenses.php — handles expenses CRUD on MySQL database.
// Requires a valid Supabase session JWT in the Authorization header.

header('Content-Type: application/json');
require_once __DIR__ . '/auth_middleware.php';

$user = authenticate();
$pdo = getDb();
$profile = requireRole($user, $pdo, ['admin', 'manager', 'agent']);

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

try {
    if ($method === 'GET') {
        $stmt = $pdo->query('SELECT * FROM expenses ORDER BY payment_date DESC');
        $expenses = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Map floats/numeric keys properly
        foreach ($expenses as &$exp) {
            if (isset($exp['amount'])) {
                $exp['amount'] = (float)$exp['amount'];
            }
        }
        
        echo json_encode(['success' => true, 'expenses' => $expenses]);

    } elseif ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $id = $input['id'] ?? sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
        
        $amount = (float)($input['amount'] ?? 0);
        $paymentDate = $input['payment_date'] ?? date('Y-m-d');
        $category = trim($input['category'] ?? '');
        
        if ($category === '' || $amount <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'amount and category are required']);
            exit;
        }

        $stmt = $pdo->prepare(
            'INSERT INTO expenses 
                (id, amount, payment_date, category, sub_category, lead_source, remarks, vendor_name, reference_number, created_by, modified_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $id,
            $amount,
            $paymentDate,
            $category,
            $input['sub_category'] ?? null,
            $input['lead_source'] ?? null,
            $input['remarks'] ?? null,
            $input['vendor_name'] ?? null,
            $input['reference_number'] ?? null,
            $profile['id'],
            null
        ]);

        echo json_encode(['success' => true, 'id' => $id]);

    } elseif ($method === 'PUT') {
        $id = $_GET['id'] ?? '';
        if ($id === '') {
            http_response_code(400);
            echo json_encode(['error' => 'id parameter is required']);
            exit;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        
        // Retrieve existing column schema
        $q = $pdo->query("DESCRIBE expenses");
        $columns = $q->fetchAll(PDO::FETCH_COLUMN);

        // Field mapping: camelCase/snake_case mapping
        $mapping = [
            'amount' => 'amount',
            'paymentDate' => 'payment_date',
            'payment_date' => 'payment_date',
            'category' => 'category',
            'subCategory' => 'sub_category',
            'sub_category' => 'sub_category',
            'leadSource' => 'lead_source',
            'lead_source' => 'lead_source',
            'remarks' => 'remarks',
            'vendorName' => 'vendor_name',
            'vendor_name' => 'vendor_name',
            'referenceNumber' => 'reference_number',
            'reference_number' => 'reference_number',
            'modifiedBy' => 'modified_by',
            'modifiedDate' => 'modified_date'
        ];

        $updateFields = [];
        $updateParams = [];
        foreach ($mapping as $key => $col) {
            if (array_key_exists($key, $input) && in_array($col, $columns)) {
                $updateFields[] = "`$col` = ?";
                $updateParams[] = $input[$key];
            }
        }

        if (!empty($updateFields)) {
            // Add modifier details
            $updateFields[] = "`modified_by` = ?";
            $updateParams[] = $profile['id'];
            
            $updateFields[] = "`modified_date` = NOW()";
            
            $updateParams[] = $id;
            
            $sql = "UPDATE expenses SET " . implode(", ", $updateFields) . " WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($updateParams);
        }

        echo json_encode(['success' => true]);

    } elseif ($method === 'DELETE') {
        $id = $_GET['id'] ?? '';
        if ($id === '') {
            http_response_code(400);
            echo json_encode(['error' => 'id parameter is required']);
            exit;
        }

        $stmt = $pdo->prepare('DELETE FROM expenses WHERE id = ?');
        $stmt->execute([$id]);

        echo json_encode(['success' => true]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
