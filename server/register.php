<?php
	header("Access-Control-Allow-Origin: *");
	
	require "includes/connect.php";
	
	if (isset($_POST)) {
		$username = ($_POST["username"]);
		$email = ($_POST["useremail"]);
		$password = ($_POST["userpassword"]);
		
		if ($stmt = $db -> prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)")) {
			$stmt -> bind_param("sss", $username, $email, hash("sha512", $password));
			$stmt -> execute();
			$stmt -> close();
		} else {
			echo "Error: " . $db -> error;
			$stmt -> close();
		}
		
		$db -> close();
		
	}