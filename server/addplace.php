<?php
	header("Access-Control-Allow-Origin: *");
	
	require "includes/connect.php";
	
	if (isset($_POST)) {
		//$placename = ($_POST["placename"]);
		$placename = htmlentities($_POST["placename"], ENT_QUOTES);
		$placename = $db -> real_escape_string($placename);
		
		$userid = ($_POST["userid"]);
		
		if ($stmt = $db -> prepare("INSERT INTO user_places (userid, placename) VALUES (?, ?)")) {
			$stmt -> bind_param("is", $userid, $placename);
			$stmt -> execute();
			$stmt -> close();
		} else {
			echo "Error: " . $db -> error;
			$stmt -> close();
		}
		
		$db -> close();
		
	}