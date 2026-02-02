import React from 'react';
import styled from '@emotion/styled';
import { Box, Typography, IconButton } from '@mui/material';
import { 
  Favorite as FavoriteIcon, 
  FavoriteBorder as FavoriteBorderIcon,
  AddShoppingCart as AddCartIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import theme from '../../theme/theme';

// Ornamental Corner SVG
const OrnamentalCorner = ({ position = 'top-left' }) => (
  <svg 
    width="60" 
    height="60" 
    viewBox="0 0 60 60" 
    style={{
      position: 'absolute',
      [position.includes('top') ? 'top' : 'bottom']: 0,
      [position.includes('left') ? 'left' : 'right']: 0,
      opacity: 0.6
    }}
  >
    <path
      d="M0,0 Q15,0 25,10 Q35,20 40,35 Q45,50 60,60 L60,0 L0,0 Z"
      fill={theme.colors.gold}
      transform={
        position === 'top-left' ? '' :
        position === 'top-right' ? 'scale(-1, 1) translate(-60, 0)' :
        position === 'bottom-left' ? 'scale(1, -1) translate(0, -60)' :
        'scale(-1, -1) translate(-60, -60)'
      }
    />
  </svg>
);

const CardContainer = styled(Box)`
  position: relative;
  background: white;
  border-radius: ${theme.borderRadius.xl};
  overflow: hidden;
  box-shadow: ${theme.shadows.md};
  transition: ${theme.transitions.normal};
  border: 2px solid ${theme.colors.sand};
  
  &:hover {
    box-shadow: ${theme.shadows.xl};
    transform: translateY(-4px);
  }
`;

const ImageContainer = styled(Box)`
  position: relative;
  width: 100%;
  padding-top: 133%; /* 3:4 aspect ratio */
  background: ${theme.colors.cream};
  overflow: hidden;
`;

const StyledImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ImageOverlay = styled(Box)`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${theme.gradients.overlay};
  padding: ${theme.spacing.md};
  color: white;
`;

const FavoriteButton = styled(IconButton)`
  position: absolute;
  top: ${theme.spacing.sm};
  right: ${theme.spacing.sm};
  background: white;
  box-shadow: ${theme.shadows.md};
  z-index: 2;
  
  &:hover {
    background: ${theme.colors.cream};
  }
  
  svg {
    color: ${theme.colors.burgundy};
  }
`;

const ContentContainer = styled(Box)`
  padding: ${theme.spacing.md};
  position: relative;
`;

const Title = styled(Typography)`
  font-family: ${theme.fonts.arabic.heading};
  font-size: ${theme.fontSizes.lg};
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  margin-bottom: ${theme.spacing.sm};
  text-align: center;
`;

const PriceContainer = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin: ${theme.spacing.md} 0;
`;

const Price = styled(Typography)`
  font-size: ${theme.fontSizes['2xl']};
  font-weight: 700;
  color: ${theme.colors.gold};
  font-family: ${theme.fonts.arabic.heading};
`;

const Currency = styled(Typography)`
  font-size: ${theme.fontSizes.md};
  color: ${theme.colors.textSecondary};
`;

const Badge = styled(Box)`
  position: absolute;
  top: ${theme.spacing.md};
  left: ${theme.spacing.md};
  background: ${theme.colors.gold};
  color: white;
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.fontSizes.sm};
  font-weight: 600;
  box-shadow: ${theme.shadows.md};
  z-index: 2;
`;

const AddToCartButton = styled(Box)`
  background: ${theme.gradients.gold};
  color: white;
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  cursor: pointer;
  transition: ${theme.transitions.normal};
  font-weight: 600;
  box-shadow: ${theme.shadows.md};
  
  &:hover {
    box-shadow: ${theme.shadows.lg};
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const DesignCard = ({ 
  design,
  isFavorite = false,
  onFavoriteClick,
  onCardClick,
  onAddToCart,
  showBadge = false,
  badgeText = ''
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const title = design.title[i18n.language] || design.title.ar;
  const price = design.customerPrice?.basePrice || 0;
  
  return (
    <CardContainer onClick={onCardClick}>
      {/* Ornamental Corners */}
      <OrnamentalCorner position="top-left" />
      <OrnamentalCorner position="top-right" />
      <OrnamentalCorner position="bottom-left" />
      <OrnamentalCorner position="bottom-right" />
      
      {/* Image */}
      <ImageContainer>
        <StyledImage 
          src={design.images[0]?.url || '/placeholder-design.jpg'} 
          alt={title}
          loading="lazy"
        />
        
        {/* Badge */}
        {showBadge && badgeText && (
          <Badge>{badgeText}</Badge>
        )}
        
        {/* Favorite Button */}
        <FavoriteButton 
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteClick?.(design._id);
          }}
        >
          {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        </FavoriteButton>
      </ImageContainer>
      
      {/* Content */}
      <ContentContainer>
        <Title>{title}</Title>
        
        <PriceContainer>
          <Price>{price}</Price>
          <Currency>{t('common.currency')}</Currency>
        </PriceContainer>
        
        <AddToCartButton 
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart?.(design);
          }}
        >
          <AddCartIcon />
          <Typography>{t('design.addToCart')}</Typography>
        </AddToCartButton>
      </ContentContainer>
    </CardContainer>
  );
};

export default DesignCard;
