<?php
/**
 * Interactive API Schema Specification & Data Contract Inspector
 * Ghumo Firoo Journeys Enterprise Backend
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/api_response_helper.php';

$schemas = [
    'standard_response_envelope' => [
        'description' => 'Every backend API endpoint returns this unified response envelope with request tracing.',
        'fields' => [
            'success' => 'boolean (true/false)',
            'request_id' => 'string (Unique traceable ID, e.g., REQ-1787409200-8A3F)',
            'timestamp' => 'string (ISO 8601 timestamp)',
            'endpoint' => 'string (API script endpoint)',
            'table' => 'string (Target database table name)',
            'action' => 'string (FETCH_ALL | FETCH_BY_ID | CREATE | UPDATE | DELETE | ERROR)',
            'data' => 'array | object | null (Parsed result dataset with typed fields)',
            'count' => 'integer (Number of items returned)',
            'meta' => [
                'status' => 'integer (HTTP status code, e.g. 200, 400, 404, 500)',
                'execution_time_ms' => 'float (Server processing time in milliseconds)'
            ],
            'error' => 'object | null (Populated on failure with code, message, details, and traceable_id)'
        ]
    ],
    'endpoints' => [
        'hotels' => [
            'endpoint' => '/php-backend/api.php?table=hotels',
            'methods_supported' => ['GET', 'POST', 'PUT', 'DELETE'],
            'request_schema' => [
                'hotel_name' => 'string (Required)',
                'destination' => 'string (Required)',
                'star_rating' => 'integer (Optional, 1-5)',
                'address' => 'string (Optional)',
                'contact_number' => 'string (Optional)',
                'email' => 'string (Optional)',
                'supplier_name' => 'string (Optional)'
            ]
        ],
        'cabs' => [
            'endpoint' => '/php-backend/api.php?table=cab_contract_rates',
            'methods_supported' => ['GET', 'POST', 'PUT', 'DELETE'],
            'request_schema' => [
                'supplier_name' => 'string (Required)',
                'vehicle_type' => 'string (Required, e.g., Dzire / Innova)',
                'source_city' => 'string (Required)',
                'destination_city' => 'string (Required)',
                'rate_model' => 'string (Required, Per KM / Per Day / Block Circuit)',
                'rate_per_km' => 'float (Optional)',
                'daily_rate' => 'float (Optional)'
            ]
        ],
        'sightseeings' => [
            'endpoint' => '/php-backend/api.php?table=sightseeings',
            'methods_supported' => ['GET', 'POST', 'PUT', 'DELETE'],
            'request_schema' => [
                'name' => 'string (Required)',
                'destination' => 'string (Required)',
                'category' => 'string (Optional)',
                'duration' => 'string (Optional)',
                'adult_price' => 'float (Optional)',
                'child_price' => 'float (Optional)'
            ]
        ],
        'activities' => [
            'endpoint' => '/php-backend/api.php?table=activities',
            'methods_supported' => ['GET', 'POST', 'PUT', 'DELETE'],
            'request_schema' => [
                'title' => 'string (Required)',
                'destination' => 'string (Required)',
                'price' => 'float (Required)',
                'duration' => 'string (Optional)'
            ]
        ],
        'packages' => [
            'endpoint' => '/php-backend/api.php?table=packages',
            'methods_supported' => ['GET', 'POST', 'PUT', 'DELETE'],
            'request_schema' => [
                'name' => 'string (Required)',
                'price' => 'float (Required)',
                'duration' => 'string (Required)',
                'destinations' => 'string (Optional)'
            ]
        ],
        'leads' => [
            'endpoint' => '/php-backend/api.php?table=leads',
            'methods_supported' => ['GET', 'POST', 'PUT', 'DELETE'],
            'request_schema' => [
                'customer_name' => 'string (Required)',
                'customer_phone' => 'string (Required)',
                'customer_email' => 'string (Optional)'
            ]
        ],
        'api_request_logs' => [
            'endpoint' => '/php-backend/api.php?table=api_request_logs',
            'methods_supported' => ['GET'],
            'description' => 'Inspect and trace any request by request_id, status_code, or endpoint.'
        ]
    ]
];

sendApiResponse($schemas, 'API Schema Specification & Data Contracts', 200, 'FETCH_SCHEMA', 'api_spec');
