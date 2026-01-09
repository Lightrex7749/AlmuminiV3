import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import MainNavbar from '@/components/layout/MainNavbar';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Bell, Shield, Database, Mail, Globe } from 'lucide-react';
import { toast } from 'sonner';

const AdminSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    // General Settings
    platformName: 'AlumUnity',
    platformUrl: 'https://alumunity.com',
    supportEmail: 'support@alumunity.com',
    // Notification Settings
    emailNotifications: true,
    pushNotifications: false,
    weeklyDigest: true,
    // Security Settings
    twoFactorAuth: false,
    passwordExpiry: 90,
    maxLoginAttempts: 5,
    sessionTimeout: 30,
    // Feature Flags
    enableJobPosting: true,
    enableMentorship: true,
    enableEvents: true,
    enableForum: true,
    requireProfileVerification: true,
  });

  const handleSave = (section) => {
    toast.success(`${section} settings saved successfully`);
  };

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleInputChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-300">
      <MainNavbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#3D52A0] to-[#7091E6] rounded-lg p-6 text-white shadow-md">
              <h1 className="text-3xl font-bold">Admin Settings ⚙️</h1>
              <p className="mt-2 opacity-90">Configure platform settings and preferences</p>
            </div>

            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 bg-card border border-border">
                <TabsTrigger value="general" data-testid="tab-general">
                  <Globe className="w-4 h-4 mr-2" />
                  General
                </TabsTrigger>
                <TabsTrigger value="notifications" data-testid="tab-notifications">
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="security" data-testid="tab-security">
                  <Shield className="w-4 h-4 mr-2" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="features" data-testid="tab-features">
                  <Settings className="w-4 h-4 mr-2" />
                  Features
                </TabsTrigger>
                <TabsTrigger value="database" data-testid="tab-database">
                  <Database className="w-4 h-4 mr-2" />
                  Database
                </TabsTrigger>
              </TabsList>

              {/* General Settings */}
              <TabsContent value="general" className="space-y-6 mt-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground">General Settings</CardTitle>
                    <CardDescription className="text-muted-foreground">Basic platform configuration</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="platformName" className="text-foreground">Platform Name</Label>
                      <Input
                        id="platformName"
                        value={settings.platformName}
                        onChange={(e) => handleInputChange('platformName', e.target.value)}
                        data-testid="input-platform-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="platformUrl" className="text-foreground">Platform URL</Label>
                      <Input
                        id="platformUrl"
                        type="url"
                        value={settings.platformUrl}
                        onChange={(e) => handleInputChange('platformUrl', e.target.value)}
                        data-testid="input-platform-url"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supportEmail" className="text-foreground">Support Email</Label>
                      <Input
                        id="supportEmail"
                        type="email"
                        value={settings.supportEmail}
                        onChange={(e) => handleInputChange('supportEmail', e.target.value)}
                        data-testid="input-support-email"
                      />
                    </div>
                    <Button onClick={() => handleSave('General')} data-testid="save-general-btn">
                      Save Changes
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notification Settings */}
              <TabsContent value="notifications" className="space-y-6 mt-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground">Notification Preferences</CardTitle>
                    <CardDescription className="text-muted-foreground">Configure notification settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-foreground">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Send notifications via email</p>
                      </div>
                      <Switch
                        checked={settings.emailNotifications}
                        onCheckedChange={() => handleToggle('emailNotifications')}
                        data-testid="toggle-email-notifications"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-foreground">Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">Enable browser push notifications</p>
                      </div>
                      <Switch
                        checked={settings.pushNotifications}
                        onCheckedChange={() => handleToggle('pushNotifications')}
                        data-testid="toggle-push-notifications"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-foreground">Weekly Digest</Label>
                        <p className="text-sm text-muted-foreground">Send weekly activity summary</p>
                      </div>
                      <Switch
                        checked={settings.weeklyDigest}
                        onCheckedChange={() => handleToggle('weeklyDigest')}
                        data-testid="toggle-weekly-digest"
                      />
                    </div>
                    <Button onClick={() => handleSave('Notification')} data-testid="save-notifications-btn">
                      Save Changes
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Settings */}
              <TabsContent value="security" className="space-y-6 mt-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground">Security Settings</CardTitle>
                    <CardDescription className="text-muted-foreground">Configure security and authentication</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-foreground">Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">Require 2FA for all users</p>
                      </div>
                      <Switch
                        checked={settings.twoFactorAuth}
                        onCheckedChange={() => handleToggle('twoFactorAuth')}
                        data-testid="toggle-2fa"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="passwordExpiry" className="text-foreground">Password Expiry (days)</Label>
                      <Input
                        id="passwordExpiry"
                        type="number"
                        value={settings.passwordExpiry}
                        onChange={(e) => handleInputChange('passwordExpiry', e.target.value)}
                        data-testid="input-password-expiry"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxLoginAttempts" className="text-foreground">Max Login Attempts</Label>
                      <Input
                        id="maxLoginAttempts"
                        type="number"
                        value={settings.maxLoginAttempts}
                        onChange={(e) => handleInputChange('maxLoginAttempts', e.target.value)}
                        data-testid="input-max-login-attempts"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout" className="text-foreground">Session Timeout (minutes)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        value={settings.sessionTimeout}
                        onChange={(e) => handleInputChange('sessionTimeout', e.target.value)}
                        data-testid="input-session-timeout"
                      />
                    </div>
                    <Button onClick={() => handleSave('Security')} data-testid="save-security-btn">
                      Save Changes
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Feature Flags */}
              <TabsContent value="features" className="space-y-6 mt-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground">Feature Management</CardTitle>
                    <CardDescription className="text-muted-foreground">Enable or disable platform features</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-foreground">Job Posting</Label>
                        <p className="text-sm text-muted-foreground">Allow users to post jobs</p>
                      </div>
                      <Switch
                        checked={settings.enableJobPosting}
                        onCheckedChange={() => handleToggle('enableJobPosting')}
                        data-testid="toggle-job-posting"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-foreground">Mentorship System</Label>
                        <p className="text-sm text-muted-foreground">Enable mentorship features</p>
                      </div>
                      <Switch
                        checked={settings.enableMentorship}
                        onCheckedChange={() => handleToggle('enableMentorship')}
                        data-testid="toggle-mentorship"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-foreground">Events</Label>
                        <p className="text-sm text-muted-foreground">Allow event creation</p>
                      </div>
                      <Switch
                        checked={settings.enableEvents}
                        onCheckedChange={() => handleToggle('enableEvents')}
                        data-testid="toggle-events"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-foreground">Community Forum</Label>
                        <p className="text-sm text-muted-foreground">Enable forum discussions</p>
                      </div>
                      <Switch
                        checked={settings.enableForum}
                        onCheckedChange={() => handleToggle('enableForum')}
                        data-testid="toggle-forum"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-foreground">Profile Verification</Label>
                        <p className="text-sm text-muted-foreground">Require admin verification for profiles</p>
                      </div>
                      <Switch
                        checked={settings.requireProfileVerification}
                        onCheckedChange={() => handleToggle('requireProfileVerification')}
                        data-testid="toggle-profile-verification"
                      />
                    </div>
                    <Button onClick={() => handleSave('Feature')} data-testid="save-features-btn">
                      Save Changes
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Database Settings */}
              <TabsContent value="database" className="space-y-6 mt-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground">Database Management</CardTitle>
                    <CardDescription className="text-muted-foreground">Database maintenance and backups</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                      <p className="text-sm text-primary">
                        <strong>Last Backup:</strong> 2 hours ago
                      </p>
                      <p className="text-sm text-primary mt-1">
                        <strong>Database Size:</strong> 2.4 GB
                      </p>
                      <p className="text-sm text-primary mt-1">
                        <strong>Status:</strong> Healthy
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" data-testid="backup-now-btn">
                        Backup Now
                      </Button>
                      <Button variant="outline" data-testid="optimize-db-btn">
                        Optimize Database
                      </Button>
                      <Button variant="outline" className="text-destructive hover:bg-destructive/10" data-testid="clear-cache-btn">
                        Clear Cache
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default AdminSettings;