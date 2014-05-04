<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>All Users</title>

<style>
	body {
		font-family: sans-serif;
		background: #e9e9e9;
	}
	
	hr {
		display: block;
		height: 1px;
		border: 0;
		border-top: 1px solid hsla(0, 0%, 80%, 1);
		margin: 1em 0;
		padding: 0;
	}
	
	h1 {
		padding: 10px;
		background: hsla(0,0%,0%,0.60);
		color: white;
	}
	
	span {
		display: inline-block;
		padding: 0 20px;
	}
	
	.id {
		width: 60px;
	}
	
	.username {
		width: 290px;
	}
	
	.email {
		width: 400px;
	}
	
	.password {
		width: 300px;
		display: inline-block;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	
	.date {
		width: 300px;
	}
</style>
</head>
	<body>
    
    <h1>All Users</h1>

	<?php
        require "../includes/connect.php";
        
        //list all users
        if ($stmt = $db -> prepare("SELECT * FROM users ORDER BY id")) {
            $stmt -> execute();
            $stmt -> bind_result($returned_ids, $returned_names, $returned_emails, $returned_passwords, $returned_dates);
            
            while($stmt -> fetch()) {
                echo "<span class=\"id\"><strong>ID: </strong>" . $returned_ids . "</span>" .
                     "<span class=\"username\"><strong>Username: </strong>" . $returned_names . "</span>" .
					 "<span class=\"email\"><strong>Email: </strong>" . $returned_emails . "</span>" .
                     "<span class=\"password\"><strong>Password (hashed): </strong>" . $returned_passwords . "</span>" .
                     "<span class=\"date\"><strong>Date Registered: </strong>" . $returned_dates . "</span>" .
                     
                     "<br/><hr>";
            }
        
            $stmt->close();
        
        } else {
            echo "Error: " . $db -> error;
            $stmt -> close();
        }
        
        $db->close();
    ?>
    
</body>
</html>