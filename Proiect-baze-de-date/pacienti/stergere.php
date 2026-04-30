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

$sql="DELETE FROM pacienti WHERE id=?";
$stmt=$conn->prepare($sql);
$stmt->bind_param("i",$id);
$stmt->execute();

header("Location: lista.php");
exit();
?>