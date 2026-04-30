<?php
session_start();
include("../config/db.php");

if(!isset($_SESSION['user'])){
    header("Location: ../auth/login.php");
    exit();
}

if(isset($_POST['submit'])){
    $nume=$_POST['nume'];
    $prenume=$_POST['prenume'];
    $cnp=$_POST['cnp'];
    $data=$_POST['data_nastere'];
    $sex=$_POST['sex'];
    $telefon=$_POST['telefon'];
    $email=$_POST['email'];
    $adresa=$_POST['adresa'];

    $sql="INSERT INTO pacienti
    (nume,prenume,cnp,data_nastere,sex,telefon,email,adresa)
    VALUES (?,?,?,?,?,?,?,?)";

    $stmt=$conn->prepare($sql);
    $stmt->bind_param("ssssssss",
        $nume,$prenume,$cnp,$data,$sex,$telefon,$email,$adresa);
    if($stmt->execute()){
        // redirect back to list with success message
        header("Location: lista.php?msg=added");
        exit();
    } else {
        echo "Eroare la adaugare: " . $conn->error;
    }
}
?>

<!DOCTYPE html>
<html>

<head>
<link rel="stylesheet" href="../style/style.css">
</head>

<body>

<header>
<h1>Adauga Pacient</h1>
</header>

<nav class="navbar">
    <a href="../dashboard.php">Dashboard</a> |
    <a href="lista.php">Lista pacienti</a>
</nav>

<div class="container">

<form id="patientForm" method="POST">

<div class="grid">

<div class="input-group">
<label>Nume</label>
<input type="text" name="nume" required>
</div>

<div class="input-group">
<label>Prenume</label>
<input type="text" name="prenume" required>
</div>

<div class="input-group">
<label>CNP</label>
<input type="text" name="cnp" maxlength="13" required>
</div>

<div class="input-group">
<label>Data nasterii</label>
<input type="date" name="data_nastere">
</div>

<div class="input-group">
<label>Sex</label>
<select name="sex">
<option value="">Selecteaza</option>
<option value="M">M</option>
<option value="F">F</option>
</select>
</div>

<div class="input-group">
<label>Telefon</label>
<input name="telefon">
</div>

<div class="input-group">
<label>Email</label>
<input name="email">
</div>

<div class="input-group full">
<label>Adresa</label>
<input name="adresa">
</div>

</div>

<button name="submit">Adauga pacient</button>

</form>

</div>

<script src="../js/script.js"></script>

</body>
</html>