/**
 * Built-in icon registry.
 *
 * Next.js resolves the imports below to hashed asset URLs at build time and
 * exposes each one as a `{ src, width, height }` (StaticImageData) object, so
 * every read must go through `toIconUrl` before hitting an <img src>.
 *
 * Each entry is either:
 *   { name, src }                        — single icon used in any theme
 *   { name, light, dark }                — separate variants per theme
 *
 * To add a new built-in icon:
 *   1. Drop the PNG/SVG into src/images/node_icons/
 *   2. Add an import + an entry in BUILT_IN_ICONS
 *   3. (Optional) Map a type key in TYPE_DEFAULT_ICON so that type starts
 *      using it automatically.
 */
import customBlack from './images/node_icons/custom-black.svg';
import customWhite from './images/node_icons/custom-white.svg';
import discordIcon from './images/node_icons/discord.png';
import emailBlack from './images/node_icons/email-black.png';
import emailWhite from './images/node_icons/email-white.png';
import facebookIcon from './images/node_icons/facebook.png';
import familyBlack from './images/node_icons/family-black.png';
import familyWhite from './images/node_icons/family-white.png';
import familyPersonDark from './images/node_icons/family-person-dark.png';
import familyPersonLight from './images/node_icons/family-person-light.png';
import googleIcon from './images/node_icons/google.png';
import instagramIcon from './images/node_icons/instagram.png';
import licensePlateBlack from './images/node_icons/license-plate-black.png';
import licensePlateWhite from './images/node_icons/license-plate-white.png';
import linkedinIcon from './images/node_icons/linkedin.png';
import locationBlack from './images/node_icons/location-black.png';
import locationWhite from './images/node_icons/location-white.png';
import nameBlack from './images/node_icons/name-black.svg';
import nameWhite from './images/node_icons/name-white.svg';
import phoneDark from './images/node_icons/phone-dark.png';
import phoneLight from './images/node_icons/phone-light.png';
import redditIcon from './images/node_icons/reddit.png';
import snapchatIcon from './images/node_icons/snapchat.png';
import spotifyIcon from './images/node_icons/spotify.png';
import telegramIcon from './images/node_icons/telegram.png';
import tiktokIcon from './images/node_icons/tik-tok.png';
import twitterBlack from './images/node_icons/twitter-black.png';
import twitterWhite from './images/node_icons/twitter-white.png';
import vehicleBlack from './images/node_icons/vehicle-black.png';
import vehicleWhite from './images/node_icons/vehicle-white.png';
import vinBlack from './images/node_icons/vin-black.png';
import vinWhite from './images/node_icons/vin-white.png';
import whatsappIcon from './images/node_icons/social.png';
import youtubeIcon from './images/node_icons/youtube.png';

export const BUILT_IN_ICONS = {
  instagram: { name: 'Instagram', src: instagramIcon },
  facebook: { name: 'Facebook', src: facebookIcon },
  // Icons with `light` and `dark` variants swap automatically based on the
  // current theme so the icon stays visible against the background.
  twitter: { name: 'X / Twitter', light: twitterBlack, dark: twitterWhite },
  youtube: { name: 'YouTube', src: youtubeIcon },
  tiktok: { name: 'TikTok', src: tiktokIcon },
  linkedin: { name: 'LinkedIn', src: linkedinIcon },
  snapchat: { name: 'Snapchat', src: snapchatIcon },
  reddit: { name: 'Reddit', src: redditIcon },
  discord: { name: 'Discord', src: discordIcon },
  telegram: { name: 'Telegram', src: telegramIcon },
  google: { name: 'Google', src: googleIcon },
  spotify: { name: 'Spotify', src: spotifyIcon },
  whatsapp: { name: 'WhatsApp', src: whatsappIcon },
  phone: { name: 'Phone', light: phoneDark, dark: phoneLight },
  email: { name: 'Email', light: emailBlack, dark: emailWhite },
  address: { name: 'Address', light: locationBlack, dark: locationWhite },
  name: { name: 'Name', light: nameBlack, dark: nameWhite },
  custom: { name: 'Custom', light: customBlack, dark: customWhite },
  family: { name: 'Family', light: familyBlack, dark: familyWhite },
  familyPerson: {
    name: 'Family (person)',
    light: familyPersonDark,
    dark: familyPersonLight,
  },
  vehicle: { name: 'Vehicle', light: vehicleBlack, dark: vehicleWhite },
  vin: { name: 'VIN', light: vinBlack, dark: vinWhite },
  licensePlate: {
    name: 'License plate',
    light: licensePlateBlack,
    dark: licensePlateWhite,
  },
};

/** When an identifier of this type has no `customIconId`, fall back to this built-in icon. */
export const TYPE_DEFAULT_ICON = {
  instagram: 'instagram',
  facebook: 'facebook',
  twitter: 'twitter',
  youtube: 'youtube',
  tiktok: 'tiktok',
  linkedin: 'linkedin',
  snapchat: 'snapchat',
  reddit: 'reddit',
  discord: 'discord',
  telegram: 'telegram',
  email: 'email',
  phone: 'phone',
  address: 'address',
  name: 'name',
  custom: 'custom',
  family: 'family',
  vehicle: 'vehicle',
  vin: 'vin',
  licensePlate: 'licensePlate',
};

/**
 * Normalise an imported image to a URL string. Next.js static image imports
 * are objects ({ src, width, height }); plain strings are returned as-is.
 */
function toIconUrl(value) {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && typeof value.src === 'string') {
    return value.src;
  }
  return null;
}

/**
 * Pick the right src for a built-in icon given the current theme.
 * Falls through gracefully if only one variant is defined.
 */
export function getBuiltInSrc(iconId, theme = 'dark') {
  const entry = BUILT_IN_ICONS[iconId];
  if (!entry) return null;
  if (entry.src) return toIconUrl(entry.src);
  if (theme === 'light') return toIconUrl(entry.light ?? entry.dark);
  return toIconUrl(entry.dark ?? entry.light);
}
