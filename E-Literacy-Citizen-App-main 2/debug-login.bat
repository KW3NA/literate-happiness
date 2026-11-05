@echo off
echo Debugging login issues...

echo.
echo Fixed issues:
echo 1. Backend now returns token for 2FA required users
echo 2. Added better error logging in frontend
echo 3. Improved error messages for debugging

echo.
echo To test login:
echo 1. Make sure Laravel backend is running: php artisan serve
echo 2. Check that the API_BASE URL is correct in config/api.ts
echo 3. Try logging in with a verified email
echo 4. Check console logs for detailed error information

echo.
echo Common issues to check:
echo - Backend server not running
echo - Wrong API_BASE URL (check your IP address)
echo - User email not verified
echo - Network connectivity issues

echo.
echo Current API_BASE: http://192.168.137.59:8000/api
echo Make sure this matches your Laravel server IP!

pause
