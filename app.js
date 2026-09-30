'use strict';
const menu=document.querySelector('.menu-button'),nav=document.querySelector('#navigation');
function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');}
menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
document.addEventListener('click',e=>{if(!e.target.closest('.nav-wrap'))closeMenu();});
const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
if('IntersectionObserver' in window&&!motion.matches){document.documentElement.classList.add('motion-ready');const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}});},{threshold:.08});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));}
if('IntersectionObserver' in window){const sections=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){nav.querySelectorAll('a').forEach(a=>{const active=a.hash==='#'+e.target.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}});},{rootMargin:'-20% 0px -50% 0px'});document.querySelectorAll('#about,#work,#skills').forEach(el=>sections.observe(el));}
const video=document.querySelector('#intro-video'),cover=document.querySelector('#video-cover');
async function playIntro(){cover.hidden=true;video.focus({preventScroll:true});try{await video.play();}catch{video.controls=true;}}
cover.addEventListener('click',playIntro);
document.querySelector('.watch-link').addEventListener('click',()=>{playIntro();});
video.addEventListener('error',()=>{cover.hidden=true;const link=document.createElement('a');link.href='intro_vid.mp4';link.textContent=document.documentElement.lang==='ar'?'افتح الفيديو مباشرة':'Open video directly';document.querySelector('.video-help').replaceChildren(link);});
const dialog=document.querySelector('#saas-dialog');
document.querySelector('#saas-open').addEventListener('click',()=>dialog.showModal());
document.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
document.querySelector('#year').textContent=new Date().getFullYear();
const config=window.PORTFOLIO_CONTACT||{},links=document.querySelector('#contact-links');
function addLink(label,href){const a=document.createElement('a');a.textContent=label+' ↗';a.href=href;if(href.startsWith('https://')){a.target='_blank';a.rel='noopener noreferrer';}links.append(a);}
if(typeof config.email==='string'&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.email)){addLink(config.email,'mailto:'+config.email);}
for(const [key,label,host] of [['github','GitHub','github.com'],['linkedin','LinkedIn','linkedin.com']]){try{const u=new URL(config[key]);if(u.protocol==='https:'&&(u.hostname===host||u.hostname==='www.'+host))addLink(label,u.href);}catch{}}
if(typeof config.whatsapp==='string'&&/^\+?[1-9]\d{7,14}$/.test(config.whatsapp)){addLink('WhatsApp','https://wa.me/'+config.whatsapp.replace('+',''));}
document.querySelector('#contact-pending').hidden=links.children.length>0;

if(typeof config.phone==='string'&&/^\+?[1-9]\d{7,14}$/.test(config.phone)){addLink(config.phoneDisplay||config.phone,'tel:'+config.phone);document.querySelector('#contact-pending').hidden=true;}
