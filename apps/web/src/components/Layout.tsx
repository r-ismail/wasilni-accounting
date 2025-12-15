import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Divider,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Apartment as ApartmentIcon,
  Description as DescriptionIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  People as PeopleIcon,
  Speed as SpeedIcon,
  TrendingUp as TrendingUpIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Language as LanguageIcon,
  Business as BusinessIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

const drawerWidth = 260;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { t, i18n } = useTranslation();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [companyName, setCompanyName] = useState<string>('');

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const response = await api.get('/companies/my-company');
        if (response.data.success && response.data.data) {
          setCompanyName(response.data.data.name);
        }
      } catch (error) {
        console.error('Failed to fetch company info:', error);
      }
    };

    fetchCompanyInfo();
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
    document.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { text: t('nav.dashboard'), icon: <DashboardIcon />, path: '/' },
    { text: t('nav.units'), icon: <ApartmentIcon />, path: '/units' },
    { text: t('nav.contracts'), icon: <DescriptionIcon />, path: '/contracts' },
    { text: t('nav.invoices'), icon: <ReceiptIcon />, path: '/invoices' },
    { text: t('nav.payments'), icon: <PaymentIcon />, path: '/payments' },
    { text: t('nav.customers'), icon: <PeopleIcon />, path: '/customers' },
    { text: t('nav.meters'), icon: <SpeedIcon />, path: '/meters' },
    { text: t('nav.readings'), icon: <TrendingUpIcon />, path: '/readings' },
    { text: t('nav.notifications'), icon: <NotificationsIcon />, path: '/notifications' },
    { text: t('nav.settings'), icon: <SettingsIcon />, path: '/settings' },
  ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#f8f9fa' }}>
      {/* Logo and Company Name */}
      <Box sx={{ p: 3, bgcolor: 'primary.main', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: 'white', color: 'primary.main', width: 48, height: 48, mr: 2 }}>
            <BusinessIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {t('app.title')}
            </Typography>
            {companyName && (
              <Typography variant="caption" sx={{ opacity: 0.9, display: 'block', mt: 0.5 }}>
                {companyName}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      <Divider />

      {/* Navigation Menu */}
      <List sx={{ flexGrow: 1, px: 1, py: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  bgcolor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? 'white' : 'text.primary',
                  '&:hover': {
                    bgcolor: isActive ? 'primary.dark' : 'action.hover',
                  },
                  transition: 'all 0.2s',
                }}
              >
                <ListItemIcon sx={{ color: isActive ? 'white' : 'primary.main', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.95rem',
                    fontWeight: isActive ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* User Info */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, mr: 1.5, fontSize: '1rem' }}>
            {user?.username?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.username}
            </Typography>
            <Chip 
              label={user?.role || 'User'} 
              size="small" 
              sx={{ 
                height: 20, 
                fontSize: '0.7rem',
                bgcolor: 'primary.light',
                color: 'primary.contrastText',
              }} 
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: i18n.language === 'ar' ? 0 : { sm: `${drawerWidth}px` },
          mr: i18n.language === 'ar' ? { sm: `${drawerWidth}px` } : 0,
          bgcolor: 'white',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Page Title */}
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {menuItems.find(item => item.path === location.pathname)?.text || t('app.title')}
          </Typography>

          {/* Company Name Badge */}
          {companyName && (
            <Chip
              icon={<BusinessIcon />}
              label={companyName}
              sx={{ 
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                bgcolor: 'primary.light',
                color: 'primary.main',
                fontWeight: 600,
              }}
            />
          )}

          {/* Language Toggle */}
          <IconButton 
            color="inherit" 
            onClick={toggleLanguage}
            sx={{ 
              mr: 1,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <LanguageIcon />
          </IconButton>

          {/* Logout Button */}
          <Button
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ 
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            {t('auth.logout')}
          </Button>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          anchor={i18n.language === 'ar' ? 'right' : 'left'}
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              border: 'none',
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          anchor={i18n.language === 'ar' ? 'right' : 'left'}
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              border: 'none',
              borderRight: i18n.language === 'ar' ? 'none' : '1px solid',
              borderLeft: i18n.language === 'ar' ? '1px solid' : 'none',
              borderColor: 'divider',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          minHeight: '100vh',
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Box sx={{ mt: 2 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
