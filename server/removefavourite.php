<?php
	header("Access-Control-Allow-Origin: *");
	
	require "includes/connect.php";
	
	if (isset($_POST)) {
		$userid = $_POST["userid"];
		$placename = htmlentities($_POST["placename"], ENT_QUOTES);
		$placename = $db -> real_escape_string($placename);
		
		if ($stmt = $db -> prepare("DELETE FROM user_favourites WHERE userid = (?) AND placename = (?) LIMIT 1")) {
			$stmt -> bind_param("is", $userid, $placename); 
			$stmt -> execute();
			$stmt -> close();
		
		} else {
			echo "Error: " . $db -> error;
			$stmt -> close();
		}
		
		$db -> close();
	}