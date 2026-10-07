import './style.css';
import { business, projects } from './config.js';
import { tamil } from './translations.js';
const $ = s => document.querySelector(s);
const saved = key => { try { return localStorage.getItem(key); } catch { return null; } };
const save = (key,value) => { try { localStorage.setItem(key,value); } catch {} };
let language = saved('happycity-language') === 'ta' ? 'ta' : 'en';
let filter = 'all', expanded = false;
const original = new Map([...document.querySelectorAll('[data-i18n]')].map(el => [el,el.innerHTML]));
const t = (en,ta) => language === 'ta' ? ta : en;
function renderProjects() {
  const filtered = projects.filter(p => filter === 'all' || p.category === filter);
  const visible = expanded || filter !== 'all' ? filtered : filtered.slice(0,3);
  $('#project-grid').replaceChildren(...visible.map((project,index) => {
    const button = document.createElement('button'); button.className = 'project-card';
    button.innerHTML = `<div class="project-photo"><img src="/images/${project.image}.jpg" alt="" loading="lazy"><span>${t('DINDIGUL','திண்டுக்கல்')}</span></div><div class="project-body"><small>${t(project.tag || 'Find your place',project.tagTa || 'உங்களுக்கான இடம்')}</small><h3>${project.name}</h3><p>⌖ ${t(project.location,project.ta)}</p><div class="project-bottom"><span>${t('Discover this project','திட்டத்தைப் பற்றி அறிய')}</span><span>↗</span></div></div>`;
    button.addEventListener('click',() => {
      $('#dialog-title').textContent = project.name;
      $('#dialog-location').textContent = t(project.location,project.ta);
      $('#enquiry-project').value = project.name;
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
  if (business.address) $('[data-i18n=officeNote]').textContent = business.address;
  if (business.email && !business.whatsapp) {
    $('[data-i18n=formNote]').textContent = t('Email us directly, or prepare and download your enquiry below. Nothing is sent automatically.','எங்களுக்கு நேரடியாக மின்னஞ்சல் அனுப்பலாம் அல்லது கீழே உங்கள் விசாரணையைத் தயாரித்துப் பதிவிறக்கலாம். தானாக எதுவும் அனுப்பப்படாது.');
  }
  if (business.whatsapp) {
    $('[data-i18n=formNote]').textContent = t('Prepare your enquiry and review it in WhatsApp before sending.','உங்கள் விசாரணையைத் தயாரித்து, அனுப்புவதற்கு முன் WhatsApp-ல் சரிபார்க்கவும்.');
    $('[data-i18n=enquiryCta]').textContent = t('Continue in WhatsApp ↗','WhatsApp-ல் தொடர ↗');
  }
  renderProjects();
}
$('#language').addEventListener('click',() => { language = language === 'en' ? 'ta':'en'; save('happycity-language',language); applyLanguage(); });
if(saved('happycity-large') === 'true') document.body.classList.add('large-text');
$('#text-size').setAttribute('aria-pressed',String(document.body.classList.contains('large-text')));
$('#text-size').addEventListener('click',() => {const active = document.body.classList.toggle('large-text');$('#text-size').setAttribute('aria-pressed',String(active));save('happycity-large',String(active));});
$('.menu-toggle').addEventListener('click',() => {const active=$('nav').classList.toggle('open');$('.menu-toggle').setAttribute('aria-expanded',String(active));});
document.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',()=>{$('nav').classList.remove('open');$('.menu-toggle').setAttribute('aria-expanded','false');}));
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});renderProjects();}));
$('#show-more').addEventListener('click',()=>{expanded=true;renderProjects();});
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
  const url=URL.createObjectURL(new Blob([content],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='Happy-City-Enquiry.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  $('#form-status').textContent=business.email?t(`Your enquiry file has been prepared. It has not been sent. You can email it to ${business.email}.`,`உங்கள் விசாரணைக் கோப்பு தயாராக உள்ளது. இது அனுப்பப்படவில்லை. இதை ${business.email} என்ற முகவரிக்கு மின்னஞ்சல் அனுப்பலாம்.`):t('Your enquiry file has been prepared. It has not been sent. Contact details will be added soon.','உங்கள் விசாரணைக் கோப்பு தயாராக உள்ளது. இது அனுப்பப்படவில்லை. தொடர்பு விவரங்கள் விரைவில் சேர்க்கப்படும்.');
});
applyLanguage();
