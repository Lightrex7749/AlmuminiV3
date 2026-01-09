import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/aceternity/sidebar";
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  MessageSquare,
  Settings,
  Award,
  UserCheck,
  Bell,
  Mail,
  FileText,
  Upload,
  Activity,
  BookOpen,
  ArrowLeft,
  LogOut
} from 'lucide-react';

const SidebarLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const studentLinks = [
    { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
    { label: 'My Profile', href: '/profile', icon: <UserCheck className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
    { label: 'Find Mentors', href: '/mentorship/find', icon: <Users className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
    { label: 'Browse Jobs', href: '/jobs', icon: <Briefcase className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
    { label: 'Events', href: '/events', icon: <Calendar className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
    { label: 'Forum', href: '/forum', icon: <MessageSquare className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
    { label: 'Settings', href: '/settings', icon: <Settings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
  ];

  const alumniLinks = [
    { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
    { label: 'My Profile', href: '/profile', icon: <UserCheck className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
    { label: 'Mentorship', href: '/mentorship/dashboard', icon: <Users className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
    { label: 'Mentor Management', href: '/mentorship/manage', icon: <Users className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
    { label: 'Post Jobs', href: '/jobs/post', icon: <Briefcase className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
    { label: 'Events', href: '/events', icon: <Calendar className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
    { label: 'Forum', href: '/forum', icon: <MessageSquare className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
    { label: 'Leaderboard', href: '/leaderboard', icon: <Award className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
    { label: 'Settings', href: '/settings', icon: <Settings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
  ];

  const recruiterLinks = [
    { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
    { label: 'Post Job', href: '/jobs/post', icon: <Briefcase className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
    { label: 'Manage Jobs', href: '/jobs/manage', icon: <Briefcase className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
    { label: 'Browse Alumni', href: '/directory', icon: <Users className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
    { label: 'Settings', href: '/settings', icon: <Settings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
  ];

  const adminLinks = [
    { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
    { label: 'User Management', href: '/admin/users', icon: <Users className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
    { label: 'Verifications', href: '/admin/verifications', icon: <UserCheck className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
    { label: 'Content Moderation', href: '/admin/moderation', icon: <MessageSquare className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
    { label: 'Jobs Management', href: '/admin/jobs', icon: <Briefcase className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
    { label: 'Events Management', href: '/admin/events', icon: <Calendar className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
    { label: 'Mentorship Management', href: '/admin/mentorship', icon: <Users className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
    { label: 'Badge Management', href: '/admin/badges', icon: <Award className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
    { label: 'Knowledge Capsules', href: '/admin/knowledge-capsules', icon: <BookOpen className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
    { label: 'Email Queue', href: '/admin/email-queue', icon: <Mail className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
    { label: 'Notifications', href: '/admin/notifications', icon: <Bell className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
    { label: 'Audit Logs', href: '/admin/audit-logs', icon: <FileText className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
    { label: 'File Uploads', href: '/admin/file-uploads', icon: <Upload className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
    { label: 'Analytics', href: '/admin/analytics', icon: <Activity className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
    { label: 'Settings', href: '/admin/settings', icon: <Settings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
  ];

  const getLinks = () => {
    switch (user?.role) {
      case 'student':
        return studentLinks;
      case 'alumni':
        return alumniLinks;
      case 'recruiter':
        return recruiterLinks;
      case 'admin':
        return adminLinks;
      default:
        return studentLinks;
    }
  };

  const links = getLinks();

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-col flex-1 no-visible-scrollbar overflow-y-auto overflow-x-hidden">
          {open ? <Logo /> : <LogoIcon />}
          <div className="mt-8 flex flex-col gap-2">
            {links.map((link, idx) => (
              <SidebarLink 
                key={idx} 
                link={link}
                onClick={() => setOpen(false)}
                className={cn(
                  "transition-all duration-200",
                  isActive(link.href) 
                    ? "bg-primary/10 text-primary font-bold border-l-4 border-primary rounded-r-xl mx-2 pl-4 shadow-sm" 
                    : "text-muted-foreground hover:bg-muted/50 hover:pl-3 hover:text-foreground"
                )}
              />
            ))}
          </div>
        </div>
        <div>
          <SidebarLink
            link={{
              label: "Back to Home",
              href: "/",
              icon: (
                <ArrowLeft className="text-muted-foreground h-5 w-5 flex-shrink-0" />
              ),
            }}
          />
          <div className="cursor-pointer mt-2" onClick={logout}>
             <SidebarLink
              link={{
                label: "Logout",
                href: "#",
                icon: (
                  <LogOut className="text-muted-foreground h-5 w-5 flex-shrink-0" />
                ),
              }}
            />
          </div>
        </div>
      </SidebarBody>
    </Sidebar>
  );
};

export const Logo = () => {
  return (
    <Link
      to="/"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 rounded-lg flex-shrink-0" />
      <span className="font-medium text-foreground whitespace-pre">
        AlumUnity
      </span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      to="/"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 rounded-lg flex-shrink-0" />
    </Link>
  );
};

export default React.memo(SidebarLayout);
