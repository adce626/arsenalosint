export default {
  id: 'geoint',
  title: 'GEOINT — Geolocation from Imagery',
  summary:
    'Pinning a photo or video to a real-world location using landmarks, shadows, and metadata.',
  level: 'advanced',
  minutes: 14,
  tags: ['disciplines', 'geolocation', 'imagery'],
  blocks: [
    {
      type: 'p',
      text: 'GEOINT is the art of answering "where was this taken?" from the image itself. It is equal parts observation and patience, and it is the discipline behind most viral "we found the exact spot" investigations.',
    },
    {
      type: 'h',
      text: 'The chronolocation workflow',
    },
    {
      type: 'steps',
      items: [
        'Reverse-search first. The image may already be located by someone else — use that as a hypothesis, not a conclusion.',
        'Read for region: language on signs, driving side, licence plates, utility markings, vegetation, architecture.',
        'Read for landmark: distinctive buildings, bridges, mountains, signage, brand logos.',
        'Read for precise position: match the camera angle against satellite and street-level imagery until the geometry locks.',
        'Chronolocate: use shadow length and direction, weather archives, and dated imagery to establish when.',
      ],
    },
    {
      type: 'callout',
      tone: 'tip',
      title: 'Shadows are a clock',
      text: "A shadow's direction gives you a compass bearing; its length relative to the object gives you a rough time of day for that latitude and season. Free solar-position calculators turn this into a precise window.",
    },
    {
      type: 'h',
      text: 'Tools of the trade',
    },
    {
      type: 'list',
      items: [
        'Satellite basemaps: Google Earth, Bing, Sentinel/Landsat for terrain and change over time.',
        'Street-level: Google Street View, Mapillary, KartaView.',
        'Terrain: peak-finder apps to match ridgelines against photos.',
        'Sun/shadow: any solar-position calculator with a map picker.',
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Confidence, always',
      text: 'State how sure you are and why. "The blue sign, the tram livery, and the mountain profile place this on Tram Line 2 in Lisbon, facing north-east" beats "looks like Lisbon".',
    },
    {
      type: 'h',
      text: 'Chronolocation: turning a photo into a time',
    },
    {
      type: 'p',
      text: 'Once you have a location, the photo often tells you when. Shadows are the workhorse: the azimuth gives a compass bearing to the sun, and the length ratio gives an elevation angle. Invert that for the latitude and you narrow the hour, then the season.',
    },
    {
      type: 'code',
      text: '# Shadow geometry sketch\nsun_azimuth_deg  = atan2(dx, dy) * 180/PI      # bearing of the shadow\nsun_elevation    = atan(object_height / shadow_len) * 180/PI\n# feed latitude + elevation + azimuth into any solar-position calculator\n# to bracket the date and time; cross-check with weather archives.',
    },
    {
      type: 'example',
      title: 'Locating an anonymous protest photo',
      scenario:
        'A photo claims to show a protest "last week" but has no caption, no geotag, and clipped EXIF.',
      method:
        'Region from the language on the signs and the traffic-light design. Landmark match: a distinctive clock tower in the background, confirmed against satellite and street-level imagery. Sun: the low, hard shadow from the left fixes the subject on the east side of the plaza around mid-morning. Weather archives confirm a rain-free morning that matches only one day in the claimed window.',
      result:
        'Exact plaza, camera facing west, captured on a specific morning four days before the post. Reported as "confirmed location; time narrowed to a two-hour window, high confidence".',
    },
    {
      type: 'callout',
      tone: 'tip',
      title: 'Beware the edited sky',
      text: 'Sun, shadows, and weather must be internally consistent. If the shadow contradicts the visible sun position, or the reflection does not match the scene, treat the image as composited until proven otherwise.',
    },
    {
      type: 'checklist',
      title: 'GEOINT verification checklist',
      items: [
        'Region identified from at least one text/language or infrastructure cue.',
        'Two independent landmark matches against current imagery.',
        'Camera bearing estimated and consistent with all shadows.',
        'Time-of-day bracketed with a solar calculator and the latitude.',
        'Weather cross-checked for the claimed date.',
        'Any inconsistencies (impossible reflections, edited sky) documented, not ignored.',
      ],
    },
    {
      type: 'tools',
      title: 'GEOINT toolkit',
      items: [
        {
          label: 'Geolocation tools',
          href: '/tools?category=geolocation',
          note: 'Map annotation, image geolocation, and satellite basemaps.',
        },
        {
          label: 'Vehicle, aviation & maritime',
          href: '/tools?category=vehicle-aviation-maritime',
          note: 'Identify aircraft, vessels, and plates spotted in media.',
        },
        {
          label: 'Mapping Tool',
          href: '/mapping',
          note: 'Pin the located site and link it to the account that posted it.',
        },
      ],
    },
  ],
};
