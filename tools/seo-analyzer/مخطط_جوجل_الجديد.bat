@echo off
chcp 65001 > nul
title AirPro Google Ads Keyword Planner (Web)
color 0A
echo.
echo ==================================================
echo.
echo      جاري تشغيل خادم إعلانات جوجل (النسخة الحديثة)
echo.
echo ==================================================
echo.
echo برجاء عدم إغلاق هذه الشاشة (السيرفر المحلي).
echo.
start http://localhost:8080
node "C:\Users\i7\.gemini\antigravity-ide\scratch\fans-installation-project\tools\seo-analyzer\Ads-Server.cjs"
pause
