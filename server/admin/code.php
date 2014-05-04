<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Voucher Code Generation</title>
</head>

<body>

<?php

$length = 8;
$voucherCode = "";
$count = 0;

while ($count < $length) {
    $random = mt_rand(0, 9);
    $voucherCode .= $random;
    $count++;
}

preg_match("/(\d{4})(\d{4})/", $voucherCode, $matches);
echo "$matches[1]&ndash;$matches[2]";


?>

</body>
</html>