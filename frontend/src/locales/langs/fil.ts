import type { Translation } from './en';

// Filipino (Tagalog) translations. Typed against the English dictionary so
// missing/renamed keys surface as TypeScript errors.

export const fil: Translation = {
  nav: {
    home: 'Home',
    shop: 'Tindahan',
    visualSearch: 'Hanap sa Larawan',
    about: 'Tungkol',
    contact: 'Kontak',
    signIn: 'Mag-sign In',
  },
  footer: {
    address: 'Felix Y. Manalo St., San Isidro, Cainta, Rizal · Naglilingkod simula 2019',
    shop: 'Tindahan',
    visualSearch: 'Hanap sa Larawan',
    aboutUs: 'Tungkol Sa Amin',
    contact: 'Makipag-ugnayan',
    storeHours: 'Oras ng Tindahan',
    disclaimer:
      'Ang mga presyo ay tantya batay sa iyong sukat at kinukumpirma ng tindahan kapag nag-order.',
  },
  search: {
    placeholder: 'Maghanap ng produkto…',
    byPhoto: 'Maghanap gamit ang larawan',
  },
  language: {
    label: 'Wika',
  },
  visualSearch: {
    tapToSearch: 'I-tap ang button para maghanap',
    searchFromAlbum: 'Maghanap mula sa Album',
    choosePhoto: 'Pumili ng Larawan',
    albumHint: 'I-tap para matuklasan ang mga katugmang item gamit ang image search.',
    cameraUnavailable: 'Hindi available ang camera. Gamitin ang “Maghanap mula sa Album” sa ibaba.',
    analyzing: 'Sinusuri ang iyong larawan…',
    onDevice: 'Tumatakbo sa iyong device — maaaring tumagal ng ilang sandali.',
    resultsTitle: 'Resulta ng Image Search',
    matchedTo: 'Itinugma sa: {{label}}',
    newSearch: 'Bagong hanap',
    errorTitle: 'Hindi masuri ang larawan sa ngayon.',
    noMatchTitle: 'Hindi namin tiyak na maitugma ang larawan sa aming stock.',
    tryClearer: 'Subukan ang mas malinaw at maliwanag na larawan na nakasentro ang item.',
    tryAnother: 'Subukan ang Ibang Larawan',
    pageTitle: 'Hanapin Gamit ang Larawan',
    pageSubtitle:
      'Hindi alam ang pangalan ng parte? Mag-upload o kumuha ng larawan at itutugma namin ito sa mga item sa aming tindahan.',
    dropHere: 'Mag-drop ng larawan dito, o i-click para mag-upload',
    uploadPhoto: 'Mag-upload ng Larawan',
    takePhoto: 'Kumuha ng Larawan',
    fileHint: 'JPG o PNG · Mas maganda ang malinaw at maliwanag na larawan.',
    relatedTo: 'Sa tingin namin ay kaugnay ito ng:',
    matchingItems: 'Narito ang mga katugmang item mula sa aming tindahan:',
    browseCategory: 'Mag-browse na lang ayon sa kategorya →',
    contactHelp: 'Makipag-ugnayan sa tindahan para matulungan kayong tukuyin ang parteng ito →',
    pageDisclaimer:
      'Tinutukoy ng visual search ang pangkalahatang kategorya ng item at ikinokonekta ito sa aming imbentaryo. Para sa eksaktong tugma, makukumpirma ng aming team ang partikular na produkto.',
  },
  tour: {
    skip: 'Laktawan',
    back: 'Bumalik',
    next: 'Susunod',
    gotIt: 'Nakuha ko',
    step: '{{current}} / {{total}}',
    welcomeTitle: 'Maghanap gamit ang larawan',
    welcomeBody:
      'Hindi alam ang tawag sa parte? Hanapin ito gamit ang larawan sa halip na salita. Narito ang mabilis na tour.',
    captureTitle: 'Kumuha ng larawan',
    captureBody: 'Itutok ang camera sa item at i-tap ang shutter para agad maghanap sa aming stock.',
    albumTitle: 'O pumili mula sa iyong gallery',
    albumBody: 'May larawan na? Pumili mula sa iyong device at itutugma namin ito.',
    replayTitle: 'Ulitin kahit kailan',
    replayBody: 'I-tap dito para panoorin ulit ang gabay na ito kapag kailangan mo.',
  },
};
