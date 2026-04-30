<?php
session_start();
include("config/db.php");

if (!isset($_SESSION['user'])) {
    header("Location: auth/login.php");
    exit();
}

$pacienti = $conn->query("SELECT COUNT(*) as total FROM pacienti")->fetch_assoc()['total'];
$programari = $conn->query("SELECT COUNT(*) as total FROM programari")->fetch_assoc()['total'];
$consultatii = $conn->query("SELECT COUNT(*) as total FROM consultatii")->fetch_assoc()['total'];

// PACIENTI PE LUNI
$pacienti_lunar = $conn->query("
SELECT MONTH(data_inregistrare) as luna, COUNT(*) as total
FROM pacienti
GROUP BY luna
");

// PROGRAMARI PE LUNI
$programari_lunar = $conn->query("
SELECT MONTH(data_programare) as luna, COUNT(*) as total
FROM programari
GROUP BY luna
");

// CONSULTATII PE LUNI
$consultatii_lunar = $conn->query("
SELECT MONTH(data_consultatie) as luna, COUNT(*) as total
FROM consultatii
GROUP BY luna
");

// INIT ARRAY (12 luni)
$luni = range(1,12);
$p_data = array_fill(1,12,0);
$pr_data = array_fill(1,12,0);
$c_data = array_fill(1,12,0);

// PACIENTI
while($r = $pacienti_lunar->fetch_assoc()){
    $p_data[$r['luna']] = $r['total'];
}

// PROGRAMARI
while($r = $programari_lunar->fetch_assoc()){
    $pr_data[$r['luna']] = $r['total'];
}

// CONSULTATII
while($r = $consultatii_lunar->fetch_assoc()){
    $c_data[$r['luna']] = $r['total'];
}

// ULTIMII PACIENTI
$ultimi = $conn->query("SELECT nume, prenume FROM pacienti ORDER BY id DESC LIMIT 5");
?>

<!DOCTYPE html>
<html>
<head>
    <title>Dashboard Spital</title>
    <link rel="stylesheet" href="style/style.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>

<body>

<header>
    <h1>Spitalul Santa Maria del Travis</h1>
</header>

<nav class="navbar">
    <div class="nav-left">
        <a href="dashboard.php">Dashboard</a>
        <a href="pacienti/lista.php">Pacienți</a>
        <a href="programari/istoric.php">Programări</a>
        <a href="consultatii/istoric.php">Consultații</a>
    </div>

    <a href="auth/logout.php" class="logout">Logout</a>
</nav>

<div class="container">

    <h2>Dashboard</h2>

    <!-- CARDS -->
    <div class="cards">

        <div class="card">
            <h3><?php echo $pacienti; ?></h3>
            <p>Pacienți</p>
        </div>

        <div class="card">
            <h3><?php echo $programari; ?></h3>
            <p>Programări</p>
        </div>

        <div class="card">
            <h3><?php echo $consultatii; ?></h3>
            <p>Consultații</p>
        </div>

    </div>

    <!-- GRAFIC -->
    <div class="chart-container">
        <h3>Evoluție pacienți</h3>
        <canvas id="myChart"></canvas>
    </div>

    <!-- ULTIMI PACIENTI -->
    <div class="container" style="margin-top:30px;">
        <h3>Ultimii pacienți adăugați</h3>

        <table>
            <tr>
                <th>Nume</th>
                <th>Prenume</th>
            </tr>

            <?php while ($p = $ultimi->fetch_assoc()) { ?>
                <tr>
                    <td><?php echo $p['nume']; ?></td>
                    <td><?php echo $p['prenume']; ?></td>
                </tr>
            <?php } ?>

        </table>
    </div>

</div>

<script>
const luni = ["Ian", "Feb", "Mar", "Apr", "Mai", "Iun", "Iul", "Aug", "Sep", "Oct", "Noi", "Dec"];

new Chart(document.getElementById('myChart'), {
    type: 'line',
    data: {
        labels: luni,
        datasets: [

            {
                label: 'Pacienți',
                data: <?php echo json_encode(array_values($p_data)); ?>,
                borderColor: '#0d6efd',
                backgroundColor: 'rgba(13,110,253,0.15)',
                tension: 0.4,
                fill: true,
                pointRadius: 6,
                pointHoverRadius: 8
            },

            {
                label: 'Programări',
                data: <?php echo json_encode(array_values($pr_data)); ?>,
                borderColor: '#20c997',
                backgroundColor: 'rgba(32,201,151,0.15)',
                tension: 0.4,
                fill: true,
                pointRadius: 6,
                pointHoverRadius: 8
            },

            {
                label: 'Consultații',
                data: <?php echo json_encode(array_values($c_data)); ?>,
                borderColor: '#fd7e14',
                backgroundColor: 'rgba(253,126,20,0.15)',
                tension: 0.4,
                fill: true,
                pointRadius: 6,
                pointHoverRadius: 8
            }

        ]
    },

    options: {
        responsive: true,
        interaction: {
            mode: 'index',
            intersect: false
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: {
                        size: 14,
                        weight: 'bold'
                    }
                }
            },
            tooltip: {
                backgroundColor: '#111',
                padding: 12
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0,0,0,0.05)'
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    }
});
</script>

</body>
</html>