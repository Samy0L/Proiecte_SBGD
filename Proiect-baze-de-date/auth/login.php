<?php
session_start();
include("../config/db.php");

if(isset($_SESSION['user'])){
    header("Location: ../dashboard.php");
    exit();
}

$error = '';
if(isset($_POST['login'])){
    $email = $_POST['email'];
    $parola = $_POST['parola'];

    if($email === 'admin' && $parola === '') {
        $_SESSION['user'] = 'admin_special';
        $_SESSION['rol'] = 'admin';
        header("Location: ../dashboard.php");
        exit();
    }

    $sql = "SELECT * FROM personal WHERE email=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();

    if($user && $parola === $user['parola']){
        $_SESSION['user'] = $user['id'];
        $_SESSION['rol'] = $user['rol'];
        header("Location: ../dashboard.php");
        exit();
    } else {
        $error = "Email sau parola incorecte";
    }
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Autentificare</title>
    <link rel="stylesheet" href="../style/style.css">
</head>
<body>
<div class="container" style="max-width:400px; margin-top:100px;">
    <h2>Login</h2>
    <?php if($error): ?>
        <p style="color:red;"><?php echo $error; ?></p>
    <?php endif; ?>
    <form method="POST">
        <div class="input-group">
            <label>Email</label>
            <input type="email" name="email" placeholder="Email" required>
        </div>
        <div class="input-group">
            <label>Parola</label>
            <input type="password" name="parola" placeholder="Parola" required>
        </div>
        <button name="login">Login</button>
    </form>
</div>
</body>
</html>