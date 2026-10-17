export default {
  id: 'reverse-image-search',
  title: 'Reverse Image Search',
  summary:
    'Finding where an image came from, whether it is reused, and what else it is connected to.',
  level: 'intermediate',
  minutes: 11,
  tags: ['techniques', 'images', 'verification'],
  blocks: [
    {
      type: 'p',
      text: 'A reverse image search answers three questions: where else has this picture appeared, is it a stock or stolen photo, and what can the untouched original tell you. It is the fastest credibility check in the toolkit.',
    },
    {
      type: 'h',
      text: 'Run more than one engine',
    },
    {
      type: 'list',
      items: [
        'Google Lens / Images — strongest all-round, good for landmarks and objects.',
        'Yandex — often the best for faces and for Eastern European sources.',
        'Bing Visual Search — different index, catches some Pinterest/original pairs.',
        'TinEye — excellent for tracking the oldest instance of an image.',
      ],
    },
    {
      type: 'callout',
      tone: 'tip',
      title: 'Crop before you search',
      text: 'Faces, logos, and distinctive objects buried in a wide shot get better results from a tight crop. Run separate searches for the whole frame and each distinctive element.',
    },
    {
      type: 'h',
      text: 'Reading the results',
    },
    {
      type: 'steps',
      items: [
        'Look for the earliest appearance — that is the closest to the original.',
        "If the same image appears on stock-photo sites, it is not the target's photo.",
        'Compare against the claimed context. An image from 2019 cannot document a 2024 event.',
        'Use "similar image" results to find larger, uncropped, or higher-resolution versions.',
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Verification, not just location',
      text: 'Finding an image elsewhere does not prove the target posted it. For attribution you still need to tie the account to the person and the image to the account.',
    },
    {
      type: 'h',
      text: 'Related trick: find the untouched original',
    },
    {
      type: 'p',
      text: 'Download the highest-resolution copy you can find — the original often still carries EXIF metadata (camera, GPS, timestamp) that re-uploads strip. Then run the metadata workflow on it.',
    },
    {
      type: 'h',
      text: 'A repeatable verification pass',
    },
    {
      type: 'steps',
      items: [
        'Save the original file. Never work from a screenshot — it has already lost everything useful.',
        'Run the whole frame through at least two engines, then crop to each distinctive element and run those separately.',
        'Sort results by date ascending to find the earliest appearance — your best original.',
        'Open the earliest and largest versions side by side and check for edits, crops, and watermarks.',
        'Run the metadata workflow on the best copy before it gets re-encoded again.',
      ],
    },
    {
      type: 'example',
      title: 'Debunking a recycled flood photo',
      scenario:
        'A post claims a photo shows flooding "today" in a specific town.',
      method:
        'TinEye returns the image on news sites from six years earlier. The earliest instance is a wire-service file. Comparing the crops shows the poster only changed the caption — the pixels are identical. Weather records for the claimed date show no rain.',
      result:
        'The photo is genuine but re-dated. You report the earliest source and date, note the weather mismatch, and mark the claim as disinformation — with the archive links that prove it.',
    },
    {
      type: 'checklist',
      title: 'Reverse-search checklist',
      items: [
        'Whole frame searched on at least two engines.',
        'Distinctive elements (faces, logos, signage) searched as separate crops.',
        'Results sorted by date to find the earliest instance.',
        'Earliest copy inspected for edits and archived.',
        'Metadata extracted from the highest-resolution version.',
        'Claimed context (place, date, event) reconciled with findings.',
      ],
    },
    {
      type: 'tools',
      title: 'Image verification toolkit',
      items: [
        {
          label: 'Image & Facial tools',
          href: '/tools?category=image-facial',
          note: 'Reverse image search, face match, and tamper detection.',
        },
        {
          label: 'Document Metadata tools',
          href: '/tools?category=document-metadata',
          note: 'EXIF and file-forensics utilities for the best copy you find.',
        },
      ],
    },
  ],
};
