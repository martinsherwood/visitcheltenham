<?php
	header("Access-Control-Allow-Origin: *");
	
	require "includes/connect.php";
	
	if (isset($_POST)) {
		$id = $_POST["id"];
		
		if ($stmt = $db -> prepare("DELETE FROM users WHERE id = (?) LIMIT 1")) {
			$stmt -> bind_param("i", $id); 
			$stmt -> execute();
			$stmt -> close();
		
		} else {
			echo "Error: " . $db -> error;
			$stmt -> close();
		}
		
		$db -> close();
	}