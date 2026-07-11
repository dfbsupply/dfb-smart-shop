# How We Train the AI on Product Photos

**Feature:** AI Visual Search (Objective 2). A buyer uploads a photo, and the app finds
matching products by predicting the photo's category. It all runs **in the browser** — no AI server.

**Code:** [`visual-search.ts`](../frontend/src/services/ai/visual-search.ts) ·
**Photos:** [`dataset.json`](../frontend/public/assets/ai/dataset.json) ·
**Accuracy page:** Admin → AI Visual Search → Accuracy

---

## The idea

We don't build a neural network from scratch. We reuse a pre-trained Google model
(**MobileNet**) to turn any photo into a "fingerprint" of 1024 numbers (an *embedding*),
then teach a simple classifier (**KNN**) which fingerprints belong to which category.

```
TRAIN:   train photo ──► MobileNet ──► fingerprint ──► remember it with its category label
PREDICT: buyer's photo ─► MobileNet ──► fingerprint ──► find the closest remembered photos ──► category
```

**Libraries:** `@tensorflow/tfjs`, `@tensorflow-models/mobilenet`,
`@tensorflow-models/knn-classifier` (all open-source, client-side).

---

## The photos (dataset)

4 categories, split into a **train set** (to teach) and a **test set** (to grade).
Photos are sourced from **[Pexels](https://www.pexels.com/)** (free to use).

| Category               | Train | Test |
|------------------------|:-----:|:----:|
| Glass                  | 6     | 2    |
| Aluminum Profiles      | 9     | 3    |
| Hardware & Accessories | 5     | 2    |
| Screens                | 5     | 2    |
| **Total**              | **25**| **9**|

> **Key rule:** a train photo is never used for testing. This is what makes the
> accuracy score honest — the model is graded only on photos it has never seen.

**To improve accuracy:** add more varied `.webp` photos to a `train` folder, list them
in `dataset.json`, keep a couple aside in `test`, then re-run the benchmark.

---

## Training (happens once, in the browser)

For every train photo: run MobileNet to get its fingerprint, and store that fingerprint
with its category in the KNN. That's it — no epochs, no learning rate. It takes seconds.

## Predicting

Run the buyer's photo through MobileNet, then ask the KNN for the category of the closest
train photos (majority vote of the 5 nearest). The app shows all products in that category.

---

## Measuring accuracy

Click **Run benchmark** on the Accuracy page. It grades the model on the 9 test photos
and reports:

- **Accuracy** = correct ÷ total — the overall % classified right.
- **Precision** = `TP / (TP + FP)` — when it says "Glass," how often it's right.
- **Recall** = `TP / (TP + FN)` — of all real Glass photos, how many it caught.
- **F1** = balance of precision and recall.
- **Confusion matrix** — a grid of actual vs. predicted; correct answers sit on the diagonal.

(TP = correct, FP = wrongly assigned here, FN = missed. "Macro" averages weight every
category equally.)

---

## Scope (for the manuscript)

This is deliberately **basic machine learning**: a pre-trained model + a transfer-learned
KNN on our own photos — not a from-scratch network. Its credibility comes from the honest
train/test split and standard, reproducible metrics.
