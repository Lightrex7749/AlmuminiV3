import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { profileService } from '@/services';
import MainNavbar from '@/components/layout/MainNavbar';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { BlurFade, SpotlightCard, BorderBeam } from '@/components/ui/aceternity';
import { 
  User, 
  Mail, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Edit,
  Save,
  X,
  Building,
  Award,
  Target,
  Plus,
  Trash2,
  Linkedin,
  Github,
  Twitter,
  Globe,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import CareerJourneyForm from '@/components/career/CareerJourneyForm';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfileData();
    if (location.state?.editMode) {
      setIsEditing(true);
      // Clear state so it doesn't persist on refresh/back
      window.history.replaceState({}, document.title);
    }
  }, [user?.id, location.state]);

  const loadProfileData = async () => {
    try {
      if (!user?.id) return;
      
      // Load profile from service layer (respects toggle)
      const result = await profileService.getMyProfile();
      
      if (result.success && result.data) {
        setProfileData(result.data);
        setOriginalData(JSON.parse(JSON.stringify(result.data)));
      } else {
        // If profile doesn't exist, create default profile structure
        const defaultProfile = {
          id: `profile-${user.id}-${Date.now()}`,
          user_id: user.id,
          name: user.email?.split('@')[0] || (user.role === 'alumni' ? 'Alumni' : 'Student'),
          email: user.email,
          photo_url: '',
          bio: '',
          headline: '',
          current_company: '',
          current_role: '',
          location: '',
          batch_year: new Date().getFullYear(),
          experience_timeline: [],
          education_details: [],
          skills: [],
          achievements: [],
          social_links: {
            linkedin: '',
            github: '',
            twitter: '',
            website: ''
          },
          // Alumni-specific fields
          industry: '',
          years_of_experience: 0,
          willing_to_mentor: false,
          willing_to_hire: false,
          profile_completion_percentage: 10,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setProfileData(defaultProfile);
        setOriginalData(JSON.parse(JSON.stringify(defaultProfile)));
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const calculateCompletion = (data) => {
    let completion = 0;
    if (data.name) completion += 10;
    if (data.photo_url) completion += 10;
    if (data.bio && data.bio.length > 20) completion += 15;
    if (data.headline) completion += 10;
    if (data.location) completion += 10;
    if (data.current_role) completion += 10;
    if (data.current_company) completion += 10;
    if (data.batch_year) completion += 5;
    if (data.skills && data.skills.length >= 3) completion += 10;
    if (data.education_details && data.education_details.length > 0) completion += 10;
    
    // Alumni-specific fields (optional bonus)
    if (user?.role === 'alumni') {
      if (data.industry) completion += 5;
      if (data.years_of_experience !== undefined && data.years_of_experience > 0) completion += 5;
    }
    
    return Math.min(completion, 100);
  };

  const handleSave = async () => {
    try {
      // Calculate profile completion
      const completion = calculateCompletion(profileData);
      const updatedData = {
        ...profileData,
        profile_completion_percentage: completion,
        updated_at: new Date().toISOString()
      };

      // Update via service layer (respects toggle)
      const result = await profileService.updateProfile(user.id, updatedData);
      
      if (result.success) {
        setProfileData(result.data || updatedData);
        setOriginalData(JSON.parse(JSON.stringify(result.data || updatedData)));
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      } else {
        toast.error(result.error || 'Failed to save profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    }
  };

  const handleCancel = () => {
    setProfileData(JSON.parse(JSON.stringify(originalData)));
    setIsEditing(false);
  };

  const updateField = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addSkill = () => {
    const skill = prompt('Enter skill name:');
    if (skill && skill.trim()) {
      setProfileData(prev => ({
        ...prev,
        skills: [...(prev.skills || []), skill.trim()]
      }));
    }
  };

  const removeSkill = (index) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const addAchievement = () => {
    const achievement = prompt('Enter achievement:');
    if (achievement && achievement.trim()) {
      setProfileData(prev => ({
        ...prev,
        achievements: [...(prev.achievements || []), achievement.trim()]
      }));
    }
  };

  const removeAchievement = (index) => {
    setProfileData(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index)
    }));
  };

  const addEducation = () => {
    const institution = prompt('Enter institution name:');
    const degree = prompt('Enter degree:');
    const field = prompt('Enter field of study:');
    const startYear = prompt('Enter start year:');
    const endYear = prompt('Enter end year:');
    
    if (institution && degree) {
      setProfileData(prev => ({
        ...prev,
        education_details: [...(prev.education_details || []), {
          institution,
          degree,
          field: field || '',
          start_year: parseInt(startYear) || new Date().getFullYear() - 4,
          end_year: parseInt(endYear) || new Date().getFullYear(),
          achievements: []
        }]
      }));
    }
  };

  const removeEducation = (index) => {
    setProfileData(prev => ({
      ...prev,
      education_details: prev.education_details.filter((_, i) => i !== index)
    }));
  };

  const addExperience = () => {
    const company = prompt('Enter company name:');
    const role = prompt('Enter role/position:');
    const startDate = prompt('Enter start date (YYYY-MM):');
    const endDate = prompt('Enter end date (YYYY-MM) or leave empty if current:');
    const description = prompt('Enter description:');
    
    if (company && role) {
      setProfileData(prev => ({
        ...prev,
        experience_timeline: [...(prev.experience_timeline || []), {
          company,
          role,
          start_date: startDate || new Date().toISOString().slice(0, 7),
          end_date: endDate || null,
          description: description || ''
        }]
      }));
    }
  };

  const removeExperience = (index) => {
    setProfileData(prev => ({
      ...prev,
      experience_timeline: prev.experience_timeline.filter((_, i) => i !== index)
    }));
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    return names.length > 1 
      ? `${names[0][0]}${names[1][0]}`.toUpperCase()
      : names[0].substring(0, 2).toUpperCase();
  };

  if (loading || !profileData) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <MainNavbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">Loading profile...</p>
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
            {/* Profile Header Card */}
            <Card className="bg-card border-border shadow-md">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    {isEditing ? (
                      <div className="space-y-2">
                        <Avatar className="w-24 h-24 border-2 border-border">
                          <AvatarImage src={profileData.photo_url} alt={profileData.name} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                            {getInitials(profileData.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <Label htmlFor="photo" className="text-xs text-foreground">Photo URL</Label>
                          <Input
                            id="photo"
                            value={profileData.photo_url || ''}
                            onChange={(e) => updateField('photo_url', e.target.value)}
                            placeholder="https://..."
                            className="w-64 text-xs bg-background border-border"
                          />
                        </div>
                      </div>
                    ) : (
                      <Avatar className="w-24 h-24 border-2 border-border">
                        <AvatarImage src={profileData.photo_url} alt={profileData.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                          {getInitials(profileData.name)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className="space-y-1">
                      {isEditing ? (
                        <Input
                          value={profileData.name || ''}
                          onChange={(e) => updateField('name', e.target.value)}
                          className="text-3xl font-bold h-auto py-1 bg-background border-border"
                          placeholder="Your Name"
                          data-testid="input-name"
                        />
                      ) : (
                        <h1 className="text-3xl font-bold text-foreground" data-testid="profile-name">
                          {profileData.name}
                        </h1>
                      )}
                      {profileData.headline && !isEditing && (
                        <p className="text-lg text-muted-foreground">{profileData.headline}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {profileData.current_role && profileData.current_company && !isEditing && (
                          <div className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            <span>{profileData.current_role} at {profileData.current_company}</span>
                          </div>
                        )}
                        {profileData.location && !isEditing && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{profileData.location}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="capitalize">
                          {user?.role}
                        </Badge>
                        {profileData.batch_year && (
                          <Badge variant="outline" className="border-border">Batch {profileData.batch_year}</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {!isEditing ? (
                      <Button onClick={() => setIsEditing(true)} data-testid="edit-profile-btn" className="bg-primary text-primary-foreground hover:bg-primary/90">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <>
                        <Button onClick={handleSave} data-testid="save-profile-btn" className="bg-primary text-primary-foreground hover:bg-primary/90">
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button variant="outline" onClick={handleCancel} data-testid="cancel-edit-btn" className="border-border text-foreground hover:bg-muted">
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Profile Completion */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Profile Completion</span>
                    <span className="text-sm font-medium text-primary">
                      {profileData.profile_completion_percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${profileData.profile_completion_percentage}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Content Tabs */}
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-card border border-border">
                <TabsTrigger value="about" data-testid="tab-about">
                  <User className="w-4 h-4 mr-2" />
                  About
                </TabsTrigger>
                <TabsTrigger value="experience" data-testid="tab-experience">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Experience
                </TabsTrigger>
                <TabsTrigger value="education" data-testid="tab-education">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Education
                </TabsTrigger>
                <TabsTrigger value="skills" data-testid="tab-skills">
                  <Award className="w-4 h-4 mr-2" />
                  Skills
                </TabsTrigger>
              </TabsList>

              {/* About Tab */}
              <TabsContent value="about" className="space-y-6 mt-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground">About Me</CardTitle>
                    <CardDescription className="text-muted-foreground">Tell others about yourself</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="bio" className="text-foreground">Bio</Label>
                          <Textarea
                            id="bio"
                            rows={6}
                            className="w-full bg-background border-border"
                            value={profileData.bio || ''}
                            onChange={(e) => updateField('bio', e.target.value)}
                            data-testid="input-bio"
                            placeholder="Write a brief introduction about yourself..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="headline" className="text-foreground">Professional Headline</Label>
                          <Input
                            id="headline"
                            value={profileData.headline || ''}
                            onChange={(e) => updateField('headline', e.target.value)}
                            data-testid="input-headline"
                            placeholder="e.g., Computer Science Student | Aspiring Developer"
                            className="bg-background border-border"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="space-y-4">
                        {profileData.bio ? (
                          <p className="text-foreground whitespace-pre-wrap leading-relaxed">{profileData.bio}</p>
                        ) : (
                          <p className="text-muted-foreground italic">No bio added yet. Click Edit Profile to add one.</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {isEditing ? (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-foreground">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={user?.email || ''}
                              disabled
                              data-testid="input-email"
                              className="bg-muted border-border"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="location" className="text-foreground">Location</Label>
                            <Input
                              id="location"
                              value={profileData.location || ''}
                              onChange={(e) => updateField('location', e.target.value)}
                              data-testid="input-location"
                              placeholder="City, Country"
                              className="bg-background border-border"
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-primary" />
                            <div>
                              <p className="text-sm text-muted-foreground">Email</p>
                              <p className="font-medium text-foreground">{user?.email}</p>
                            </div>
                          </div>
                          {profileData.location && (
                            <div className="flex items-center gap-3">
                              <MapPin className="w-5 h-5 text-primary" />
                              <div>
                                <p className="text-sm text-muted-foreground">Location</p>
                                <p className="font-medium text-foreground">{profileData.location}</p>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Social Links Section */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground">Social Links</CardTitle>
                    <CardDescription className="text-muted-foreground">Connect your professional and social profiles</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="linkedin" className="flex items-center gap-2 text-foreground">
                            <Linkedin className="w-4 h-4 text-primary" />
                            LinkedIn Profile URL
                          </Label>
                          <Input
                            id="linkedin"
                            value={profileData.social_links?.linkedin || ''}
                            onChange={(e) => updateField('social_links', {
                              ...(profileData.social_links || {}),
                              linkedin: e.target.value
                            })}
                            placeholder="https://www.linkedin.com/in/yourprofile"
                            data-testid="input-linkedin"
                            className="bg-background border-border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="github" className="flex items-center gap-2 text-foreground">
                            <Github className="w-4 h-4 text-foreground" />
                            GitHub Profile URL
                          </Label>
                          <Input
                            id="github"
                            value={profileData.social_links?.github || ''}
                            onChange={(e) => updateField('social_links', {
                              ...(profileData.social_links || {}),
                              github: e.target.value
                            })}
                            placeholder="https://github.com/yourusername"
                            data-testid="input-github"
                            className="bg-background border-border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="twitter" className="flex items-center gap-2 text-foreground">
                            <Twitter className="w-4 h-4 text-accent" />
                            Twitter/X Profile URL
                          </Label>
                          <Input
                            id="twitter"
                            value={profileData.social_links?.twitter || ''}
                            onChange={(e) => updateField('social_links', {
                              ...(profileData.social_links || {}),
                              twitter: e.target.value
                            })}
                            placeholder="https://twitter.com/yourusername"
                            data-testid="input-twitter"
                            className="bg-background border-border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="website" className="flex items-center gap-2 text-foreground">
                            <Globe className="w-4 h-4 text-green-600" />
                            Personal Website
                          </Label>
                          <Input
                            id="website"
                            value={profileData.social_links?.website || ''}
                            onChange={(e) => updateField('social_links', {
                              ...(profileData.social_links || {}),
                              website: e.target.value
                            })}
                            placeholder="https://yourwebsite.com"
                            data-testid="input-website"
                            className="bg-background border-border"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {profileData.social_links?.linkedin ? (
                          <a 
                            href={profileData.social_links.linkedin} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted transition-colors"
                          >
                            <Linkedin className="w-5 h-5 text-primary" />
                            <span className="text-sm flex-1 text-foreground">LinkedIn Profile</span>
                            <ExternalLink className="w-4 h-4 text-muted-foreground" />
                          </a>
                        ) : null}
                        
                        {profileData.social_links?.github ? (
                          <a 
                            href={profileData.social_links.github} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted transition-colors"
                          >
                            <Github className="w-5 h-5 text-foreground" />
                            <span className="text-sm flex-1 text-foreground">GitHub Profile</span>
                            <ExternalLink className="w-4 h-4 text-muted-foreground" />
                          </a>
                        ) : null}
                        
                        {profileData.social_links?.twitter ? (
                          <a 
                            href={profileData.social_links.twitter} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted transition-colors"
                          >
                            <Twitter className="w-5 h-5 text-accent" />
                            <span className="text-sm flex-1 text-foreground">Twitter/X Profile</span>
                            <ExternalLink className="w-4 h-4 text-muted-foreground" />
                          </a>
                        ) : null}
                        
                        {profileData.social_links?.website ? (
                          <a 
                            href={profileData.social_links.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted transition-colors"
                          >
                            <Globe className="w-5 h-5 text-green-600" />
                            <span className="text-sm flex-1 text-foreground">Personal Website</span>
                            <ExternalLink className="w-4 h-4 text-muted-foreground" />
                          </a>
                        ) : null}
                        
                        {!profileData.social_links?.linkedin && 
                         !profileData.social_links?.github && 
                         !profileData.social_links?.twitter && 
                         !profileData.social_links?.website && (
                          <p className="text-muted-foreground italic">No social links added yet. Click Edit Profile to add your profiles.</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Alumni-Specific Professional Details */}
                {user?.role === 'alumni' && (
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-foreground">Professional Details</CardTitle>
                      <CardDescription className="text-muted-foreground">Alumni-specific information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {isEditing ? (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="industry" className="text-foreground">Industry/Sector</Label>
                            <Input
                              id="industry"
                              value={profileData.industry || ''}
                              onChange={(e) => updateField('industry', e.target.value)}
                              placeholder="e.g., Technology, Finance, Healthcare"
                              className="bg-background border-border"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="yearsOfExperience" className="text-foreground">Years of Experience</Label>
                            <Input
                              id="yearsOfExperience"
                              type="number"
                              value={profileData.years_of_experience || ''}
                              onChange={(e) => updateField('years_of_experience', parseInt(e.target.value) || 0)}
                              placeholder="e.g., 5"
                              className="bg-background border-border"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="willingToMentor" className="text-foreground">Willing to Mentor</Label>
                            <select
                              id="willingToMentor"
                              className="w-full p-2 border border-border rounded-md bg-background text-foreground"
                              value={profileData.willing_to_mentor ? 'yes' : 'no'}
                              onChange={(e) => updateField('willing_to_mentor', e.target.value === 'yes')}
                            >
                              <option value="yes">Yes</option>
                              <option value="no">No</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="willingToHire" className="text-foreground">Willing to Post Jobs</Label>
                            <select
                              id="willingToHire"
                              className="w-full p-2 border border-border rounded-md bg-background text-foreground"
                              value={profileData.willing_to_hire ? 'yes' : 'no'}
                              onChange={(e) => updateField('willing_to_hire', e.target.value === 'yes')}
                            >
                              <option value="yes">Yes</option>
                              <option value="no">No</option>
                            </select>
                          </div>
                        </>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {profileData.industry && (
                            <div>
                              <p className="text-sm text-muted-foreground">Industry</p>
                              <p className="font-medium text-foreground">{profileData.industry}</p>
                            </div>
                          )}
                          {profileData.years_of_experience !== undefined && (
                            <div>
                              <p className="text-sm text-muted-foreground">Years of Experience</p>
                              <p className="font-medium text-foreground">{profileData.years_of_experience} years</p>
                            </div>
                          )}
                          <div>
                            <p className="text-sm text-muted-foreground">Mentorship</p>
                            <Badge variant={profileData.willing_to_mentor ? 'default' : 'secondary'}>
                              {profileData.willing_to_mentor ? 'Available' : 'Not Available'}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Hiring</p>
                            <Badge variant={profileData.willing_to_hire ? 'default' : 'secondary'}>
                              {profileData.willing_to_hire ? 'Open to Post Jobs' : 'Not Hiring'}
                            </Badge>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Experience Tab */}
              <TabsContent value="experience" className="space-y-6 mt-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-foreground">Work Experience</CardTitle>
                        <CardDescription className="text-muted-foreground">Your professional experience</CardDescription>
                      </div>
                      {isEditing && (
                        <Button size="sm" onClick={addExperience} className="bg-primary text-primary-foreground hover:bg-primary/90">
                          <Plus className="w-4 h-4 mr-1" />
                          Add Experience
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Current Position */}
                    {isEditing ? (
                      <div className="space-y-4 p-4 border border-border rounded-lg bg-background">
                        <h3 className="font-semibold text-foreground">Current Position</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="currentRole" className="text-foreground">Role</Label>
                            <Input
                              id="currentRole"
                              value={profileData.current_role || ''}
                              onChange={(e) => updateField('current_role', e.target.value)}
                              data-testid="input-current-role"
                              placeholder="e.g., Intern, Part-time Developer"
                              className="bg-card border-border"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="currentCompany" className="text-foreground">Company</Label>
                            <Input
                              id="currentCompany"
                              value={profileData.current_company || ''}
                              onChange={(e) => updateField('current_company', e.target.value)}
                              data-testid="input-current-company"
                              placeholder="e.g., Tech Corp"
                              className="bg-card border-border"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        {profileData.current_role || profileData.current_company ? (
                          <div className="flex gap-4 p-4 border border-border rounded-lg bg-background hover:bg-muted/50 transition-colors">
                            <Building className="w-12 h-12 text-primary bg-primary/10 rounded-lg p-2 flex-shrink-0" />
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg text-foreground">{profileData.current_role}</h3>
                              <p className="text-muted-foreground">{profileData.current_company}</p>
                              <p className="text-sm text-muted-foreground mt-1">Present</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-muted-foreground italic">No experience added yet. Click Edit Profile to add one.</p>
                        )}
                        
                        {/* Past Experience */}
                        {profileData.experience_timeline && Array.isArray(profileData.experience_timeline) && 
                         profileData.experience_timeline.length > 0 && (
                          <div className="space-y-4">
                            {profileData.experience_timeline.map((exp, index) => (
                              <div key={index} className="flex gap-4 p-4 border border-border rounded-lg bg-background hover:bg-muted/50 transition-colors">
                                <Building className="w-12 h-12 text-muted-foreground bg-muted rounded-lg p-2 flex-shrink-0" />
                                <div className="flex-1">
                                  <h3 className="font-semibold text-lg text-foreground">{exp.role}</h3>
                                  <p className="text-muted-foreground">{exp.company}</p>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {exp.start_date} - {exp.end_date || 'Present'}
                                  </p>
                                  {exp.description && (
                                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{exp.description}</p>
                                  )}
                                </div>
                                {isEditing && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removeExperience(index)}
                                    className="text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Career Journey Form - ML Data Collection */}
                {!isEditing && (
                  <CareerJourneyForm onSuccess={() => toast.success('Thank you for contributing to our AI! 🚀')} />
                )}
              </TabsContent>

              {/* Education Tab */}
              <TabsContent value="education" className="space-y-6 mt-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-foreground">Education</CardTitle>
                        <CardDescription className="text-muted-foreground">Your educational background</CardDescription>
                      </div>
                      {isEditing && (
                        <Button size="sm" onClick={addEducation} className="bg-primary text-primary-foreground hover:bg-primary/90">
                          <Plus className="w-4 h-4 mr-1" />
                          Add Education
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing && (
                      <div className="space-y-4 p-4 border border-border rounded-lg bg-background">
                        <div className="space-y-2">
                          <Label htmlFor="batchYear" className="text-foreground">Batch Year</Label>
                          <Input
                            id="batchYear"
                            type="number"
                            value={profileData.batch_year || ''}
                            onChange={(e) => updateField('batch_year', parseInt(e.target.value))}
                            data-testid="input-batch-year"
                            placeholder="e.g., 2024"
                            className="bg-card border-border"
                          />
                        </div>
                      </div>
                    )}
                    
                    {profileData.education_details && Array.isArray(profileData.education_details) && 
                     profileData.education_details.length > 0 ? (
                      <div className="space-y-4">
                        {profileData.education_details.map((edu, index) => (
                          <div key={index} className="flex gap-4 p-4 border border-border rounded-lg bg-background hover:bg-muted/50 transition-colors">
                            <GraduationCap className="w-12 h-12 text-green-600 bg-green-600/10 rounded-lg p-2 flex-shrink-0" />
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg text-foreground">{edu.degree} {edu.field && `in ${edu.field}`}</h3>
                              <p className="text-muted-foreground">{edu.institution}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {edu.start_year} - {edu.end_year}
                              </p>
                              {edu.achievements && (
                                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{edu.achievements}</p>
                              )}
                            </div>
                            {isEditing && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeEducation(index)}
                                className="text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground italic">No education details added yet. Click Edit Profile to add one.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Skills Tab */}
              <TabsContent value="skills" className="space-y-6 mt-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-foreground">Skills & Achievements</CardTitle>
                        <CardDescription className="text-muted-foreground">Showcase your expertise</CardDescription>
                      </div>
                      {isEditing && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={addSkill} className="bg-primary text-primary-foreground hover:bg-primary/90">
                            <Plus className="w-4 h-4 mr-1" />
                            Add Skill
                          </Button>
                          <Button size="sm" variant="outline" onClick={addAchievement} className="border-border text-foreground hover:bg-muted">
                            <Plus className="w-4 h-4 mr-1" />
                            Add Achievement
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-3 text-foreground">Skills</h3>
                      {profileData.skills && Array.isArray(profileData.skills) && profileData.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {profileData.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="px-3 py-1 flex items-center gap-2 bg-secondary text-secondary-foreground border-border">
                              {skill}
                              {isEditing && (
                                <button
                                  onClick={() => removeSkill(index)}
                                  className="hover:text-destructive transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground italic">No skills added yet. Click Edit Profile to add skills.</p>
                      )}
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3 text-foreground">Achievements</h3>
                      {profileData.achievements && Array.isArray(profileData.achievements) && 
                       profileData.achievements.length > 0 ? (
                        <ul className="space-y-2">
                          {profileData.achievements.map((achievement, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <Target className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                              <span className="text-foreground flex-1 leading-relaxed">{achievement}</span>
                              {isEditing && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeAchievement(index)}
                                  className="text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted-foreground italic">No achievements added yet. Click Edit Profile to add achievements.</p>
                      )}
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

export default Profile;
