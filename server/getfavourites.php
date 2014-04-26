<?php
	header("Access-Control-Allow-Origin: *");
	
	require "includes/connect.php";
	
	if (isset($_POST)) {
		$userid = $_POST["userid"];
		//$userid = 15; //testing
		
		if ($stmt = $db -> prepare("SELECT placename FROM user_favourites WHERE userid = '" . $userid . "' ORDER BY placename")) {
			$stmt -> execute();
			$stmt -> bind_result($placename);
			
			$records = array();
			
			while ($stmt -> fetch()) {
				$records[] = $placename;
			}
			
			$stmt -> close();
		
		} else {
			echo "Error: " . $db -> error;
			$stmt -> close();
		}
		
		$db -> close();
	}
	
	echo json_encode($records);