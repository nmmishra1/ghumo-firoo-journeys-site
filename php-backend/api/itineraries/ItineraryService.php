<?php
// ItineraryService.php — Canonical Itineraries Domain Business Logic Service
// Ghumo Firoo Travels Enterprise Architecture
declare(strict_types=1);

require_once __DIR__ . '/ItineraryModel.php';

class ItineraryService {
    private ItineraryModel $model;
    private PDO $pdo;
    private array $user;

    public function __construct(PDO $pdo, array $user) {
        $this->pdo = $pdo;
        $this->user = $user;
        $this->model = new ItineraryModel($pdo);
    }

    public function saveItinerary(array $payload): array {
        return $this->model->save($payload, $this->user);
    }

    public function getItinerary(string $id, ?string $leadId = null): array {
        $result = $this->model->getById($id, $leadId);
        if (!$result) {
            return [
                'success' => true,
                'itinerary' => null
            ];
        }
        return [
            'success' => true,
            'itinerary' => $result['itinerary'],
            'lead' => $result['lead']
        ];
    }

    public function listItineraries(array $filters = []): array {
        $items = $this->model->listAll($filters);
        return [
            'success' => true,
            'itineraries' => $items
        ];
    }

    public function listByLead(string|int $leadId): array {
        $items = $this->model->listByLead($leadId);
        return [
            'success' => true,
            'itineraries' => $items
        ];
    }

    public function updateStatus(string|int $id, ?int $leadId, string $status): array {
        return $this->model->updateStatus($id, $leadId, $status);
    }

    public function confirmLeg(int $proposalId, string $legType, string $legId, array $input): array {
        return $this->model->confirmLeg($proposalId, $legType, $legId, $input, $this->user);
    }
}
