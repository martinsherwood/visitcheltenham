<?php
	header("Access-Control-Allow-Origin: *");
	
	require "includes/connect.php";
	
	if (isset($_POST)) {
		$placename = ($_POST["placename"]);
		$userid = ($_POST["userid"]);
		
		if ($stmt = $db -> prepare("INSERT INTO user_favourites (userid, placename) VALUES (?, ?)")) {
			$stmt -> bind_param("is", $userid, $placename);
			$stmt -> execute();
			$stmt -> close();
		} else {
			echo "Error: " . $db -> error;
			$stmt -> close();
		}
		
		$db -> close();
		
	}