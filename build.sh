#!/bin/bash

echo "🚀 Building Eloqua for distribution..."

# Check if we're on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 Building for macOS..."
    
    # Build the Vue app first
    npm run build
    
    # Create macOS package
    npm run electron:dist
    
    echo "✅ macOS build complete! Check dist-electron/ folder"
    
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    echo "🪟 Building for Windows..."
    
    # Build the Vue app first
    npm run build
    
    # Create Windows package
    npm run electron:dist
    
    echo "✅ Windows build complete! Check dist-electron/ folder"
    
else
    echo "🐧 Building for Linux..."
    
    # Build the Vue app first
    npm run build
    
    # Create Linux package
    npm run electron:dist
    
    echo "✅ Linux build complete! Check dist-electron/ folder"
fi

echo ""
echo "📦 Distribution packages created in dist-electron/"
echo "🎯 Upload these files to GitHub Releases for distribution"
