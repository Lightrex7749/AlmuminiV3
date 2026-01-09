import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import MainNavbar from '@/components/layout/MainNavbar';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, File, Image, FileText, Trash2, Download, ExternalLink, Loader2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { adminService } from '@/services';

const AdminFileUploads = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getAllFiles({ file_type: fileTypeFilter, search: searchQuery });
      if (response.success) {
        const filesData = response.data || [];
        setFiles(filesData);
        setFilteredFiles(filesData);
      } else {
        setError(response.message || 'Failed to load files');
        toast.error(response.message || 'Failed to load files');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load files';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      loadFiles();
    }
  }, [searchQuery, fileTypeFilter]);

  useEffect(() => {
    let filtered = files;

    if (searchQuery) {
      filtered = filtered.filter(
        (f) =>
          f.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.user_email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (fileTypeFilter !== 'all') {
      filtered = filtered.filter((f) => f.file_type === fileTypeFilter);
    }

    setFilteredFiles(filtered);
  }, [searchQuery, fileTypeFilter, files]);

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
      return;
    }

    setDeleteLoading(fileId);
    try {
      const response = await adminService.deleteFile(fileId);
      if (response.success) {
        setFiles(files.filter((f) => f.id !== fileId));
        setFilteredFiles(filteredFiles.filter((f) => f.id !== fileId));
        toast.success('File deleted successfully');
      } else {
        toast.error(response.message || 'Failed to delete file');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete file');
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatFileSize = (kb) => {
    if (kb < 1024) return `${kb} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
  };

  const getFileTypeIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) return Image;
    if (mimeType === 'application/pdf') return FileText;
    return File;
  };

  const getFileTypeColor = (fileType) => {
    switch (fileType) {
      case 'cv':
        return 'bg-blue-100 text-blue-800';
      case 'photo':
        return 'bg-green-100 text-green-800';
      case 'banner':
        return 'bg-purple-100 text-purple-800';
      case 'document':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalSize = files.reduce((sum, f) => sum + f.file_size_kb, 0);

  const stats = [
    {
      label: 'Total Files',
      value: files.length,
      color: 'text-blue-600',
      icon: File,
    },
    {
      label: 'CVs',
      value: files.filter((f) => f.file_type === 'cv').length,
      color: 'text-green-600',
      icon: FileText,
    },
    {
      label: 'Photos',
      value: files.filter((f) => f.file_type === 'photo').length,
      color: 'text-purple-600',
      icon: Image,
    },
    {
      label: 'Total Size',
      value: formatFileSize(totalSize),
      color: 'text-orange-600',
      icon: File,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-300">
      <MainNavbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#3D52A0] to-[#7091E6] rounded-lg p-6 text-white shadow-md">
              <h1 className="text-3xl font-bold">File Upload Manager 📁</h1>
              <p className="mt-2 opacity-90">Track and manage all uploaded files</p>
            </div>

            {/* Loading State */}
            {loading && (
              <Card className="bg-card border-border">
                <CardContent className="py-12">
                  <div className="flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                    <p className="text-muted-foreground">Loading files...</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error State */}
            {error && !loading && (
              <Card className="border-destructive/20 bg-destructive/5">
                <CardContent className="py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <XCircle className="w-6 h-6 text-destructive" />
                      <div>
                        <p className="font-medium text-destructive">Failed to load files</p>
                        <p className="text-sm text-destructive/80 mt-1">{error}</p>
                      </div>
                    </div>
                    <Button onClick={loadFiles} variant="outline" size="sm">
                      Retry
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats */}
            {!loading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index} className="bg-card border-border shadow-sm">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                          <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                        </div>
                        <Icon className={`w-8 h-8 ${stat.color} opacity-50`} />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              </div>
            )}

            {/* Files List */}
            {!loading && !error && (
              <Card className="bg-card border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-foreground">Uploaded Files</CardTitle>
                <CardDescription className="text-muted-foreground">All files uploaded to the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search by filename or user..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                        data-testid="file-search-input"
                      />
                    </div>
                    <div className="flex gap-2">
                      {['all', 'cv', 'photo', 'banner', 'document'].map((type) => (
                        <Button
                          key={type}
                          variant={fileTypeFilter === type ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setFileTypeFilter(type)}
                          className="capitalize"
                          data-testid={`filter-${type}-btn`}
                        >
                          {type}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-border">
                      <tr className="text-left">
                        <th className="pb-3 font-medium text-foreground">File Name</th>
                        <th className="pb-3 font-medium text-foreground">Type</th>
                        <th className="pb-3 font-medium text-foreground">Size</th>
                        <th className="pb-3 font-medium text-foreground">Uploaded By</th>
                        <th className="pb-3 font-medium text-foreground">Upload Date</th>
                        <th className="pb-3 font-medium text-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFiles.map((file) => {
                        const FileIcon = getFileTypeIcon(file.mime_type);
                        return (
                          <tr
                            key={file.id}
                            className="border-b border-border hover:bg-muted/50 transition-colors"
                            data-testid={`file-row-${file.id}`}
                          >
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <FileIcon className="w-5 h-5 text-muted-foreground" />
                                <span className="text-sm font-medium text-foreground">{file.file_name}</span>
                              </div>
                            </td>
                            <td className="py-4">
                              <Badge className={getFileTypeColor(file.file_type)}>
                                {file.file_type}
                              </Badge>
                            </td>
                            <td className="py-4 text-sm text-muted-foreground">{formatFileSize(file.file_size_kb)}</td>
                            <td className="py-4 text-sm text-foreground">{file.user_email}</td>
                            <td className="py-4 text-sm text-muted-foreground">
                              {new Date(file.uploaded_at).toLocaleDateString()}
                            </td>
                            <td className="py-4">
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(file.file_url, '_blank')}
                                  data-testid={`view-file-${file.id}`}
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-destructive hover:bg-destructive/10"
                                  onClick={() => handleDeleteFile(file.id)}
                                  disabled={deleteLoading === file.id}
                                  data-testid={`delete-file-${file.id}`}
                                >
                                  {deleteLoading === file.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {filteredFiles.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <File className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No files found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default AdminFileUploads;