import { motion } from 'framer-motion';
import MainNavbar from '@/components/layout/MainNavbar';
import Footer from '@/components/layout/Footer';
import { Users, Target, Heart, Award, Briefcase, Calendar, MessageSquare, TrendingUp } from 'lucide-react';
import { BlurFade, Spotlight, BorderBeam, GlowBorderCard, ShineButton, StaggerContainer, StaggerItem, TiltCard } from '@/components/ui/aceternity';

const About = () => {
  const stats = [
    { label: 'Active Alumni', value: '5,000+', icon: Users },
    { label: 'Success Stories', value: '1,200+', icon: Award },
    { label: 'Job Placements', value: '800+', icon: Briefcase },
    { label: 'Events Hosted', value: '200+', icon: Calendar },
  ];

  const values = [
    {
      icon: Users,
      title: 'Community First',
      description: 'We believe in the power of community and fostering meaningful connections between alumni, students, and recruiters.',
    },
    {
      icon: Target,
      title: 'Career Growth',
      description: 'Empowering members to achieve their professional goals through mentorship, job opportunities, and skill development.',
    },
    {
      icon: Heart,
      title: 'Give Back',
      description: 'Encouraging alumni to share their knowledge and experiences with the next generation of professionals.',
    },
    {
      icon: TrendingUp,
      title: 'Continuous Learning',
      description: 'Providing access to resources, events, and knowledge that help our community stay ahead in their careers.',
    },
  ];

  const features = [
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
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <MainNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-950 text-white py-20 px-4">
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
        
        {/* Animated gradient orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        <BlurFade delay={0.2}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 max-w-4xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="about-title">
              About AlumUnity
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed" data-testid="about-description">
              Connecting alumni, students, and recruiters to build a thriving professional community.
              We're on a mission to help every member achieve their career goals through meaningful connections.
            </p>
          </motion.div>
        </BlurFade>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <StaggerItem key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center"
                    data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full mb-4">
                      <Icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{stat.value}</div>
                    <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
                  </motion.div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <BlurFade delay={0.3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                To create a vibrant ecosystem where alumni can give back, students can learn and grow, 
                and recruiters can find exceptional talent. We're building more than just a platform – 
                we're nurturing a community that thrives on collaboration, mentorship, and mutual success.
              </p>
            </motion.div>
          </BlurFade>

          {/* Values */}
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <StaggerItem key={index}>
                  <TiltCard>
                    <motion.div
                      initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800"
                      data-testid={`value-${value.title.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                          <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{value.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400">{value.description}</p>
                      </div>
                    </motion.div>
                  </TiltCard>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <BlurFade delay={0.2}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">What We Offer</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Comprehensive tools and features to support your professional journey
              </p>
            </motion.div>
          </BlurFade>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <StaggerItem key={index}>
                  <GlowBorderCard>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="relative bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow h-full"
                      data-testid={`feature-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <BorderBeam size={100} duration={12} delay={index * 2} />
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">{feature.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                    </motion.div>
                  </GlowBorderCard>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-20 px-4 bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-950 text-white">
        {/* Animated gradient orbs */}
        <div className="absolute top-10 right-20 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 left-20 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
        
        <BlurFade delay={0.3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative z-10 max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Join Our Community Today</h2>
            <p className="text-xl text-blue-100 mb-8">
              Be part of a network that's shaping the future of professional growth
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <ShineButton>
                <a
                  href="/register"
                  className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-blue-600 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Get Started Free
                </a>
              </ShineButton>
              <a
                href="/login"
                className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-white border-2 border-white rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
              >
                Sign In
              </a>
            </div>
          </motion.div>
        </BlurFade>
      </section>

      <Footer />
    </div>
  );
};

export default About;
