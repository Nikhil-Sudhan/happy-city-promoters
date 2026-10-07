import './style.css';
import { business, projects } from './config.js';
import { tamil } from './translations.js';
import { renderLocation } from './locations.js';
const $ = s => document.querySelector(s);
const saved = key => { try { return localStorage.getItem(key); } catch { return null; } };
const save = (key,value) => { try { localStorage.setItem(key,value); } catch {} };
let language = saved('happycity-language') === 'ta' ? 'ta' : 'en';
const featured = ['PRG Nagar', 'Happycity', 'Sri Ganapathy Nagar'];
const projectRank = p => featured.includes(p.name) ? featured.indexOf(p.name) : p.mapKey ? 3 : 4;
let filter = 'all', expanded = false;
const original = new Map([...document.querySelectorAll('[data-i18n]')].map(el => [el,el.innerHTML]));
const t = (en,ta) => language === 'ta' ? ta : en;
function renderProjects() {
  const filtered = [...projects].sort((a,b) => projectRank(a) - projectRank(b)).filter(p => filter === 'all' || p.category === filter);
  const visible = expanded || filter !== 'all' ? filtered : filtered.slice(0,3);
  $('#project-grid').replaceChildren(...visible.map((project,index) => {
    const button = document.createElement('button'); button.className = 'project-card';
    button.innerHTML = `<div class="project-heading"><span class="location-icon" aria-hidden="true">⌖</span><span>${t('DINDIGUL','திண்டுக்கல்')}</span><span class="project-number">${String(projects.indexOf(project)+1).padStart(2,'0')}</span></div><div class="project-body"><small>${t(project.mapKey ? 'Company-published map' : 'Find your place',project.mapKey ? 'நிறுவனம் வெளியிட்ட வரைபடம்' : 'உங்களுக்கான இடம்')}</small><h3>${project.name}</h3><p>${t(project.location,project.ta)}</p><div class="project-bottom"><span>${project.mapKey ? t('Explore the location','இடத்தைப் பார்க்க') : t('Enquire about this project','திட்டத்தைப் பற்றி விசாரிக்க')}</span><span aria-hidden="true">↗</span></div></div>`;
    button.addEventListener('click',() => {
      $('#dialog-title').textContent = project.name;
      $('#dialog-location').textContent = t(project.location,project.ta);
      $('#enquiry-project').value = project.name;
      renderLocation($('#dialog-map'),project.mapKey,language,project.name);
      $('#project-dialog').showModal();
    });
    return button;
  }));
  $('#project-count').textContent = t(`${visible.length} of ${filtered.length} projects`,`${filtered.length} திட்டங்களில் ${visible.length}`);
  $('#show-more').hidden = filter !== 'all' || expanded;
}
function applyLanguage() {
  document.documentElement.lang = language;
  original.forEach((html,el) => { el.innerHTML = language === 'ta' ? tamil[el.dataset.i18n] || html : html; });
  $('#language').textContent = t('தமிழில் பார்க்க','View in English');
  $('#language').lang = language === 'en' ? 'ta' : 'en';
  const selected = $('#enquiry-project').value;
  $('#enquiry-project').replaceChildren(new Option(t('Help me choose a project','திட்டத்தைத் தேர்வு செய்ய உதவுங்கள்'),''),...projects.map(p=>new Option(p.name,p.name)));
  $('#enquiry-project').value = selected;
  $('input[name=name]').placeholder = t('e.g. Kumar','உங்கள் பெயர்');
  $('input[name=phone]').placeholder = t('Your contact number','உங்கள் தொடர்பு எண்');
  $('#form-status').textContent = '';
  if (business.address) $('[data-i18n=officeNote]').textContent = t(business.address,business.addressTa);
  if (business.email && !business.whatsapp) {
    $('[data-i18n=formNote]').textContent = t('This opens your email app with your enquiry ready to review and send. You can also call us directly.','உங்கள் விசாரணையைச் சரிபார்த்து அனுப்ப மின்னஞ்சல் செயலி திறக்கும். எங்களை நேரடியாக அழைக்கலாம்.');
  }
  if (business.email) $('[data-i18n=enquiryCta]').textContent = t('Continue in email ↗','மின்னஞ்சலில் தொடர ↗');
  if (business.whatsapp) {
    $('[data-i18n=formNote]').textContent = t('Prepare your enquiry and review it in WhatsApp before sending.','உங்கள் விசாரணையைத் தயாரித்து, அனுப்புவதற்கு முன் WhatsApp-ல் சரிபார்க்கவும்.');
    $('[data-i18n=enquiryCta]').textContent = t('Continue in WhatsApp ↗','WhatsApp-ல் தொடர ↗');
  }
  renderProjects();
  const currentLocation = $('#location-select').value || 'prg';
  $('#location-select').replaceChildren(...projects.filter(p=>p.mapKey).map(p=>new Option(p.name,p.mapKey)));
  $('#location-select').value = currentLocation;
  updateLocation();
}
$('#language').addEventListener('click',() => { language = language === 'en' ? 'ta':'en'; save('happycity-language',language); applyLanguage(); });
if(saved('happycity-large') === 'true') document.body.classList.add('large-text');
$('#text-size').setAttribute('aria-pressed',String(document.body.classList.contains('large-text')));
$('#text-size').addEventListener('click',() => {const active = document.body.classList.toggle('large-text');$('#text-size').setAttribute('aria-pressed',String(active));save('happycity-large',String(active));});
$('.menu-toggle').addEventListener('click',() => {const active=$('nav').classList.toggle('open');$('.menu-toggle').setAttribute('aria-expanded',String(active));});
document.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',()=>{$('nav').classList.remove('open');$('.menu-toggle').setAttribute('aria-expanded','false');}));
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});renderProjects();}));
$('#show-more').addEventListener('click',()=>{expanded=true;renderProjects();});
function updateLocation() {
  const project = projects.find(p=>p.mapKey === $('#location-select').value);
  renderLocation($('#location-map'),project.mapKey,language,project.name);
}
$('#location-select').addEventListener('change',updateLocation);
$('#project-dialog').addEventListener('close',()=>$('#dialog-map').replaceChildren());
$('.dialog-close').addEventListener('click',()=>$('#project-dialog').close());
$('#dialog-enquire').addEventListener('click',()=>$('#project-dialog').close());
$('#year').textContent = new Date().getFullYear();
$('#explorer-link').href = business.explorerUrl;
if(business.phone){const link=$('#phone-link');link.hidden=false;link.textContent=business.phone;link.href=`tel:${business.phone.replace(/[^+\d]/g,'')}`;}
if(business.email){const link=document.createElement('a');link.id='email-link';link.className='text-link email-link';link.textContent=business.email;link.href=`mailto:${business.email}`;$('#phone-link').after(link);}
$('#enquiry-form').addEventListener('submit',event=>{
  event.preventDefault(); const data=Object.fromEntries(new FormData(event.currentTarget));
  const content=`Happy City Promoters — enquiry\n\nName: ${data.name.trim()}\nPhone: ${data.phone}\nProject: ${data.project || 'Help me choose'}\nMessage: ${data.message.trim() || 'I would like to know more and arrange a site visit.'}`;
  if(business.whatsapp){window.open(`https://wa.me/${business.whatsapp.replace(/\D/g,'')}?text=${encodeURIComponent(content)}`,'_blank','noopener');$('#form-status').textContent=t('Your enquiry is ready to review in WhatsApp.','WhatsApp-ல் உங்கள் விசாரணையைச் சரிபார்க்கலாம்.');return;}
  if(business.email){
    window.location.href=`mailto:${business.email}?subject=${encodeURIComponent('Project enquiry — '+(data.project || 'Happy City Promoters'))}&body=${encodeURIComponent(content)}`;
    $('#form-status').textContent=t(`Complete and send your enquiry in your email app. If it did not open, email ${business.email} or call ${business.phone}.`,`உங்கள் மின்னஞ்சல் செயலியில் விசாரணையை அனுப்பவும். செயலி திறக்கவில்லை என்றால் ${business.email} முகவரிக்கு எழுதுங்கள் அல்லது ${business.phone} எண்ணை அழையுங்கள்.`);
  }
});
applyLanguage();
