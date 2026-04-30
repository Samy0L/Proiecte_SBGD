<?php
session_start();
include("../config/db.php");

if(!isset($_SESSION['user'])){
    header("Location: ../auth/login.php");
    exit();
}

$search="";
if(isset($_GET['search'])){
    // simple sanitization, use prepared below
    $search = $_GET['search'];
}

// use prepared statement for search to avoid injection
$sql = "SELECT * FROM pacienti WHERE nume LIKE ? OR prenume LIKE ? OR cnp LIKE ?";
$stmt = $conn->prepare($sql);
$like = "%" . $search . "%";
$stmt->bind_param("sss", $like, $like, $like);
$stmt->execute();
$result = $stmt->get_result();
?>

<!DOCTYPE html>
<html>

<head>

<link rel="stylesheet" href="../style/style.css">

</head>

<body>

<header>
<h1>Lista Pacienti</h1>
</header>

<nav class="navbar">

<a href="../dashboard.php">Dashboard</a>
<a href="../programari/istoric.php">Programări</a>
<a href="../consultatii/istoric.php">Consultații</a>
<a href="adauga.php">Adauga pacient</a>

</nav>

<div class="container">

<?php if(isset($_GET['msg'])): ?>
    <p style="color:green;">
        <?php
        if($_GET['msg']=='added') echo 'Pacientul a fost adaugat.';
        if($_GET['msg']=='updated') echo 'Pacientul a fost actualizat.';
        ?>
    </p>
<?php endif; ?>

<form method="GET" class="search">

<input type="text" name="search" placeholder="Cauta pacient" value="<?php echo htmlspecialchars($search); ?>">
<button type="submit">Cauta</button>

</form>

<table>

<tr>
<th>ID</th>
<th>Nume</th>
<th>Prenume</th>
<th>CNP</th>
<th>Telefon</th>
<th>Actiuni</th>
</tr>

<?php

while($row=$result->fetch_assoc()){

echo "<tr>";

echo "<td>".$row['id']."</td>";
echo "<td>".$row['nume']."</td>";
echo "<td>".$row['prenume']."</td>";
echo "<td>".$row['cnp']."</td>";
echo "<td>".$row['telefon']."</td>";

echo "<td>\n\n<a href='edit.php?id=".$row['id']."'>Edit</a> |\n<a href='stergere.php?id=".$row['id']."' onclick=\"return confirm('Sigur?')\">Sterge</a>\n\n</td>";

echo "</tr>";

}

?>

</table>

</div>

</body>
</html>