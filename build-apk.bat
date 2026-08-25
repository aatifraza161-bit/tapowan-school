@echo off
echo Creating C:\Tapowan directory...
mkdir C:\Tapowan

echo Copying files to C:\Tapowan to avoid MAX_PATH issues...
robocopy "C:\Users\Admin\Desktop\My Project\Slip And Receipt\All fixed\TapowanPublicSchool-fixed\student-mobile-app" "C:\Tapowan" /E /XD .git

echo Building APK...
cd C:\Tapowan\android
call gradlew assembleRelease

echo Copying APK back...
copy "C:\Tapowan\android\app\build\outputs\apk\release\app-release.apk" "C:\Users\Admin\Desktop\My Project\Slip And Receipt\All fixed\TapowanPublicSchool-fixed\Tapowan-Mobile-App-Latest.apk"

echo Cleaning up...
cd C:\
rmdir /S /Q C:\Tapowan

echo Done!
