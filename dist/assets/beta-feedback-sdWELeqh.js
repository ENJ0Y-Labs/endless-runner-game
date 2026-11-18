var e=5242880,t=[`image/png`,`image/jpeg`,`image/webp`];function n(n=document){n.querySelector(`#backyard-feedback-dialog`)||n.body.insertAdjacentHTML(`beforeend`,`
      <button class="backyard-feedback-launch" id="backyard-feedback-open" type="button">Report a bug</button>
      <section class="backyard-feedback-dialog" id="backyard-feedback-dialog" role="dialog" aria-modal="true" aria-labelledby="backyard-feedback-heading" hidden>
        <div class="backyard-feedback-panel">
          <div class="backyard-feedback-head">
            <div><p class="eyebrow">BACKYARD BETA</p><h2 id="backyard-feedback-heading">Report a bug</h2><p>Tell us what went wrong. Your report goes straight to the development team.</p></div>
            <button class="backyard-feedback-close" type="button" data-feedback-close aria-label="Close feedback form">×</button>
          </div>
          <form class="backyard-feedback-form" id="backyard-feedback-form">
            <label>Title
              <input id="backyard-feedback-title" name="title" type="text" minlength="5" maxlength="120" placeholder="A short summary of the problem" required>
            </label>
            <label>Description
              <textarea name="description" minlength="15" maxlength="10000" placeholder="What happened? What did you expect to happen? Include steps to reproduce it if possible." required></textarea>
            </label>
            <label>Screenshot <span class="backyard-feedback-hint">Optional · PNG, JPG or WebP · up to 5 MB</span>
              <input id="backyard-feedback-screenshot" name="screenshot" type="file" accept="image/png,image/jpeg,image/webp">
            </label>
            <div class="backyard-feedback-preview" id="backyard-feedback-preview" hidden><span>Screenshot preview</span><img id="backyard-feedback-preview-image" alt="Screenshot attached to your report"></div>
            <label class="backyard-feedback-trap" aria-hidden="true">Leave this field empty<input name="website" tabindex="-1" autocomplete="off"></label>
            <p class="backyard-feedback-status" id="backyard-feedback-status" role="status" aria-live="polite"></p>
            <button class="backyard-feedback-submit" id="backyard-feedback-submit" type="submit">Submit feedback</button>
            <button class="backyard-feedback-close" type="button" data-feedback-close>Cancel</button>
          </form>
        </div>
      </section>`);let r=n.querySelector(`#backyard-feedback-open`),i=n.querySelector(`#backyard-feedback-dialog`),a=n.querySelector(`#backyard-feedback-form`),o=n.querySelector(`#backyard-feedback-status`),s=n.querySelector(`#backyard-feedback-submit`),c=n.querySelector(`#backyard-feedback-screenshot`),l=n.querySelector(`#backyard-feedback-preview`),u=n.querySelector(`#backyard-feedback-preview-image`),d=n.querySelectorAll(`[data-feedback-close]`);if(!r||!i||!a||!o||!s)return;let f=null,p=(e,t=``)=>{o.textContent=e,o.dataset.kind=t},m=()=>{i.hidden=!0,r.focus()};r.addEventListener(`click`,()=>{i.hidden=!1,p(``),i.querySelector(`#backyard-feedback-title`)?.focus()}),d.forEach(e=>e.addEventListener(`click`,m)),i.addEventListener(`click`,e=>{e.target===i&&m()}),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&!i.hidden&&m()}),c?.addEventListener(`change`,()=>{let n=c.files?.[0];f&&URL.revokeObjectURL(f),f=null,l.hidden=!0,n&&(!t.includes(n.type)||n.size>e?(c.value=``,p(`Choose a PNG, JPG or WebP screenshot under 5 MB.`,`error`)):(f=URL.createObjectURL(n),u.src=f,l.hidden=!1,p(``)))}),a.addEventListener(`submit`,async n=>{n.preventDefault();let r=window.RELIC_RUSH_FEEDBACK_API;if(!r){p(`Feedback submission is not connected yet. Please try again later.`,`error`);return}let i=a.elements.namedItem(`title`).value.trim(),o=a.elements.namedItem(`description`).value.trim(),u=c?.files?.[0];if(i.length<5||o.length<15){p(`Add a clear title and at least 15 characters describing the issue.`,`error`);return}if(u&&(!t.includes(u.type)||u.size>e)){p(`Choose a PNG, JPG or WebP screenshot under 5 MB.`,`error`);return}let d=new FormData;d.set(`title`,i),d.set(`description`,o),d.set(`page`,location.href),d.set(`userAgent`,navigator.userAgent),d.set(`gameVersion`,document.documentElement.dataset.gameVersion||`backyard-beta`),d.set(`website`,a.elements.namedItem(`website`).value),u&&d.set(`screenshot`,u,u.name),s.disabled=!0,s.textContent=`Submitting…`,p(`Sending your report…`);try{let e=await fetch(r,{method:`POST`,body:d}),t=await e.json().catch(()=>({}));if(!e.ok)throw Error(t.error||`Your report could not be submitted.`);a.reset(),l.hidden=!0,f&&URL.revokeObjectURL(f),f=null,p(t.issueNumber?`Thanks. Report #${t.issueNumber} has been created.`:`Thanks. Your report has been submitted.`,`success`)}catch(e){p(e.message||`Network error. Please try again.`,`error`)}finally{s.disabled=!1,s.textContent=`Submit feedback`}})}export{n as mountBackyardFeedback};