# AI — Visual Search (TensorFlow.js + MobileNet)

The AI feature (Objective 2) runs **entirely in the browser** with TensorFlow.js
and the pre-trained **MobileNet** model — there is no AI server. This folder is
the design/reference home for that feature; the runnable integration code lives
in [`../frontend/src/services/ai`](../frontend/src/services/ai).

## The bridge problem (and the solution)

MobileNet classifies an uploaded photo into **general** ImageNet categories
(e.g. `"window screen"`, `"picture frame"`, `"sliding door"`). Those labels do
**not** correspond to the shop's SKUs. The bridge:

```
photo ──MobileNet──► general labels ──keyword match──► DFB products
                                         ▲
                          admin-set "Visual Search Keywords" (Admin A-6)
```

Each product carries admin-defined keywords (`glass`, `window`, `metal`,
`frame`, …). `matchProductsByLabels()` scores products by how many predicted
words hit their keywords/name/category, then returns the best matches. This is
why the keyword field in the Admin product form matters — it's what turns a
generic model output into a real product result.

## Going live

```bash
cd frontend
yarn add @tensorflow/tfjs @tensorflow-models/mobilenet
```

Then implement `classifyImage()` in `frontend/src/services/ai/visual-search.ts`
(load the model once, call `model.classify(imageEl)`), and feed the predictions
into the existing `matchProductsByLabels()`. The Webshop's "Visual Search" entry
point (W-4) and the Buyer app shortcut (B-3) will call into this module.

## Scope

Per the manuscript this is "basic machine learning" — a pre-trained model plus a
rule-based keyword bridge — **not** a trained-from-scratch or collaborative-
filtering system.
