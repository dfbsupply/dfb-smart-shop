import type { Product } from 'src/data/types';
import type { MobileNet } from '@tensorflow-models/mobilenet';

// ----------------------------------------------------------------------
// AI visual search (Objective 2) — TensorFlow.js + MobileNet, client-side.
//
// MobileNet returns *general* ImageNet categories (e.g. "window screen",
// "sliding door", "mirror"). Those don't map directly to SKUs, and ImageNet
// labels almost never contain shop words like "glass" or "aluminum". So we
// bridge them in two steps:
//   1. translate each generic label to the shop's vocabulary via LABEL_BRIDGE,
//   2. score products by how many bridged words hit their admin-set Visual
//      Search Keywords / name / category (see Admin A-6).
// This is the "bridge" described in the manuscript's Data Flow & AI Logic
// section. The model + matching run entirely in the browser.
// ----------------------------------------------------------------------

export type Prediction = { label: string; score: number };

// Maps substrings of MobileNet/ImageNet labels onto catalogue concept words.
// Keep keys lowercase; the longest useful match wins by virtue of adding more
// concept hits. Extend this as the catalogue grows.
const LABEL_BRIDGE: { match: string; concepts: string[] }[] = [
  { match: 'window screen', concepts: ['screen', 'window', 'mesh', 'insect'] },
  { match: 'mosquito net', concepts: ['screen', 'mesh', 'window', 'mosquito'] },
  { match: 'window shade', concepts: ['window', 'screen'] },
  { match: 'shoji', concepts: ['door', 'sliding', 'window', 'frame', 'glass'] },
  { match: 'sliding door', concepts: ['door', 'sliding', 'aluminum', 'frame', 'profile'] },
  { match: 'patio', concepts: ['door', 'sliding', 'aluminum'] },
  { match: 'greenhouse', concepts: ['glass', 'frame', 'window'] },
  { match: 'mirror', concepts: ['glass', 'mirror'] },
  { match: 'glass', concepts: ['glass'] },
  { match: 'pane', concepts: ['glass', 'window'] },
  { match: 'pole', concepts: ['aluminum', 'profile', 'metal'] },
  { match: 'bannister', concepts: ['aluminum', 'profile', 'metal', 'frame'] },
  { match: 'padlock', concepts: ['lock', 'hardware'] },
  { match: 'lock', concepts: ['lock', 'hardware'] },
  { match: 'latch', concepts: ['lock', 'hardware'] },
  { match: 'knob', concepts: ['handle', 'hardware', 'door'] },
  { match: 'handle', concepts: ['handle', 'hardware'] },
  { match: 'hook', concepts: ['hardware', 'accessory'] },
  { match: 'screw', concepts: ['hardware', 'accessory'] },
  { match: 'hinge', concepts: ['hardware', 'door'] },
  { match: 'door', concepts: ['door', 'frame', 'aluminum'] },
  { match: 'frame', concepts: ['frame', 'aluminum', 'profile'] },
  { match: 'screen', concepts: ['screen', 'mesh'] },
];

// Turn raw predictions into the set of catalogue words to search for: the
// label's own words plus any bridged concepts.
function bridgeLabels(predictions: Prediction[]): string[] {
  const words = new Set<string>();
  for (const { label } of predictions) {
    const lower = label.toLowerCase();
    lower
      .split(/[\s,]+/)
      .filter((w) => w.length >= 3)
      .forEach((w) => words.add(w));
    for (const { match, concepts } of LABEL_BRIDGE) {
      if (lower.includes(match)) concepts.forEach((c) => words.add(c));
    }
  }
  return [...words];
}

/**
 * Bridge MobileNet predictions to catalog products by matching the bridged
 * label words against each product's keywords / name / category.
 */
export function matchProductsByLabels(
  predictions: Prediction[],
  products: Product[]
): Product[] {
  const words = bridgeLabels(predictions);

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
// needs internet — consistent with the app's online (Supabase) requirement.
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
