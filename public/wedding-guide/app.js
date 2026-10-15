'use strict';
const $ = s => document.querySelector(s);
const money = n => 'C$' + new Intl.NumberFormat('en-CA').format(n);
const collections = [
 {id:'signature',name:'Signature',tag:'The full-day starting point',badge:'Most booked',price:3000,hours:8,fit:'For a wedding with preparations, a ceremony and a reception, with room for the moments between.',items:['8 continuous hours · one lead photographer','600+ edited, high-resolution images','60-minute engagement session','1-minute colour-graded feature film','2 rolls of film, processed and scanned','40-image preview the next day','90-minute planning call & family-photo plan','Social reels in the first week','Film prints for guests on the night','Full photo gallery in 3 weeks']},
 {id:'legacy',name:'Legacy',tag:'A longer day, a printed story',badge:'10 hours',price:4200,hours:10,fit:'For a longer celebration, two places to be at once, and an album to return to.',items:['10 continuous hours · one lead photographer','Second photographer for 4 hours','800+ edited, high-resolution images','60-minute engagement session','3-minute colour-graded feature film','4 rolls of film, processed and scanned','10×10-inch Signature album · 30 pages','Two planning calls & a location scout','50-image preview within 24 hours','Social reels in the first week','Film prints for guests on the night','Full photo gallery in 3 weeks']},
 {id:'photo-film',name:'Photo + Film',tag:'To hear it as well as see it',badge:'12 hours',price:5900,hours:12,fit:'For the story in photographs and motion, with a dedicated filmmaker beside the photography.',items:['12 continuous hours · one lead photographer','Dedicated filmmaker for all 12 hours','800+ edited, high-resolution images','60-minute engagement session','3–5 minute highlight · licensed music','Vows or speeches where audio is clean','One round of minor film revisions','4 rolls of film, processed and scanned','10×10-inch Signature album · 30 pages','Social reels in the first week','Film prints for guests on the night','Photo gallery in 3 weeks · film in 10']}
];
let selected='signature';
const chosen = new Set();
const addonGroups = [
 {title:'More time & another perspective',items:[
  {id:'hour',label:'One extra coverage hour',price:400,desc:'Continuous with your collection, booked in advance; editing included.'},
  {id:'second',label:'Second photographer · 4 hours',price:800,desc:'Four-hour minimum. Already included with Legacy.'},
  {id:'second-hour',label:'One extra second-photographer hour',price:175,desc:'Requires the four-hour minimum, or Legacy.'},
  {id:'welcome',label:'Welcome event or rehearsal dinner',price:1000,desc:'Up to three hours on another day; also a tea ceremony or mehndi.'}
 ]},
 {title:'Film & motion',items:[
  {id:'filmmaker',label:'Dedicated filmmaker · 8 hours',price:2900,desc:'A 3–5 minute highlight film. Photo + Film already includes 12 hours.'},
  {id:'filmmaker-hour',label:'One extra filmmaking hour',price:250,desc:'Added alongside a dedicated filmmaker; booked in advance.'},
  {id:'ceremony',label:'Full ceremony & speeches films',price:650,desc:'Both edited long. Multi-camera coverage and an audio plan agreed in advance.'},
  {id:'film-roll',label:'One more roll of film',price:175,desc:'Processing and scans included; no guaranteed frame count.'},
  {id:'film-two',label:'Two more rolls of film',price:300,desc:'Processing and scans included; no guaranteed frame count.'},
  {id:'film-story',label:'Film Story · four more rolls',price:500,desc:'Carried through the day, processed and scanned; no guaranteed frame count.'},
  {id:'drone',label:'Drone stills & clips',price:350,desc:'Subject to weather, venue rules, safe operation and airspace permission.'}
 ]},
 {title:'Printed things & delivery',items:[
  {id:'album',label:'Signature album · 10×10 inches',price:1200,desc:'30 pages, 15 lay-flat spreads. Included in Legacy and Photo + Film.'},
  {id:'parent',label:'One parent album · 8×8 inches',price:550,desc:'30 pages, 15 spreads, linen; a copy of the main album. Main album required.'},
  {id:'prints',label:'Fine-art print box',price:400,desc:'20–30 archival prints at 5×7 or 6×8 inches, in a covered clamshell box.'},
  {id:'rush',label:'Seven-day photo-gallery rush',price:750,desc:'Capacity-limited; availability confirmed before booking.'}
 ],note:'The 12×12-inch Heirloom album is listed at C$1,800. Upgrade pricing for an included album is quoted. Large framed prints: C$300–900 by size and frame.'},
 {title:'Another chapter together',items:[
  {id:'destination-session',label:'Destination welcome session',price:550,desc:'45 minutes when I am already on location; not a separate fly-out.'},
  {id:'anniversary',label:'Anniversary session',price:400,desc:'60 minutes, 40+ edited images, within twelve months after the wedding.'}
 ],note:'Extensive retouching, a dedicated content creator and a defined run of social edits are quoted to scope.'}
];
function renderCards(){
 $('#collection-cards').innerHTML=collections.map(c=>`<article class="collection-card ${c.id===selected?'selected':''}"><p class="eyebrow"><span>${c.tag}</span><span>${c.badge}</span></p><h3>${c.name}</h3><p class="cost">${money(c.price)}</p><p class="hours">${c.hours} continuous hours · ${c.id==='signature'?'600':'800'}+ photographs</p><p class="fit">${c.fit}</p><ul>${c.items.map(i=>`<li>${i}</li>`).join('')}</ul><button class="button" data-collection="${c.id}" aria-pressed="${c.id===selected}">${c.id===selected?'Selected as your starting point':'Start with '+c.name}<span>${c.id===selected?'✓':'↗'}</span></button></article>`).join('');
 document.querySelectorAll('[data-collection]').forEach(b=>b.addEventListener('click',()=>{selected=b.dataset.collection;enforceAddons();renderCards();renderAddons();updateEstimate();}));
}
const compareRows=[
 ['Collection price','C$3,000','C$4,200','C$5,900'],
 ['Continuous coverage','8 hours','10 hours','12 hours'],
 ['Lead photographer','Included','Included','Included'],
 ['Second photographer','Optional · C$800 / 4 hours','4 hours included','Optional · C$800 / 4 hours'],
 ['Dedicated filmmaker','Optional · C$2,900 / 8 hours','Optional · C$2,900 / 8 hours','12 hours included'],
 ['Edited photographs','600+','800+','800+'],
 ['High-resolution files & print permission','Included','Included','Included'],
 ['Engagement session','60 minutes','60 minutes','60 minutes'],
 ['Feature / highlight film','1 minute, colour graded','3 minutes, colour graded','3–5 minutes, colour graded; licensed music; vows or speeches where audio is clean'],
 ['Film revisions','—','—','One consolidated round of minor changes'],
 ['Film rolls, processing & scans','2 rolls','4 rolls','4 rolls'],
 ['Social reels','First week','First week','First week'],
 ['Film prints for guests on the night','Included','Included','Included'],
 ['Signature album','Optional · C$1,200','10×10 inches · 30 pages','10×10 inches · 30 pages'],
 ['Planning','90-minute call & family-photo plan','Two calls & location scout','Confirm the planning schedule in your proposal'],
 ['Photo preview','40 images the next day','50 images within 24 hours','Preview timing agreed in your proposal'],
 ['Full photo gallery','3 weeks','3 weeks','3 weeks'],
 ['Dedicated highlight-film delivery','—','—','10 weeks']
];
$('#comparison-table').innerHTML='<thead><tr><th scope="col">The details</th>'+collections.map(c=>`<th scope="col">${c.name}</th>`).join('')+'</tr></thead><tbody>'+compareRows.map(r=>`<tr><th scope="row">${r[0]}</th>${r.slice(1).map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')+'</tbody>';
function included(id){return (id==='second'&&selected==='legacy')||(id==='album'&&selected!=='signature')||(id==='filmmaker'&&selected==='photo-film');}
function unavailable(id){return (id==='second-hour'&&selected!=='legacy'&&!chosen.has('second'))||(id==='filmmaker-hour'&&selected!=='photo-film'&&!chosen.has('filmmaker'))||(id==='parent'&&selected==='signature'&&!chosen.has('album'));}
function enforceAddons(){addonGroups.flatMap(g=>g.items).forEach(a=>{if(included(a.id)||unavailable(a.id))chosen.delete(a.id);});}
let openGroups=new Set();
function renderAddons(){
 $('#addon-groups').innerHTML=addonGroups.map((g,i)=>`<details class="addon-group" data-group="${i}" ${openGroups.has(String(i))?'open':''}><summary>${g.title}<span>+</span></summary><div>${g.items.map(a=>{const inc=included(a.id),disabled=inc||unavailable(a.id);return `<label class="addon-row ${disabled?'disabled':''}"><input type="checkbox" data-addon="${a.id}" ${chosen.has(a.id)||inc?'checked':''} ${disabled?'disabled':''}><span><strong>${a.label}</strong><small>${inc?'Included in your selected collection.':a.desc}</small></span><span class="addon-price">${inc?'Included':money(a.price)}</span></label>`;}).join('')}${g.note?`<p class="addon-info">${g.note}</p>`:''}</div></details>`).join('');
 document.querySelectorAll('[data-group]').forEach(d=>d.addEventListener('toggle',()=>{if(d.open)openGroups.add(d.dataset.group);else openGroups.delete(d.dataset.group);}));
 document.querySelectorAll('[data-addon]').forEach(i=>i.addEventListener('change',()=>{if(i.checked)chosen.add(i.dataset.addon);else chosen.delete(i.dataset.addon);enforceAddons();openGroups=new Set([...document.querySelectorAll('[data-group][open]')].map(d=>d.dataset.group));renderAddons();updateEstimate();}));
}
function updateEstimate(){
 const c=collections.find(x=>x.id===selected);const adds=addonGroups.flatMap(g=>g.items).filter(a=>chosen.has(a.id));const total=c.price+adds.reduce((s,a)=>s+a.price,0);
 $('#estimate-name').textContent=c.name;
 $('#estimate-items').textContent=c.hours+' continuous hours'+(adds.length?' · '+adds.map(a=>a.label).join(' · '):' · no optional additions');
 $('#estimate-price').textContent=money(total);
 const body=`Hello Arman,\n\nWe'd like to talk about ${c.name} for our wedding.\n\nDate:\nVenue / city:\nA little about the day:\n\nStarting collection: ${c.name} (${money(c.price)})\n${adds.map(a=>a.label+': '+money(a.price)).join('\n')}\nPlanning subtotal: ${money(total)} before tax and quoted travel.\n\nPlease let us know your availability and what you'd recommend.`;
 const href='mailto:i@armanarai.com?subject='+encodeURIComponent('Our wedding — '+c.name)+'&body='+encodeURIComponent(body);
 $('#estimate-contact').href=href;$('#estimate-contact').removeAttribute('target');$('#estimate-contact').removeAttribute('rel');$('#email-cta').href=href;
}
const galleryData={
 documentary:{description:'The unscripted parts: anticipation, laughter, a room full of people who know you.',images:[['home-08','A newly married couple celebrating during their candlelit ceremony'],['home-10','Guests laughing together over champagne'],['home-35','A bride smiling through the window of a vintage car']]},
 editorial:{description:'A little intention: beautiful light, considered composition, and direction that still leaves room for you.',images:[['home-34','A couple kissing beneath a stone colonnade'],['home-16','A bride and groom on an ornate staircase in warm light'],['home-37','A bride walking through a dark gallery of gilt-framed paintings']]},
 film:{description:'Texture, movement and the atmosphere of the room. Photographs selected for the feeling they hold.',images:[['home-18','A quiet black-and-white portrait beneath the veil'],['home-09','Bouquets and wedding details in golden light'],['home-15','A wedding reception alive with movement, in black and white']]}
};
let activeGallery='documentary',lightboxItems=[],lightboxIndex=0;
const dialog=$('#lightbox');
function renderGallery(key){
 activeGallery=key;const data=galleryData[key];$('#style-description').textContent=data.description;$('#style-gallery').setAttribute('aria-labelledby','tab-'+key);
 $('#style-gallery').innerHTML=data.images.map((a,i)=>`<button aria-label="Enlarge: ${a[1]}" data-gallery-index="${i}"><img src="/wedding-guide/assets/${a[0]}.webp" alt="${a[1]}" loading="lazy" width="1000" height="1200"></button>`).join('');
 document.querySelectorAll('[data-gallery-index]').forEach(b=>b.addEventListener('click',()=>openLightbox(data.images,Number(b.dataset.galleryIndex))));
}
function showLightbox(){const item=lightboxItems[lightboxIndex];$('#lightbox-image').src='/wedding-guide/assets/'+item[0]+'.webp';$('#lightbox-image').alt=item[1];$('#lightbox-caption').textContent=item[1];$('#lightbox-count').textContent=String(lightboxIndex+1).padStart(2,'0')+' / '+String(lightboxItems.length).padStart(2,'0');$('#lightbox-prev').hidden=$('#lightbox-next').hidden=lightboxItems.length<2;}
function openLightbox(items,index){lightboxItems=items;lightboxIndex=index;showLightbox();dialog.showModal();}
function advance(n){lightboxIndex=(lightboxIndex+n+lightboxItems.length)%lightboxItems.length;showLightbox();}
$('#lightbox-close').addEventListener('click',()=>dialog.close());$('#lightbox-prev').addEventListener('click',()=>advance(-1));$('#lightbox-next').addEventListener('click',()=>advance(1));
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();advance(1);}if(e.key==='ArrowLeft'){e.preventDefault();advance(-1);}});
function setupTabs(selector,fn){const tabs=[...document.querySelectorAll(selector)];function activate(b){tabs.forEach(t=>{t.setAttribute('aria-selected',String(t===b));t.tabIndex=t===b?0:-1;});fn(b);}
 tabs.forEach((b,i)=>{b.addEventListener('click',()=>activate(b));b.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight')next=(i+1)%tabs.length;else if(e.key==='ArrowLeft')next=(i-1+tabs.length)%tabs.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=tabs.length-1;else return;e.preventDefault();activate(tabs[next]);tabs[next].focus();});});}
setupTabs('[data-style]',b=>renderGallery(b.dataset.style));
const timelines={
 8:[['1:00 pm','The final preparations','Getting dressed, the last quiet moments and the people helping you into the day.'],['2:15 pm','A first look, if you want one','A little privacy and some portraits before the ceremony. If you prefer to meet at the aisle, we move this time.'],['4:00 pm','The ceremony','Time to be present. I photograph what happens.'],['4:45 pm','Family photographs','A short, agreed list, then back to your guests.'],['5:15 pm','A little time together','Couple portraits and a breath before the reception.'],['6:00 pm','Dinner & the speeches','The room, the reactions, the people telling your story.'],['8:00 pm','First dance & the party','Coverage through 9 pm in this example. If sunset falls later, we adjust the plan.']],
 10:[['11:00 am','The morning, properly','Room for details, preparations and the people around you.'],['1:30 pm','Getting dressed & a first look','Time for both preparations; the included second photographer covers the four hours where two angles matter most.'],['4:00 pm','The ceremony','The vows, the room and the reactions.'],['4:45 pm','Family groups & portraits','Planned groups first, then some time together.'],['6:00 pm','Dinner & speeches','Space for the people and the stories around the tables.'],['8:00 pm','The first dance','An hour of the party after it; coverage ends at 9 pm in this example.']],
 12:[['11:00 am','Both stories begin','Photography and a dedicated filmmaker arrive for the preparations.'],['1:30 pm','Getting dressed & a first look','Portraits and a little time before the ceremony, if that fits your day.'],['4:00 pm','The ceremony','Photographs and moving images, with the audio plan agreed in advance.'],['4:45 pm','Family groups & time together','Keep the group list purposeful. Keep some time for yourselves.'],['6:00 pm','Dinner & speeches','The words as well as the faces listening to them.'],['8:00 pm','The first dance & everything after','Room to stay with the party and step out for sunset when the light suits.'],['11:00 pm','The last frame','Twelve hours complete. Your coverage follows your actual day, not this example.']]
};
function renderTimeline(hours){$('#timeline-list').setAttribute('aria-labelledby','time-'+hours);$('#timeline-list').innerHTML=timelines[hours].map(t=>`<div class="timeline-item"><time>${t[0]}</time><div><h3>${t[1]}</h3><p>${t[2]}</p></div></div>`).join('');}
setupTabs('[data-hours]',b=>renderTimeline(b.dataset.hours));
const proofs=[['reviews-00','Justine on the preview gallery'],['reviews-01','Jennifer on the preview gallery'],['reviews-02','Megan on her wedding album'],['reviews-03',"Rachel sharing her mother's reaction"],['reviews-04','Brianna on the finished gallery'],['reviews-05','Stephanie on the announcement video'],['reviews-06','Lexi after receiving the gallery'],['reviews-07','Samantha’s Google review'],['reviews-08','Glen on the portraits and album'],['reviews-09','Brian’s Google review'],['reviews-10','Andrew, the morning after'],['reviews-11','A message from Taylor']];
$('#proof-grid').innerHTML=proofs.map((p,i)=>`<button data-proof-index="${i}" aria-label="Enlarge ${p[1]}"><img src="/wedding-guide/assets/${p[0]}.webp" loading="lazy" alt="${p[1]} — original review screenshot"></button>`).join('');
document.querySelectorAll('[data-proof-index]').forEach(b=>b.addEventListener('click',()=>openLightbox(proofs,Number(b.dataset.proofIndex))));
document.querySelectorAll('[data-proof]').forEach(b=>b.addEventListener('click',()=>openLightbox(proofs,proofs.findIndex(p=>p[0]===b.dataset.proof))));
const chapters=[...document.querySelectorAll('[data-title]')];
$('#contents-links').innerHTML=chapters.map((s,i)=>`<a href="#${s.id}"><span class="num">${String(i+1).padStart(2,'0')}</span><span><strong>${s.dataset.title}</strong><small>${s.dataset.label}</small></span><span class="arrow">↗</span></a>`).join('');
$('#menu-links').innerHTML=chapters.map((s,i)=>`<a href="#${s.id}"><span>${String(i+1).padStart(2,'0')}</span>${s.dataset.title}</a>`).join('');
const menu=$('#guide-menu'),menuToggle=$('#menu-toggle');
function closeMenu(){menu.hidden=true;menuToggle.setAttribute('aria-expanded','false');}
menuToggle.addEventListener('click',()=>{const open=menu.hidden;menu.hidden=!open;menuToggle.setAttribute('aria-expanded',String(open));});
menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('click',e=>{if(!menu.hidden&&!menu.contains(e.target)&&!menuToggle.contains(e.target))closeMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){closeMenu();menuToggle.focus();}});
let ticking=false;
function updateProgress(){const max=document.documentElement.scrollHeight-innerHeight;const percent=Math.max(0,Math.min(100,Math.round(scrollY/max*100)));$('#progress').style.width=percent+'%';$('#read-percent').textContent=percent+'%';$('.chapter-indicator').classList.toggle('visible',scrollY>innerHeight*.8);const current=chapters.filter(c=>c.getBoundingClientRect().top<innerHeight*.4).pop();$('#current-chapter').textContent=current?String(chapters.indexOf(current)+1).padStart(2,'0')+' / '+current.dataset.title:'The wedding guide';ticking=false;}
addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(updateProgress);ticking=true;}},{passive:true});addEventListener('resize',updateProgress);
renderCards();renderAddons();updateEstimate();renderGallery('documentary');renderTimeline(8);updateProgress();
