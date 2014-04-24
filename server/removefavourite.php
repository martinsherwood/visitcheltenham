<?php
	header("Access-Control-Allow-Origin: *");
	
	require "includes/connect.php";
	
	if (isset($_POST)) {
		$userid = $_POST["userid"];
		$placename = $_POST["placename"];
		
		//"SELECT id FROM users WHERE username = '" . $username . "'"
		
		if ($stmt = $db -> prepare("DELETE FROM user_favourites WHERE userid = '" . $userid . "'" . " AND placename = '" . $placename . "' LIMIT 1")) {
			$stmt -> bind_param("is", $id, $placename); 
			$stmt -> execute();
			$stmt -> close();
		
		} else {
			echo "Error: " . $db -> error;
			$stmt -> close();
		}
		
		$db->close();
	}