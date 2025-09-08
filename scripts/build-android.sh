#!/bin/bash

# scripts/build-android.sh
# สคริปต์สำหรับ build Android APK

echo "🚀 เริ่มต้น Build Android APK สำหรับ ZapStock..."

# ตรวจสอบว่าอยู่ในโฟลเดอร์ที่ถูกต้อง
if [ ! -f "package.json" ]; then
    echo "❌ ไม่พบ package.json กรุณาเรียกใช้สคริปต์นี้ในโฟลเดอร์ root ของโปรเจค"
    exit 1
fi

# ตรวจสอบว่ามี EAS CLI หรือไม่
if ! command -v eas &> /dev/null; then
    echo "📦 ติดตั้ง EAS CLI..."
    npm install -g @expo/eas-cli
fi

# ตรวจสอบการ login
echo "🔐 ตรวจสอบการ login EAS..."
if ! eas whoami &> /dev/null; then
    echo "❌ กรุณา login เข้า EAS ก่อน:"
    echo "   eas login"
    exit 1
fi

echo "✅ Login สำเร็จ"

# ตรวจสอบ project configuration
echo "🔍 ตรวจสอบ project configuration..."
if [ ! -f "eas.json" ]; then
    echo "❌ ไม่พบ eas.json"
    exit 1
fi

if [ ! -f "app.config.js" ]; then
    echo "❌ ไม่พบ app.config.js"
    exit 1
fi

echo "✅ Configuration files พบแล้ว"

# Build APK
echo "🔨 เริ่ม build APK..."
echo "📱 Platform: Android"
echo "📦 Build Type: APK"
echo "🌐 Target: Production"

# ใช้ profile apk ที่เราสร้างไว้
eas build --platform android --profile apk --non-interactive

if [ $? -eq 0 ]; then
    echo "✅ Build สำเร็จ!"
    echo "📱 APK พร้อมใช้งาน"
    echo "🔗 ตรวจสอบ build status ที่: https://expo.dev"
else
    echo "❌ Build ล้มเหลว!"
    echo "🔍 ตรวจสอบ logs สำหรับรายละเอียด"
    exit 1
fi



