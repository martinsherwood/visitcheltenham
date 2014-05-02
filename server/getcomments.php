<?php
	header("Access-Control-Allow-Origin: *");
	
	require "includes/connect.php";
	
	if (isset($_POST)) {
		$placename = $_POST["placename"];
		
		if ($stmt = $db -> prepare("SELECT username, comment, date_format(datemade, '%e/%c/%Y, %h:%i %p') FROM user_comments WHERE placename = (?) ORDER BY datemade DESC")) {
			$stmt -> bind_param("s", $placename);
			$stmt -> execute();
			$stmt -> bind_result($username, $comment, $date);
			
			$records = array();
			
			while ($row = $stmt -> fetch()) {
				$records[] = (array("username" => $username, "comment" => $comment, "date" => $date));
			}
			
			$stmt -> close();
		
		} else {
			echo "Error: " . $db -> error;
			$stmt -> close();
		}
		
		$db -> close();
	}
	
	echo json_encode($records);