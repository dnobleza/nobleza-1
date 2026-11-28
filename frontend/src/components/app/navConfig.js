import { Globe, LayoutDashboard, LayoutGrid } from 'lucide-react';

// What the sidebar and top bar show for each role. Only list pages that exist.
export const clientNav = {
  root: { label: 'Home', to: '/' },
  startProject: false, // change to true when the /start page is built
  showHelp: true,
  showBell: true,
  badge: null,
  sections: [
    {
      label: 'Menu',
      items: [{ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
    },
  ],
};

export const adminNav = {
  root: { label: 'Admin', to: '/admin' },
  startProject: false,
  showHelp: false,
  showBell: false,
  badge: 'Admin',
  sections: [
    {
      label: 'Admin',
      items: [{ to: '/admin', label: 'Overview', icon: LayoutGrid }],
    },
    {
      label: 'Site',
      items: [{ to: '/', label: 'View landing page', icon: Globe }],
    },
  ],
};
