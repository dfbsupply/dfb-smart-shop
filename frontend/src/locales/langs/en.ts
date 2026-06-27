// English (default) storefront translations.
// Organized by area; new sections (catalog, product, cart, admin, buyer)
// can be appended here and mirrored in fil.ts as the rollout continues.

export const en = {
  nav: {
    home: 'Home',
    shop: 'Shop',
    visualSearch: 'Visual Search',
    about: 'About',
    contact: 'Contact',
    signIn: 'Sign In',
  },
  footer: {
    address: 'Felix Y. Manalo St., San Isidro, Cainta, Rizal · Serving since 2019',
    tagline: 'Custom glass & aluminum — windows, doors, shower enclosures, and more.',
    quickLinks: 'Quick Links',
    visitUs: 'Visit Us',
    hoursValue: 'Mon – Sat · 8:00 AM – 6:00 PM',
    rights: 'All rights reserved.',
    shop: 'Shop',
    visualSearch: 'Visual Search',
    aboutUs: 'About Us',
    contact: 'Contact',
    storeHours: 'Store Hours',
    disclaimer:
      'Prices are estimates based on your measurements and are confirmed by the shop upon order.',
  },
  search: {
    placeholder: 'Search products…',
    byPhoto: 'Search by photo',
  },
  language: {
    label: 'Language',
  },
  visualSearch: {
    tapToSearch: 'Tap the button to search',
    searchFromAlbum: 'Search from Album',
    choosePhoto: 'Choose a Photo',
    albumHint: 'Tap to discover matching items with image search.',
    cameraUnavailable: 'Camera unavailable. Use “Search from Album” below.',
    analyzing: 'Analyzing your image…',
    onDevice: 'Running on your device — this may take a moment.',
    resultsTitle: 'Image Search Results',
    matchedTo: 'Matched to: {{label}}',
    newSearch: 'New search',
    errorTitle: "Couldn't analyze that image right now.",
    noMatchTitle: "We couldn't confidently match that photo to our stock.",
    tryClearer: 'Try a clearer, well-lit photo with the item centered.',
    tryAnother: 'Try Another Photo',
    pageTitle: 'Find It With a Photo',
    pageSubtitle:
      "Don't know the name of a part? Upload or take a photo and we'll match it to items in our shop.",
    dropHere: 'Drop an image here, or click to upload',
    uploadPhoto: 'Upload Photo',
    takePhoto: 'Take a Photo',
    fileHint: 'JPG or PNG · Clear, well-lit photos work best.',
    relatedTo: 'We think this is related to:',
    matchingItems: 'Here are matching items from our shop:',
    browseCategory: 'Browse by category instead →',
    contactHelp: 'Contact the shop for help identifying this part →',
    pageDisclaimer:
      'Visual search identifies the general category of an item and links it to our inventory. For an exact match, our team can confirm the specific product.',
  },
  tour: {
    skip: 'Skip',
    back: 'Back',
    next: 'Next',
    gotIt: 'Got it',
    step: '{{current}} / {{total}}',
    welcomeTitle: 'Search by photo',
    welcomeBody:
      "Don't know what a part is called? Find it with a picture instead of words. Here's a quick tour.",
    captureTitle: 'Snap a photo',
    captureBody: 'Point your camera at the item and tap the shutter to search our stock instantly.',
    albumTitle: 'Or pick from your gallery',
    albumBody: "Already have a photo? Choose one from your device and we'll match it.",
    replayTitle: 'Replay anytime',
    replayBody: 'Tap here to watch this guide again whenever you need a refresher.',
  },
};

export type Translation = typeof en;
