// Utility functions for the application

export const createPageUrl = (pageName) => {
  // Simple page URL creation - in a real app this might handle routing logic
  const pageMap = {
    'Homepage': '/',
    'About': '/About',
    'Gallery': '/Gallery',
    'Fundraising': '/Fundraising',
    'ReferKid': '/ReferKid',
    'AdminDashboard': '/AdminDashboard',
    'TestingDashboard': '/TestingDashboard',
    'ProductionChecklist': '/ProductionChecklist',
    'PrivacyPolicy': '/PrivacyPolicy',
    'TermsOfService': '/TermsOfService',
    'DonationSuccess': '/DonationSuccess'
  };
  
  return pageMap[pageName] || '/';
};