<?php
	header("Access-Control-Allow-Origin: *");
	
	require "includes/connect.php";
	
	if (isset($_POST)) {
		$placename = htmlentities($_POST["placename"], ENT_QUOTES);
		$placename = $db -> real_escape_string($placename);
		
		$placeaddress = htmlentities($_POST["placeaddress"], ENT_QUOTES);
		$placeaddress = $db -> real_escape_string($placeaddress);
		
		$userid = ($_POST["userid"]);
		
		if ($stmt = $db -> prepare("INSERT INTO user_favourites (userid, placename, placeaddress) VALUES (?, ?, ?)")) {
			$stmt -> bind_param("iss", $userid, $placename, $placeaddress);
			$stmt -> execute();
			$stmt -> close();
		} else {
			echo "Error: " . $db -> error;
			$stmt -> close();
		}
		
		$db -> close();
		
	}