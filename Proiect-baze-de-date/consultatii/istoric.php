<?php
session_start();
include("../config/db.php");

if(!isset($_SESSION['user'])){
    header("Location: ../auth/login.php");
    exit();
}

$sql="SELECT c.id,c.diagnostic,pa.nume as pacient,pa.prenume as pacient_pr,
             d.nume as doctor,d.prenume as doctor_pr
      FROM consultatii c
      LEFT JOIN pacienti pa ON pa.id = c.pacient_id
      LEFT JOIN personal d ON d.id = c.doctor_id";
$result = $conn->query($sql);
?>

<!DOCTYPE html>
<html>
<head>
    <title>Istoric Consultatii</title>
    <link rel="stylesheet" href="../style/style.css">
</head>
<body>
<header><h1>Istoric Consultatii</h1></header>
<nav class="navbar"    >
    <a href="../dashboard.php">Dashboard</a>
    <a href="../pacienti/lista.php">Pacienți</a>
    <a href="../programari/istoric.php">Programări</a>
    <a href="adauga.php">Adauga consultatie</a>
</nav>
<div class="container">
    <table>
        <tr><th>ID</th><th>Pacient</th><th>Doctor</th><th>Diagnostic</th></tr>
        <?php while($row=$result->fetch_assoc()): ?>
        <tr>
            <td><?php echo $row['id']; ?></td>
            <td><?php echo htmlspecialchars($row['pacient'].' '.$row['pacient_pr']); ?></td>
            <td><?php echo htmlspecialchars($row['doctor'].' '.$row['doctor_pr']); ?></td>
            <td><?php echo htmlspecialchars($row['diagnostic']); ?></td>
        </tr>
        <?php endwhile; ?>
    </table>
</div>
</body>
</html>