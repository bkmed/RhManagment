#!/bin/bash

# Icon source: artifacts/icon.png (1024x1024)
# Splash source: artifacts/splash.png (2048x2048)

# iOS App Icons
mkdir -p ios/rhmanagment/Images.xcassets/AppIcon.appiconset
sips -z 20 20 artifacts/icon.png --out ios/rhmanagment/Images.xcassets/AppIcon.appiconset/icon-20.png
sips -z 40 40 artifacts/icon.png --out ios/rhmanagment/Images.xcassets/AppIcon.appiconset/icon-20@2x.png
sips -z 60 60 artifacts/icon.png --out ios/rhmanagment/Images.xcassets/AppIcon.appiconset/icon-20@3x.png
sips -z 29 29 artifacts/icon.png --out ios/rhmanagment/Images.xcassets/AppIcon.appiconset/icon-29.png
sips -z 58 58 artifacts/icon.png --out ios/rhmanagment/Images.xcassets/AppIcon.appiconset/icon-29@2x.png
sips -z 87 87 artifacts/icon.png --out ios/rhmanagment/Images.xcassets/AppIcon.appiconset/icon-29@3x.png
sips -z 40 40 artifacts/icon.png --out ios/rhmanagment/Images.xcassets/AppIcon.appiconset/icon-40.png
sips -z 80 80 artifacts/icon.png --out ios/rhmanagment/Images.xcassets/AppIcon.appiconset/icon-40@2x.png
sips -z 120 120 artifacts/icon.png --out ios/rhmanagment/Images.xcassets/AppIcon.appiconset/icon-40@3x.png
sips -z 57 57 artifacts/icon.png --out ios/rhmanagment/Images.xcassets/AppIcon.appiconset/icon-57.png
sips -z 114 114 artifacts/icon.png --out ios/rhmanagment/Images.xcassets/AppIcon.appiconset/icon-57@2x.png
sips -z 60 60 artifacts/icon.png --out ios/rhmanagment/Images.xcassets/AppIcon.appiconset/icon-60.png
sips -z 120 120 artifacts/icon.png --out ios/rhmanagment/Images.xcassets/AppIcon.appiconset/icon-60@2x.png
sips -z 180 180 artifacts/icon.png --out ios/rhmanagment/Images.xcassets/AppIcon.appiconset/icon-60@3x.png
sips -z 72 72 artifacts/icon.png --out ios/rhmanagment/Images.xcassets/AppIcon.appiconset/icon-72.png
sips -z 144 144 artifacts/icon.png --out ios/rhmanagment/Images.xcassets/AppIcon.appiconset/icon-72@2x.png
sips -z 76 76 artifacts/icon.png --out ios/rhmanagment/Images.xcassets/AppIcon.appiconset/icon-76.png
sips -z 152 152 artifacts/icon.png --out ios/rhmanagment/Images.xcassets/AppIcon.appiconset/icon-76@2x.png
sips -z 167 167 artifacts/icon.png --out ios/rhmanagment/Images.xcassets/AppIcon.appiconset/icon-83.5@2x.png
sips -z 1024 1024 artifacts/icon.png --out ios/rhmanagment/Images.xcassets/AppIcon.appiconset/icon-1024.png

# Android App Icons (Mipmap)
mkdir -p android/app/src/main/res/mipmap-mdpi
sips -z 48 48 artifacts/icon.png --out android/app/src/main/res/mipmap-mdpi/ic_launcher.png
sips -z 48 48 artifacts/icon.png --out android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png

mkdir -p android/app/src/main/res/mipmap-hdpi
sips -z 72 72 artifacts/icon.png --out android/app/src/main/res/mipmap-hdpi/ic_launcher.png
sips -z 72 72 artifacts/icon.png --out android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png

mkdir -p android/app/src/main/res/mipmap-xhdpi
sips -z 96 96 artifacts/icon.png --out android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
sips -z 96 96 artifacts/icon.png --out android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png

mkdir -p android/app/src/main/res/mipmap-xxhdpi
sips -z 144 144 artifacts/icon.png --out android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
sips -z 144 144 artifacts/icon.png --out android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png

mkdir -p android/app/src/main/res/mipmap-xxxhdpi
sips -z 192 192 artifacts/icon.png --out android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
sips -z 192 192 artifacts/icon.png --out android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png

# BootSplash Assets (Android)
# Generating bootsplash_logo.png for Android drawable
# standard sizes roughly: mdpi=48, hdpi=72, xhdpi=96, xxhdpi=144, xxxhdpi=192
# BootSplash usually recommends a center logo. We'll generate a few sizes.
# For simplicity, we'll put a high-res one in drawable-xxxhdpi and let Android scale down or specific buckets.
# Actually, let's just make one valid logo resource.
mkdir -p android/app/src/main/res/drawable
sips -z 1024 1024 artifacts/splash.png --out android/app/src/main/res/drawable/bootsplash_logo.png

# BootSplash Assets (iOS)
# iOS uses a storyboard, we just need the image in the xcassets.
# We'll create a new imageset for the splash logo.
mkdir -p ios/rhmanagment/Images.xcassets/BootSplashLogo.imageset
sips -z 100 100 artifacts/splash.png --out ios/rhmanagment/Images.xcassets/BootSplashLogo.imageset/bootsplash_logo.png
sips -z 200 200 artifacts/splash.png --out ios/rhmanagment/Images.xcassets/BootSplashLogo.imageset/bootsplash_logo@2x.png
sips -z 300 300 artifacts/splash.png --out ios/rhmanagment/Images.xcassets/BootSplashLogo.imageset/bootsplash_logo@3x.png
