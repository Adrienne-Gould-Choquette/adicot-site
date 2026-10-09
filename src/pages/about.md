---
layout: layouts/page.njk
title: "About Adicot, Inc."
seoTitle: "About Adicot, Inc. | adicot.com"
description: "A boutique mechanical engineering practice with national reach. HVAC load calculations and energy code compliance, engineer-stamped in 11 states."
permalink: /about.html
subtitle: "A boutique mechanical engineering practice with national reach."
proseWide: true
---
{%- macro ico(name) -%}
<svg class="ab-ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
{%- if name == 'calendar' %}<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>
{%- elif name == 'map' %}<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>
{%- elif name == 'stamp' %}<path d="M9 13V9a3 3 0 1 1 6 0v4"/><path d="M5 13h14v4H5zM4 21h16"/>
{%- elif name == 'check' %}<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.8 2.8L16.5 9.5"/>
{%- elif name == 'users' %}<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6.5 6.5 0 0 1 3.5 6"/>
{%- elif name == 'doc' %}<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>
{%- elif name == 'dollar' %}<circle cx="12" cy="12" r="9"/><path d="M15 9.2c-.5-1-1.6-1.6-3-1.6-1.8 0-3 .9-3 2.2 0 3 6 1.5 6 4.5 0 1.3-1.3 2.2-3 2.2-1.5 0-2.6-.6-3.1-1.7M12 6v1.6M12 16.9v1.6"/>
{%- elif name == 'calc' %}<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h1M11.5 11h1M15 11h1M8 14.5h1M11.5 14.5h1M15 14.5h1M8 18h1M11.5 18h4.5"/>
{%- elif name == 'cube' %}<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/>
{%- elif name == 'clock' %}<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
{%- elif name == 'award' %}<circle cx="12" cy="9" r="5.5"/><path d="M8.5 13.5L7 21l5-2.5 5 2.5-1.5-7.5"/>
{%- endif %}</svg>
{%- endmacro %}

<p class="ab-lede">Founded in Venice, Florida in 2014 and headquartered in Boston, Massachusetts since 2022, Adicot is a multi-state mechanical engineering practice with active licensure in eleven states. Over the past {{ business.yearsWord }} years the firm has delivered more than 3,000 stamped projects and built a calculator library at adicot.com that serves over 15,000 users each month.</p>

<section class="ab-split" aria-labelledby="ab-comfort">
<div class="ab-text">
<h2 id="ab-comfort">Engineered comfort</h2>
<p>Adicot was built on a simple founding principle: engineered comfort. We design HVAC and mechanical systems that perform for the people who occupy the buildings, the developers who own them, and the architects whose work depends on what happens inside the walls.</p>
<p>The practice centers on <strong>HVAC load calculations and energy code compliance</strong> for industrial, commercial and multi-family projects. Our methodology is grounded in the same calculations our public calculator library teaches to other engineers, and a three-hundred-unit multi-family building gets the same approach as a single-building industrial project. We invest in process discipline so delivery times stay short and quality stays high, and we use modern tools (BIM-compatible 3D IFC design, with integrated load and energy software) to keep coordination tight from the first sketch through the final stamp.</p>
<p>After more than three thousand stamped projects across eleven states, we have built working relationships with architects, builders, engineering firms, contractors and developers who come back project after project. Consistency, responsiveness and clear communication are what they need from a mechanical consultant.</p>
</div>
<figure class="ab-card ab-mapcard">
<figcaption class="ab-cardhead">{{ ico('map') }}<span>Professional engineer licensure</span></figcaption>
<div class="ab-map" role="img" aria-label="Map of the United States with the {{ usTiles.count }} states Adicot is licensed in highlighted: {% for s in usTiles.tiles %}{% if s[0] in usTiles.licensed %}{{ s[1] }}{% if not loop.last %}, {% endif %}{% endif %}{% endfor %}">
{%- for s in usTiles.tiles %}<span class="ab-tile{% if s[0] in usTiles.licensed %} is-on{% endif %}" style="grid-column:{{ s[2] + 1 }};grid-row:{{ s[3] + 1 }}" title="{{ s[1] }}{% if s[0] in usTiles.licensed %}: licensed{% endif %}">{{ s[0] }}</span>{% endfor -%}
</div>
<p class="ab-legend"><span class="ab-key is-on"></span> Licensed ({{ usTiles.count }}) <span class="ab-key"></span> Other states</p>
</figure>
</section>

<section aria-labelledby="ab-process">
<h2 id="ab-process">How a project runs</h2>
<ol class="ab-flow">
  <li class="ab-step">{{ ico('doc') }}<span class="ab-stepno">1</span><strong>Send the plans</strong><span>Drawings, project type, square footage and the turnaround you need.</span></li>
  <li class="ab-step">{{ ico('dollar') }}<span class="ab-stepno">2</span><strong>Priced on screen</strong><span>The online quote tool shows the fee; it is confirmed in writing once we review the scope.</span></li>
  <li class="ab-step">{{ ico('calc') }}<span class="ab-stepno">3</span><strong>Calculated</strong><span>Loads by ASHRAE methods, ventilation and compliance to the code your jurisdiction adopts.</span></li>
  <li class="ab-step">{{ ico('stamp') }}<span class="ab-stepno">4</span><strong>Stamped and delivered</strong><span>Plan-review ready, with the assumptions written down.</span></li>
