<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

require __DIR__ . '/config.php';

function respond(array $data, int $status = 200): void {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function getJsonBody(): array {
    $raw = file_get_contents('php://input');
    if (!$raw) return [];
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function allRows(PDO $pdo, string $table): array {
    return $pdo->query("SELECT * FROM {$table}")->fetchAll();
}

try {
    $pdo = getPdo();
    $action = $_GET['action'] ?? 'state';

    if ($action === 'state') {
        respond([
            'ok' => true,
            'users' => allRows($pdo, 'users'),
            'carti' => allRows($pdo, 'carti'),
            'imprumuturi' => allRows($pdo, 'imprumuturi'),
            'extinderi' => allRows($pdo, 'extinderi'),
            'logs' => allRows($pdo, 'logs'),
        ]);
    }

    if ($action === 'save_state') {
        $body = getJsonBody();
        $users = $body['users'] ?? [];
        $carti = $body['carti'] ?? [];
        $imprumuturi = $body['imprumuturi'] ?? [];
        $extinderi = $body['extinderi'] ?? [];
        $logs = $body['logs'] ?? [];

        $pdo->beginTransaction();

        $pdo->exec('DELETE FROM extinderi');
        $pdo->exec('DELETE FROM imprumuturi');
        $pdo->exec('DELETE FROM logs');
        $pdo->exec('DELETE FROM carti');
        $pdo->exec('DELETE FROM users');

        $stmtUser = $pdo->prepare('INSERT INTO users (id, pass, role, name, email, status, facultate, dataInreg) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        foreach ($users as $u) {
            $stmtUser->execute([
                $u['id'] ?? '',
                $u['pass'] ?? '',
                $u['role'] ?? '',
                $u['name'] ?? '',
                $u['email'] ?? '',
                $u['status'] ?? 'pending',
                $u['facultate'] ?? '',
                $u['dataInreg'] ?? date('Y-m-d'),
            ]);
        }

        $stmtBook = $pdo->prepare('INSERT INTO carti (id, titlu, autor, editura, an, isbn, pagini, gen, coperta, limba, exemplare, disponibile) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        foreach ($carti as $c) {
            $stmtBook->execute([
                $c['id'] ?? '',
                $c['titlu'] ?? '',
                $c['autor'] ?? '',
                $c['editura'] ?? '',
                (int)($c['an'] ?? 0),
                $c['isbn'] ?? '',
                (int)($c['pagini'] ?? 0),
                $c['gen'] ?? '',
                $c['coperta'] ?? '',
                $c['limba'] ?? '',
                (int)($c['exemplare'] ?? 0),
                (int)($c['disponibile'] ?? 0),
            ]);
        }

        $stmtLoan = $pdo->prepare('INSERT INTO imprumuturi (id, carteId, studentId, dataImprumut, termen, status) VALUES (?, ?, ?, ?, ?, ?)');
        foreach ($imprumuturi as $i) {
            $stmtLoan->execute([
                $i['id'] ?? '',
                $i['carteId'] ?? '',
                $i['studentId'] ?? '',
                $i['dataImprumut'] ?? date('Y-m-d'),
                $i['termen'] ?? date('Y-m-d'),
                $i['status'] ?? 'activ',
            ]);
        }

        $stmtExt = $pdo->prepare('INSERT INTO extinderi (id, studentId, carteId, imprumutId, motiv, status, data) VALUES (?, ?, ?, ?, ?, ?, ?)');
        foreach ($extinderi as $e) {
            $stmtExt->execute([
                $e['id'] ?? '',
                $e['studentId'] ?? '',
                $e['carteId'] ?? '',
                $e['imprumutId'] ?? '',
                $e['motiv'] ?? '',
                $e['status'] ?? 'pending',
                $e['data'] ?? date('Y-m-d'),
            ]);
        }

        $stmtLog = $pdo->prepare('INSERT INTO logs (id, data, tip, `desc`, user) VALUES (?, ?, ?, ?, ?)');
        foreach ($logs as $l) {
            $stmtLog->execute([
                $l['id'] ?? '',
                $l['data'] ?? '',
                $l['tip'] ?? '',
                $l['desc'] ?? '',
                $l['user'] ?? '',
            ]);
        }

        $pdo->commit();
        respond(['ok' => true]);
    }

    respond(['ok' => false, 'error' => 'Actiune necunoscuta.'], 400);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    respond(['ok' => false, 'error' => $e->getMessage()], 500);
}
