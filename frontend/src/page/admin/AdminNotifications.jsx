import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import MainNavbar from '@/components/layout/MainNavbar';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, Plus, Edit, Trash2, MoreVertical, Eye, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { adminService } from '@/services';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { toast } from 'sonner';

const AdminNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [formData, setFormData] = useState({
    type: 'system',
    title: '',
    message: '',
    link: '',
    priority: 'medium',
    targetUsers: 'all',
  });

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await adminService.getAllNotifications();
      setNotifications(result.data || []);
      setFilteredNotifications(result.data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setError('Unable to connect to server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    let filtered = notifications;

    if (searchQuery) {
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter((n) => n.type === typeFilter);
    }

    setFilteredNotifications(filtered);
  }, [searchQuery, typeFilter, notifications]);

  const handleCreateNotification = async () => {
    if (!formData.title || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const notificationData = {
        user_id: formData.targetUsers === 'all' ? 'broadcast' : formData.targetUsers,
        type: formData.type,
        title: formData.title,
        message: formData.message,
        link: formData.link,
        priority: formData.priority,
      };

      await adminService.createNotification(notificationData);
      toast.success('Notification created and sent successfully');
      setShowCreateModal(false);
      resetForm();
      loadNotifications();
    } catch (error) {
      console.error('Error creating notification:', error);
      toast.error('Unable to create notification. Please try again.');
    }
  };

  const handleEditNotification = (notification) => {
    setEditingNotification(notification);
    setFormData({
      type: notification.type,
      title: notification.title,
      message: notification.message,
      link: notification.link || '',
      priority: notification.priority,
      targetUsers: notification.user_id === 'broadcast' ? 'all' : notification.user_id,
    });
    setShowCreateModal(true);
  };

  const handleUpdateNotification = async () => {
    if (!formData.title || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const updateData = {
        type: formData.type,
        title: formData.title,
        message: formData.message,
        link: formData.link,
        priority: formData.priority,
      };

      await adminService.updateNotification(editingNotification.id, updateData);
      toast.success('Notification updated successfully');
      setShowCreateModal(false);
      setEditingNotification(null);
      resetForm();
      loadNotifications();
    } catch (error) {
      console.error('Error updating notification:', error);
      toast.error('Unable to update notification. Please try again.');
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        await adminService.deleteNotification(notificationId);
        toast.success('Notification deleted successfully');
        loadNotifications();
      } catch (error) {
        console.error('Error deleting notification:', error);
        toast.error('Unable to delete notification. Please try again.');
      }
    }
  };

  const handleViewDetails = (notification) => {
    setSelectedNotification(notification);
    setShowDetailsModal(true);
  };

  const handleResendNotification = async (notificationId) => {
    try {
      await adminService.resendNotification(notificationId);
      toast.success('Notification resent successfully');
    } catch (error) {
      console.error('Error resending notification:', error);
      toast.error('Unable to resend notification. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'system',
      title: '',
      message: '',
      link: '',
      priority: 'medium',
      targetUsers: 'all',
    });
    setEditingNotification(null);
  };

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case 'profile':
        return 'bg-blue-100 text-blue-800';
      case 'mentorship':
        return 'bg-green-100 text-green-800';
      case 'job':
        return 'bg-purple-100 text-purple-800';
      case 'event':
        return 'bg-orange-100 text-orange-800';
      case 'forum':
        return 'bg-pink-100 text-pink-800';
      case 'system':
        return 'bg-red-100 text-red-800';
      case 'verification':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = [
    { label: 'Total Sent', value: notifications.length, color: 'text-blue-600', icon: Bell },
    { label: 'System', value: notifications.filter((n) => n.type === 'system').length, color: 'text-red-600', icon: AlertCircle },
    { label: 'High Priority', value: notifications.filter((n) => n.priority === 'high').length, color: 'text-red-600', icon: AlertCircle },
    { label: 'Read', value: notifications.filter((n) => n.is_read).length, color: 'text-green-600', icon: CheckCircle },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <MainNavbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-6">
            <LoadingSpinner message="Loading notifications..." />
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <MainNavbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-6">
            <ErrorMessage message={error} onRetry={loadNotifications} />
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-300">
      <MainNavbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#3D52A0] to-[#7091E6] rounded-lg p-6 text-white shadow-md">
              <h1 className="text-3xl font-bold">Notification Management 🔔</h1>
              <p className="mt-2 opacity-90">Create and manage system notifications</p>
            </div>

            {/* Stats */}
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

            {/* Notifications List */}
            <Card className="bg-card border-border shadow-sm">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-foreground">System Notifications</CardTitle>
                    <CardDescription className="text-muted-foreground">Create and manage notifications for users</CardDescription>
                  </div>
                  <Button
                    onClick={() => {
                      resetForm();
                      setShowCreateModal(true);
                    }}
                    data-testid="create-notification-btn"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Notification
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="space-y-4 mb-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search notifications..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                        data-testid="notification-search-input"
                      />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {['all', 'system', 'profile', 'mentorship', 'job', 'event', 'forum', 'verification'].map((type) => (
                        <Button
                          key={type}
                          variant={typeFilter === type ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setTypeFilter(type)}
                          className="capitalize"
                          data-testid={`filter-${type}-btn`}
                        >
                          {type}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Notifications Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-border">
                      <tr className="text-left">
                        <th className="pb-3 font-medium text-foreground">Title</th>
                        <th className="pb-3 font-medium text-foreground">Type</th>
                        <th className="pb-3 font-medium text-foreground">Priority</th>
                        <th className="pb-3 font-medium text-foreground">Recipient</th>
                        <th className="pb-3 font-medium text-foreground">Status</th>
                        <th className="pb-3 font-medium text-foreground">Created</th>
                        <th className="pb-3 font-medium text-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredNotifications.map((notification) => (
                        <tr
                          key={notification.id}
                          className="border-b border-border hover:bg-muted/50 transition-colors"
                          data-testid={`notification-row-${notification.id}`}
                        >
                          <td className="py-4">
                            <div>
                              <p className="font-medium text-foreground">{notification.title}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-xs">
                                {notification.message}
                              </p>
                            </div>
                          </td>
                          <td className="py-4">
                            <Badge className={`capitalize ${getTypeBadgeColor(notification.type)}`}>
                              {notification.type}
                            </Badge>
                          </td>
                          <td className="py-4">
                            <Badge className={`capitalize ${getPriorityBadgeColor(notification.priority)}`}>
                              {notification.priority}
                            </Badge>
                          </td>
                          <td className="py-4 text-sm text-foreground">
                            {notification.user_id === 'broadcast'
                              ? 'All Users'
                              : notification.user?.email || 'Unknown'}
                          </td>
                          <td className="py-4">
                            <Badge variant={notification.is_read ? 'outline' : 'default'} className={notification.is_read ? 'border-border text-muted-foreground' : ''}>
                              {notification.is_read ? 'Read' : 'Unread'}
                            </Badge>
                          </td>
                          <td className="py-4 text-sm text-muted-foreground">
                            {new Date(notification.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" data-testid={`notification-actions-${notification.id}`}>
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-card border-border">
                                <DropdownMenuLabel className="text-foreground">Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleViewDetails(notification)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditNotification(notification)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleResendNotification(notification.id)}>
                                  <Send className="mr-2 h-4 w-4" />
                                  Resend
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteNotification(notification.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredNotifications.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No notifications found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <Footer />

      {/* Create/Edit Notification Modal */}
      <Dialog
        open={showCreateModal}
        onOpenChange={(open) => {
          setShowCreateModal(open);
          if (!open) {
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground text-xl">{editingNotification ? 'Edit Notification' : 'Create New Notification'}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editingNotification ? 'Update notification details' : 'Send a new notification to users'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type" className="text-foreground">Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger className="border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="profile">Profile</SelectItem>
                    <SelectItem value="mentorship">Mentorship</SelectItem>
                    <SelectItem value="job">Job</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="forum">Forum</SelectItem>
                    <SelectItem value="verification">Verification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority" className="text-foreground">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger className="border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title" className="text-foreground">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Notification title"
                className="border-border"
                data-testid="notification-title-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message" className="text-foreground">Message *</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Notification message"
                className="border-border min-h-[100px]"
                data-testid="notification-message-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link" className="text-foreground">Link (Optional)</Label>
              <Input
                id="link"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="/page/path or https://..."
                className="border-border"
                data-testid="notification-link-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetUsers" className="text-foreground">Send To</Label>
              <Select value={formData.targetUsers} onValueChange={(value) => setFormData({ ...formData, targetUsers: value })}>
                <SelectTrigger className="border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="students">All Students</SelectItem>
                  <SelectItem value="alumni">All Alumni</SelectItem>
                  <SelectItem value="recruiters">All Recruiters</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={editingNotification ? handleUpdateNotification : handleCreateNotification}
              data-testid="save-notification-btn"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Send className="w-4 h-4 mr-2" />
              {editingNotification ? 'Update' : 'Send'} Notification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground text-xl">Notification Details</DialogTitle>
            <DialogDescription className="text-muted-foreground">Complete notification information</DialogDescription>
          </DialogHeader>
          {selectedNotification && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <Badge className={`mt-1 ${getTypeBadgeColor(selectedNotification.type)}`}>
                    {selectedNotification.type}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Priority</p>
                  <Badge className={`mt-1 ${getPriorityBadgeColor(selectedNotification.priority)}`}>
                    {selectedNotification.priority}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Title</p>
                <p className="text-lg font-bold mt-1 text-foreground">{selectedNotification.title}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Message</p>
                <p className="text-sm mt-1 text-foreground leading-relaxed">{selectedNotification.message}</p>
              </div>
              {selectedNotification.link && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Link</p>
                  <p className="text-sm mt-1 text-primary hover:underline cursor-pointer">{selectedNotification.link}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Recipient</p>
                  <p className="text-sm text-foreground mt-1 font-medium">
                    {selectedNotification.user_id === 'broadcast'
                      ? 'All Users'
                      : selectedNotification.user?.email || 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Status</p>
                  <Badge variant={selectedNotification.is_read ? 'outline' : 'default'} className={selectedNotification.is_read ? 'mt-1 border-border text-muted-foreground' : 'mt-1'}>
                    {selectedNotification.is_read ? 'Read' : 'Unread'}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Created</p>
                  <p className="text-sm text-foreground mt-1">{new Date(selectedNotification.created_at).toLocaleString()}</p>
                </div>
                {selectedNotification.read_at && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Read At</p>
                    <p className="text-sm text-foreground mt-1">{new Date(selectedNotification.read_at).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminNotifications;
