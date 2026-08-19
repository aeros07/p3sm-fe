<?php
$sourcePath = __DIR__ . '/public/assets/images/icon.png';
$destPng = __DIR__ . '/public/favicon.png';
$destIco = __DIR__ . '/public/favicon.ico';

$sourceImage = imagecreatefrompng($sourcePath);
$width = imagesx($sourceImage);
$height = imagesy($sourceImage);

// 1. Pad to square first (in memory)
$max = max($width, $height);
$squareImage = imagecreatetruecolor($max, $max);

// Make background transparent for square image
imagealphablending($squareImage, false);
imagesavealpha($squareImage, true);
$transparent = imagecolorallocatealpha($squareImage, 0, 0, 0, 127);
imagefill($squareImage, 0, 0, $transparent);

// Calculate centered position
$x = intval(($max - $width) / 2);
$y = intval(($max - $height) / 2);

// Copy source to square target
imagecopy($squareImage, $sourceImage, $x, $y, 0, 0, $width, $height);

// 2. Resize to 64x64 (standard crisp favicon size)
$targetSize = 64;
$finalImage = imagecreatetruecolor($targetSize, $targetSize);

// Make background transparent for final image
imagealphablending($finalImage, false);
imagesavealpha($finalImage, true);
imagefill($finalImage, 0, 0, $transparent);

// Resample square image into 64x64
imagecopyresampled($finalImage, $squareImage, 0, 0, 0, 0, $targetSize, $targetSize, $max, $max);

// Save to files
imagepng($finalImage, $destPng);
imagepng($finalImage, $destIco);

imagedestroy($sourceImage);
imagedestroy($squareImage);
imagedestroy($finalImage);

echo "Success\n";
