<?php
session_start();
include("../config/db.php");

if(!isset($_SESSION['user'])){
    header("Location: ../auth/login.php");
    exit();
}

if(isset($_POST['submit'])){
    $pacient=$_POST['pacient'];
    $doctor=$_POST['doctor'];
    $data=$_POST['data'];

    $sql="INSERT INTO programari
    (pacient_id,doctor_id,data_programare)
    VALUES (?,?,?)";
    $stmt=$conn->prepare($sql);
    $stmt->bind_param("iis",$pacient,$doctor,$data);
    if($stmt->execute()){
        header("Location: istoric.php?msg=added");
        exit();
    } else {
        echo "Eroare: " . $conn->error;
    }
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Adauga Programare</title>
    <link rel="stylesheet" href="../style/style.css">
</head>
<body>
<header><h1>Adauga Programare</h1></header>
<nav class="navbar">
    <a href="../dashboard.php">Dashboard</a>
    <a href="istoric.php">Istoric programari</a>
</nav>
<div class="container">
    <form method="POST" class="grid">
        <div class="input-group">
            <label>Pacient ID</label>
            <input name="pacient" type="number" required>
        </div>
        <div class="input-group">
            <label>Doctor ID</label>
            <input name="doctor" type="number" required>
        </div>
        <div class="input-group">
            <label>Data programare</label>
            <input type="datetime-local" name="data" required>
        </div>
        <button name="submit">Adauga</button>
    </form>
</div>
</body>
</html>