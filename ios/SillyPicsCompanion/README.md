# iOS companion scaffold (SwiftUI)

This folder contains a lightweight SwiftUI scaffold for the Silly Pics companion app.

## Included
- `ContentView.swift`: capture portrait, random style, caricature generation, branded save.
- `CameraPicker.swift`: `UIImagePickerController` camera bridge.
- `CaricatureFilter.swift`: Core Image caricature-like distortion + style tuning + branding overlay.
- `SillyPicsCompanionApp.swift`: app entry point.

## Use in Xcode
1. Create a new iOS App project named **SillyPicsCompanion** (SwiftUI).
2. Replace generated Swift files with these files.
3. Add `NSCameraUsageDescription` and `NSPhotoLibraryAddUsageDescription` to `Info.plist`.
4. Run on iPhone or iOS Simulator with camera support.
