<?php
declare(strict_types=1);

const DB_HOST = '127.0.0.1';
const DB_PORT = '8889';
const DB_NAME = 'biblioteca_app';
const DB_USER = 'root';
const DB_PASS = 'root';

function getPdo(): PDO {
    $dsn = 'mysql:host=' . DB_HOST . ';port=' . DB_PORT . ';dbname=' . DB_NAME . ';charset=utf8mb4';
    return new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
}
