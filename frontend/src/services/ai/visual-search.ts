import type { Product } from 'src/data/types';
import type { MobileNet } from '@tensorflow-models/mobilenet';

import { PRODUCTS } from 'src/data/mock';

// ----------------------------------------------------------------------
// AI visual search (Objective 2) — TensorFlow.js + MobileNet, client-side.
//
// MobileNet returns *general* image categories (e.g. "window screen",
// "picture frame"). Those don't map directly to SKUs, so we bridge the
// general labels to real products using the admin-set Visual Search Keywords
// on each product (see Admin A-6). This is the "bridge" described in the
// manuscript's Data Flow & AI Logic section.
//
// To make it live:
//   1. `yarn add @tensorflow/tfjs @tensorflow-models/mobilenet`.
//   2. Load the model once (see classifyImage below).
//   3. Feed predictions into matchProductsByLabels().
// ----------------------------------------------------------------------

export type Prediction = { label: string; score: number };

/**
 * Bridge MobileNet predictions to catalog products by matching prediction
 * words against each product's admin-defined keywords/name/category.
 */
export function matchProductsByLabels(
  predictions: Prediction[],
  products: Product[] = PRODUCTS
): Product[] {
  const words = predictions
    .flatMap((p) => p.label.toLowerCase().split(/[\s,]+/))
    .filter(Boolean);

  const scored = products
    .map((product) => {
      const haystack = [product.name, product.category, ...product.keywords]
        .join(' ')
        .toLowerCase();
      const score = words.reduce((acc, word) => (haystack.includes(word) ? acc + 1 : acc), 0);
      return { product, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.map((entry) => entry.product);
}

// MobileNet is loaded lazily on first use (heavy) and cached for the session.
// The model weights are fetched from Google's CDN at runtime, so the browser
// needs internet — consistent with the app's Firebase requirement.
let modelPromise: Promise<MobileNet> | null = null;

async function loadModel() {
  if (!modelPromise) {
    modelPromise = (async () => {
      await import('@tensorflow/tfjs');
      const mobilenet = await import('@tensorflow-models/mobilenet');
      return mobilenet.load();
    })();
  }
  return modelPromise;
}

/**
 * Classify an image element with MobileNet (client-side, Objective 2).
 */
export async function classifyImage(image: HTMLImageElement): Promise<Prediction[]> {
  const model = await loadModel();
  const predictions = await model.classify(image);
  return predictions.map((p) => ({ label: p.className, score: p.probability }));
}
