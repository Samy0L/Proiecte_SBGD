<?php
session_start();
include("../config/db.php");

if(!isset($_SESSION['user'])){
    header("Location: ../auth/login.php");
    exit();
}

if(!isset($_GET['id']) || !is_numeric($_GET['id'])){
    die("ID invalid");
}
$id = (int)$_GET['id'];

// fetch existing record
$stmt = $conn->prepare("SELECT * FROM pacienti WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();

if(!$row){
    die("Pacientul nu exista");
}

if(isset($_POST['update'])){
    $nume = $_POST['nume'];
    $prenume = $_POST['prenume'];
    $cnp = $_POST['cnp'];
    $data = $_POST['data_nastere'];
    $sex = $_POST['sex'];
    $telefon = $_POST['telefon'];
    $email = $_POST['email'];
    $adresa = $_POST['adresa'];

    $sql = "UPDATE pacienti SET nume=?, prenume=?, cnp=?, data_nastere=?, sex=?, telefon=?, email=?, adresa=? WHERE id=?";
    $upd = $conn->prepare($sql);
    $upd->bind_param("ssssssssi", $nume, $prenume, $cnp, $data, $sex, $telefon, $email, $adresa, $id);
    if($upd->execute()){
        header("Location: lista.php?msg=updated");
        exit();
    } else {
        echo "Eroare actualizare: " . $conn->error;
    }
}
?>

<!DOCTYPE html>
<html>
<head>
<link rel="stylesheet" href="../style/style.css">
</head>
<body>
<header><h1>Editare Pacient</h1></header>
<nav>
    <a href="../dashboard.php">Dashboard</a> |
    <a href="lista.php">Lista pacienti</a>
</nav>
<div class="container">
<form method="POST">
<div class="grid">
<div class="input-group">
<label>Nume</label>
<input type="text" name="nume" value="<?php echo htmlspecialchars($row['nume']); ?>" required>
</div>
<div class="input-group">
<label>Prenume</label>
<input type="text" name="prenume" value="<?php echo htmlspecialchars($row['prenume']); ?>" required>
</div>
<div class="input-group">
<label>CNP</label>
<input type="text" name="cnp" maxlength="13" value="<?php echo htmlspecialchars($row['cnp']); ?>" required>
</div>
<div class="input-group">
<label>Data nasterii</label>
<input type="date" name="data_nastere" value="<?php echo htmlspecialchars($row['data_nastere']); ?>">
</div>
<div class="input-group">
<label>Sex</label>
<select name="sex">
<option value=""<?php if($row['sex']=='') echo ' selected';?>>Selecteaza</option>
<option value="M"<?php if($row['sex']=='M') echo ' selected';?>>M</option>
<option value="F"<?php if($row['sex']=='F') echo ' selected';?>>F</option>
</select>
</div>
<div class="input-group">
<label>Telefon</label>
<input name="telefon" value="<?php echo htmlspecialchars($row['telefon']); ?>">
</div>
<div class="input-group">
<label>Email</label>
<input name="email" value="<?php echo htmlspecialchars($row['email']); ?>">
</div>
<div class="input-group full">
<label>Adresa</label>
<input name="adresa" value="<?php echo htmlspecialchars($row['adresa']); ?>">
</div>
</div>
<button name="update">Update</button>
</form>
</div>
</body>
</html>