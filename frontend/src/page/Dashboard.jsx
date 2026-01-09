import { useAuth } from '@/contexts/AuthContext';
import MainNavbar from '@/components/layout/MainNavbar';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Briefcase, Calendar, Award } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Profile Views',
      value: '1,234',
      icon: Users,
      change: '+12%',
      changeType: 'positive',
    },
    {
      title: 'Applications',
      value: '8',
      icon: Briefcase,
      change: '+3 new',
      changeType: 'positive',
    },
    {
      title: 'Events Attended',
      value: '15',
      icon: Calendar,
      change: '2 upcoming',
      changeType: 'neutral',
    },
    {
      title: 'Engagement Score',
      value: '485',
      icon: Award,
      change: 'Rank #1',
      changeType: 'positive',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-300">
      <MainNavbar />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Welcome back! 👋</h1>
              <p className="text-muted-foreground mt-1 text-lg">
                Logged in as <span className="font-bold text-primary">{user?.email}</span> ({user?.role})
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index} className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                        {stat.title}
                      </CardTitle>
                      <Icon className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                      <p className={`text-xs mt-1 font-medium ${
                        stat.changeType === 'positive' ? 'text-green-600' :
                        stat.changeType === 'negative' ? 'text-red-600' :
                        'text-muted-foreground'
                      }`}>
                        {stat.change}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Quick Actions */}
            <Card className="bg-card border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-foreground">Quick Actions</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Get started with these common tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="p-6 border border-border rounded-xl hover:bg-muted/50 transition-all text-left group hover:border-primary/50">
                    <div className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">Complete Profile</div>
                    <div className="text-xs text-muted-foreground mt-1">Add your experience and skills</div>
                  </button>
                  <button className="p-6 border border-border rounded-xl hover:bg-muted/50 transition-all text-left group hover:border-primary/50">
                    <div className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">Browse Jobs</div>
                    <div className="text-xs text-muted-foreground mt-1">Find your next opportunity</div>
                  </button>
                  <button className="p-6 border border-border rounded-xl hover:bg-muted/50 transition-all text-left group hover:border-primary/50">
                    <div className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">Find a Mentor</div>
                    <div className="text-xs text-muted-foreground mt-1">Connect with experienced alumni</div>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-card border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-foreground">Recent Activity</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Your latest interactions on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-2.5 h-2.5 bg-primary rounded-full mt-1.5 ring-4 ring-primary/10"></div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">Profile updated</p>
                      <p className="text-xs text-muted-foreground mt-0.5">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-2.5 h-2.5 bg-green-600 rounded-full mt-1.5 ring-4 ring-green-600/10"></div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">Applied to Frontend Developer position</p>
                      <p className="text-xs text-muted-foreground mt-0.5">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-2.5 h-2.5 bg-[#7091E6] rounded-full mt-1.5 ring-4 ring-[#7091E6]/10"></div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">RSVP'd to Machine Learning Workshop</p>
                      <p className="text-xs text-muted-foreground mt-0.5">3 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
