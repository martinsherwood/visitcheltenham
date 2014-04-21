<?php
	header("Access-Control-Allow-Origin: *");
	
	if (isset($_POST)) {
		
		$formOkay = true;
		
		//extra
		$ipAddress = $_SERVER['REMOTE_ADDR'];
		$date = date('D, M j');
		$time = date('h:i A');

		//items
		$name = $_POST["name"];
		$email = $_POST["email"];
		$message = $_POST["message"];
		
		//construct email to send
		$to = "martin.sherwood@outlook.com";
		$subject = "Visit Cheltenham Feedback";
		
		//send email if all is ok
		if ($formOkay = true) {
			$headers = "From:" . $email . "\r\n";
			$headers .= "MIME-Version: 1.0\r\n";
			$headers .= "Content-type: text/html; charset=utf-8" . "\r\n";
			
			$emailBody = "<p style=\"font-size:1.0em;\"><strong>From: {$name}, {$email} </strong></p>
						  <hr>
						  <h3>Message:</h3>
						  <p>{$message}</p>
						  <hr>
						  <p style=\"font-size:0.8em; color: #ccc;\">This message was sent from the IP Address: {$ipAddress} on {$date} at {$time}</p>";
			
			mail($to, $subject, $emailBody, $headers);
			
		}
	}