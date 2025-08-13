#!/bin/bash

# Create a temporary file with the fixes
cat > /tmp/photo-upload-fix.ts << 'FILEEOF'
  const processFile = async (file: File) => {
    setError(null);
    setCanRetry(false);
    
    try {
      // Validate file type before processing
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Unsupported image format');
      }
      
      // Convert file to data URL
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Validate format
      imageProcessor.current.validateFormat(dataUrl);
      
      // Validate size
      imageProcessor.current.validateSize(dataUrl);
FILEEOF

# Backup original and apply fix
cp components/ui/photo-upload.tsx components/ui/photo-upload.tsx.bak

# Replace the processFile function
awk '
/const processFile = async \(file: File\) => {/ {
    in_func = 1
    print "  const processFile = async (file: File) => {"
    print "    setError(null);"
    print "    setCanRetry(false);"
    print "    "
    print "    try {"
    print "      // Validate file type before processing"
    print "      const validTypes = [\"image/jpeg\", \"image/png\", \"image/webp\"];"
    print "      if (!validTypes.includes(file.type)) {"
    print "        throw new Error(\"Unsupported image format\");"
    print "      }"
    print "      "
    print "      // Convert file to data URL"
    print "      const reader = new FileReader();"
    print "      const dataUrl = await new Promise<string>((resolve, reject) => {"
    print "        reader.onload = (e) => resolve(e.target?.result as string);"
    print "        reader.onerror = reject;"
    print "        reader.readAsDataURL(file);"
    print "      });"
    print ""
    print "      // Validate format"
    print "      imageProcessor.current.validateFormat(dataUrl);"
    print "      "
    print "      // Validate size"
    print "      imageProcessor.current.validateSize(dataUrl);"
    next
}
in_func && /imageProcessor.current.validateSize\(dataUrl\);/ {
    in_func = 0
    next
}
!in_func {
    print
}
' components/ui/photo-upload.tsx.bak > components/ui/photo-upload.tsx

echo "Fixed photo-upload.tsx"
