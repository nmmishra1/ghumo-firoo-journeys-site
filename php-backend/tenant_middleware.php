<?php
// tenant_middleware.php — Multi-Tenant Subdomain & Data Scoping Layer
// Resolves active tenant from subdomain (e.g. agency1.ghumofiroo.com) or HTTP header (X-Tenant-ID)

require_once __DIR__ . '/db.php';

function getActiveTenant($pdo = null) {
    if (!$pdo) {
        $pdo = getDb();
    }

    $tenantId = 1; // Default to HQ tenant (id: 1)
    $host = $_SERVER['HTTP_HOST'] ?? '';
    $headerTenant = $_SERVER['HTTP_X_TENANT_ID'] ?? $_GET['tenant_id'] ?? null;

    if ($headerTenant && is_numeric($headerTenant)) {
        $tenantId = (int)$headerTenant;
    } elseif (!empty($host) && strpos($host, '.') !== false) {
        $parts = explode('.', $host);
        if (count($parts) >= 3 && $parts[0] !== 'www' && $parts[0] !== 'api') {
            $slug = strtolower($parts[0]);
            $stmt = $pdo->prepare("SELECT id FROM tenants WHERE slug = ? AND is_active = 1");
            $stmt->execute([$slug]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                $tenantId = (int)$row['id'];
            }
        }
    }

    return $tenantId;
}

/**
 * Helper to append tenant scoping SQL clause
 */
function applyTenantScope(string $sql, int $tenantId, string $tableAlias = ''): string {
    $prefix = !empty($tableAlias) ? "{$tableAlias}." : "";
    if (stripos($sql, 'WHERE') !== false) {
        return str_ireplace('WHERE', "WHERE {$prefix}tenant_id = {$tenantId} AND", $sql);
    }
    return $sql . " WHERE {$prefix}tenant_id = {$tenantId}";
}
