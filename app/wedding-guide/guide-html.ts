// Standalone wedding guide, written in Arman's voice.
const guideHtml = /* html */ `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <meta name="description" content="Wedding photography with Arman Arai. Meet your photographer, compare the collections, and plan a day you actually get to enjoy.">
  <meta name="theme-color" content="#11110f">
  <title>The Wedding Guide — Arman Arai</title>
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%2311110f'/%3E%3Ctext x='12' y='47' fill='%23c9b18b' font-family='Georgia' font-size='44'%3EA%3C/text%3E%3C/svg%3E">
  <link rel="stylesheet" href="/wedding-guide/assets/fonts.css">
  <link rel="stylesheet" href="/wedding-guide/style.css">
  <link rel="stylesheet" href="/wedding-guide/personality.css">
  <script src="/wedding-guide/app.js" defer></script>
</head>
<body>
<a class="skip" href="#contents">Skip to the guide</a>
<div class="reading-progress" aria-hidden="true"><span id="progress"></span></div>
<header class="topbar">
  <a class="wordmark" href="#cover" aria-label="Arman Arai, back to cover">Arman Arai<span>WEDDING PHOTOGRAPHY</span></a>
  <nav aria-label="Guide navigation"><a href="#collections">The collections</a><a class="nav-call" href="https://calendly.com/i-armanarai/30-minute-meeting-wedding" target="_blank" rel="noopener">Let's talk <span>↗</span></a><button id="menu-toggle" aria-expanded="false" aria-controls="guide-menu">Contents <span class="menu-icon">☰</span></button></nav>
</header>
<div class="menu-panel" id="guide-menu" hidden>
  <p class="eyebrow">Inside the guide</p>
  <div id="menu-links"></div>
  <a class="text-link" href="https://www.armanarai.ca/galleries" target="_blank" rel="noopener">See complete weddings ↗</a>
</div>
<main>
<section class="cover" id="cover" aria-labelledby="cover-title">
  <picture><source media="(max-width:760px)" srcset="/wedding-guide/assets/home-56.webp"><img class="cover-photo" src="/wedding-guide/assets/home-19.webp" alt="A quiet moment together on a wedding day" fetchpriority="high" width="1600" height="1067"></picture>
  <div class="cover-shade"></div>
  <div class="cover-top"><span class="eyebrow">The wedding photography guide</span><span class="eyebrow">Across Canada & beyond</span></div>
  <div class="cover-copy"><p class="serif-italic">Arman Arai · The wedding guide</p><h1 id="cover-title">Get married.<br><em>I've got this.</em></h1><p>Spend the day with your favourite people. <br>I'll make sure you remember more than the seating chart.</p><a class="button outline" href="#contents">Open the guide <span>↓</span></a></div>
  <div class="cover-bottom"><span>Arman Arai · Wedding photography</span><a href="#collections">Collections from C$3,000 <span>↗</span></a></div>
</section>

<section class="contents wrap" id="contents" aria-labelledby="contents-title">
  <div class="section-head"><p class="eyebrow">Before we book anything</p><h2 id="contents-title">Let's get <em>acquainted.</em></h2></div>
  <div class="contents-layout"><p class="intro">You're choosing someone who'll spend a fair bit of your wedding day with you. Sensible to find out who that is before they turn up holding two cameras. Here's how I work and what you can expect.</p><div class="contents-list" id="contents-links"></div></div>
</section>

<section class="chapter wrap" id="hello" data-title="Hello, I'm Arman" data-label="The person behind the camera">
  <div class="chapter-label"><span>01 / A personal welcome</span><span>Arman Arai</span></div>
  <div class="portrait-layout"><figure class="portrait"><img src="/wedding-guide/assets/about-00.webp" loading="lazy" alt="Arman with his camera, wearing a cap and suspenders" width="1067" height="1600"><figcaption>Occasionally somebody points a camera back.</figcaption></figure><div class="letter"><p class="eyebrow">The short version</p><h2>Hi, I'm<br><em>Arman.</em></h2><p class="dropcap">My grandmother gave me a film camera when I was ten. Things have escalated slightly.</p><p>You don't need to know how to pose. That's why one of us is being paid. I'll give you a little direction, get to know your people, and keep an eye on the time so you can stop checking it.</p><p>During the ceremony, you won't hear much from me. During family photos, you will. There's a time and a place. I'll help where you need me and give you room when you don't.</p><p>I want you to have the photograph of your friend laughing before you've even finished the story. The hand on your shoulder just before you walk in. The things you missed because you were busy getting married. Most of those happen when nobody's looking at the camera.</p><p class="signature">Arman</p><a class="text-link" href="https://www.armanarai.ca/about" target="_blank" rel="noopener">A little more about me ↗</a></div></div>
</section>

<section class="photo-interlude"><img src="/wedding-guide/assets/home-01.webp" alt="Two hands reaching for one another through a floating veil" loading="lazy" width="1600" height="1067"><div><p class="eyebrow">Some room to be yourselves</p><p>The best bits<br>usually aren't rehearsed.</p></div></section>

<section class="chapter wrap" id="approach" data-title="How I see your day" data-label="The approach & the photographs">
  <div class="chapter-label"><span>02 / The approach</span><span>How the day feels</span></div>
  <div class="split-heading"><h2>You can<br><em>relax a little.</em></h2><div class="prose"><p>Being photographed can feel strange at first. We'll start with standing next to the person you're marrying. You've had some practice at that.</p><p>I'll photograph the day as it happens. When we step away for portraits, I'll find the light and give you something simple to do. You can walk, talk, and take a minute together while I work around you.</p></div></div>
  <div class="principles"><article><span class="small-number">I</span><h3>During the day.</h3><p>The vows, the hugs, the conversations around the tables. I'll let them happen and photograph the people in them.</p></article><article><span class="small-number">II</span><h3>During portraits.</h3><p>I'll help with where to stand, what to do and where we're going next. A little direction gives you something to settle into.</p></article><article><span class="small-number">III</span><h3>Before any of that.</h3><p>We'll sort out the timing, the family list, portrait locations and a weather alternative before the wedding. Then you can leave those things with me.</p></article></div>

  <aside class="meme-chat" aria-label="A familiar pre-wedding conversation">
    <p class="eyebrow">The portrait briefing</p>
    <div class="chat-line"><span>You</span><p>Neither of us knows what to do in photos.</p></div>
    <div class="chat-line chat-reply"><span>Me</span><p>Terrible news. I was hoping you'd run the session.</p></div>
  </aside>
  <div class="portfolio-heading"><p class="eyebrow">The photographs</p><div class="tabs" role="tablist" aria-label="Photographic approaches"><button role="tab" aria-selected="true" aria-controls="style-gallery" id="tab-documentary" data-style="documentary">Documentary</button><button role="tab" aria-selected="false" aria-controls="style-gallery" id="tab-editorial" data-style="editorial" tabindex="-1">Editorial</button><button role="tab" aria-selected="false" aria-controls="style-gallery" id="tab-film" data-style="film" tabindex="-1">Film & atmosphere</button></div></div>
  <p id="style-description" class="gallery-description">The conversations, reactions and moments that happen without instructions.</p>
  <div id="style-gallery" class="style-gallery" role="tabpanel" aria-labelledby="tab-documentary"></div>
  <div class="under-gallery"><span>Tap a photograph to look closer.</span><a class="text-link" href="https://www.armanarai.ca/galleries" target="_blank" rel="noopener">See complete wedding stories ↗</a></div>
</section>

<section class="chapter collections-section" id="collections" data-title="The collections" data-label="Coverage, inclusions & investment">
<div class="wrap"><div class="chapter-label"><span>03 / The collections</span><span>Canadian dollars · before sales tax</span></div>
  <div class="split-heading"><h2>Find your<br><em>kind of day.</em></h2><div class="prose"><p>You don't need to arrive knowing how many hours a wedding takes. Tell me what you've planned, what you're excited about, and which bits you really want to remember. I'll help you choose. That's part of my job.</p><p>The collection price is the same anywhere in Canada. Travel is quoted separately and kept lean. All the prices are below, before we've even made small talk.</p></div></div>
  <div class="collection-cards" id="collection-cards"></div>
  <p class="price-note">All prices are in CAD, before applicable sales tax. Travel and optional additions are separate. Collections and inclusions checked against <a href="https://www.armanarai.ca/pricing" target="_blank" rel="noopener">the pricing page</a> on 14 October 2026.</p>
  <details class="comparison"><summary>Compare every inclusion <span>+</span></summary><div class="table-scroll"><table id="comparison-table"><caption class="visually-hidden">Wedding collection inclusions</caption></table></div></details>
  <div class="included-note"><p class="eyebrow">In every collection</p><p>A 60-minute engagement session. Edited high-resolution photographs with print permission. Real film, processed and scanned. Vertical social reels in the first week. Film prints handed to guests on the night. Your full photo gallery in three weeks.</p></div>
  <div class="travel-note"><span class="compass">↗</span><div><p class="eyebrow">Travel kept lean</p><h3>Send me the venue and date.</h3><p>Send me the venue and date and I'll work out the sensible route. Travel covers the transport and nights the day needs. If I'm already in your region, that fee comes down or disappears. The collection price stays the same across Canada.</p></div></div>
  <div class="additions"><div><p class="eyebrow">Make it yours</p><h3>A little extra?<br><em>Your call.</em></h3><p>More time, more film, an album for your parents. Choose the things you want and you'll see the starting subtotal below.</p></div><div id="addon-groups"></div></div>
  <aside class="estimate" aria-label="Your starting estimate"><div><p class="eyebrow">Your starting point</p><h3 id="estimate-name">Signature</h3><p id="estimate-items">8 continuous hours · no optional additions</p></div><div class="estimate-total"><span id="estimate-price" aria-live="polite">C$3,000</span><small>Before tax & quoted travel</small></div><a class="button" id="estimate-contact" href="https://www.armanarai.ca/contact" target="_blank" rel="noopener">Does this look like your day? Let's talk <span>↗</span></a></aside>
  <p class="small-text">This is a planning subtotal. Availability, travel, tax and the final scope are confirmed in your written proposal. Multi-day and cultural weddings are scoped by event, crew and editing volume.</p>
</div></section>

<section class="chapter wrap" id="engagement" data-title="Before the wedding" data-label="Your engagement session">
  <div class="chapter-label"><span>04 / The engagement session</span><span>Included in every collection · 60 minutes</span></div>
  <div class="engagement-layout"><div><p class="eyebrow">Your engagement session</p><h2>Let's meet<br><em>before the aisle.</em></h2><p>An hour together before the wedding. We go somewhere you like, walk, talk and make some photographs. You'll need to supply two people who like each other. I'm assuming that bit's sorted.</p><p>Bring any ideas you have, or leave the planning with me. We'll choose a place and time that work, and you'll get to see how I direct you before the wedding day.</p><div class="field-note"><p class="eyebrow">Before the session</p><ul><li>Wear something you feel good in and can comfortably move around in.</li><li>Choose somewhere you like spending time, or ask me for ideas.</li><li>Tell me if you feel awkward. We can slow down, have a chat and work through it.</li><li>Tell me what you're comfortable with. We'll work within your boundaries.</li></ul></div></div><figure><img src="/wedding-guide/assets/pricing-01.webp" loading="lazy" alt="A couple close together among soft pink blossoms" width="1067" height="1600"><figcaption>A chance to get comfortable before the wedding.</figcaption></figure></div>
</section>

<section class="chapter wrap" id="timeline" data-title="A day with breathing room" data-label="Sample wedding-day timelines">
  <div class="chapter-label"><span>05 / The shape of the day</span><span>A plan with room for real life</span></div>
  <div class="split-heading"><h2>Give yourselves<br><em>a little room.</em></h2><div class="prose"><p>Allow time to get dressed, travel between venues and actually speak to the people who came. A little space between things makes the whole day easier.</p><p>These examples use a 4 pm ceremony. We'll plan yours around your locations, travel and the parts of the day you want covered.</p></div></div>
  <div class="timeline-layout"><div><div class="tabs timeline-tabs" role="tablist" aria-label="Sample coverage length"><button role="tab" id="time-8" aria-selected="true" aria-controls="timeline-list" data-hours="8">8 hours</button><button role="tab" id="time-10" aria-selected="false" aria-controls="timeline-list" data-hours="10" tabindex="-1">10 hours</button><button role="tab" id="time-12" aria-selected="false" aria-controls="timeline-list" data-hours="12" tabindex="-1">12 hours</button></div><div id="timeline-list" role="tabpanel" aria-labelledby="time-8"></div><p class="small-text">Illustrative coverage windows. Ceremony length, cultural events and travel between venues can change the plan considerably.</p></div><figure><img src="/wedding-guide/assets/home-07.webp" loading="lazy" alt="A bride reading her vows beside a window before getting dressed" width="1600" height="1067"><figcaption>A quiet minute before the ceremony.</figcaption><img class="timeline-second" src="/wedding-guide/assets/home-10.webp" loading="lazy" alt="Wedding guests laughing together over champagne" width="1600" height="1067"></figure></div>
</section>

<section class="wide-photo"><img src="/wedding-guide/assets/home-36.webp" loading="lazy" alt="A bride and groom laughing together, making goggles with their hands" width="1600" height="1067"><div><p class="eyebrow">The brief: “One sensible photo.”</p><h2><em>Nailed it.</em></h2></div></section>

<section class="chapter wrap" id="advice" data-title="A few things I'd tell a friend" data-label="Practical wedding-day advice">
  <div class="chapter-label"><span>06 / From experience</span><span>A few things I'd tell my friends</span></div>
  <div class="split-heading"><h2>A few things<br><em>worth knowing.</em></h2><p class="intro">A few practical things that make the day easier. None of them involve buying another thing with your wedding date printed on it.</p></div>
  <div class="advice-grid"><article><span>01</span><h3>Please eat the sandwich.</h3><p>Put breakfast and lunch on the schedule. Apparently being in love still doesn't exempt you from needing a sandwich. Keep some water nearby, too.</p></article><article><span>02</span><h3>Make room for the morning.</h3><p>Good window light, a corner for the bags, and enough time to get dressed without rushing. Those things help more than an immaculate room.</p></article><article><span>03</span><h3>Put the family list on paper.</h3><p>Give me names and groups, plus someone who knows who's who. Tell me privately about any sensitive family dynamics so we can handle them with care.</p></article><article><span>04</span><h3>Invite a Plan B.</h3><p>We'll agree on a covered option before the day. The forecast has been remarkably unhelpful about signing a contract.</p></article><article><span>05</span><h3>Let the flower lean.</h3><p>Give the little fixes to someone you trust. If a flower slips or a table needs rearranging, let them handle it while you spend time with your guests.</p></article><article><span>06</span><h3>Have a minute. Just you two.</h3><p>Step outside together after the ceremony, or take a short walk for sunset portraits. I'll help find the time. You've just got married; give yourselves a minute to take that in.</p></article></div>

  <aside class="meme-status" aria-label="Wedding-day meme: the missing family member">
    <div><p class="eyebrow">Everything is running exactly to schedule.</p><h3>Family photos: 97% complete.</h3><p>Waiting for the uncle who went to find the other uncle.</p></div>
    <div class="meme-loading" aria-hidden="true"><span></span></div>
  </aside>
</section>

<section class="chapter keepsakes" id="keepsakes" data-title="What comes home with you" data-label="Photographs, film & printed things"><div class="wrap">
  <div class="chapter-label"><span>07 / The return</span><span>Made to be revisited</span></div>
  <div class="split-heading"><h2>The day ends.<br><em>The good stuff stays.</em></h2><div class="prose"><p>You'll see the photographs in your gallery first. After that, there are prints to pass around, an album to leave on the table, and films that bring back the voices as well as the faces.</p></div></div>
  <div class="keepsake-layout"><figure><img src="/wedding-guide/assets/pricing-04.webp" loading="lazy" alt="Wedding rings and hands resting against a tulle dress" width="1067" height="1600"><figcaption>You will look at this photograph and remember the whole morning.</figcaption></figure><div class="keepsake-list"><article><p class="eyebrow">The first look back</p><h3>For the morning-after group chat.</h3><p>Signature includes a 40-image preview the next day. Legacy includes 50 images within 24 hours. Every collection includes vertical social reels in the first week and the full photo gallery in three weeks.</p><p class="small-text">Photo + Film's highlight film is delivered in ten weeks.</p></article><article><p class="eyebrow">Real film, in every collection</p><h3>A few rolls of real film.</h3><p>Signature includes two rolls of real film; Legacy and Photo + Film include four. Processing and scans are included. I work film into the day for its texture and the way it handles light; there is no guaranteed frame count per roll.</p></article><article><p class="eyebrow">The voice, the movement</p><h3>So you can hear that speech again.</h3><p>Signature includes a one-minute feature; Legacy includes a three-minute feature, captured alongside the photography. Photo + Film adds a dedicated filmmaker for twelve hours and a three-to-five-minute highlight with licensed music, and vows or speeches where the audio is clean.</p><p>Full ceremony and speeches films are a C$650 addition, with a multi-camera and audio plan agreed in advance.</p></article><article><p class="eyebrow">The printed story</p><h3>A very good reason to put your phone down.</h3><p>Legacy and Photo + Film include a 10×10-inch Signature album: 30 pages over 15 lay-flat spreads, lustre photographic paper, and a linen or vegan leather cover. I design the sequence; you get two rounds of changes.</p><p>On Signature, the album is C$1,200. The larger 12×12-inch Heirloom album is listed at C$1,800; ask for the upgrade figure if your collection already includes an album.</p></article></div></div>
  <div class="photo-pair"><img src="/wedding-guide/assets/home-18.webp" loading="lazy" alt="A quiet moment under the veil, photographed in black and white" width="1600" height="1067"><img src="/wedding-guide/assets/home-09.webp" loading="lazy" alt="Bouquets held close in warm evening light" width="1067" height="1600"></div>
</div></section>

<section class="chapter wrap" id="reviews" data-title="Words from the people in the pictures" data-label="Real messages & reviews">
  <div class="chapter-label"><span>08 / After the day</span><span>Their words</span></div>
  <h2>Okay, enough<br><em>about me.</em></h2>
  <p class="review-intro">A few words from my wedding and elopement couples. The original screenshots are here too. I could write a glowing review of myself, but the conflict of interest is fairly substantial.</p>
  <div class="review-quotes"><figure><blockquote>“He somehow caught all the little moments we didn't even notice.”</blockquote><figcaption>Brian · Google review</figcaption><button class="text-link proof-open" data-proof="reviews-09">Read the original ↗</button></figure><figure><blockquote>“I did not expect to get emotional over the album but here we are.”</blockquote><figcaption>Megan · After the album</figcaption><button class="text-link proof-open" data-proof="reviews-02">Read the original ↗</button></figure><figure><blockquote>“I cannot stop staring at the gallery”</blockquote><figcaption>Brianna · After the gallery</figcaption><button class="text-link proof-open" data-proof="reviews-04">Read the original ↗</button></figure></div>
  <details class="review-screens"><summary>Read the messages, as they were sent <span>+</span></summary><div class="proof-grid" id="proof-grid"></div></details>
  <a class="text-link" href="https://www.armanarai.ca/reviews" target="_blank" rel="noopener">More words from couples ↗</a>
</section>

<section class="chapter wrap" id="team" data-title="The people around your day" data-label="Working with your wedding team">
  <div class="chapter-label"><span>09 / The team around you</span><span>A good team makes a difference</span></div>
  <div class="team-layout"><figure><img src="/wedding-guide/assets/pricing-03.webp" loading="lazy" alt="A candlelit wedding banquet table set with flowers and glassware" width="1600" height="1067"></figure><div><h2>The people<br><em>around you.</em></h2><p>A planner who understands your priorities. A celebrant whose words feel right. Hair and makeup with time left to get dressed. Choose people you trust and enjoy having around.</p><p>Tell me who's on your team and what's already booked. I'll coordinate the photography timings and flag anything that needs more time before the wedding.</p><p>If you're still looking for someone, tell me what you need and where you're getting married. We can talk through the options.</p></div></div>
</section>

<section class="chapter wrap" id="questions" data-title="The things people ask" data-label="Straight answers before you book">
  <div class="chapter-label"><span>10 / A few straight answers</span><span>Before you decide</span></div>
  <div class="faq-layout"><div><h2>Yes, you can<br><em>ask that.</em></h2><p>If something isn't covered here, send me a message. We can talk it through before you decide.</p><a class="text-link" href="mailto:i@armanarai.com">i@armanarai.com ↗</a></div><div class="faqs">
  <details><summary>We're awkward in photographs. Will this work?<span>+</span></summary><p>Yes. That's a very normal starting point. I'll give you simple direction and time to settle in. The included engagement session lets us do that before the wedding.</p></details>
  <details><summary>How do we choose between eight, ten and twelve hours?<span>+</span></summary><p>Send me your ceremony time, locations, and the parts you want photographed. I'll recommend what fits. Eight hours is a good starting point for most full weddings. Ten gives us longer and includes a second photographer for four hours. Photo + Film gives you twelve hours and a dedicated filmmaker. You don't need to choose blind from a spreadsheet.</p></details>
  <details><summary>Do we need a second photographer?<span>+</span></summary><p>It helps with separate preparations, a large guest list or moments where two angles matter. I have yet to master being in two rooms at once. Legacy includes four hours. Added to another collection, four hours is C$800; extra hours are C$175 each.</p></details>
  <details><summary>Is video included, or do we need Photo + Film?<span>+</span></summary><p>Signature and Legacy include short feature films captured alongside the photography: one and three minutes respectively. Photo + Film gives the moving image its own dedicated filmmaker for twelve hours, with a three-to-five-minute highlight film. An eight-hour dedicated filmmaker can also be added to another collection for C$2,900.</p></details>
  <details><summary>When do we receive everything?<span>+</span></summary><p>Signature's 40-image preview arrives the next day; Legacy's 50-image preview arrives within 24 hours. Vertical social reels arrive in the first week for every collection. The full photo gallery arrives in three weeks; the Photo + Film highlight arrives in ten weeks. Album production is arranged after the design is approved.</p></details>
  <details><summary>Can we print and share the photographs?<span>+</span></summary><p>Yes. You receive edited, high-resolution images with print permission. Share them with your people and print your favourites.</p></details>
  <details><summary>Do you photograph multi-day or cultural weddings?<span>+</span></summary><p>Yes, and I'd love to hear what you're planning. Tell me about the ceremonies and gatherings that matter to you. We'll scope the events, crew, travel and editing properly. A welcome event, rehearsal dinner, tea ceremony or mehndi of up to three hours on another day is listed at C$1,000.</p></details>
  <details><summary>What happens if it rains?<span>+</span></summary><p>We'll agree on a covered space, an alternative location or some flexibility in the portrait timing before the day. Drone coverage depends on weather, venue rules and airspace permission.</p></details>
  <details><summary>How does travel work?<span>+</span></summary><p>Your collection price stays the same across Canada. Travel is quoted for your venue and date using practical routes, transport and the nights required. If I'm already scheduled in your region, that fee is reduced or waived. Destination weddings outside Canada are quoted by country and date; I work worldwide outside the United States.</p></details>
  <details><summary>How do we reserve the date, and when do we pay?<span>+</span></summary><p>A signed contract and a non-refundable 30% deposit book the date. The next 35% is due 60 days before the wedding, and the final 35% is due 30 days before. I offer a free 48-hour date hold and will tell you if another inquiry comes in during it. If your wedding is close, we'll confirm the payment dates in your proposal.</p></details>
  <details><summary>How far ahead should we get in touch?<span>+</span></summary><p>Peak-season Saturdays commonly book nine to eighteen months ahead. Weekdays and off-season dates can open up later. If your wedding is soon, send me the date and I'll check.</p></details>
  </div></div>
</section>

<section class="chapter booking" id="begin" data-title="Let's begin" data-label="A conversation, then a held date"><div class="wrap">
  <div class="chapter-label"><span>11 / Working together</span><span>Booking 2027 & 2028</span></div>
  <div class="split-heading"><h2>Tell me about<br><em>you two.</em></h2><p class="intro">Tell me the date, where you're getting married, and what you're looking forward to. You can send the rest as you work it out.</p></div>
  <ol class="booking-steps"><li><span>01</span><h3>Say hello.</h3><p>Send the date, venue or city, and a little about the day. I'll reply with availability and the coverage I'd recommend.</p></li><li><span>02</span><h3>We'll have a chat.</h3><p>We'll talk through your plans and questions. Then you receive a written proposal with the collection, travel and applicable tax, so you can see the full figure.</p></li><li><span>03</span><h3>Make it official.</h3><p>A free 48-hour hold gives you time to decide. When you're ready, a signed contract and 30% deposit reserve the date.</p></li></ol>
  <div class="payment-strip"><div><strong>30%</strong><span>To reserve your date</span></div><div><strong>35%</strong><span>60 days before</span></div><div><strong>35%</strong><span>30 days before</span></div></div>
  <div class="last-word"><p class="serif-italic">You two. Your people. The whole day.</p><h2>Let's meet.</h2><p>I'd love to hear what you're planning. Send me a message or pick a time for a call.</p><div class="cta-row"><a class="button" href="https://calendly.com/i-armanarai/30-minute-meeting-wedding" target="_blank" rel="noopener">Let's meet <span>↗</span></a><a class="text-link" id="email-cta" href="mailto:i@armanarai.com?subject=Our%20wedding">Send an email instead ↗</a></div><p class="signature">Arman Arai</p></div>
</div></section>
<section class="closing-photo" aria-label="A final photograph"><img src="/wedding-guide/assets/home-56.webp" loading="lazy" alt="A couple embracing at the water's edge on a sunlit Pacific beach" width="1067" height="1600"><p>You two. Exactly as you are.</p></section>
</main>
<footer class="wrap"><a class="wordmark" href="#cover">Arman Arai</a><p>Wedding photography across Canada.<br>Destination weddings worldwide outside the USA.</p><div><a href="https://www.armanarai.ca" target="_blank" rel="noopener">The website ↗</a><a href="https://instagram.com/iarmanarai" target="_blank" rel="noopener">Instagram ↗</a><a href="#cover">Back to the beginning ↑</a></div><p class="copyright">© 2026 Arman Arai · The wedding guide</p></footer>
<div class="chapter-indicator" aria-hidden="true"><span id="current-chapter">The wedding guide</span><span id="read-percent">0%</span></div>
<dialog id="lightbox" aria-label="Photograph viewer"><div class="lightbox-top"><span id="lightbox-count"></span><button id="lightbox-close" aria-label="Close photograph viewer">Close ×</button></div><button id="lightbox-prev" class="lightbox-arrow prev" aria-label="Previous photograph">←</button><img id="lightbox-image" alt=""><button id="lightbox-next" class="lightbox-arrow next" aria-label="Next photograph">→</button><p id="lightbox-caption"></p></dialog>
</body>
</html>
`;

export default guideHtml;
