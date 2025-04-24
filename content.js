/* 0️⃣  make sure our stylesheet is on the page */
(() => {
  const cssURL = chrome.runtime.getURL('styles.css');
  if (![...document.styleSheets].some(s => s.href === cssURL)) {
    const link = document.createElement('link');
    link.rel  = 'stylesheet';
    link.href = cssURL;
    document.head.appendChild(link);
  }
})();

/* Log for sanity */
console.log('IJM content script running on', window.location.hostname);

/* 1️⃣  check if current site is flagged */
const currentHost = window.location.hostname;

fetch(chrome.runtime.getURL('websites.json'))
  .then(r => r.json())
  .then(list => {
    if (!list.some(site => currentHost.includes(site))) return;           // ✅ site is clean
    if (sessionStorage.getItem('ijmPopupClosed')) return;                 // already dismissed this tab

    /* 2️⃣  build translucent overlay */
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position:fixed; inset:0; z-index:9999;
      background:rgba(0,0,0,.8); display:flex;
      justify-content:center; align-items:center;
    `;

    /* 3️⃣  assemble popup HTML */
    const logo   = chrome.runtime.getURL('IJM_Logo.jpg');
    const close  = chrome.runtime.getURL('close.png');
    const icon   = chrome.runtime.getURL('responsibility-icon.png');

    overlay.innerHTML = `
      <div class="ijm-popup">
        <div class="top">
          <img class="IJM_Logo"     src="${logo}"  alt="IJM logo">
          <img class="Close_Button" src="${close}" alt="Close">
        </div>

        <div class="middle">
          <div class="animation-container">
            <img class="responsibility-icon" src="${icon}" alt="Shop responsibly">
          </div>

          <div class="middle-content">
            <h1>ALERT ALERT!</h1>
            <p>The website you are currently viewing <br>has been associated with child&nbsp;slavery</p>
            <button id="view-alternatives">View Alternatives</button>
            <p id="dismiss">Dismiss</p>
          </div>
        </div>

        <div class="bottom">
          <a href="https://www.ijm.ca/about-ijm" target="_blank">
            Learn More About International Justice Mission
          </a>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    /* 4️⃣  wiring buttons */
    const closePopup = () => {
      overlay.remove();
      sessionStorage.setItem('ijmPopupClosed', 'true');
    };
    overlay.querySelector('.Close_Button').addEventListener('click', closePopup);
    overlay.querySelector('#dismiss')      .addEventListener('click', closePopup);
    overlay.querySelector('#view-alternatives')
            .addEventListener('click', () => chrome.runtime.sendMessage({ action: 'openAlternativesPopup' }));
  })
  .catch(err => console.error('IJM → failed to load flagged-sites list:', err));