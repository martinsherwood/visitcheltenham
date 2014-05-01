<?php
	header("Access-Control-Allow-Origin: *");
	
	require "includes/connect.php";
	
	if (isset($_POST)) {
		$placename = $_POST["placename"];
		
		if ($stmt = $db -> prepare("SELECT username, comment FROM user_comments WHERE placename = (?) ORDER BY datemade DESC")) {
			$stmt -> bind_param("s", $placename);
			$stmt -> execute();
			$stmt -> bind_result($usernames, $comments);
			
			$records = array();
			
			while ($row = $stmt -> fetch()) {
				$records[] = $usernames . " " . $comments; //try to make proper json
			}
			
			$stmt -> close();
		
		} else {
			echo "Error: " . $db -> error;
			$stmt -> close();
		}
		
		$db -> close();
	}
	
	echo json_encode($records);