</ol>
<p class="ab-flownote">{{ ico('clock') }}<span><strong>5 to 10 business days</strong> from scope confirmation for most projects; rush turnarounds when schedules require them.</span></p>
</section>

<section class="ab-principal" aria-labelledby="ab-meet">
<h2 id="ab-meet">Meet the principal</h2>
<div class="ab-split ab-split-rev">
<figure class="ab-card ab-profile">
<img src="/assets/adrienne.jpg" width="640" height="800" loading="lazy" alt="Adrienne Gould-Choquette, P.E., founder and Principal Engineer of Adicot">
<figcaption><strong>Adrienne Gould-Choquette</strong>, P.E., MSME<span>Founder + Principal Engineer</span></figcaption>
<ul class="ab-chips" aria-label="Credentials">
  <li>Professional Engineer (P.E.)</li>
  <li>NCEES Model Law Engineer</li>
  <li>2 U.S. patents (Bell Labs)</li>
  <li>B.S. + M.S. Mechanical Engineering (URI)</li>
  <li>Graduate coursework in Sustainability, Harvard</li>
</ul>
</figure>
<div class="ab-text">
<p>Adrienne Gould-Choquette is the founder and Principal Engineer of Adicot. She holds active PE licensure in eleven states and is recognized as an NCEES Model Law Engineer, a credential signifying that her qualifications meet the model standards used to support PE licensure applications across U.S. jurisdictions.</p>
<p>She holds a B.S. and M.S. in Mechanical Engineering from the University of Rhode Island and completed graduate coursework in Sustainability at Harvard University. Before founding Adicot she worked in semiconductor manufacturing research at Lucent Technologies and Bell Labs, where she was awarded two U.S. patents for innovations in the Tungsten CVD process for low-temperature manufacturing applications. In 2012 she was named Engineering Technology Educator of the Year for the State of Florida by FLATE, the Florida Advanced Technological Education Center of Excellence, for her work building and leading engineering programs at the State College of Florida, Manatee-Sarasota.</p>
<p>Adrienne has held volunteer leadership roles, joining the Massachusetts EOHLC Designer Selection Board in 2025 and chairing it since 2026, evaluating and ranking design firms on behalf of the Executive Office of Housing and Livable Communities. She has held various positions at the Sarasota ASHRAE Chapter, including Secretary, Treasurer and Vice President. She has also served on the Architectural Review Board for the City of Venice, Florida.</p>
</div>
</div>
<h3 class="ab-subhead">Service and recognition</h3>
<ol class="ab-timeline">
  <li><span class="ab-when">2026–</span><span class="ab-what"><strong>Chair</strong>, MA EOHLC Designer Selection Board</span></li>
  <li><span class="ab-when">2025–</span><span class="ab-what">Member, MA EOHLC Designer Selection Board</span></li>
  <li class="is-firm"><span class="ab-when">2022</span><span class="ab-what">Adicot headquarters moves to <strong>Boston, MA</strong></span></li>
  <li><span class="ab-when">2015–2021</span><span class="ab-what">Sarasota ASHRAE Chapter: Secretary, Treasurer, Vice President</span></li>
  <li class="is-firm"><span class="ab-when">2014</span><span class="ab-what"><strong>Adicot founded</strong> in Venice, FL (October 15)</span></li>
  <li><span class="ab-when">2013–2016</span><span class="ab-what">City of Venice Architectural Review Board</span></li>
  <li><span class="ab-when">2012</span><span class="ab-what">Florida Engineering Technology Educator of the Year (FLATE)</span></li>
  <li><span class="ab-when">Earlier</span><span class="ab-what">Semiconductor manufacturing research, Lucent Technologies and Bell Labs: 2 U.S. patents</span></li>
</ol>
</section>

<section aria-labelledby="ab-five">
<h2 id="ab-five">Five things to know about Adicot</h2>
<div class="ab-grid">
  <div class="ab-card ab-point">{{ ico('calc') }}<h3>Calculations behind every drawing</h3><p>Deliverables include the load calculations, energy compliance and ventilation analyses that underpin the design, using the same methodology our calculator library teaches to other engineers.</p></div>
  <div class="ab-card ab-point">{{ ico('clock') }}<h3>Process-driven turnaround</h3><p>Most projects are delivered within 5 to 10 business days, with rush turnarounds available when schedules require them. The pace comes from a mature internal process, not from cutting scope.</p></div>
  <div class="ab-card ab-point">{{ ico('dollar') }}<h3>Pricing in the open</h3><p>Most projects can be priced through our online quote tool. The on-screen estimate is preliminary; final fees are confirmed in writing after we review your documents and scope.</p></div>
  <div class="ab-card ab-point">{{ ico('cube') }}<h3>Modern tooling</h3><p>Designs are BIM-compatible and created in 3D using IFC format, with integrated load and energy software supporting the workflow.</p></div>
  <div class="ab-card ab-point">{{ ico('award') }}<h3>A public calculator library</h3><p>Adicot maintains a free engineering calculator library used by over 15,000 users each month. It is a public reference for the methodology the team uses internally, and it is always free to access.</p></div>
</div>
</section>

<section class="ab-cta" aria-labelledby="ab-work">
<h2 id="ab-work">Work with Adicot</h2>
<p>See what we do and how it is priced, or use the free calculator library.</p>
<p class="ab-ctabtns"><a class="btn" href="/services">Engineering Services &rarr;</a> <a class="btn btn-quiet" href="/calculators">Browse the calculators &rarr;</a></p>
</section>
