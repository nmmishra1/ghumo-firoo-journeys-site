<?php
// BaseRepository.php - Centralized scope and tenant filtering for database queries

class BaseRepository
{
    protected $pdo;
    protected $context;

    /**
     * @param PDO $pdo Shared PDO database connection
     * @param array $context Request context with user identity, role scope, and agency details
     */
    public function __construct(PDO $pdo, array $context)
    {
        $this->pdo = $pdo;
        $this->context = $context;
    }

    /**
     * Generates a SQL WHERE clause fragment to enforce tenant isolation and role scoping.
     *
     * @param string $tableAlias Optional table alias (e.g. 'l' for leads)
     * @return string SQL fragment (e.g. "l.agency_id = 1 AND l.owner_user_id = 'user-uuid'")
     */
    protected function applyScopeFilter(string $tableAlias = ''): string
    {
        // Platform Admins bypass all filters and can see all data across all agencies
        if (!empty($this->context['is_platform_admin'])) {
            return "1=1";
        }

        $prefix = $tableAlias !== '' ? $tableAlias . '.' : '';
        $agencyId = (int)($this->context['agency_id'] ?? 0);

        // Standard tenant isolation requires at least an agency ID
        if ($agencyId === 0) {
            return "0=1"; // Deny all if agency ID is missing
        }

        $scope = strtoupper($this->context['scope_code'] ?? 'AGENCY');

        switch ($scope) {
            case 'SELF':
                // Only view own records
                $userIdEscaped = $this->pdo->quote($this->context['user_id']);
                return "{$prefix}agency_id = {$agencyId} AND ({$prefix}owner_user_id = {$userIdEscaped} OR {$prefix}assigned_to = {$userIdEscaped})";

            case 'TEAM':
                // View records matching user's team
                $teamId = (int)($this->context['team_id'] ?? 0);
                return "{$prefix}agency_id = {$agencyId} AND {$prefix}team_id = {$teamId}";

            case 'DEPARTMENT':
                // View records matching user's department
                $deptId = (int)($this->context['department_id'] ?? 0);
                return "{$prefix}agency_id = {$agencyId} AND {$prefix}department_id = {$deptId}";

            case 'BRANCH':
                // View records matching user's branch
                $branchId = (int)($this->context['branch_id'] ?? 0);
                return "{$prefix}agency_id = {$agencyId} AND {$prefix}branch_id = {$branchId}";

            case 'PLATFORM':
                // Platform scope (if granted inside an agency context) sees all agency records
            case 'AGENCY':
            default:
                // Agency-wide scope (default)
                return "{$prefix}agency_id = {$agencyId}";
        }
    }
}
?>
