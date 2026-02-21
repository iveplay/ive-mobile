/**
 * Ad blocking filter lists.
 *
 * Edit these arrays to add/remove filters. Both are used by the adblock
 * injected JS modules — CSS_SELECTORS for element hiding (early injection)
 * and AD_DOMAINS for script/iframe/popup blocking (both phases).
 *
 * CSS selectors: any valid CSS selector that matches ad elements.
 * Ad domains: bare domains — matched with endsWith so "doubleclick.net"
 * also catches "ad.doubleclick.net".
 */

// --- CSS element hiding selectors ---
// These get joined into a single stylesheet rule with display:none
export const CSS_SELECTORS = [
  // Google Ads
  'ins.adsbygoogle',
  '[id^="google_ads"]',
  '[id^="div-gpt-ad"]',
  '[id^="google_ad"]',
  'iframe[src*="googlesyndication.com"]',
  'iframe[src*="doubleclick.net"]',
  'iframe[src*="googleadservices.com"]',

  // Generic ad containers (id-based)
  '[id*="ad-container"]',
  '[id*="ad_container"]',
  '[id*="ad-wrapper"]',
  '[id*="ad_wrapper"]',
  '[id*="ad-banner"]',
  '[id*="ad_banner"]',
  '[id*="adBanner"]',
  '[id*="ad-slot"]',
  '[id*="ad_slot"]',
  '[id*="adSlot"]',
  '[id*="ad-unit"]',
  '[id*="ad_unit"]',
  '[id*="ad-overlay"]',
  '[id*="ad_overlay"]',
  '[id*="ad-popup"]',
  '[id*="ad_popup"]',
  '[id*="adbox"]',
  '[id*="adBox"]',

  // Generic ad containers (class-based)
  '[class*="ad-container"]',
  '[class*="ad_container"]',
  '[class*="ad-wrapper"]',
  '[class*="ad_wrapper"]',
  '[class*="ad-banner"]',
  '[class*="ad_banner"]',
  '[class*="adBanner"]',
  '[class*="ad-slot"]',
  '[class*="ad_slot"]',
  '[class*="ad-unit"]',
  '[class*="ad_unit"]',
  '[class*="ad-overlay"]',
  '[class*="ad_overlay"]',
  '[class*="ad-popup"]',
  '[class*="ad_popup"]',
  '[class*="adbox"]',
  '[class*="adBox"]',
  '.ad-placement',
  '.ad-leaderboard',
  '.ad-skyscraper',
  '.ad-rectangle',
  '.ad-interstitial',

  // Data attribute ads
  '[data-ad]',
  '[data-ad-slot]',
  '[data-ad-client]',
  '[data-ad-unit]',
  '[data-adzone]',
  '[data-ad-manager]',

  // Common ad network elements
  '.ads-banner',
  '.ads-container',
  '.adsbox',
  '.ad-block',
  '.adbanner',
  '.advert',
  '.advertisement',
  '.advertisment',
  '.advertising',

  // Popup/overlay containers
  '.popup-container',
  '.popup-overlay',
  '.popup-wrapper',
  '.popunder',
  '.pop-up-overlay',
  '.interstitial-ad',
  '.interstitial-overlay',
  '.modal-ad',

  // Sticky ad bars
  '.sticky-ad',
  '.sticky-ads',
  '.sticky-banner',
  '.floating-ad',
  '.fixed-ad',
  '.bottom-ad',
  '.top-ad',

  // Common ad iframes
  'iframe[src*="popads.net"]',
  'iframe[src*="popcash.net"]',
  'iframe[src*="propellerads.com"]',
  'iframe[src*="juicyads.com"]',
  'iframe[src*="exoclick.com"]',
  'iframe[src*="trafficjunky.com"]',
  'iframe[src*="trafficstars.com"]',
  'iframe[src*="adskeeper.com"]',
  'iframe[src*="adsterra.com"]',
  'iframe[src*="clickadu.com"]',
  'iframe[src*="hilltopads.com"]',
  'iframe[src*="ads.yahoo.com"]',
  'iframe[src*="amazon-adsystem.com"]',
  'iframe[src*="advertising.com"]',

  // Streaming/video site ads
  '.video-ad',
  '.video-ads',
  '.video-ad-overlay',
  '.player-ad',
  '.pre-roll-ad',
  '.vast-ad',

  // Cookie/consent banners
  '.cookie-banner',
  '.cookie-consent',
  '.cookie-notice',
  '.cookies-banner',
  '.consent-banner',
  '.consent-overlay',
  '#cookie-banner',
  '#cookie-consent',
  '#cookie-notice',
  '#consent-banner',
  '[class*="cookie-banner"]',
  '[class*="cookie-consent"]',
  '[class*="consent-banner"]',
  '[id*="cookie-banner"]',
  '[id*="cookie-consent"]',
  '[id*="consent-banner"]',
  '[class*="gdpr"]',
  '[id*="gdpr"]',
  '[class*="CookieConsent"]',
  '[id*="CookieConsent"]',

  // Social/tracking widgets
  '[class*="social-share-popup"]',
  '.newsletter-popup',
  '.email-popup',
  '.subscribe-popup',
  '[class*="newsletter-overlay"]',
  '[class*="subscribe-overlay"]',

  // Anti-adblock overlays
  '[class*="adblock-notice"]',
  '[class*="adblock-overlay"]',
  '[class*="adblock-modal"]',
  '[id*="adblock-notice"]',
  '[id*="adblock-overlay"]',
  '[id*="adblock-modal"]',

  // Push notification prompts
  '[class*="push-notification"]',
  '[class*="notification-popup"]',
  '[id*="push-notification"]',
  '[class*="onesignal"]',
  '#onesignal-bell-container',
  '#onesignal-popover-container',

  // Common "click to continue" overlays
  '[class*="click-overlay"]',
  '[class*="clickOverlay"]',
]

// --- Known ad/tracking domains ---
// Used for script blocking, iframe removal, popup blocking, and link sanitization.
// Matched with endsWith so "doubleclick.net" catches "ad.doubleclick.net" too.
export const AD_DOMAINS = [
  'googlesyndication.com',
  'doubleclick.net',
  'googleadservices.com',
  'adservice.google.com',
  'pagead2.googlesyndication.com',
  'amazon-adsystem.com',
  'ads-twitter.com',
  'ads.yahoo.com',
  'advertising.com',
  'popads.net',
  'popcash.net',
  'propellerads.com',
  'juicyads.com',
  'exoclick.com',
  'trafficjunky.com',
  'trafficstars.com',
  'adskeeper.com',
  'adsterra.com',
  'clickadu.com',
  'hilltopads.com',
  'a-ads.com',
  'adcash.com',
  'admaven.com',
  'bidvertiser.com',
  'revcontent.com',
  'taboola.com',
  'outbrain.com',
  'mgid.com',
  'zergnet.com',
  'adblade.com',
  'adroll.com',
  'criteo.com',
  'facebook.com/tr',
  'connect.facebook.net/en_US/fbevents',
  'mc.yandex.ru',
  'moatads.com',
  'serving-sys.com',
  'smartadserver.com',
  'rubiconproject.com',
  'pubmatic.com',
  'openx.net',
  'casalemedia.com',
  'indexexchange.com',
  'spotxchange.com',
  'contextweb.com',
]
