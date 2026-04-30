<?php
session_start();
include("../config/db.php");

if(!isset($_SESSION['user'])){
    header("Location: ../auth/login.php");
    exit();
}

$sql="SELECT p.id,p.data_programare,pa.nume as pacient, pa.prenume as pacient_pr, d.nume as doctor, d.prenume as doctor_pr
      FROM programari p
      LEFT JOIN pacienti pa ON pa.id = p.pacient_id
      LEFT JOIN personal d ON d.id = p.doctor_id";
$result = $conn->query($sql);
?>

<!DOCTYPE html>
<html>
<head>
    <title>Istoric Programari</title>
    <link rel="stylesheet" href="../style/style.css">
</head>
<body>
<header><h1>Istoric Programari</h1></header>
<nav class="navbar">
    <a href="../dashboard.php">Dashboard</a>
    <a href="../pacienti/lista.php">Pacienți</a>
    <a href="../consultatii/istoric.php">Consultații</a>
    <a href="adauga.php">Adauga programare</a>
</nav>


<div class="container">
    <table>
        <tr><th>ID</th><th>Pacient</th><th>Doctor</th><th>Data</th></tr>
        <?php while($row=$result->fetch_assoc()): ?>
            <tr>
                <td><?php echo $row['id']; ?></td>
                <td><?php echo htmlspecialchars($row['pacient'] . ' ' . $row['pacient_pr']); ?></td>
                <td><?php echo htmlspecialchars($row['doctor'] . ' ' . $row['doctor_pr']); ?></td>
                <td><?php echo $row['data_programare']; ?></td>
            </tr>
        <?php endwhile; ?>
    </table>
</div>
</body>
</html>