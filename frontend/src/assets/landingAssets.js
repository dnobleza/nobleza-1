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
import pilandokWelcome from './mascot/pilandok-welcome.webp';

const landingAssets = {
  // Big mascot in the hero (right side).
  heroMascot: pilandokWorking,
  // Mascot on the left edge of the final call-to-action panel.
  ctaMascot: pilandokWelcome,
  // Office/house picture behind the hero mascot. Not available yet.
  heroHouse: null,

  // Optional custom icons. While these are null, lucide-react icons are used.
  // Use the same keys as the list in each section component, for example
  // serviceIcons: { websiteDevelopment: websiteIcon }
  serviceIcons: null,
  featureIcons: null,

  // Project screenshots. While null, the card shows a branded placeholder.
  projectImages: {
    gvnSafeStart: null,
    metalMarket: null,
  },
};

export default landingAssets;
