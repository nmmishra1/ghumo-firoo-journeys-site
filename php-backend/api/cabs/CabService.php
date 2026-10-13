<?php
// php-backend/api/cabs/CabService.php — Domain Business Logic for Cab Contracting & Fleet Management
// Ghumo Firoo Travels Enterprise Architecture

require_once __DIR__ . '/CabModel.php';
require_once __DIR__ . '/../../auth_middleware.php';

class CabService
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    /**
     * Search routes by destination / source
     */
    public function searchRoutes(?string $dest): array
    {
        $sql = "SELECT * FROM cab_routes WHERE active_status = 1";
        $params = [];
        if (!empty($dest)) {
            $sql .= " AND (source LIKE ? OR destination LIKE ? OR state LIKE ?)";
            $wildcard = "%$dest%";
            $params = [$wildcard, $wildcard, $wildcard];
        }
        $sql .= " ORDER BY destination ASC, source ASC";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        $routes = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_map(fn($r) => CabModel::parseRow($r, 'cab_routes'), $routes);
    }

    /**
     * Query contract rates for a cab contract, joined with vehicle and route details
     */
    public function getContractRates(string $contractId): array
    {
        $stmt = $this->pdo->prepare("
            SELECT cr.*, v.vehicle_name, v.vehicle_type, v.seating_capacity,
                   r.source, r.destination, r.state as route_state, r.distance_km
            FROM cab_contract_rates cr
            LEFT JOIN cab_vehicles v ON cr.vehicle_id = v.id
            LEFT JOIN cab_routes r ON cr.route_id = r.id
            WHERE cr.contract_id = ?
            ORDER BY cr.id ASC
        ");
        $stmt->execute([$contractId]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_map(fn($r) => CabModel::parseRow($r, 'cab_contract_rates'), $rows);
    }

    /**
     * Bootstrap complete cab contracting workspace data
     */
    public function getBootstrapData(): array
    {
        $sStmt = $this->pdo->query("SELECT * FROM cab_suppliers ORDER BY supplier_name ASC");
        $suppliers = array_map(fn($r) => CabModel::parseRow($r, 'cab_suppliers'), $sStmt->fetchAll(PDO::FETCH_ASSOC));

        $vStmt = $this->pdo->query("SELECT * FROM cab_vehicles ORDER BY vehicle_name ASC");
        $vehicles = array_map(fn($r) => CabModel::parseRow($r, 'cab_vehicles'), $vStmt->fetchAll(PDO::FETCH_ASSOC));

        $rStmt = $this->pdo->query("SELECT * FROM cab_routes ORDER BY source ASC, destination ASC");
        $routes = array_map(fn($r) => CabModel::parseRow($r, 'cab_routes'), $rStmt->fetchAll(PDO::FETCH_ASSOC));

        $cStmt = $this->pdo->query("
            SELECT c.*, s.supplier_name
            FROM cab_contracts c
            LEFT JOIN cab_suppliers s ON c.supplier_id = s.id
            ORDER BY c.id DESC
        ");
        $contracts = array_map(fn($r) => CabModel::parseRow($r, 'cab_contracts'), $cStmt->fetchAll(PDO::FETCH_ASSOC));

        return [
            'success' => true,
            'suppliers' => $suppliers,
            'vehicles' => $vehicles,
            'routes' => $routes,
            'contracts' => $contracts
        ];
    }

    /**
     * Generic query for cab sub-tables (suppliers, vehicles, routes, contracts, contract_rates)
     */
    public function querySubTable(string $table, array $filters = []): array
    {
        $allowed = ['cab_suppliers', 'cab_vehicles', 'cab_routes', 'cab_contracts', 'cab_contract_rates'];
        if (!in_array($table, $allowed, true)) {
            return [];
        }

        $where = [];
        $params = [];

        foreach ($filters as $col => $val) {
            if ($val !== '' && $val !== null && $col !== 'table') {
                $where[] = "`$col` = ?";
                $params[] = $val;
            }
        }

        $whereSql = $where ? 'WHERE ' . implode(' AND ', $where) : '';
        $stmt = $this->pdo->prepare("SELECT * FROM `$table` $whereSql ORDER BY id DESC");
        $stmt->execute($params);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_map(fn($r) => CabModel::parseRow($r, $table), $rows);
    }
}
