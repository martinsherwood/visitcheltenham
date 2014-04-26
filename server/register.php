<?php
	header("Access-Control-Allow-Origin: *");
	
	require "includes/connect.php";
	
	if (isset($_POST)) {
		//$username = ($_POST["username"]);
		//$email = ($_POST["useremail"]);
		//$password = ($_POST["userpassword"]);
		
		$username = htmlentities($_POST["username"], ENT_QUOTES);
		$email = htmlentities($_POST["useremail"], ENT_QUOTES);
		$password = htmlentities($_POST["userpassword"], ENT_QUOTES);
		
		$username = $db -> real_escape_string($username);
		$email = $db -> real_escape_string($email);
		$password = $db -> real_escape_string($password);
		
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