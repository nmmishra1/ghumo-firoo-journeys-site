<?php
// php-backend/api/leads/LeadService.php — Domain Business Logic for Leads & Customer Inquiries
// Ghumo Firoo Travels Enterprise Architecture

require_once __DIR__ . '/LeadModel.php';
require_once __DIR__ . '/../../auth_middleware.php';

class LeadService
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    /**
     * Get single lead by ID with communications and journey timeline
     */
    public function getLeadById(int $leadId): ?array
    {
        $stmt = $this->pdo->prepare("SELECT * FROM leads WHERE id = ?");
        $stmt->execute([$leadId]);
        $lead = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$lead) return null;

        $lead = LeadModel::parseRow($lead);

        // Fetch journey timeline / communications
        try {
            $jStmt = $this->pdo->prepare("SELECT * FROM lead_journey WHERE lead_id = ? ORDER BY created_at DESC");
            $jStmt->execute([$leadId]);
            $lead['lead_journey'] = $jStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
        } catch (Throwable $e) {
            $lead['lead_journey'] = [];
        }

        // Fetch payments if any
        try {
            $pStmt = $this->pdo->prepare("SELECT * FROM payments WHERE lead_id = ? ORDER BY payment_date DESC");
            $pStmt->execute([$leadId]);
            $lead['payments'] = $pStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
        } catch (Throwable $e) {
            $lead['payments'] = [];
        }

        return $lead;
    }

    /**
     * List all active leads with customer repeat trip metrics
     */
    public function listLeads(array $filters = []): array
    {
        $where = [];
        $params = [];

        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $where[] = "status = ?";
            $params[] = $filters['status'];
        }

        if (!empty($filters['search'])) {
            $s = '%' . trim($filters['search']) . '%';
            $where[] = "(customer_name LIKE ? OR customer_phone LIKE ? OR customer_email LIKE ? OR destinations LIKE ?)";
            $params[] = $s;
            $params[] = $s;
            $params[] = $s;
            $params[] = $s;
        }

        $whereSql = $where ? 'WHERE ' . implode(' AND ', $where) : '';
        $stmt = $this->pdo->prepare("SELECT * FROM leads $whereSql ORDER BY id DESC");
        $stmt->execute($params);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

        return array_map(['LeadModel', 'parseRow'], $rows);
    }

    /**
     * Create an authenticated CRM lead
     */
    public function createLead(array $input, ?array $user = null): array
    {
        $columns = LeadModel::getColumns($this->pdo);

        if (empty($input['customer_name'])) {
            return ['success' => false, 'error' => 'customer_name is required', 'status_code' => 400];
        }

        $phone = LeadModel::sanitizePhone($input['customer_phone'] ?? '');
        $email = trim($input['customer_email'] ?? '');

        // Check for repeat customer
        $previousTripsCount = 0;
        if (!empty($phone) || !empty($email)) {
            try {
                $chk = $this->pdo->prepare("SELECT COUNT(*) FROM leads WHERE (customer_phone = :ph AND :ph != '') OR (customer_email = :em AND :em != '')");
                $chk->execute([':ph' => $phone, ':em' => $email]);
                $previousTripsCount = (int)$chk->fetchColumn();
            } catch (Throwable $e) {}
        }

        $input['customer_phone'] = $phone;
        $data = LeadModel::buildData($input, $columns);

        $cols = array_keys($data);
        $placeholders = array_map(fn($c) => ":$c", $cols);
        $sql = "INSERT INTO `leads` (`" . implode("`, `", $cols) . "`) VALUES (" . implode(", ", $placeholders) . ")";

        $params = array_combine($placeholders, array_values($data));
        $this->pdo->prepare($sql)->execute($params);
        $newId = (int)$this->pdo->lastInsertId();

        $custName = $input['customer_name'] ?? 'Lead';
        writeAuditLog($this->pdo, 'leads', (string)$newId, 'CREATE_LEAD', null, "Created lead for {$custName}", $user);

        return [
            'success' => true,
            'lead_id' => $newId,
            'is_repeat_customer' => $previousTripsCount > 0,
            'previous_trips_count' => $previousTripsCount
        ];
    }

    /**
     * Public visitor lead capture with anti-abuse rate limits
     */
    public function createPublicLead(array $input, string $clientIp): array
    {
        // Enforce anti-spam rate limiting (5 per 15 min)
        try {
            $this->pdo->exec("
                CREATE TABLE IF NOT EXISTS rate_limits (
                    ip_address VARCHAR(45) NOT NULL,
                    request_type VARCHAR(100) NOT NULL,
                    request_count INT NOT NULL DEFAULT 1,
                    first_request_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    PRIMARY KEY (ip_address, request_type)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            ");
            $this->pdo->exec("DELETE FROM rate_limits WHERE first_request_at < NOW() - INTERVAL 15 MINUTE");

            $stmtRate = $this->pdo->prepare("
                INSERT INTO rate_limits (ip_address, request_type, request_count, first_request_at)
                VALUES (:ip, 'public_lead', 1, NOW())
                ON DUPLICATE KEY UPDATE request_count = request_count + 1
            ");
            $stmtRate->execute([':ip' => $clientIp]);

            $stmtCheck = $this->pdo->prepare("SELECT request_count FROM rate_limits WHERE ip_address = :ip AND request_type = 'public_lead'");
            $stmtCheck->execute([':ip' => $clientIp]);
            $rateLimit = $stmtCheck->fetch(PDO::FETCH_ASSOC);

            if ($rateLimit && (int)$rateLimit['request_count'] > 5) {
                return [
                    'success' => false,
                    'error' => 'Rate limit exceeded. Maximum 5 lead requests allowed per 15 minutes to prevent spam.',
                    'status_code' => 429
                ];
            }
        } catch (Throwable $e) {}

        $custName = trim($input['customer_name'] ?? '');
        $phone = LeadModel::sanitizePhone($input['customer_phone'] ?? '');
        $email = trim($input['customer_email'] ?? '');
        $packageName = trim($input['package_name'] ?? ($input['destination'] ?? 'Website Inquiry'));

        if (empty($custName) || (empty($phone) && empty($email))) {
            return [
                'success' => false,
                'error' => 'Name and either Phone or Email are required',
                'status_code' => 400
            ];
        }

        $columns = LeadModel::getColumns($this->pdo);
        $payload = [
            'customer_name' => $custName,
            'customer_phone' => $phone,
            'customer_email' => $email,
            'destinations' => $packageName,
            'source' => $input['source'] ?? 'Website Form',
            'status' => 'New',
            'adult_count' => (int)($input['adult_count'] ?? 2),
            'child_count' => (int)($input['child_count'] ?? 0),
            'trip_start_date' => $input['travel_date'] ?? null,
            'notes' => $input['notes'] ?? null
        ];

        $data = LeadModel::buildData($payload, $columns);
        $cols = array_keys($data);
        $placeholders = array_map(fn($c) => ":$c", $cols);
        $sql = "INSERT INTO `leads` (`" . implode("`, `", $cols) . "`) VALUES (" . implode(", ", $placeholders) . ")";
        $params = array_combine($placeholders, array_values($data));

        $this->pdo->prepare($sql)->execute($params);
        $newId = (int)$this->pdo->lastInsertId();

        return [
            'success' => true,
            'lead_id' => $newId,
            'message' => 'Thank you! Your travel inquiry has been received. Our team will contact you shortly.'
        ];
    }

    /**
     * Update an existing lead record
     */
    public function updateLead(int $leadId, array $input, ?array $user = null): array
    {
        if ($leadId <= 0) {
            return ['success' => false, 'error' => 'Valid lead id is required', 'status_code' => 400];
        }

        $columns = LeadModel::getColumns($this->pdo);
        if (isset($input['customer_phone'])) {
            $input['customer_phone'] = LeadModel::sanitizePhone($input['customer_phone']);
        }

        $data = LeadModel::buildData($input, $columns);
        if (empty($data)) {
            return ['success' => true, 'message' => 'No fields to update', 'id' => $leadId];
        }

        $setParts = [];
        $params = [':id' => $leadId];
        foreach ($data as $key => $val) {
            $setParts[] = "`$key` = :$key";
            $params[":$key"] = $val;
        }

        $sql = "UPDATE `leads` SET " . implode(", ", $setParts) . " WHERE id = :id";
        $this->pdo->prepare($sql)->execute($params);

        writeAuditLog($this->pdo, 'leads', (string)$leadId, 'UPDATE_LEAD', null, "Updated lead #{$leadId}", $user);

        return ['success' => true, 'id' => $leadId];
    }

    /**
     * Delete a lead by ID
     */
    public function deleteLead(int $leadId, ?array $user = null): array
    {
        if ($leadId <= 0) {
            return ['success' => false, 'error' => 'Valid lead id is required', 'status_code' => 400];
        }

        $stmt = $this->pdo->prepare("DELETE FROM leads WHERE id = ?");
        $stmt->execute([$leadId]);

        writeAuditLog($this->pdo, 'leads', (string)$leadId, 'DELETE_LEAD', null, "Deleted lead #{$leadId}", $user);

        return ['success' => true, 'id' => $leadId];
    }
}
