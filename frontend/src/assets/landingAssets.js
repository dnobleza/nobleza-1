// Every image the landing page uses lives in this one file.
//
// HOW TO SWAP AN IMAGE
// 1. Put the new file in src/assets/ (for example src/assets/landing/house.webp).
// 2. At the top, add:   import houseImage from './landing/house.webp';
// 3. Below, replace the `null` with the name:   heroHouse: houseImage,
// That is all. No component needs to change.
//
// A value of `null` means "no image yet". Every component checks for null
// and shows a fallback instead (an icon, or a branded placeholder card).

import pilandokWorking from './mascot/pilandok-working.webp';
import heroBackgroundImage from './landing/hero-background.webp';
import heroWideImage from './landing/hero-wide.webp';
import heroMobileImage from './landing/hero-mobile.webp';
import metalMarketLogo from './landing/metal-market-logo.webp';

const landingAssets = {
  // Separate hero mascot. null on purpose: Pilandok is already inside the hero images
  // (one mascot per viewport). Only used by the old fallback hero.
  heroMascot: null,
  // Finished hero scenes (Pilandok and the Codehaus building are part of the picture).
  // heroWide: 1792x768, used from 1280px up. heroMobile: 1200x976, used below 1280px.
  // If either is null, the hero falls back to the old look (heroBackground + HeroBackground.jsx).
  heroWide: heroWideImage,
  heroMobile: heroMobileImage,
  // Mascot on the left edge of the final call-to-action panel.
  ctaMascot: pilandokWorking,
  // Full illustrated hero background (sky, office house, skyline, hill, clouds).
  // Generated with Figma AI. While null, the hero uses the coded SVG scene.
  heroBackground: heroBackgroundImage,
  // Office/house picture behind the hero mascot. Not available yet.
  heroHouse: null,

  // Optional custom icons. While these are null, lucide-react icons are used.
  // Use the same keys as the list in each section component, for example
  // serviceIcons: { websiteDevelopment: websiteIcon }
  serviceIcons: null,
  featureIcons: null,

  // Project logos (512x512, transparent background). Shown on the dark panel of a project card.
  projectLogos: {
    metalMarket: metalMarketLogo,
  },

  // Project screenshots. While null, the card shows the logo panel instead.
  // If you set one, the screenshot replaces the logo on the card.
  projectImages: {
    gvnSafeStart: null,
    metalMarket: null,
  },
};

export default landingAssets;
