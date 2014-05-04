<?php
	header("Access-Control-Allow-Origin: *");
	
	require "includes/connect.php";
		
	if ($stmt = $db -> prepare("SELECT id, placename, description, imagename, code, expiry FROM offers")) {
		$stmt -> execute();
		$stmt -> bind_result($id, $placename, $description, $imagename, $code, $expiry);
		
		$records = array();
		
		while ($row = $stmt -> fetch()) {
			$records[] = (array("id" => $id, "placename" => $placename, "description" => $description, "imagename" => $imagename, "code" => $code, "expiry" => $expiry));
		}
		
		$stmt -> close();
	
	} else {
		echo "Error: " . $db -> error;
		$stmt -> close();
	}
	
	$db -> close();
	
	echo json_encode($records);