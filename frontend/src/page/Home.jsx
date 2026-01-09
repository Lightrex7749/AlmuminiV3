import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import MainNavbar from '@/components/layout/MainNavbar';
import Footer from '@/components/layout/Footer';
import { ArrowRight, Users, Briefcase, Calendar, Award, MessageSquare, UserCheck, Target, Heart, TrendingUp, Network, Route, Map, CreditCard, BookOpen, BarChart3, Sparkles, Star, Zap, Globe, Shield } from 'lucide-react';
import { BackgroundDots } from '@/components/ui/background-grids';
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid';
import { useRef, useState, useEffect } from 'react';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { FloatingParticles } from '@/components/ui/floating-particles';

// Premium Aceternity UI Components
import { 
  Spotlight,
  SpotlightCard,
  TextGenerateEffect,
  FlipWords,
  GradientHeading,
  BlurFade,
  StaggerContainer,
  StaggerItem,
  ScrollProgress,
  HeroGradient,
  GridBackground,
  HoverCard,
  TiltCard,
  MagneticButton,
  ShineButton,
  GlowBorderCard,
} from '@/components/ui/aceternity';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const stats = [
    { label: 'Active Alumni', value: 5000, icon: Users, gradient: 'from-blue-500 to-cyan-500' },
    { label: 'Success Stories', value: 1200, icon: Award, gradient: 'from-purple-500 to-pink-500' },
    { label: 'Job Placements', value: 800, icon: Briefcase, gradient: 'from-orange-500 to-red-500' },
    { label: 'Events Hosted', value: 200, icon: Calendar, gradient: 'from-green-500 to-emerald-500' },
  ];

  const features = [
    {
      icon: Users,
      title: 'Alumni Directory',
      description: 'Connect with thousands of alumni from various industries and locations',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Briefcase,
      title: 'Job Portal',
      description: 'Discover exclusive job opportunities posted by alumni and recruiters',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Calendar,
      title: 'Events & Webinars',
      description: 'Attend workshops, conferences, and networking events',
      gradient: 'from-orange-500 to-amber-500',
    },
    {
      icon: UserCheck,
      title: 'Mentorship Program',
      description: 'Get guidance from experienced alumni in your field of interest',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: MessageSquare,
      title: 'Community Forum',
      description: 'Engage in discussions, share knowledge, and build connections',
      gradient: 'from-indigo-500 to-purple-500',
    },
    {
      icon: Award,
      title: 'Achievements & Badges',
      description: 'Earn recognition for your contributions and engagement',
      gradient: 'from-rose-500 to-pink-500',
    },
  ];

  const values = [
    {
      icon: Users,
      title: 'Community First',
      description: 'We believe in the power of community and fostering meaningful connections between alumni, students, and recruiters.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Target,
      title: 'Career Growth',
      description: 'Empowering members to achieve their professional goals through mentorship, job opportunities, and skill development.',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Heart,
      title: 'Give Back',
      description: 'Encouraging alumni to share their knowledge and experiences with the next generation of professionals.',
      gradient: 'from-rose-500 to-orange-500',
    },
    {
      icon: TrendingUp,
      title: 'Continuous Learning',
      description: 'Providing access to resources, events, and knowledge that help our community stay ahead in their careers.',
      gradient: 'from-green-500 to-emerald-500',
    },
  ];

  const innovativeFeatures = [
    {
      icon: Network,
      title: 'Skill Graph AI',
      description: 'Skill matching + relationship network model',
      marketValue: 'Smart talent discovery',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Route,
      title: 'Career Path Engine',
      description: 'Predictive role-transition algorithm',
      marketValue: 'Student success insights',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Map,
      title: 'Talent Heatmap',
      description: 'Spatio-temporal career intelligence',
      marketValue: 'Recruiter targeting',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: CreditCard,
      title: 'Digital Alumni ID',
      description: 'Dynamic credential verification + QR security',
      marketValue: 'Trusted identity layer',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: BookOpen,
      title: 'Knowledge Capsules',
      description: 'Content validation tied to skill graph',
      marketValue: 'Micro-learning marketplace',
      gradient: 'from-indigo-500 to-blue-500',
    },
    {
      icon: BarChart3,
      title: 'Engagement Scoring',
      description: 'Contribution impact measurement',
      marketValue: 'Gamification & retention',
      gradient: 'from-yellow-500 to-orange-500',
    },
  ];

  const detailedFeatures = [
    {
      icon: Users,
      title: 'Alumni Directory',
      description: 'Connect with thousands of alumni across various industries, locations, and career stages. Build your professional network.',
    },
    {
      icon: Briefcase,
      title: 'Job Portal',
      description: 'Access exclusive job opportunities posted by alumni and top recruiters. Get referrals and increase your chances of landing your dream job.',
    },
    {
      icon: MessageSquare,
      title: 'Mentorship Program',
      description: 'Get personalized guidance from experienced alumni. Book one-on-one sessions and accelerate your career growth.',
    },
    {
      icon: Calendar,
      title: 'Events & Workshops',
      description: 'Attend networking events, technical workshops, webinars, and conferences organized by the community.',
    },
    {
      icon: MessageSquare,
      title: 'Community Forum',
      description: 'Engage in discussions, ask questions, share knowledge, and learn from the collective wisdom of the community.',
    },
    {
      icon: Award,
      title: 'Recognition & Badges',
      description: 'Earn badges and recognition for your contributions. Climb the leaderboard and showcase your engagement.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-300">
      {/* Scroll Progress Indicator */}
      <ScrollProgress />
      
      <MainNavbar />

      {/* Hero Section - Premium Design with Spotlight */}
      <section className="relative flex-1 flex items-center justify-center px-4 py-16 md:py-24 overflow-hidden min-h-[90vh]" data-testid="hero-section">
        {/* Floating Particles */}
        <FloatingParticles count={30} />
        
        {/* Background Dots with Radial Fade */}
        <BackgroundDots className="absolute inset-0">
          <div className="absolute inset-0 bg-background/90" />
        </BackgroundDots>
        
        {/* Spotlight Effect */}
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="#3D52A0" />
        
        {/* Enhanced Gradient Background with Animated Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Animated gradient orbs */}
          <div className="absolute top-0 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
          <div className="absolute top-20 -right-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s' }}></div>
          
          {/* Floating geometric shapes */}
          <div className="absolute top-1/4 left-1/4 w-32 h-32 border border-primary/20 rounded-lg rotate-12 animate-float" style={{ animationDelay: '0s' }}></div>
          <div className="absolute top-1/3 right-1/4 w-24 h-24 border border-accent/20 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
          
          {/* Radial gradient overlay for depth */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(61,82,160,0.05),transparent_70%)]"></div>
        </div>

        <div className="relative max-w-5xl text-center space-y-8 z-10">
          {/* Badge with BlurFade */}
          <BlurFade delay={0.1}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/20 rounded-full backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium bg-gradient-to-r from-[#3D52A0] to-[#7091E6] bg-clip-text text-transparent">
                Trusted by 5,000+ Alumni Worldwide
              </span>
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            </div>
          </BlurFade>

          <div className="space-y-6">
            {/* Animated Title */}
            <BlurFade delay={0.2}>
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight" data-testid="hero-title">
                <span className="text-foreground">Connect, Grow &</span>
                <br />
                <GradientHeading gradient="from-[#3D52A0] via-[#7091E6] to-[#8697C4]">
                  <FlipWords words={["Succeed Together", "Build Networks", "Grow Careers", "Share Knowledge"]} duration={3000} />
                </GradientHeading>
              </h1>
            </BlurFade>
            
            {/* Text Generate Effect for Description */}
            <BlurFade delay={0.3}>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed" data-testid="hero-description">
                Join thousands of alumni, students, and recruiters in building a stronger professional community with cutting-edge tools and meaningful connections.
              </p>
            </BlurFade>
          </div>

          {/* CTA Buttons */}
          <BlurFade delay={0.4}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              {isAuthenticated ? (
                <MagneticButton onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-2 bg-primary text-primary-foreground">
                  <span>Go to Dashboard</span>
                  <ArrowRight className="h-5 w-5" />
                </MagneticButton>
              ) : (
                <>
                  <MagneticButton onClick={() => navigate('/register')} data-testid="get-started-btn" className="inline-flex items-center gap-2 bg-primary text-primary-foreground">
                    <span>Get Started Free</span>
                    <ArrowRight className="h-5 w-5" />
                  </MagneticButton>
                  <MagneticButton onClick={() => navigate('/login')} data-testid="sign-in-btn" className="inline-flex items-center gap-2 variant-outline border-primary text-primary">
                    <span>Sign In</span>
                    <ArrowRight className="h-5 w-5" />
                  </MagneticButton>
                </>
              )}
            </div>
          </BlurFade>

          {/* Trust Indicators */}
          <BlurFade delay={0.5}>
            <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>AI-Powered Matching</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                <span>Global Network</span>
              </div>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* Bento Grid Features Section */}
      <section className="py-20 px-4 bg-background relative transition-colors duration-300" data-testid="bento-features">
        <div className="max-w-7xl mx-auto">
          <BlurFade delay={0.1}>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                <GradientHeading gradient="from-[#3D52A0] via-[#7091E6] to-[#8697C4]">
                  Everything You Need to Succeed
                </GradientHeading>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Powerful features designed to connect, engage, and empower your alumni network
              </p>
            </div>
          </BlurFade>

          <BentoGrid className="max-w-7xl mx-auto">
            <BentoGridItem
              title="Smart Alumni Directory"
              description="AI-powered search and filtering to find the right connections instantly"
              header={
                <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-[#3D52A0] to-[#7091E6] items-center justify-center shadow-md">
                  <Users className="h-12 w-12 text-white" />
                </div>
              }
              icon={<Users className="h-4 w-4 text-primary" />}
              className="md:col-span-2 bg-card border-border"
            />
            <BentoGridItem
              title="Job Portal"
              description="Connect alumni with exclusive career opportunities"
              header={
                <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-[#7091E6] to-[#ADBBDA] items-center justify-center shadow-md">
                  <Briefcase className="h-12 w-12 text-white" />
                </div>
              }
              icon={<Briefcase className="h-4 w-4 text-accent" />}
              className="md:col-span-1 bg-card border-border"
            />
            <BentoGridItem
              title="Events & Networking"
              description="Host and manage alumni events with ease"
              header={
                <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-[#ADBBDA] to-[#3D52A0] items-center justify-center shadow-md">
                  <Calendar className="h-12 w-12 text-white" />
                </div>
              }
              icon={<Calendar className="h-4 w-4 text-primary" />}
              className="md:col-span-1 bg-card border-border"
            />
            <BentoGridItem
              title="Mentorship Program"
              description="Connect experienced alumni with those seeking guidance"
              header={
                <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-[#3D52A0] to-[#ADBBDA] items-center justify-center shadow-md">
                  <Award className="h-12 w-12 text-white" />
                </div>
              }
              icon={<Award className="h-4 w-4 text-primary" />}
              className="md:col-span-2 bg-card border-border"
            />
          </BentoGrid>
        </div>
      </section>

      {/* Stats Section - Modern 3D Tilt Cards */}
      <section className="py-20 px-4 bg-background relative transition-colors duration-300" data-testid="stats-section">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent"></div>
        <div className="max-w-7xl mx-auto relative">
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.1}>
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <StaggerItem key={index}>
                  <SpotlightCard
                    className="bg-card p-8 rounded-2xl text-center h-full border border-border shadow-sm"
                    spotlightColor="rgba(61, 82, 160, 0.1)"
                    data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${stat.gradient} rounded-2xl mb-5 shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-4xl font-bold text-foreground mb-2">
                      <AnimatedCounter end={stat.value} suffix="+" duration={2.5} />
                    </div>
                    <div className="text-muted-foreground font-medium">{stat.label}</div>
                  </SpotlightCard>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* Innovative Features Section - Dark Theme with Spotlight */}
      <section className="py-24 px-4 bg-[#1A1F2C] relative overflow-hidden" data-testid="innovative-features-section">
        {/* Spotlight effect */}
        <Spotlight className="top-0 left-1/4" fill="#7091E6" />
        
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s' }}></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <BlurFade delay={0.1}>
            <div className="text-center mb-20">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-full mb-8 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
                <Sparkles className="w-5 h-5 text-accent animate-pulse" />
                <span className="text-sm font-bold text-blue-100 tracking-wide">NEXT-GENERATION INNOVATION</span>
                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              </div>
              
              {/* Title */}
              <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight" data-testid="innovative-features-title">
                <GradientHeading gradient="from-[#7091E6] via-[#ADBBDA] to-white">
                  Patentable Technology Stack
                </GradientHeading>
              </h2>
              
              {/* Description */}
              <p className="text-lg md:text-xl text-blue-100/80 max-w-3xl mx-auto leading-relaxed">
                Revolutionary features that set us apart with <span className="text-white font-semibold">cutting-edge algorithms</span> and <span className="text-white font-semibold">intelligent systems</span>
              </p>
            </div>
          </BlurFade>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" staggerDelay={0.1}>
            {innovativeFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <StaggerItem key={index}>
                  <div 
                    className="h-full group"
                    data-testid={`innovative-feature-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <div className="relative bg-white/5 p-8 rounded-2xl h-full overflow-hidden transition-all duration-500 hover:scale-[1.02] border border-white/10 hover:border-white/20 shadow-2xl">
                      <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                      
                      <div className="relative z-10">
                        <div className={`relative w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                          <Icon className="w-8 h-8 text-white relative z-10" />
                        </div>
                        
                        <h3 className="text-2xl font-bold text-white mb-4">
                          {feature.title}
                        </h3>
                        
                        <p className="text-blue-100/70 mb-6 text-base leading-relaxed group-hover:text-blue-50 transition-colors duration-300">
                          {feature.description}
                        </p>
                        
                        <div className="flex items-center gap-3 pt-5 border-t border-white/10 transition-colors duration-300">
                          <div className="relative">
                            <div className={`w-2.5 h-2.5 bg-gradient-to-r ${feature.gradient} rounded-full`}></div>
                            <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-full animate-ping opacity-75`}></div>
                          </div>
                          <p className="text-sm font-bold text-white/80">
                            {feature.marketValue}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* Features Section - Modern Grid with Tilt Cards */}
      <section id="features" className="py-24 px-4 bg-background" data-testid="features-section">
        <div className="max-w-7xl mx-auto">
          <BlurFade delay={0.1}>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6" data-testid="features-title">
                <span className="text-foreground">Everything You Need </span>
                <GradientHeading gradient="from-[#3D52A0] via-[#7091E6] to-[#ADBBDA]">
                  in One Place
                </GradientHeading>
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                Powerful features to help you connect and grow professionally
              </p>
            </div>
          </BlurFade>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.08}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <StaggerItem key={index}>
                  <TiltCard
                    className="bg-card p-8 border border-border h-full overflow-hidden transition-colors duration-300 shadow-sm"
                    tiltAmount={8}
                    data-testid={`feature-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <div className="relative">
                      <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6 shadow-lg`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </TiltCard>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* Mission & Values Section */}
      <section id="about" className="py-24 px-4 bg-background relative overflow-hidden transition-colors duration-300" data-testid="mission-section">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:20px_20px] opacity-20"></div>
        
        <div className="max-w-4xl mx-auto relative">
          <BlurFade delay={0.1}>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                <span className="text-foreground">Our </span>
                <GradientHeading gradient="from-[#3D52A0] to-[#7091E6]">Mission</GradientHeading>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                To create a vibrant ecosystem where alumni can give back, students can learn and grow, 
                and recruiters can find exceptional talent. We're building more than just a platform – 
                we're nurturing a community that thrives on collaboration, mentorship, and mutual success.
              </p>
            </div>
          </BlurFade>

          {/* Values - Modern Cards with Hover Effect */}
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6" staggerDelay={0.15}>
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <StaggerItem key={index}>
                  <HoverCard
                    className="group bg-card p-8 rounded-2xl h-full border border-border transition-all duration-300 shadow-sm"
                    data-testid={`value-${value.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <div className="flex gap-5">
                      <div className="flex-shrink-0">
                        <div className={`w-14 h-14 bg-gradient-to-br ${value.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{value.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                      </div>
                    </div>
                  </HoverCard>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA Section - Stunning Gradient with Spotlight */}
      <section className="py-24 px-4 relative overflow-hidden" data-testid="cta-section">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#3D52A0] via-[#7091E6] to-[#ADBBDA]"></div>
        
        {/* Spotlight Effect */}
        <Spotlight className="top-0 left-1/3" fill="white" />
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s' }}></div>
        </div>
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        
        <BlurFade delay={0.2}>
          <div className="relative max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">Join 5,000+ Members</span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white" data-testid="cta-title">
              Join Our Community Today
            </h2>
            <p className="text-lg sm:text-xl text-blue-50 max-w-2xl mx-auto leading-relaxed">
              Be part of a network that's shaping the future of professional growth
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              {isAuthenticated ? (
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="h-14 text-base sm:text-lg px-8 py-4 bg-white text-primary hover:bg-blue-50 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  data-testid="cta-dashboard-btn"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => navigate('/register')}
                    className="h-14 text-base sm:text-lg px-8 py-4 bg-white text-primary hover:bg-blue-50 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    data-testid="cta-register-btn"
                  >
                    Create Free Account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    onClick={() => navigate('/login')}
                    className="h-14 text-base sm:text-lg px-8 py-4 bg-white text-primary hover:bg-blue-50 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    data-testid="cta-signin-btn"
                  >
                    Sign In
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </BlurFade>
      </section>

      <Footer />
    </div>
  );
};

export default Home;