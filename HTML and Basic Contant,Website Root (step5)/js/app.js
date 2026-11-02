/* Ethey's Fashion Feaster — Part 3 JavaScript enhancements */
'use strict';
document.documentElement.classList.add('js-enhanced');

// Accessible FAQ accordion: only one answer is open at a time.
document.querySelectorAll('.faq-question').forEach((button) => {
  button.addEventListener('click', () => {
    const willOpen = button.getAttribute('aria-expanded') !== 'true';
    document.querySelectorAll('.faq-question').forEach((other) => {
      other.setAttribute('aria-expanded', 'false');
      const panel = document.getElementById(other.getAttribute('aria-controls'));
      if (panel) panel.hidden = true;
    });
    button.setAttribute('aria-expanded', String(willOpen));
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    if (panel) panel.hidden = !willOpen;
  });
});

// Product search and sort: dynamically filters and reorders the collection cards.
const productGrid = document.getElementById('product-grid');
if (productGrid) {
  const search = document.getElementById('product-search');
  const sort = document.getElementById('product-sort');
  const count = document.getElementById('product-count');
  const cards = Array.from(productGrid.querySelectorAll('.product-card'));
  const updateProducts = () => {
    const term = search.value.trim().toLocaleLowerCase();
    const mode = sort.value;
    const sorted = [...cards].sort((a, b) => {
      if (mode === 'price-low') return Number(a.dataset.price) - Number(b.dataset.price);
      if (mode === 'price-high') return Number(b.dataset.price) - Number(a.dataset.price);
      if (mode === 'name') return a.dataset.name.localeCompare(b.dataset.name);
      return cards.indexOf(a) - cards.indexOf(b);
    });
    sorted.forEach(card => productGrid.appendChild(card));
    let visible = 0;
    cards.forEach(card => {
      const text = (card.dataset.name + ' ' + card.textContent).toLocaleLowerCase();
      card.hidden = !text.includes(term);
      if (!card.hidden) visible++;
    });
    count.textContent = `Showing ${visible} of ${cards.length} collections`;
  };
  search.addEventListener('input', updateProducts);
  sort.addEventListener('change', updateProducts);
  updateProducts();
}

// Image lightbox for collection images. Escape closes the dialog.
let lightbox;
function closeLightbox() {
  if (!lightbox) return;
  lightbox.hidden = true;
  document.body.style.overflow = '';
}
document.querySelectorAll('.gallery-open').forEach((button) => {
  button.addEventListener('click', () => {
    if (!lightbox) {
      lightbox = document.createElement('div');
      lightbox.className = 'lightbox';
      lightbox.hidden = true;
      lightbox.setAttribute('role', 'dialog');
      lightbox.setAttribute('aria-modal', 'true');
      lightbox.setAttribute('aria-label', 'Enlarged collection image');
      lightbox.innerHTML = '<button class="lightbox-close" type="button" aria-label="Close enlarged image">×</button><img alt=""><p class="lightbox-caption"></p>';
      document.body.appendChild(lightbox);
      lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
      lightbox.addEventListener('click', event => { if (event.target === lightbox) closeLightbox(); });
    }
    const image = lightbox.querySelector('img');
    image.src = button.dataset.image;
    image.alt = button.dataset.alt || 'Fashion collection';
    lightbox.querySelector('.lightbox-caption').textContent = image.alt;
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lightbox.querySelector('.lightbox-close').focus();
  });
});
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeLightbox(); });

function showFeedback(element, message, type) {
  if (!element) return;
  element.textContent = message;
  element.className = `form-feedback ${type}`;
}
function validateForm(form) {
  const invalid = Array.from(form.querySelectorAll('input,select,textarea')).find(field => !field.checkValidity());
  if (invalid) {
    invalid.reportValidity();
    invalid.focus();
    return false;
  }
  return true;
}

// Enquiry form: validates inputs and gives a relevant prototype response before opening email.
const enquiryForm = document.getElementById('enquiry-form');
if (enquiryForm) {
  enquiryForm.addEventListener('submit', event => {
    event.preventDefault();
    const feedback = document.getElementById('enquiry-feedback');
    if (!validateForm(enquiryForm)) {
      showFeedback(feedback, 'Please check the highlighted fields and correct the information.', 'error');
      return;
    }
    const type = document.getElementById('type').value;
    const message = document.getElementById('message').value.trim();
    let response = 'Thank you. Our team will review your enquiry. Prices and availability must be confirmed by the store.';
    if (type === 'Size or availability') response = 'Thank you. Please include the product name, size and preferred store in your message. Availability is not live in this academic prototype and must be confirmed by the store.';
    else if (type === 'Product information') response = 'Thank you. Our displayed collection prices are illustrative only. The store will need to confirm current pricing and product details.';
    else if (type === 'Customer support') response = 'Thank you for contacting customer support. Please include any order or product details that help us understand your request.';
    else if (/sponsor|volunteer/i.test(message)) response = 'Thank you for your interest in supporting Ethey’s Fashion Feaster. Please describe the support you would like to offer; the team can follow up by email.';
    showFeedback(feedback, response + ' Your email application will open with your enquiry details.', 'success');
    const data = new FormData(enquiryForm);
    const body = Array.from(data.entries()).map(([key, value]) => `${key}: ${value}`).join('\n');
    window.location.href = `mailto:info@etheysfashion.co.za?subject=${encodeURIComponent('Website enquiry — Ethey’s Fashion Feaster')}&body=${encodeURIComponent(body)}`;
  });
}

// Contact form: validates and prepares a complete email in the visitor's email application.
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', event => {
    event.preventDefault();
    const feedback = document.getElementById('contact-feedback');
    if (!validateForm(contactForm)) {
      showFeedback(feedback, 'Please correct the fields marked by your browser and try again.', 'error');
      return;
    }
    const data = new FormData(contactForm);
    const body = `Name: ${data.get('name')}\nEmail: ${data.get('email')}\nPhone: ${data.get('phone') || 'Not supplied'}\nMessage type: ${data.get('type')}\n\nMessage:\n${data.get('message')}`;
    showFeedback(feedback, 'Your message has been checked. Your default email application should open with the message prepared. Please review it and press Send in your email application.', 'success');
    window.location.href = `mailto:info@etheysfashion.co.za?subject=${encodeURIComponent(`Website contact: ${data.get('type')}`)}&body=${encodeURIComponent(body)}`;
  });
}

// Optional Leaflet map. The page remains usable if the library or internet is unavailable.
const mapElement = document.getElementById('store-map');
if (mapElement) {
  const loadMap = () => {
    if (!window.L) { mapElement.innerHTML = '<p>Interactive map is unavailable offline. Use the proposed store addresses listed above.</p>'; return; }
    mapElement.textContent = '';
    const map = L.map(mapElement).setView([-23.05, 29.85], 8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
    L.marker([-23.9045, 29.4689]).addTo(map).bindPopup('<strong>Proposed Polokwane store</strong><br>123 Thabo Mbeki Street, Polokwane');
    L.marker([-23.0439, 29.9044]).addTo(map).bindPopup('<strong>Proposed Makhado store</strong><br>45 Main Road, Makhado');
  };
  const leafletCss = document.createElement('link'); leafletCss.rel = 'stylesheet'; leafletCss.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(leafletCss);
  const leafletScript = document.createElement('script'); leafletScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; leafletScript.onload = loadMap; leafletScript.onerror = () => { mapElement.innerHTML = '<p>Map library could not load. Use the proposed store addresses listed above.</p>'; }; document.head.appendChild(leafletScript);
}
