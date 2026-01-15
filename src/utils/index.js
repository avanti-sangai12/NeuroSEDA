export const createPageUrl = (pageName) => {
  const pageMap = {
    'Dashboard': '/dashboard',
    'Workflows': '/workflows',
    'Analytics': '/analytics',
    'Settings': '/settings'
  };
  
  return pageMap[pageName] || '/';
};
