import React from 'react';
import styled from '@emotion/styled';
import { Box, Container, Typography, IconButton } from '@mui/material';
import { 
  Home as HomeIcon,
  Search as SearchIcon,
  ShoppingCart as CartIcon,
  Person as PersonIcon,
  Chat as ChatIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import theme from '../../theme/theme';

// Moroccan Pattern SVG
const MoroccanPattern = () => (
  <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, opacity: 0.1 }}>
    <defs>
      <pattern id="moroccan-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M30,0 L35,10 L45,10 L35,20 L40,30 L30,25 L20,30 L25,20 L15,10 L25,10 Z" 
              fill={theme.colors.gold} 
              opacity="0.3"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#moroccan-pattern)" />
  </svg>
);

const HeaderContainer = styled(Box)`
  position: relative;
  background: ${theme.gradients.primary};
  color: white;
  padding: ${theme.spacing.lg} ${theme.spacing.md};
  border-radius: 0 0 ${theme.spacing.xl} ${theme.spacing.xl};
  overflow: hidden;
  box-shadow: ${theme.shadows.lg};
`;

const Logo = styled(Typography)`
  font-family: ${theme.fonts.arabic.display};
  font-size: ${theme.fontSizes['3xl']};
  font-weight: 700;
  text-align: center;
  color: ${theme.colors.gold};
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 2px;
  position: relative;
  z-index: 1;
`;

const IconGroup = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
  margin-top: ${theme.spacing.md};
`;

const StyledIconButton = styled(IconButton)`
  color: white;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const BottomNav = styled(Box)`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  padding: ${theme.spacing.md};
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 2px solid ${theme.colors.gold};
  z-index: ${theme.zIndex.drawer};
`;

const NavItem = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: ${theme.transitions.normal};
  
  &:active {
    transform: scale(0.95);
  }
`;

const NavIcon = styled(Box)`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.active ? theme.gradients.gold : 'transparent'};
  color: ${props => props.active ? 'white' : theme.colors.textSecondary};
  transition: ${theme.transitions.normal};
  
  svg {
    font-size: 24px;
  }
`;

const NavLabel = styled(Typography)`
  font-size: ${theme.fontSizes.xs};
  margin-top: ${theme.spacing.xs};
  color: ${props => props.active ? theme.colors.burgundy : theme.colors.textSecondary};
  font-weight: ${props => props.active ? 600 : 400};
`;

export const Header = ({ title = "المخور" }) => {
  const { t } = useTranslation();
  
  return (
    <HeaderContainer>
      <MoroccanPattern />
      <IconGroup>
        <StyledIconButton>
          <PersonIcon />
        </StyledIconButton>
        <Logo variant="h1">{title}</Logo>
        <StyledIconButton>
          <ChatIcon />
        </StyledIconButton>
      </IconGroup>
    </HeaderContainer>
  );
};

export const BottomNavigation = ({ active = 'home' }) => {
  const { t } = useTranslation();
  
  const navItems = [
    { id: 'home', icon: <HomeIcon />, label: t('nav.home') },
    { id: 'search', icon: <SearchIcon />, label: t('nav.search') },
    { id: 'orders', icon: <CartIcon />, label: t('nav.orders') },
    { id: 'profile', icon: <PersonIcon />, label: t('nav.profile') }
  ];
  
  return (
    <BottomNav>
      {navItems.map(item => (
        <NavItem key={item.id}>
          <NavIcon active={active === item.id}>
            {item.icon}
          </NavIcon>
          <NavLabel active={active === item.id}>
            {item.label}
          </NavLabel>
        </NavItem>
      ))}
    </BottomNav>
  );
};

export default Header;
