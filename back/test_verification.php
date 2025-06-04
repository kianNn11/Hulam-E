<?php

echo "=== Testing Verification Endpoint ===" . PHP_EOL;

// Test with a simple curl request to the verification endpoint
$url = 'http://localhost:8000/api/users/verify-student';

// Create test data
$testData = [
    'userId' => 1,
    'verificationData' => json_encode([
        'fileName' => 'test_certificate.pdf',
        'fileType' => 'application/pdf',
        'fileSize' => 1024,
        'uploadDate' => date('c')
    ])
];

echo "Testing endpoint: " . $url . PHP_EOL;
echo "Test data prepared..." . PHP_EOL;

// Test without authentication first (should fail with 401)
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($testData));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/x-www-form-urlencoded',
    'Accept: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Response Code: " . $httpCode . PHP_EOL;
echo "Response Body: " . $response . PHP_EOL;

if ($httpCode === 401) {
    echo "✅ Endpoint properly requires authentication" . PHP_EOL;
} else {
    echo "❌ Expected 401 but got " . $httpCode . PHP_EOL;
}

echo PHP_EOL . "Endpoint test completed." . PHP_EOL; 