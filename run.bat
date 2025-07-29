@echo off
REM Thay đổi đường dẫn tới thư mục client (ứng dụng React)
cd /d "E:\Desktop\REACT\quannhu"

REM Khởi động ứng dụng React
start cmd.exe /k "npm start"

REM Quay lại thư mục REACT
cd /d "E:\Desktop\REACT"

REM Thay đổi đường dẫn tới thư mục server (ứng dụng Node.js)
cd "E:\Desktop\REACT\quannhuserver"
REM Khởi động Node.js server
start cmd.exe /k "npm start"
REM Kiểm tra xem MongoDB có đang chạy không
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe" > NUL
if "%ERRORLEVEL%"=="0" (
    echo MongoDB is running
) else (
    echo Starting MongoDB...
    cd /d "C:\"
    start cmd.exe /k "mongod"
    timeout /t 5
)

REM Đợi vài giây để ứng dụng khởi động
timeout /t 5

REM Đường dẫn tới MongoDB Compass, thay thế bằng đường dẫn thực tế trên hệ thống của bạn
set MONGO_COMPASS_PATH="C:\Users\Van Khanh\AppData\Local\MongoDBCompass\MongoDBCompass.exe"

REM URL kết nối tới cơ sở dữ liệu MongoDB, thay thế bằng URL của bạn
set MONGO_URI="mongodb://localhost:27017/quannhu"

REM Khởi động MongoDB Compass với URL kết nối
start "" %MONGO_COMPASS_PATH% %MONGO_URI%