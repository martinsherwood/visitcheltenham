<?php
	header("Access-Control-Allow-Origin: *");
	
	require "includes/connect.php";
	
	if (isset($_POST)) {
		$username = $_POST["username"];
		
		if ($stmt = $db -> prepare("SELECT id FROM users WHERE username = '" . $username . "'")) {
			$stmt -> execute();
			$stmt -> bind_result($id);
			$stmt -> fetch();
			
			echo json_encode($id);
			
			$stmt -> close();
		
		} else {
			echo "Error: " . $db -> error;
			$stmt -> close();
		}
		
		$db -> close();
	}