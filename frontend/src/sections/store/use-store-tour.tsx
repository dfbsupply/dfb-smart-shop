import type { DriveStep } from 'driver.js';

import { useEffect, useCallback } from 'react';

import { useRouter, usePathname } from 'src/routes/hooks';

// ----------------------------------------------------------------------
// Webshop onboarding tours (spotlight coach-marks via driver.js). Each page
// with a tour auto-runs once on first visit and can be replayed from the
// header's "Take a tour" button. driver.js is lazy-loaded.
// ----------------------------------------------------------------------

const REQUEST_KEY = 'dfb-store-tour-request'; // stores the pathname to auto-run

const SHOP_STEPS: DriveStep[] = [
  {
    popover: {
      title: 'Welcome to DFB Smart Shop 👋',
      description:
        "Here's a quick 20-second tour of how to find parts and get an instant price.",
    },
  },
  {
    element: '[data-tour="browse"]',
    popover: {
      title: 'Browse the catalog',
      description: 'See all glass, aluminum profiles, hardware, and screens.',
    },
  },
  {
    element: '[data-tour="visual-search"]',
    popover: {
      title: 'Snap & Search',
      description:
        "Don't know the part's name? Take or upload a photo and our AI matches it to our stock.",
    },
  },
  {
    element: '[data-tour="quote"]',
    popover: {
      title: 'Instant quote',
      description: 'Enter the width and height of your custom size to get a price in seconds.',
    },
  },
  {
    element: '[data-tour="cart"]',
    popover: {
      title: 'Cart & order',
      description:
        'Your computed prices carry here. Checkout sends your order to the shop — no online payment, they contact you to confirm.',
      side: 'left',
    },
  },
];

const VISUAL_SEARCH_STEPS: DriveStep[] = [
  {
    popover: {
      title: 'Find it with a photo 📷',
      description:
        "Don't know what a part is called? Show us a photo and we'll match it to items we stock.",
    },
  },
  {
    element: '[data-tour="vs-camera"]',
    popover: {
      title: 'Use your camera',
      description: 'Point your camera at the item and tap to search in real time.',
    },
  },
  {
    element: '[data-tour="vs-upload"]',
    popover: {
      title: 'Or upload a photo',
      description: 'Pick a clear, well-lit photo from your device instead.',
    },
  },
  {
    popover: {
      title: 'Then size & order',
      description:
        'Pick a match, enter your width & height for an instant price, and place your order — your photo goes to the shop so they can confirm the exact part.',
    },
  },
];

const TOURS: Record<string, { seenKey: string; steps: DriveStep[] }> = {
  '/': { seenKey: 'dfb-store-tour-seen', steps: SHOP_STEPS },
  '/visual-search': { seenKey: 'dfb-vs-tour-seen', steps: VISUAL_SEARCH_STEPS },
};

async function runTour(steps: DriveStep[], seenKey: string) {
  const { driver } = await import('driver.js');
  await import('driver.js/dist/driver.css');

  const tour = driver({
    showProgress: true,
    nextBtnText: 'Next',
    prevBtnText: 'Back',
    doneBtnText: 'Got it',
    // Skip any step whose target isn't currently on the page.
    steps: steps.filter(
      (s) => typeof s.element !== 'string' || document.querySelector(s.element)
    ),
  });
  tour.drive();
  localStorage.setItem(seenKey, '1');
}

export function useStoreTour() {
  const router = useRouter();
  const pathname = usePathname();

  // Auto-start on first visit to a page that has a tour, or when a replay was
  // requested for this page from elsewhere.
  useEffect(() => {
    const tour = TOURS[pathname];
    if (!tour) return undefined;

    const requested = sessionStorage.getItem(REQUEST_KEY) === pathname;
    const firstTime = !localStorage.getItem(tour.seenKey);
    if (!requested && !firstTime) return undefined;

    const timer = setTimeout(() => {
      sessionStorage.removeItem(REQUEST_KEY);
      runTour(tour.steps, tour.seenKey);
    }, 600);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Replay handler for the header button: run the current page's tour if it has
  // one, otherwise go to the home tour.
  const startTour = useCallback(() => {
    const tour = TOURS[pathname];
    if (tour) {
      runTour(tour.steps, tour.seenKey);
    } else {
      sessionStorage.setItem(REQUEST_KEY, '/');
      router.push('/');
    }
  }, [pathname, router]);

  return { startTour };
}
