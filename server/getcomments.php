<?php
	header("Access-Control-Allow-Origin: *");
	
	require "includes/connect.php";
	
	if (isset($_POST)) {
		$placename = $_POST["placename"];
		
		if ($stmt = $db -> prepare("SELECT username, comment FROM user_comments WHERE placename = '" . $placename . "' ORDER BY datemade")) {
			$stmt -> execute();
			$stmt -> bind_result($usernames, $comments);
			
			$records = array();
			
			while ($row = $stmt -> fetch()) {
				$records[] = $usernames . " " . $comments;
			}
			
			$stmt -> close();
		
		} else {
			echo "Error: " . $db -> error;
			$stmt -> close();
		}
		
		$db -> close();
	}
	
	echo json_encode($records);