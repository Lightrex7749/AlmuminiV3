import { useState } from 'react';
import { Upload, Download, Info, ArrowLeft, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import MainLayout from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import FileUploader from '@/components/datasets/FileUploader';
import MLDataStatusWidget from '@/components/admin/MLDataStatusWidget';
import apiCareerDataService from '@/services/apiCareerDataService';

const AdminCareerDataUpload = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);

  const handleDownloadTemplate = async () => {
    try {
      const response = await apiCareerDataService.downloadCSVTemplate();
      
      // Create and download CSV file
      const blob = new Blob([response.data.template], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = response.data.filename || 'career_transitions_template.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Template downloaded successfully');
    } catch (error) {
      toast.error('Failed to download template');
      console.error('Download error:', error);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a CSV file to upload');
      return;
    }

    setUploading(true);
    setUploadResults(null);

    try {
      const result = await apiCareerDataService.bulkUploadCareerData(selectedFile);
      
      if (result.success) {
        const { success_count, failed_count, errors } = result.data;
        
        setUploadResults(result.data);
        
        if (failed_count === 0) {
          toast.success(`✅ All ${success_count} records imported successfully!`);
        } else {
          toast.warning(
            `Partial success: ${success_count} imported, ${failed_count} failed`
          );
        }
        
        // Clear file selection
        setSelectedFile(null);
      }
    } catch (error) {
      toast.error(error.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl" data-testid="admin-career-upload-page">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/datasets/history')}
            className="mb-4 text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Button>
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-xl">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Career Data Upload</h1>
              <p className="text-muted-foreground mt-1">
                Upload career transition data to train the ML career prediction model
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upload Interface */}
          <div className="lg:col-span-2 space-y-6">
            {/* Instructions */}
            <Card className="p-6 bg-primary/5 border-primary/20 shadow-sm">
              <h3 className="font-bold text-primary mb-4 flex items-center">
                <Info className="h-5 w-5 mr-2" />
                CSV Upload Instructions
              </h3>
              <div className="space-y-3 text-sm text-foreground/80">
                <p><strong>Required fields:</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li><code className="bg-primary/10 px-1.5 py-0.5 rounded text-primary font-mono text-xs">email</code> - User's email (auto-creates if not found)</li>
                  <li><code className="bg-primary/10 px-1.5 py-0.5 rounded text-primary font-mono text-xs">from_role</code> - Previous job role</li>
                  <li><code className="bg-primary/10 px-1.5 py-0.5 rounded text-primary font-mono text-xs">to_role</code> - New job role</li>
                  <li><code className="bg-primary/10 px-1.5 py-0.5 rounded text-primary font-mono text-xs">transition_date</code> - Date (YYYY-MM-DD)</li>
                  <li><code className="bg-primary/10 px-1.5 py-0.5 rounded text-primary font-mono text-xs">success_rating</code> - Rating from 1 to 5</li>
                </ul>
                <p className="mt-4 pt-2 border-t border-primary/10"><strong>Optional:</strong> from_company, to_company, skills_acquired</p>
                <p className="text-xs text-muted-foreground mt-2 italic">
                  💡 Tip: Skills should be separated by pipes (|), e.g., "React|Node.js|SQL"
                </p>
              </div>
            </Card>

            {/* Template Download */}
            <Card className="p-6 bg-card border-border shadow-sm">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                CSV Template
              </h2>
              <p className="text-muted-foreground mb-6">
                Download the CSV template with example data and proper formatting to ensure successful import.
              </p>
              <Button
                onClick={handleDownloadTemplate}
                variant="outline"
                className="w-full sm:w-auto border-border text-foreground hover:bg-muted"
                data-testid="download-template-btn"
              >
                <Download className="h-4 w-4 mr-2" />
                Download CSV Template
              </Button>
            </Card>

            {/* File Upload */}
            <Card className="p-6 bg-card border-border shadow-sm">
              <h2 className="text-xl font-bold text-foreground mb-4">Select CSV File</h2>
              <FileUploader
                onFileSelect={setSelectedFile}
                acceptedTypes=".csv"
                maxSize={10}
              />
              
              {selectedFile && (
                <div className="mt-6 p-4 bg-green-600/10 border border-green-600/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xs">✓</div>
                    <div>
                      <p className="text-sm font-bold text-green-700">
                        File selected: {selectedFile.name}
                      </p>
                      <p className="text-xs text-green-600 mt-0.5">
                        Size: {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Upload Results */}
            {uploadResults && (
              <Card className="p-6 bg-card border-border shadow-md">
                <h2 className="text-xl font-bold text-foreground mb-4">Upload Results</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-600/10 rounded-xl border border-green-600/20">
                    <span className="text-sm font-bold text-green-700">
                      ✅ Successfully imported
                    </span>
                    <span className="text-2xl font-bold text-green-600">
                      {uploadResults.success_count}
                    </span>
                  </div>
                  
                  {uploadResults.failed_count > 0 && (
                    <div className="flex items-center justify-between p-4 bg-destructive/10 rounded-xl border border-destructive/20">
                      <span className="text-sm font-bold text-destructive">
                        ❌ Failed to import
                      </span>
                      <span className="text-2xl font-bold text-destructive">
                        {uploadResults.failed_count}
                      </span>
                    </div>
                  )}

                  {uploadResults.errors && uploadResults.errors.length > 0 && (
                    <div className="mt-6">
                      <details className="group cursor-pointer">
                        <summary className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                          <span className="group-open:rotate-180 transition-transform">▼</span>
                          View Errors ({uploadResults.errors.length})
                        </summary>
                        <div className="mt-4 p-4 bg-background rounded-xl border border-border max-h-60 overflow-y-auto shadow-inner">
                          <ul className="text-xs text-muted-foreground space-y-2 font-mono">
                            {uploadResults.errors.map((error, idx) => (
                              <li key={idx} className="flex gap-2">
                                <span className="text-destructive">•</span>
                                {error}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Upload Button */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                variant="outline"
                onClick={() => navigate('/admin')}
                disabled={uploading}
                className="border-border text-foreground hover:bg-muted px-8"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="min-w-40 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg font-bold"
                data-testid="upload-btn"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload CSV
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Right Column - ML Status Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <MLDataStatusWidget 
                onUploadClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminCareerDataUpload;
