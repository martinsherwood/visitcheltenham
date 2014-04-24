<?php

	require_once "constants.php";
	
	$db = new mysqli(DB_SERVER, DB_USER, DB_PASSWORD, DB_NAME);

	if($db->connect_errno > 0) {
		die("Unable to connect to database [" . $db->connect_error . "]");
	}
	
	
	