export const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatDateTime = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getRoleLabel = (role) => {
  const labels = {
    super_admin: 'Super Admin',
    admin_sportif: 'Admin Sportif',
    responsable_club: 'Responsable Club',
    arbitre: 'Arbitre',
    visiteur: 'Visiteur'
  };
  return labels[role] || role;
};

export const getRoleBadgeColor = (role) => {
  const colors = {
    super_admin: 'bg-purple-100 text-purple-800',
    admin_sportif: 'bg-blue-100 text-blue-800',
    responsable_club: 'bg-green-100 text-green-800',
    arbitre: 'bg-orange-100 text-orange-800',
    visiteur: 'bg-gray-100 text-gray-800'
  };
  return colors[role] || 'bg-gray-100 text-gray-800';
};

export const getInitials = (nom, prenom) => {
  if (!nom && !prenom) return 'U';
  const firstName = prenom ? prenom.charAt(0).toUpperCase() : '';
  const lastName = nom ? nom.charAt(0).toUpperCase() : '';
  return firstName + lastName || 'U';
};

export const getDashboardPath = (role) => {
  const paths = {
    super_admin: '/admin/dashboard',
    admin_sportif: '/sport/dashboard',
    responsable_club: '/club/dashboard',
    arbitre: '/arbitre/dashboard',
    visiteur: '/public/dashboard'
  };
  return paths[role] || '/public/dashboard';
};

export const getSidebarItems = (role) => {
  const allItems = [
    { 
      label: 'Dashboard', 
      icon: 'LayoutDashboard', 
      path: '/dashboard',
      roles: ['super_admin', 'admin_sportif', 'responsable_club', 'arbitre', 'visiteur']
    },
    {
      label: 'Administration',
      icon: 'Settings',
      path: '/admin',
      roles: ['super_admin']
    },
    {
      label: 'Utilisateurs',
      icon: 'Users',
      path: '/admin/users',
      roles: ['super_admin']
    },
    {
      label: 'Clubs',
      icon: 'Shirt',
      path: '/clubs',
      roles: ['super_admin', 'admin_sportif', 'responsable_club', 'visiteur']
    },
    {
      label: 'Joueurs',
      icon: 'User',
      path: '/joueurs',
      roles: ['super_admin', 'admin_sportif', 'responsable_club']
    },
    {
      label: 'Compétitions',
      icon: 'Trophy',
      path: '/competitions',
      roles: ['super_admin', 'admin_sportif', 'responsable_club', 'visiteur']
    },
    {
      label: 'Matchs',
      icon: 'Calendar',
      path: '/matchs',
      roles: ['super_admin', 'admin_sportif', 'responsable_club', 'arbitre', 'visiteur']
    },
    {
      label: 'Résultats',
      icon: 'Medal',
      path: '/resultats',
      roles: ['super_admin', 'admin_sportif', 'responsable_club', 'arbitre', 'visiteur']
    },
    {
      label: 'Classements',
      icon: 'BarChart3',
      path: '/classements',
      roles: ['super_admin', 'admin_sportif', 'responsable_club', 'visiteur']
    },
    {
      label: 'Trophées',
      icon: 'Award',
      path: '/trophees',
      roles: ['super_admin', 'admin_sportif', 'responsable_club', 'visiteur']
    },
    {
      label: 'Profil',
      icon: 'UserCircle',
      path: '/profile',
      roles: ['super_admin', 'admin_sportif', 'responsable_club', 'arbitre', 'visiteur']
    }
  ];

  return allItems.filter(item => item.roles.includes(role));
};