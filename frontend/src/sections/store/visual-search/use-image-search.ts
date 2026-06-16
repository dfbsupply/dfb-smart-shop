import type { Product } from 'src/data/types';
import type { Prediction } from 'src/services/ai';

import { useState, useCallback } from 'react';

import { PRODUCTS } from 'src/data/mock';
import { classifyImage, matchProductsByLabels } from 'src/services/ai';

// ----------------------------------------------------------------------
// Shared client-side image search engine (TensorFlow.js + MobileNet).
// Used by both the visual search page and the Shopee-style camera modal.
// ----------------------------------------------------------------------

export type SearchPhase = 'idle' | 'processing' | 'results' | 'no-match' | 'error';

const CONFIDENCE_FLOOR = 0.08;

export function useImageSearch() {
  const [phase, setPhase] = useState<SearchPhase>('idle');
  const [preview, setPreview] = useState('');
  const [topLabel, setTopLabel] = useState('');
  const [matches, setMatches] = useState<Product[]>([]);

  const runSearch = useCallback(async (file: File) => {
    const url = URL.createObjectURL(file);
    setPreview(url);
    setPhase('processing');

    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = url;

    try {
      await image.decode();
      const predictions: Prediction[] = await classifyImage(image);
      const best = predictions[0];

      if (!best || best.score < CONFIDENCE_FLOOR) {
        setPhase('no-match');
        return;
      }

      const matched = matchProductsByLabels(predictions, PRODUCTS).filter((p) => p.visibleInShop);
      setTopLabel(best.label);

      if (matched.length === 0) {
        setPhase('no-match');
        return;
      }
      setMatches(matched);
      setPhase('results');
    } catch {
      setPhase('error');
    }
  }, []);

  const reset = useCallback(() => {
    setPhase('idle');
    setPreview('');
    setMatches([]);
    setTopLabel('');
  }, []);

  return { phase, preview, topLabel, matches, runSearch, reset };
}
