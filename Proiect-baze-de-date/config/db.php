<?php
$host = "localhost";
$user = "root";
$pass = "";
$db = "baza_spital";

$conn = new mysqli($host,$user,$pass,$db);

if($conn->connect_error){
    die("Eroare conexiune: ".$conn->connect_error);
}
?>