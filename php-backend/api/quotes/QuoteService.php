<?php
// php-backend/api/quotes/QuoteService.php — Domain Business Logic for CRM Quotes & Proposals
// Ghumo Firoo Travels Enterprise Architecture

require_once __DIR__ . '/QuoteModel.php';
require_once __DIR__ . '/../../auth_middleware.php';

class QuoteService
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
        QuoteModel::ensureTable($this->pdo);
    }

    /**
     * Get a single quote by UUID
     */
    public function getQuoteById(string $id): ?array
    {
        $stmt = $this->pdo->prepare("SELECT * FROM quotes WHERE id = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) return null;

        return QuoteModel::parseRow($row);
    }

    /**
     * List quotes with versioning and proposal bridging
     */
    public function listQuotes(int $leadId = 0): array
    {
        $quotes = [];

        // 1. Fetch from quotes table
        try {
            $filterSql = "(q.total_amount > 0 OR q.status IN ('Accepted', 'Sent', 'Dispatched') OR (q.cost_breakdown IS NOT NULL AND JSON_LENGTH(COALESCE(JSON_EXTRACT(q.cost_breakdown, '$.items'), '[]')) > 0))";
            if ($leadId > 0) {
                $stmt = $this->pdo->prepare("
                    SELECT q.*, COALESCE(l.customer_name, 'Valued Client') as customer_name, l.customer_phone
                    FROM quotes q
                    LEFT JOIN leads l ON q.lead_id = l.id
                    WHERE q.lead_id = ? AND $filterSql
                    ORDER BY q.version_number DESC
                ");
                $stmt->execute([$leadId]);
            } else {
                $stmt = $this->pdo->query("
                    SELECT q.*, COALESCE(l.customer_name, 'Valued Client') as customer_name, l.customer_phone
                    FROM quotes q
                    LEFT JOIN leads l ON q.lead_id = l.id
                    WHERE $filterSql
                    ORDER BY q.created_at DESC
                    LIMIT 200
                ");
            }
            $quotes = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
        } catch (Throwable $e) {}

        // 2. Fetch from proposals table to bridge records
        try {
            $propSql = $leadId > 0
                ? "SELECT * FROM proposals WHERE lead_id = ? ORDER BY id DESC"
                : "SELECT * FROM proposals ORDER BY id DESC LIMIT 200";
            $pStmt = $this->pdo->prepare($propSql);
            if ($leadId > 0) {
                $pStmt->execute([$leadId]);
            } else {
                $pStmt->execute();
            }
            $proposals = $pStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

            $existingIds = array_column($quotes, 'id');
            foreach ($proposals as $p) {
                $propId = 'prop-' . $p['id'];
                if (!in_array($propId, $existingIds, true)) {
                    $quotes[] = [
                        'id' => $propId,
                        'lead_id' => (int)($p['lead_id'] ?? 0),
                        'itinerary_id' => $p['itinerary_id'] ?? null,
                        'version_number' => 1,
                        'parent_quote_id' => null,
                        'status' => $p['status'] ?? 'Draft',
                        'total_amount' => (float)($p['total_amount'] ?? 0),
                        'package_name' => $p['proposal_title'] ?? ($p['package_name'] ?? 'Proposal'),
                        'cost_breakdown' => null,
                        'inclusions' => [],
                        'exclusions' => [],
                        'terms' => null,
                        'notes' => $p['notes'] ?? null,
                        'share_token' => $p['share_token'] ?? null,
                        'created_at' => $p['created_at'] ?? date('Y-m-d H:i:s'),
                        'updated_at' => $p['updated_at'] ?? date('Y-m-d H:i:s')
                    ];
                }
            }
        } catch (Throwable $e) {}

        return array_map(['QuoteModel', 'parseRow'], $quotes);
    }

    /**
     * Save a new quote or create a revision
     */
    public function saveQuote(array $input, ?array $user = null): array
    {
        $packageName = trim($input['package_name'] ?? '');
        if (empty($packageName)) {
            return ['success' => false, 'error' => 'package_name is required', 'status_code' => 400];
        }

        $leadId = (int)($input['lead_id'] ?? 0);
        $totalAmount = (float)($input['total_amount'] ?? 0.00);
        $itineraryId = !empty($input['itinerary_id']) ? trim($input['itinerary_id']) : null;
        $validityDays = (int)($input['validity_days'] ?? 7);
        $notes = $input['notes'] ?? null;
        $terms = $input['terms'] ?? null;
        $isRevision = !empty($input['is_revision']);

        $costBreakdown = isset($input['cost_breakdown']) ? json_encode($input['cost_breakdown']) : null;
        $inclusions = isset($input['inclusions']) ? json_encode($input['inclusions']) : null;
        $exclusions = isset($input['exclusions']) ? json_encode($input['exclusions']) : null;

        // Auto-resolve lead if necessary
        $existingLead = null;
        if ($leadId > 0) {
            $checkLead = $this->pdo->prepare("SELECT id FROM leads WHERE id = :lid LIMIT 1");
            $checkLead->execute([':lid' => $leadId]);
            $existingLead = $checkLead->fetchColumn();
        }

        if (!$existingLead) {
            $custName = trim($input['customer_name'] ?? '');
            $custPhone = trim($input['customer_phone'] ?? '');
            $custEmail = trim($input['customer_email'] ?? '');

            if (empty($custName) && !empty($notes) && preg_match('/(?:Direct Quote Created for|Proposal for)\s+([^|$\n]+)/i', $notes, $m)) {
                $custName = trim($m[1]);
            }
            if (empty($custPhone) && !empty($notes) && preg_match('/Phone:\s*([^|$\n]+)/i', $notes, $m)) {
                $custPhone = trim($m[1]);
            }
            if (empty($custEmail) && !empty($notes) && preg_match('/Email:\s*([^|$\n]+)/i', $notes, $m)) {
                $custEmail = trim($m[1]);
            }

            if (!empty($custPhone) || !empty($custEmail)) {
                try {
                    $findLeadStmt = $this->pdo->prepare("SELECT id FROM leads WHERE (customer_phone = :ph AND :ph != '') OR (customer_email = :em AND :em != '') ORDER BY id DESC LIMIT 1");
                    $findLeadStmt->execute([':ph' => $custPhone, ':em' => $custEmail]);
                    $matchedLeadId = $findLeadStmt->fetchColumn();
                    if ($matchedLeadId) {
                        $leadId = (int)$matchedLeadId;
                        $existingLead = $leadId;
                    }
                } catch (Throwable $e) {}
            }

            if (!$existingLead) {
                $leadTitle = !empty($packageName) ? "Quote: " . $packageName : "Direct Quote Lead";
                $clientName = !empty($custName) ? $custName : 'Valued Client';
                try {
                    $insLead = $this->pdo->prepare("INSERT INTO leads (title, customer_name, customer_email, customer_phone, destination, status, created_at) VALUES (:title, :name, :email, :phone, :dest, 'New', NOW())");
                    $insLead->execute([
                        ':title' => $leadTitle,
                        ':name' => $clientName,
                        ':email' => $custEmail ?: null,
                        ':phone' => $custPhone ?: null,
                        ':dest' => $packageName ?: null
                    ]);
                    $leadId = (int)$this->pdo->lastInsertId();
                } catch (Throwable $e) {
                    $fallbackLead = $this->pdo->query("SELECT id FROM leads ORDER BY id ASC LIMIT 1")->fetchColumn();
                    $leadId = $fallbackLead ? (int)$fallbackLead : 1;
                }
            }
        }

        $versionNumber = 1;
        $parentQuoteId = null;

        if ($isRevision) {
            $stmt = $this->pdo->prepare("SELECT id, version_number FROM quotes WHERE lead_id = ? ORDER BY version_number DESC LIMIT 1");
            $stmt->execute([$leadId]);
            $latest = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($latest) {
                $versionNumber = (int)$latest['version_number'] + 1;
                $parentQuoteId = $latest['id'];
            }
        }

        $quoteId = QuoteModel::generateUUID();
        $shareToken = bin2hex(random_bytes(16));
        $expiresAt = date('Y-m-d H:i:s', strtotime("+$validityDays days"));
        $createdBy = $user['email'] ?? ($user['user_email'] ?? 'Agent');

        $stmt = $this->pdo->prepare("
            INSERT INTO quotes (
                id, lead_id, itinerary_id, version_number, parent_quote_id,
                status, total_amount, package_name, cost_breakdown, inclusions,
                exclusions, terms, notes, share_token, expires_at, created_by
            ) VALUES (?, ?, ?, ?, ?, 'Draft', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $quoteId,
            $leadId,
            $itineraryId,
            $versionNumber,
            $parentQuoteId,
            $totalAmount,
            $packageName,
            $costBreakdown,
            $inclusions,
            $exclusions,
            $terms,
            $notes,
            $shareToken,
            $expiresAt,
            $createdBy
        ]);

        writeAuditLog($this->pdo, 'quotes', $quoteId, 'SAVE_QUOTE', null, "Saved quote version {$versionNumber} for Lead #{$leadId}", $user);

        return [
            'success' => true,
            'quote_id' => $quoteId,
            'version' => $versionNumber,
            'lead_id' => $leadId,
            'share_token' => $shareToken
        ];
    }

    /**
     * Generate shareable public quote link
     */
    public function shareQuote(string $quoteId, ?string $message = null, ?string $recipientEmail = null): array
    {
        $stmt = $this->pdo->prepare("SELECT id, share_token FROM quotes WHERE id = ?");
        $stmt->execute([$quoteId]);
        $quote = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$quote) {
            return ['success' => false, 'error' => 'Quote not found', 'status_code' => 404];
        }

        $shareToken = $quote['share_token'] ?: bin2hex(random_bytes(16));
        $update = $this->pdo->prepare("UPDATE quotes SET share_token = ?, share_message = ?, shared_at = NOW(), status = 'Sent' WHERE id = ?");
        $update->execute([$shareToken, $message, $quoteId]);

        $baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://" . ($_SERVER['HTTP_HOST'] ?? 'ghumofiroo.com');
        $shareUrl = "$baseUrl/quote/view?token=$shareToken";

        return [
            'success' => true,
            'token' => $shareToken,
            'share_url' => $shareUrl
        ];
    }

    /**
     * Public view by share token
     */
    public function getQuoteByToken(string $token): ?array
    {
        $stmt = $this->pdo->prepare("SELECT * FROM quotes WHERE share_token = ?");
        $stmt->execute([$token]);
        $quote = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$quote) return null;

        // Mark viewed
        try {
            $up = $this->pdo->prepare("UPDATE quotes SET viewed_at = NOW() WHERE id = ? AND viewed_at IS NULL");
            $up->execute([$quote['id']]);
        } catch (Throwable $e) {}

        return QuoteModel::parseRow($quote);
    }

    /**
     * Public customer action (Accept / Reject / Discuss)
     */
    public function submitAction(string $token, string $action, ?string $message = null): array
    {
        $stmt = $this->pdo->prepare("SELECT id, status FROM quotes WHERE share_token = ?");
        $stmt->execute([$token]);
        $quote = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$quote) {
            return ['success' => false, 'error' => 'Invalid or expired quote token', 'status_code' => 404];
        }

        $newStatus = match (strtolower($action)) {
            'accept' => 'Accepted',
            'reject' => 'Rejected',
            'discuss' => 'In Discussion',
            default => 'Pending'
        };

        $up = $this->pdo->prepare("UPDATE quotes SET status = ?, notes = CONCAT(COALESCE(notes, ''), '\n[Client Action: ', ?, ' - ', NOW(), ']') WHERE id = ?");
        $up->execute([$newStatus, $message ?: $newStatus, $quote['id']]);

        return ['success' => true, 'status' => $newStatus];
    }
}
