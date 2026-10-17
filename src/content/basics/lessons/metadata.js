export default {
  id: 'metadata',
  title: 'Metadata & Document Forensics',
  summary:
    'The hidden data inside photos, PDFs, and Office files — and why you should scrub your own.',
  level: 'intermediate',
  minutes: 12,
  tags: ['techniques', 'metadata', 'forensics'],
  blocks: [
    {
      type: 'p',
      text: 'Files carry a shadow copy of how they were made: the device, the software, the author, sometimes the exact coordinates. Extracting that metadata is often cheaper than any other route to an identity.',
    },
    {
      type: 'h',
      text: 'What each format leaks',
    },
    {
      type: 'table',
      head: ['Format', 'Look for'],
      rows: [
        ['JPEG / HEIC', 'GPS coordinates, camera make/model, timestamps'],
        ['PDF', 'Author, producer software, original filename, creation date'],
        ['DOCX / XLSX', 'Author, last-modified-by, company, editing time'],
        ['MP4 / MOV', 'Device model, creation date, location (sometimes)'],
        [
          'PNG / screenshots',
          'Usually stripped by chat apps — proof of nothing',
        ],
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Social apps strip GPS',
      text: 'Instagram, WhatsApp, X and most chat apps remove EXIF on upload. Do not expect GPS on a downloaded post — but a photo sent as a "document" or original file often keeps it.',
    },
    {
      type: 'h',
      text: 'How to inspect',
    },
    {
      type: 'list',
      items: [
        'Desktop: `exiftool` prints every tag in a file (and works on PDFs and video).',
        'No-install: many online EXIF viewers exist, but they upload your file — use only on non-sensitive material.',
        'PDF/docx: open the properties panel, or inspect the raw file as a zip (Office files are zips).',
      ],
    },
    {
      type: 'code',
      text: 'exiftool -a -gps:all -time:all -make -model suspect.jpg',
    },
    {
      type: 'h',
      text: 'The defensive flip side',
    },
    {
      type: 'p',
      text: 'Before you publish anything, strip it. Re-encoding an image, or "remove metadata" in an editor, prevents the same trick being run against you. This is a core OPSEC habit.',
    },
    {
      type: 'h',
      text: 'Command recipes',
    },
    {
      type: 'code',
      text: '# Everything about a file, grouped and readable\nexiftool -a -G1 -s suspect.pdf\n\n# GPS + timestamps only, as a quick hit\nexiftool -a -gps:all -time:all suspect.jpg\n\n# Strip every tag before you share (writes a clean copy)\nexiftool -all= -o cleaned.jpg suspect.jpg\n\n# Office files are zips — read the XML directly when tools fail\nunzip -p report.docx docProps/core.xml',
    },
    {
      type: 'example',
      title: 'The author left in the file',
      scenario:
        'A leaked internal spreadsheet is circulating and the publisher claims it is anonymous.',
      method:
        'Open the .xlsx as a zip and read docProps/core.xml. The `dc:creator` and `cp:lastModifiedBy` fields still name an individual, and the creation date sits just before the document appeared publicly.',
      result:
        "A named author and a tight creation window, reported with the two XML fields as the source — metadata alone is a lead, so it is corroborated against the file's distribution before being treated as attribution.",
    },
    {
      type: 'checklist',
      title: 'Metadata sweep',
      items: [
        'Tried exiftool on the original file (not a screenshot).',
        'Checked coordinates, device make/model, and all timestamps.',
        'For Office files, inspected docProps/core.xml and app.xml.',
        'For PDFs, checked Author, Producer, and original filename.',
        'Archived the file hash alongside the findings.',
        'Before publishing my own artefact: stripped all tags.',
      ],
    },
    {
      type: 'tools',
      title: 'Metadata toolkit',
      items: [
        {
          label: 'Document Metadata tools',
          href: '/tools?category=document-metadata',
          note: 'EXIF viewers, PDF analysers, and Office property inspectors.',
        },
        {
          label: 'Digital Forensics tools',
          href: '/tools?category=digital-forensics',
          note: 'Deeper file and disk forensics when metadata is not enough.',
        },
      ],
    },
  ],
};
