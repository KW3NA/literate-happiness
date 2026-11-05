Write-Host "Fixing Metro bundling error..." -ForegroundColor Green
Write-Host ""

Write-Host "Installing missing expo-web-browser dependency..." -ForegroundColor Yellow
npm install expo-web-browser@~14.1.4

Write-Host ""
Write-Host "Clearing Metro cache..." -ForegroundColor Yellow
npx expo start --clear

Write-Host ""
Write-Host "Done! The Metro bundling error should now be fixed." -ForegroundColor Green
Read-Host "Press Enter to continue"
