import locations from './location-data.json';

// Preserve the company's original Google embeds and Google's own attribution.
// Load only on request; the external link also works if embeds are blocked.
export function renderLocation(container, key, language, name) {
  const t = (en, ta) => language === 'ta' ? ta : en;
  container.replaceChildren();
  const location = locations[key];
  if (!location) {
    const note = document.createElement('p');
    note.className = 'location-note';
    note.textContent = t('Contact our team for this project’s exact location and current site photographs.', 'இந்தத் திட்டத்தின் சரியான இடம் மற்றும் தற்போதைய புகைப்படங்களுக்கு எங்கள் குழுவைத் தொடர்புகொள்ளவும்.');
    container.append(note);
    return;
  }
  const panel = document.createElement('div');
  panel.className = 'map-panel';
  const label = document.createElement('strong');
  label.textContent = name;
  const explanation = document.createElement('p');
  explanation.textContent = t('See the surroundings on Google Maps. Satellite and Street View availability varies by location.', 'Google Maps-ல் சுற்றுப்புறங்களைப் பாருங்கள். செயற்கைக்கோள் மற்றும் Street View படங்கள் கிடைப்பது இடத்தைப் பொறுத்து மாறுபடும்.');
  const button = document.createElement('button');
  button.className = 'button';
  button.type = 'button';
  button.textContent = t('Load Google Map ↗', 'Google வரைபடத்தைத் திறக்க ↗');
  const note = document.createElement('small');
  note.textContent = t('Loads content from Google when selected.', 'தேர்வு செய்யும்போது Google-இலிருந்து வரைபடம் ஏற்றப்படும்.');
  panel.append(label, explanation, button, note);
  button.addEventListener('click', () => {
    const frame = document.createElement('iframe');
    frame.title = t(`${name} — company-published Google Map`, `${name} — நிறுவனம் வெளியிட்ட Google வரைபடம்`);
    frame.src = location.embed;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.allowFullscreen = true;
    panel.replaceChildren(frame);
    panel.classList.add('map-loaded');
  });
  const links = document.createElement('div');
  links.className = 'map-links';
  for (const [text, href] of [
    [t('Open in Google Maps ↗', 'Google Maps-ல் பார்க்க ↗'), location.googleMaps],
    [t('Official project page ↗', 'அதிகாரப்பூர்வ திட்டப் பக்கம் ↗'), location.source],
  ]) {
    const link = document.createElement('a');
    link.className = 'text-link';
    link.textContent = text;
    link.href = href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    links.append(link);
  }
  const caution = document.createElement('p');
  caution.className = 'location-note';
  caution.textContent = t('Company-published location. Confirm the site entrance before visiting. Imagery is recorded, not a live feed.', 'நிறுவனம் வெளியிட்ட இடம். வருவதற்கு முன் நுழைவிடத்தை உறுதிப்படுத்தவும். இவை பதிவு செய்யப்பட்ட படங்கள்; நேரலை அல்ல.');
  container.append(panel, links, caution);
}
