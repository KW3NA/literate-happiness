Write-Host "Fixing 2FA screen icon imports..." -ForegroundColor Green

Write-Host ""
Write-Host "The TwoFactorScreen has been updated to use Ionicons instead of lucide-react-native." -ForegroundColor Yellow
Write-Host "This should resolve the bundling error." -ForegroundColor Yellow

Write-Host ""
Write-Host "If you still get errors, try:" -ForegroundColor Cyan
Write-Host "1. Clear Metro cache: npx expo start --clear" -ForegroundColor White
Write-Host "2. Or restart the development server" -ForegroundColor White

Write-Host ""
Write-Host "2FA implementation is now complete and ready for testing!" -ForegroundColor Green
Read-Host "Press Enter to continue"

