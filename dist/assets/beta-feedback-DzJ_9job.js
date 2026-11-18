function e(e=document){e.querySelector(`#backyard-feedback-dialog`)||e.body.insertAdjacentHTML(`beforeend`,`
      <button class="backyard-feedback-launch" id="backyard-feedback-open" type="button">Report a bug</button>
      <section class="backyard-feedback-dialog" id="backyard-feedback-dialog" role="dialog" aria-modal="true" aria-labelledby="backyard-feedback-heading" hidden>
        <div class="backyard-feedback-panel">
          <div class="backyard-feedback-head">
            <div><p class="eyebrow">BACKYARD BETA</p><h2 id="backyard-feedback-heading">Report a bug</h2><p>Tell us what went wrong. Submitting opens a pre-filled report on GitHub (a free GitHub account is needed). You can paste a screenshot there.</p></div>
            <button class="backyard-feedback-close" type="button" data-feedback-close aria-label="Close feedback form">×</button>
          </div>
          <form class="backyard-feedback-form" id="backyard-feedback-form">
            <label>Title
              <input id="backyard-feedback-title" name="title" type="text" minlength="5" maxlength="120" placeholder="A short summary of the problem" required>
            </label>
            <label>Description
              <textarea name="description" minlength="15" maxlength="4000" placeholder="What happened? What did you expect to happen? Include steps to reproduce it if possible." required></textarea>
            </label>
            <p class="backyard-feedback-status" id="backyard-feedback-status" role="status" aria-live="polite"></p>
            <button class="backyard-feedback-submit" id="backyard-feedback-submit" type="submit">Continue to GitHub</button>
            <button class="backyard-feedback-close" type="button" data-feedback-close>Cancel</button>
          </form>
        </div>
      </section>`);let t=e.querySelector(`#backyard-feedback-open`),n=e.querySelector(`#backyard-feedback-dialog`),r=e.querySelector(`#backyard-feedback-form`),i=e.querySelector(`#backyard-feedback-status`),a=e.querySelectorAll(`[data-feedback-close]`);if(!t||!n||!r||!i)return;let o=(e,t=``)=>{i.textContent=e,i.dataset.kind=t},s=()=>{n.hidden=!0,t.focus()};t.addEventListener(`click`,()=>{n.hidden=!1,o(``),n.querySelector(`#backyard-feedback-title`)?.focus()}),a.forEach(e=>e.addEventListener(`click`,s)),n.addEventListener(`click`,e=>{e.target===n&&s()}),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&!n.hidden&&s()}),r.addEventListener(`submit`,e=>{e.preventDefault();let t=r.elements.namedItem(`title`).value.trim(),n=r.elements.namedItem(`description`).value.trim();if(t.length<5||n.length<15){o(`Add a clear title and at least 15 characters describing the issue.`,`error`);return}let i=[`## Beta tester report`,n,``,`## Environment`,`- Page: ${location.href}`,`- Build: ${document.documentElement.dataset.gameVersion||`backyard-beta`}`,`- Browser: ${navigator.userAgent}`,``,`_Submitted from the in-game Backyard feedback form._`].join(`
`),a=`https://github.com/ENJ0Y-Labs/endless-runner-game/issues/new?${new URLSearchParams({title:`[Backyard Beta] ${t}`,body:i})}`;window.open(a,`_blank`,`noopener,noreferrer`)?(r.reset(),o(`GitHub opened in a new tab. Review the report there and press “Submit new issue”.`,`success`)):o(`Your browser blocked the new tab. Allow pop-ups for this site and try again.`,`error`)})}export{e as mountBackyardFeedback};