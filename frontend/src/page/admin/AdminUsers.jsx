import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import MainNavbar from '@/components/layout/MainNavbar';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, MoreVertical, UserCheck, UserX, Mail, Shield, Trash2, Download, Eye, CreditCard, CheckCircle, XCircle } from 'lucide-react';
import { adminService } from '@/services';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { toast } from 'sonner';

const AdminUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await adminService.getAllUsers();
      setUsers(result.data || []);
      setFilteredUsers(result.data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Unable to connect to server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    // Filter users based on search and role
    let filtered = users;

    if (searchQuery) {
      filtered = filtered.filter(
        (u) =>
          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (u.role && u.role.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [searchQuery, roleFilter, users]);

  const handleBanUser = async (userId) => {
    try {
      await adminService.banUser(userId);
      toast.success('User has been banned');
      loadUsers();
    } catch (error) {
      console.error('Error banning user:', error);
      toast.error('Unable to ban user. Please try again.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await adminService.deleteUser(userId);
        setUsers(users.filter((u) => u.id !== userId));
        toast.success('User deleted successfully');
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Unable to delete user. Please try again.');
      }
    }
  };

  const handleResetPassword = async (userId) => {
    try {
      await adminService.resetUserPassword(userId);
      toast.success('Password reset email sent');
    } catch (error) {
      console.error('Error sending password reset:', error);
      toast.error('Unable to send password reset email. Please try again.');
    }
  };

  const handleIssueCard = async (userId) => {
    try {
      await adminService.issueAlumniCard(userId);
      toast.success('Alumni card issued successfully');
      loadUsers(); // Reload to update card status
    } catch (error) {
      console.error('Error issuing alumni card:', error);
      toast.error(error.response?.data?.detail || 'Unable to issue alumni card. Please try again.');
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((u) => u.id));
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
      setUsers(users.filter((u) => !selectedUsers.includes(u.id)));
      setSelectedUsers([]);
      toast.success(`${selectedUsers.length} users deleted`);
    }
  };

  const handleBulkBan = () => {
    toast.success(`${selectedUsers.length} users banned`);
    setSelectedUsers([]);
  };

  const handleExportUsers = () => {
    const csvContent = [
      ['Email', 'Role', 'Status', 'Created At'],
      ...filteredUsers.map((u) => [
        u.email,
        u.role,
        u.is_active ? 'Active' : 'Inactive',
        new Date(u.created_at).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Users exported successfully');
  };

  const handleViewUserDetails = async (userId) => {
    try {
      const result = await adminService.getUserDetails(userId);
      setSelectedUserDetails(result.data);
      setShowUserModal(true);
    } catch (error) {
      console.error('Error loading user details:', error);
      toast.error('Unable to load user details. Please try again.');
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'alumni':
        return 'bg-blue-100 text-blue-800';
      case 'recruiter':
        return 'bg-purple-100 text-purple-800';
      case 'student':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = [
    { label: 'Total Users', value: users.length, color: 'text-blue-600' },
    { label: 'Students', value: users.filter((u) => u.role === 'student').length, color: 'text-green-600' },
    { label: 'Alumni', value: users.filter((u) => u.role === 'alumni').length, color: 'text-purple-600' },
    { label: 'Recruiters', value: users.filter((u) => u.role === 'recruiter').length, color: 'text-orange-600' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <MainNavbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-6">
            <LoadingSpinner message="Loading users..." />
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <MainNavbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-6">
            <ErrorMessage message={error} onRetry={loadUsers} />
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
              <h1 className="text-3xl font-bold">User Management 👥</h1>
              <p className="mt-2 opacity-90">Manage all platform users and their permissions</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <Card key={index} className="bg-card border-border">
                  <CardContent className="pt-6">
                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                    <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Filters */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">User List</CardTitle>
                <CardDescription className="text-muted-foreground">Search and filter users by role</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search by email or role..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                        data-testid="user-search-input"
                      />
                    </div>
                    <div className="flex gap-2">
                      {['all', 'student', 'alumni', 'recruiter', 'admin'].map((role) => (
                        <Button
                          key={role}
                          variant={roleFilter === role ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setRoleFilter(role)}
                          className="capitalize"
                          data-testid={`filter-${role}-btn`}
                        >
                          {role}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Bulk Actions */}
                  {selectedUsers.length > 0 && (
                    <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                      <span className="text-sm font-medium text-primary">
                        {selectedUsers.length} user(s) selected
                      </span>
                      <div className="flex gap-2 ml-auto">
                        <Button size="sm" variant="outline" onClick={handleBulkBan} data-testid="bulk-ban-btn">
                          <UserX className="w-4 h-4 mr-1" />
                          Ban Selected
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={handleBulkDelete}
                          data-testid="bulk-delete-btn"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete Selected
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Export Button */}
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" onClick={handleExportUsers} data-testid="export-users-btn" className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                      <Download className="w-4 h-4 mr-2" />
                      Export Users
                    </Button>
                  </div>
                </div>

                {/* User Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-border">
                      <tr className="text-left">
                        <th className="pb-3 w-12">
                          <Checkbox
                            checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                            onCheckedChange={handleSelectAll}
                            data-testid="select-all-checkbox"
                            className="dark:border-gray-500"
                          />
                        </th>
                        <th className="pb-3 font-medium text-foreground">Email</th>
                        <th className="pb-3 font-medium text-foreground">Role</th>
                        <th className="pb-3 font-medium text-foreground">Status</th>
                        <th className="pb-3 font-medium text-foreground">Card Status</th>
                        <th className="pb-3 font-medium text-foreground">Joined</th>
                        <th className="pb-3 font-medium text-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="border-b border-border hover:bg-muted/50 transition-colors" data-testid={`user-row-${u.id}`}>
                          <td className="py-4">
                            <Checkbox
                              checked={selectedUsers.includes(u.id)}
                              onCheckedChange={() => handleSelectUser(u.id)}
                              data-testid={`select-user-${u.id}`}
                              className="dark:border-gray-500"
                            />
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.email}`}
                                alt={u.email}
                                className="w-8 h-8 rounded-full bg-background"
                              />
                              <span className="font-medium text-foreground">{u.email}</span>
                            </div>
                          </td>
                          <td className="py-4">
                            <Badge className={`capitalize ${getRoleBadgeColor(u.role)}`}>
                              {u.role}
                            </Badge>
                          </td>
                          <td className="py-4">
                            <Badge variant="outline" className="text-green-600 border-green-600 dark:text-green-400 dark:border-green-500">
                              Active
                            </Badge>
                          </td>
                          <td className="py-4">
                            {u.has_card ? (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 flex items-center gap-1 w-fit">
                                <CheckCircle className="w-3 h-3" />
                                Has Card
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground border-border flex items-center gap-1 w-fit">
                                <XCircle className="w-3 h-3" />
                                No Card
                              </Badge>
                            )}
                          </td>
                          <td className="py-4 text-sm text-muted-foreground">
                            {new Date(u.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" data-testid={`user-actions-${u.id}`}>
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-card border-border">
                                <DropdownMenuLabel className="text-foreground">Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleViewUserDetails(u.id)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                {!u.has_card && (
                                  <DropdownMenuItem onClick={() => handleIssueCard(u.id)}>
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Issue Alumni Card
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => handleResetPassword(u.id)}>
                                  <Mail className="mr-2 h-4 w-4" />
                                  Reset Password
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleBanUser(u.id)}>
                                  <UserX className="mr-2 h-4 w-4" />
                                  Ban User
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredUsers.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No users found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <Footer />

      {/* User Details Modal */}
      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground text-xl">User Details</DialogTitle>
            <DialogDescription className="text-muted-foreground">Complete user information and profile</DialogDescription>
          </DialogHeader>
          {selectedUserDetails && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                <img
                  src={
                    selectedUserDetails.profile?.photo_url ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUserDetails.email}`
                  }
                  alt={selectedUserDetails.email}
                  className="w-16 h-16 rounded-full bg-background border border-border"
                />
                <div>
                  <h3 className="font-semibold text-lg text-foreground">
                    {selectedUserDetails.profile?.name || selectedUserDetails.email}
                  </h3>
                  <p className="text-sm text-muted-foreground">{selectedUserDetails.email}</p>
                  <Badge className={`mt-1 capitalize ${getRoleBadgeColor(selectedUserDetails.role)}`}>
                    {selectedUserDetails.role}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <p className="text-sm mt-1">
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      {selectedUserDetails.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Verified</p>
                  <p className="text-sm mt-1">
                    <Badge variant="outline" className={selectedUserDetails.is_verified ? 'text-green-600 border-green-600' : 'text-destructive border-destructive'}>
                      {selectedUserDetails.is_verified ? 'Verified' : 'Not Verified'}
                    </Badge>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Joined</p>
                  <p className="text-sm mt-1 text-foreground">{new Date(selectedUserDetails.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Login</p>
                  <p className="text-sm mt-1 text-foreground">
                    {selectedUserDetails.last_login
                      ? new Date(selectedUserDetails.last_login).toLocaleDateString()
                      : 'Never'}
                  </p>
                </div>
              </div>

              {selectedUserDetails.profile && (
                <>
                  <div className="border-t border-border pt-4">
                    <h4 className="font-semibold mb-2 text-foreground">Profile Information</h4>
                    {selectedUserDetails.profile.headline && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-muted-foreground">Headline</p>
                        <p className="text-sm mt-1 text-foreground">{selectedUserDetails.profile.headline}</p>
                      </div>
                    )}
                    {selectedUserDetails.profile.bio && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-muted-foreground">Bio</p>
                        <p className="text-sm mt-1 text-foreground">{selectedUserDetails.profile.bio}</p>
                      </div>
                    )}
                    {selectedUserDetails.profile.current_company && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-muted-foreground">Current Company</p>
                        <p className="text-sm mt-1 text-foreground">
                          {selectedUserDetails.profile.current_role} at {selectedUserDetails.profile.current_company}
                        </p>
                      </div>
                    )}
                    {selectedUserDetails.profile.location && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-muted-foreground">Location</p>
                        <p className="text-sm mt-1 text-foreground">{selectedUserDetails.profile.location}</p>
                      </div>
                    )}
                    {selectedUserDetails.profile.batch_year && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-muted-foreground">Batch Year</p>
                        <p className="text-sm mt-1 text-foreground">{selectedUserDetails.profile.batch_year}</p>
                      </div>
                    )}
                  </div>

                  {selectedUserDetails.profile.skills && selectedUserDetails.profile.skills.length > 0 && (
                    <div className="border-t border-border pt-4">
                      <h4 className="font-semibold mb-2 text-foreground">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedUserDetails.profile.skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="border-border text-foreground">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t border-border pt-4">
                    <h4 className="font-semibold mb-2 text-foreground">Profile Completion</h4>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${selectedUserDetails.profile.profile_completion_percentage || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {selectedUserDetails.profile.profile_completion_percentage || 0}%
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* Alumni Card Status */}
              {selectedUserDetails.card_status && (
                <div className="border-t border-border pt-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-foreground">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Alumni Card Status
                  </h4>
                  {selectedUserDetails.card_status.has_card ? (
                    <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className="h-5 w-5 text-primary" />
                        <span className="font-medium text-primary">Card Issued</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Card Number:</p>
                          <p className="font-medium text-foreground">{selectedUserDetails.card_status.card_number}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Status:</p>
                          <Badge className={selectedUserDetails.card_status.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {selectedUserDetails.card_status.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-muted/30 p-4 rounded-lg border border-border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-5 w-5 text-muted-foreground" />
                          <span className="text-foreground">No alumni card issued yet</span>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => {
                            handleIssueCard(selectedUserDetails.id);
                            setShowUserModal(false);
                          }}
                        >
                          <CreditCard className="w-4 h-4 mr-1" />
                          Issue Card
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="border-t border-border pt-4 flex gap-2">
                {!selectedUserDetails.has_card && (
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={() => {
                      handleIssueCard(selectedUserDetails.id);
                      setShowUserModal(false);
                    }}
                  >
                    <CreditCard className="w-4 h-4 mr-1" />
                    Issue Card
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => handleResetPassword(selectedUserDetails.id)}>
                  <Mail className="w-4 h-4 mr-1" />
                  Reset Password
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleBanUser(selectedUserDetails.id)}>
                  <UserX className="w-4 h-4 mr-1" />
                  Ban User
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    handleDeleteUser(selectedUserDetails.id);
                    setShowUserModal(false);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;