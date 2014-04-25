<?php
	header("Access-Control-Allow-Origin: *");
	
	require "includes/connect.php";
	
	if (isset($_POST)) {
		$userid = $_POST["userid"];
		//$placename = $_POST["placename"];
		
		$placename = htmlentities($_POST["placename"], ENT_QUOTES);
		$placename = $db -> real_escape_string($placename);
		
		if ($stmt = $db -> prepare("DELETE FROM user_places WHERE userid = '" . $userid . "'" . " AND placename = '" . $placename . "' LIMIT 1")) {
			$stmt -> bind_param("is", $id, $placename); 
			$stmt -> execute();
			$stmt -> close();
		
		} else {
			echo "Error: " . $db -> error;
			$stmt -> close();
		}
		
		$db -> close();
	}