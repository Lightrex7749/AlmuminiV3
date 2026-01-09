import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Briefcase, Calendar, CheckCircle2, Mail, Linkedin, Github, Twitter, Globe, Download, MessageSquare, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import MainNavbar from '@/components/layout/MainNavbar';
import Footer from '@/components/layout/Footer';
import { directoryService } from '@/services';

const ProfileView = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const data = await directoryService.getProfileByUserId(userId);
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const handleSendMessage = async () => {
    setSendingMessage(true);
    try {
      // Navigate to messages page with recipient ID
      navigate(`/messages/${userId}`, { state: { recipientName: profile.name } });
    } catch (error) {
      console.error('Error opening message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleDownloadCV = () => {
    if (profile?.cv_url) {
      window.open(profile.cv_url, '_blank');
    }
  };

  const handleRequestMentorship = () => {
    navigate(`/mentorship/request/${userId}`, { state: { mentor: profile } });
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '??';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-background transition-colors duration-300">
        <MainNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-background transition-colors duration-300">
        <MainNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Profile Not Found</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">The profile you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/directory')}>Back to Directory</Button>
          </div>
        </div>
      </div>
    );
  }

  const socialLinks = profile.social_links || {};

  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-300">
      <MainNavbar />

      <main className="flex-1 py-8">
        <div className="max-w-5xl mx-auto px-4">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate('/directory')}
            className="mb-6 hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Directory
          </Button>

          {/* Profile Header Card */}
          <Card className="mb-6 overflow-hidden border-border shadow-lg bg-card">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <Avatar className="h-32 w-32 ring-4 ring-background shadow-md">
                    <AvatarImage src={profile.photo_url} alt={profile.name} />
                    <AvatarFallback className="text-3xl bg-gradient-to-br from-[#3D52A0] to-[#7091E6] text-white">
                      {getInitials(profile.name)}
                    </AvatarFallback>
                  </Avatar>
                  {profile.is_verified && (
                    <div className="absolute -bottom-2 -right-2 bg-card rounded-full p-1 shadow-md border border-border">
                      <CheckCircle2 className="h-8 w-8 text-primary" />
                    </div>
                  )}
                </div>

                {/* Basic Info */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">{profile.name}</h1>
                    <p className="text-xl text-muted-foreground mt-2">{profile.headline}</p>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {profile.current_company && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-primary" />
                        <span>{profile.current_company}</span>
                      </div>
                    )}
                    {profile.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-[#7091E6]" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    {profile.batch_year && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-green-600" />
                        <span>Batch of {profile.batch_year}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Button onClick={handleSendMessage} disabled={sendingMessage} className="bg-primary text-primary-foreground hover:bg-primary/90">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {sendingMessage ? 'Opening...' : 'Send Message'}
                    </Button>
                    <Button variant="outline" onClick={handleRequestMentorship} className="border-primary text-primary hover:bg-primary/10">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Request Mentorship
                    </Button>
                    {profile.cv_url && (
                      <Button variant="outline" onClick={handleDownloadCV} className="border-border text-foreground hover:bg-muted">
                        <Download className="h-4 w-4 mr-2" />
                        Download CV
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              {profile.bio && (
                <Card className="border-border shadow-sm bg-card">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold text-foreground mb-4">About</h2>
                    <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
                  </CardContent>
                </Card>
              )}

              {/* Experience */}
              {profile.experience_timeline && profile.experience_timeline.length > 0 && (
                <Card className="border-border shadow-sm bg-card">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold text-foreground mb-4">Experience</h2>
                    <div className="space-y-6">
                      {profile.experience_timeline.map((exp, idx) => (
                        <div key={idx} className="flex gap-4 group">
                          <div className="flex-shrink-0 w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <Briefcase className="h-7 w-7 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">{exp.role}</h3>
                            <p className="text-muted-foreground font-medium">{exp.company}</p>
                            <p className="text-sm text-muted-foreground/70 mt-1">
                              {new Date(exp.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                              {' - '}
                              {exp.end_date
                                ? new Date(exp.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                                : 'Present'
                              }
                            </p>
                            {exp.description && (
                              <p className="text-muted-foreground mt-3 leading-relaxed text-sm">{exp.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Education */}
              {profile.education_details && profile.education_details.length > 0 && (
                <Card className="border-border shadow-sm bg-card">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold text-foreground mb-4">Education</h2>
                    <div className="space-y-4">
                      {profile.education_details.map((edu, idx) => (
                        <div key={idx} className="relative pl-4 border-l-2 border-muted hover:border-primary transition-colors">
                          <h3 className="font-semibold text-lg text-foreground">
                            {edu.degree} in {edu.field}
                          </h3>
                          <p className="text-muted-foreground">{edu.institution}</p>
                          <p className="text-sm text-muted-foreground/70 mt-1">
                            {edu.start_year} - {edu.end_year}
                          </p>
                          {edu.achievements && (
                            <p className="text-muted-foreground mt-2 text-sm">{edu.achievements}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Skills */}
              {profile.skills && profile.skills.length > 0 && (
                <Card className="border-border shadow-sm bg-card">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold text-foreground mb-4">Skills</h2>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="text-sm bg-secondary text-secondary-foreground border-border">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Social Links */}
              {Object.keys(socialLinks).length > 0 && (
                <Card className="border-border shadow-sm bg-card">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold text-foreground mb-4">Connect</h2>
                    <div className="space-y-2">
                      {socialLinks.linkedin && (
                        <Button
                          variant="outline"
                          className="w-full justify-start border-border text-muted-foreground hover:text-primary hover:bg-primary/5"
                          onClick={() => window.open(socialLinks.linkedin, '_blank')}
                        >
                          <Linkedin className="h-4 w-4 mr-2" />
                          LinkedIn
                        </Button>
                      )}
                      {socialLinks.github && (
                        <Button
                          variant="outline"
                          className="w-full justify-start border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                          onClick={() => window.open(socialLinks.github, '_blank')}
                        >
                          <Github className="h-4 w-4 mr-2" />
                          GitHub
                        </Button>
                      )}
                      {socialLinks.twitter && (
                        <Button
                          variant="outline"
                          className="w-full justify-start border-border text-muted-foreground hover:text-accent hover:bg-accent/5"
                          onClick={() => window.open(socialLinks.twitter, '_blank')}
                        >
                          <Twitter className="h-4 w-4 mr-2" />
                          Twitter
                        </Button>
                      )}
                      {socialLinks.website && (
                        <Button
                          variant="outline"
                          className="w-full justify-start border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                          onClick={() => window.open(socialLinks.website, '_blank')}
                        >
                          <Globe className="h-4 w-4 mr-2" />
                          Website
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Achievements */}
              {profile.achievements && profile.achievements.length > 0 && (
                <Card className="border-border shadow-sm bg-card">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold text-foreground mb-4">Achievements</h2>
                    <ul className="space-y-2">
                      {profile.achievements.map((achievement, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfileView;