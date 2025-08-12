'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Upload, Image as ImageIcon, Sparkles, X, AlertCircle } from 'lucide-react';

export default function AIAnalysisPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = () => {
    const input = document.getElementById('camera-input') as HTMLInputElement;
    input?.click();
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    // Simulate API call
    setTimeout(() => {
      setIsAnalyzing(false);
      window.location.href = '/export';
    }, 2000);
  };

  return (
    <PageWrapper>
      <div className="px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Camera className="h-8 w-8 text-primary" />
            </div>
            <h1 className="mb-4 text-3xl font-bold sm:text-4xl">AI Photo Analysis</h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Take or upload a photo of your space, and our AI will generate a customized checklist
              based on what it sees
            </p>
          </div>

          {/* Upload Area */}
          {!imagePreview ? (
            <Card className="overflow-hidden">
              <div className="p-8">
                <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>

                  <h3 className="mb-2 text-lg font-semibold">Upload or Capture an Image</h3>

                  <p className="mb-6 text-sm text-muted-foreground">
                    Take a photo of the space you need a checklist for
                  </p>

                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Button onClick={handleCameraCapture} size="lg">
                      <Camera className="mr-2 h-4 w-4" />
                      Take Photo
                    </Button>

                    <Button variant="outline" size="lg" asChild>
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Image
                        <input
                          id="file-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageSelect}
                        />
                      </label>
                    </Button>

                    <input
                      id="camera-input"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handleImageSelect}
                    />
                  </div>

                  <div className="mt-6 text-xs text-muted-foreground">
                    Supported formats: JPG, PNG, WEBP (Max 5MB)
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Selected space"
                  className="h-auto w-full object-cover sm:max-h-[500px]"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute right-4 top-4 rounded-full bg-background/80 p-2 backdrop-blur transition-all hover:bg-background"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <h3 className="mb-2 font-semibold">Image Ready for Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedImage?.name} ({(selectedImage?.size || 0 / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>

                <Button onClick={handleAnalyze} disabled={isAnalyzing} size="lg" className="w-full">
                  {isAnalyzing ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/20 border-t-primary-foreground" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Analyze with AI
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}

          {/* Tips Section */}
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Card className="p-4">
              <div className="flex gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Camera className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="mb-1 text-sm font-medium">Good Lighting</h4>
                  <p className="text-xs text-muted-foreground">
                    Ensure the space is well-lit for better analysis
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <ImageIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="mb-1 text-sm font-medium">Wide Angle</h4>
                  <p className="text-xs text-muted-foreground">
                    Capture as much of the space as possible
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <AlertCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h4 className="mb-1 text-sm font-medium">Multiple Angles</h4>
                  <p className="text-xs text-muted-foreground">
                    Take multiple photos for comprehensive analysis
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
