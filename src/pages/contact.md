---
layout: layouts/page.njk
title: "How can we help?"
seoTitle: "Contact | adicot.com"
description: "Contact Adicot, Inc. Feedback on the engineering calculators, or an inquiry about HVAC load calculations and energy code compliance."
permalink: /contact.html
---

<p class="contact-intro">Feedback on a calculator, a question about the methodology,
or an inquiry about engineering services. This form reaches us either way.</p>

<div class="contact-layout">
<div class="contact-main">

<form class="contact-form" method="POST"
      action="https://formspree.io/f/{{ site.contact.formspreeId }}"
      {%- if not site.contact.formspreeId %} data-unconfigured="true"{% endif %}>
  {# Where the provider should send people after a successful post. #}
  <input type="hidden" name="_next" value="{{ site.url }}/contact/thanks">
  <input type="hidden" name="_subject" value="adicot.com contact form">
  {# Honeypot. Formspree discards anything with _gotcha filled in. #}
  <p class="hp" aria-hidden="true">
    <label for="company-url">Leave this field empty</label>
    <input id="company-url" type="text" name="_gotcha" tabindex="-1" autocomplete="off">
  </p>

  <div class="field">
    <label for="cf-name">Name <span class="req" aria-hidden="true">*</span></label>
    <input id="cf-name" name="name" type="text" required autocomplete="name">
  </div>

  <div class="field">
    <label for="cf-email">Email <span class="req" aria-hidden="true">*</span></label>
    <input id="cf-email" name="email" type="email" required autocomplete="email"
           aria-describedby="cf-email-hint">
    <p class="hint" id="cf-email-hint">So we can reply. Nothing else.</p>
  </div>

  <div class="field">
    <label for="cf-company">Company <span class="opt">optional</span></label>
    <input id="cf-company" name="company" type="text" autocomplete="organization">
  </div>

  <div class="field">
    <label for="cf-reason">What is this about?</label>
    <select id="cf-reason" name="reason">
      <option value="Calculator feedback or question">Calculator feedback or question</option>
      <option value="Engineering services inquiry">Engineering services inquiry</option>
      <option value="Existing project">An existing project</option>
      <option value="Something else">Something else</option>
    </select>
  </div>

  <div class="field">
    <label for="cf-location">Project location <span class="opt">optional</span></label>
    <input id="cf-location" name="location" type="text" autocomplete="address-level1"
           aria-describedby="cf-location-hint" placeholder="State or jurisdiction">
    <p class="hint" id="cf-location-hint">Helpful for services inquiries, since licensure and energy code vary by state.</p>
  </div>

  <div class="field">
    <label for="cf-message">Message <span class="req" aria-hidden="true">*</span></label>
    <textarea id="cf-message" name="message" rows="7" required></textarea>
  </div>

  <p class="form-actions">
    <button class="btn" type="submit">Send message</button>
  </p>
</form>

{% if not site.contact.formspreeId %}
<p class="notice" role="status">
  {#- Shown only while site.contact.formspreeId is empty in src/_data/site.json. #}
  <strong>This form isn't taking messages right now.</strong> Please email
  <a href="mailto:{{ site.contact.email }}">{{ site.contact.email }}</a> directly.
</p>
{% endif %}

</div>

<figure class="contact-figure">
  <img src="/assets/contact-desk.jpg"
       alt="A desk with a coffee cup, notebook and telephone" width="1100" height="733" loading="lazy">
</figure>
</div>

<p class="contact-note">Because the calculators are free to use, replies to calculator
feedback can take a little while. Engineering inquiries are answered within a
business day.</p>
