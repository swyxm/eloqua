# 🚀 Eloqua Distribution Guide

This guide explains how to package and distribute Eloqua as a downloadable desktop application.

## 📦 Quick Build

### Prerequisites
- Node.js 18+
- Python 3.8+
- All dependencies installed (`npm install`)

### Build Commands
```bash
# Build Vue app
npm run build

# Package for current platform
npm run electron:pack

# Create distributable
npm run electron:dist
```

## 🎯 Platform-Specific Builds

### macOS
- **Output**: `.dmg` file
- **Architecture**: Universal (Intel + Apple Silicon)
- **Requirements**: Xcode Command Line Tools
- **Icon**: `build/icon.icns`

### Windows
- **Output**: `.exe` installer
- **Architecture**: x64
- **Requirements**: Visual Studio Build Tools
- **Icon**: `build/icon.ico`

### Linux
- **Output**: `.AppImage` file
- **Architecture**: x64
- **Requirements**: Standard build tools
- **Icon**: `build/icon.png`

## 🎨 App Icons

### Converting SVG to Required Formats

1. **SVG Source**: `build/icon.svg` (512x512)
2. **Convert using online tools**:
   - **macOS**: Convert to `.icns` (512x512)
   - **Windows**: Convert to `.ico` (256x256)
   - **Linux**: Convert to `.png` (512x512)

### Icon Requirements
- **High Resolution**: 512x512 minimum
- **Transparent Background**: PNG format
- **Multiple Sizes**: Include 16x16, 32x32, 48x48, 256x256
- **Brand Consistency**: Use your logo colors

## 📱 Distribution Methods

### 1. GitHub Releases (Recommended)
```bash
# Create a new tag
git tag v1.0.0
git push origin v1.0.0

# GitHub Actions will automatically build and release
```

### 2. Manual Release
1. Build the app: `npm run electron:dist`
2. Go to GitHub → Releases → Create new release
3. Upload files from `dist-electron/` folder
4. Write release notes
5. Publish

### 3. Alternative Platforms
- **macOS**: App Store, direct download
- **Windows**: Microsoft Store, direct download
- **Linux**: Snap Store, Flathub, direct download

## 🔧 Build Configuration

### package.json Build Section
```json
{
  "build": {
    "appId": "com.eloqua.app",
    "productName": "Eloqua",
    "files": ["dist/**/*", "main.js", "preload.js"],
    "extraResources": [{"from": "src/main/python", "to": "python"}]
  }
}
```

### Customization Options
- **App ID**: Change `com.eloqua.app` to your domain
- **Product Name**: Change "Eloqua" to your app name
- **Files**: Add/remove files to include in the package
- **Resources**: Include Python scripts and other assets

## 🚀 Automated Builds

### GitHub Actions
- **Trigger**: Push a tag starting with 'v' (e.g., v1.0.0)
- **Platforms**: macOS, Ubuntu, Windows
- **Output**: Automatic release with all platform builds

### Local Build Script
```bash
# Run the build script
./build.sh

# Or manually
npm run build && npm run electron:dist
```

## 📋 Release Checklist

### Before Building
- [ ] Update version in `package.json`
- [ ] Test the app thoroughly
- [ ] Update `CHANGELOG.md`
- [ ] Ensure all dependencies are up to date

### Building
- [ ] Run `npm run build` (Vue app)
- [ ] Run `npm run electron:dist` (Electron package)
- [ ] Check `dist-electron/` folder for output files

### Release
- [ ] Create GitHub release
- [ ] Upload all platform builds
- [ ] Write comprehensive release notes
- [ ] Tag the release
- [ ] Share on social media/community

## 🐛 Troubleshooting

### Common Build Issues
1. **Python not found**: Ensure Python is in PATH
2. **Missing dependencies**: Run `npm install` and `pip install -r requirements.txt`
3. **Icon errors**: Check icon file formats and sizes
4. **Build failures**: Check platform-specific requirements

### Debug Build
```bash
# Enable verbose logging
DEBUG=electron-builder npm run electron:dist

# Check build logs
tail -f ~/.cache/electron-builder/logs/*
```

## 📚 Resources

- [Electron Builder Documentation](https://www.electron.build/)
- [Electron Packaging Guide](https://www.electronjs.org/docs/latest/tutorial/application-distribution)
- [App Icon Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Windows App Icon Requirements](https://docs.microsoft.com/en-us/windows/uwp/design/style/app-icons-and-logos)

---

**Happy Debating! 🎉**
