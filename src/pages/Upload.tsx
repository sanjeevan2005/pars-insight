import { useState, useCallback } from "react";
import { Upload as UploadIcon, File, X, CheckCircle, AlertTriangle, Package } from "lucide-react";
import { ocrService, type ExtractedData } from "@/lib/ocr";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

interface UploadFile {
  id: string;
  file: File;
  status: 'pending' | 'processing' | 'success' | 'error';
  progress: number;
  extractionResult?: ExtractedData;
}

const Upload = () => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  };

  const handleFiles = (fileList: File[]) => {
    const validFiles = fileList.filter(file => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      return validTypes.includes(file.type) && file.size <= maxSize;
    });

    const newFiles: UploadFile[] = validFiles.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      status: 'pending',
      progress: 0
    }));

    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  const processFiles = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.status !== 'pending') continue;

      try {
        // Update status to processing
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, status: 'processing', progress: 10 } : f
        ));

        // Initialize OCR worker
        await ocrService.initializeWorker();
        
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, progress: 30 } : f
        ));

        // Extract text using Tesseract OCR
        const ocrResult = await ocrService.extractText(file.file);
        
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, progress: 60 } : f
        ));

        // Process with AI for structured data
        const extractionResult = await ocrService.processWithAI(ocrResult.text);
        
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, progress: 90 } : f
        ));

        // Update with final results
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { 
            ...f, 
            status: 'success',
            progress: 100,
            extractionResult
          } : f
        ));

      } catch (error) {
        console.error('Processing error:', error);
        
        // Update with error status
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { 
            ...f, 
            status: 'error',
            progress: 100
          } : f
        ));
      }
    }

    setIsProcessing(false);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Package className="w-8 h-8 text-primary" />;
    }
    return <File className="w-8 h-8 text-muted-foreground" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-destructive" />;
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Upload Documents</h1>
          <p className="text-muted-foreground">Upload shipping labels and documents for AI-powered analysis</p>
        </div>

        {/* Upload Area */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Document Upload</CardTitle>
            <CardDescription>
              Drag and drop files or click to browse. Supports JPG, PNG, PDF (max 5MB each)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`
                relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
                ${dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto logistics-gradient rounded-2xl flex items-center justify-center">
                  <UploadIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-lg font-medium text-foreground">
                    Drop files here or click to browse
                  </p>
                  <p className="text-sm text-muted-foreground">
                    JPG, PNG, PDF files up to 5MB each
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File List */}
        {files.length > 0 && (
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Uploaded Files ({files.length})</CardTitle>
                <CardDescription>Review and process your uploaded documents</CardDescription>
              </div>
              <Button 
                onClick={processFiles}
                disabled={isProcessing || files.every(f => f.status !== 'pending')}
                className="primary-gradient"
              >
                {isProcessing ? "Processing..." : "Process All"}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {files.map((uploadFile) => (
                <div key={uploadFile.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getFileIcon(uploadFile.file.type)}
                      <div>
                        <p className="font-medium text-sm">{uploadFile.file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusIcon(uploadFile.status)}
                      <Badge variant={
                        uploadFile.status === 'success' ? 'default' :
                        uploadFile.status === 'error' ? 'destructive' :
                        uploadFile.status === 'processing' ? 'secondary' : 'outline'
                      }>
                        {uploadFile.status}
                      </Badge>
                      {uploadFile.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(uploadFile.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  {uploadFile.status === 'processing' && (
                    <Progress value={uploadFile.progress} className="w-full" />
                  )}

                  {/* Extraction Results */}
                  {uploadFile.extractionResult && uploadFile.status === 'success' && (
                    <div className="space-y-3 pt-3 border-t">
                      <h4 className="font-medium text-sm">Extraction Results</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Document Type</p>
                          <Badge variant={uploadFile.extractionResult.isShippingLabel ? "default" : "outline"}>
                            {uploadFile.extractionResult.documentType.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        {uploadFile.extractionResult.trackingNumber && (
                          <div>
                            <p className="text-muted-foreground">Tracking Number</p>
                            <p className="font-mono text-sm">{uploadFile.extractionResult.trackingNumber}</p>
                          </div>
                        )}
                      </div>

                      {uploadFile.extractionResult.originAddress && uploadFile.extractionResult.destinationAddress && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground mb-1">Origin Address</p>
                            <div className="text-xs space-y-1">
                              <p>{uploadFile.extractionResult.originAddress.name}</p>
                              <p>{uploadFile.extractionResult.originAddress.street}</p>
                              <p>{uploadFile.extractionResult.originAddress.city}, {uploadFile.extractionResult.originAddress.state} {uploadFile.extractionResult.originAddress.zip}</p>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-muted-foreground mb-1">Destination Address</p>
                            <div className="text-xs space-y-1">
                              <p>{uploadFile.extractionResult.destinationAddress.name}</p>
                              <p>{uploadFile.extractionResult.destinationAddress.street}</p>
                              <p>{uploadFile.extractionResult.destinationAddress.city}, {uploadFile.extractionResult.destinationAddress.state} {uploadFile.extractionResult.destinationAddress.zip}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {uploadFile.extractionResult.message !== "N/A" && (
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            {uploadFile.extractionResult.message}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}

                  {uploadFile.status === 'error' && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Failed to process this document. Please try again or check the file format.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="shadow-soft bg-subtle">
          <CardHeader>
            <CardTitle className="text-lg">How it works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-primary font-bold">1</span>
                </div>
                <h4 className="font-medium mb-1">Upload</h4>
                <p className="text-sm text-muted-foreground">Upload shipping labels or documents</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-primary font-bold">2</span>
                </div>
                <h4 className="font-medium mb-1">Process</h4>
                <p className="text-sm text-muted-foreground">AI extracts text and metadata</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-primary font-bold">3</span>
                </div>
                <h4 className="font-medium mb-1">Analyze</h4>
                <p className="text-sm text-muted-foreground">View structured shipping data</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Upload;