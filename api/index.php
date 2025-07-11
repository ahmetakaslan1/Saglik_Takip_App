<?php
require 'vendor/autoload.php';

// MongoDB bağlantısı
$client = new MongoDB\Client(
    'mongodb+srv://<username>:<password>@<cluster>.mongodb.net/dbname'
);

// CORS ayarları
header('Access-Control-Allow-Origin: https://proje.ahmetakaslan.com');
header('Content-Type: application/json');

// API endpoint'leri
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Verileri MongoDB'ye kaydet
    $collection = $client->dbname->collection_name;
    $result = $collection->insertOne($data);
    
    echo json_stringify(['success' => true]);
}
?> 