<?php
	header("Access-Control-Allow-Origin: *");
	
	require "includes/connect.php";
	
	if (isset($_POST)) {
		
		$userid = ($_POST["userid"]);
		
		$username = htmlentities($_POST["username"], ENT_QUOTES);
		$username = $db -> real_escape_string($username);
		
		$placename = htmlentities($_POST["placename"], ENT_QUOTES);
		$placename = $db -> real_escape_string($placename);
		
		$comment = htmlentities($_POST["comment"], ENT_QUOTES);
		$comment = $db -> real_escape_string($comment);
		
		//we need to get the place id to insert as well
		if ($stmt = $db -> prepare("INSERT INTO user_comments (userid, username, placename, comment) VALUES (?, ?, ?, ?)")) {
			$stmt -> bind_param("isss", $userid, $username, $placename, $comment);
			$stmt -> execute();
			$stmt -> close();
		} else {
			echo "Error: " . $db -> error;
			$stmt -> close();
		}
		
		$db -> close();
		
	}