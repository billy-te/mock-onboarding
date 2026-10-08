(function () {
  var mode = document.body.getAttribute("data-tutorial") || "full";
  var running = false;
  var index = 0;
  var steps = [];
  var currentEl = null;
  var advancing = false;
  var hole;
  var note;
  var progressEl;
  var textEl;
  var endBtn;
  var doneBtn;

  var style = document.createElement("style");
  style.textContent =
    "#tutorial-hole{position:fixed;z-index:80;pointer-events:none;box-shadow:0 0 0 9999px rgba(16,24,40,.55);outline:3px solid #1a6e5c;outline-offset:0;border-radius:12px}" +
    "#tutorial-note{position:fixed;z-index:81;width:min(340px,calc(100vw - 24px));background:#fff;border-radius:12px;padding:14px 16px 12px;box-shadow:0 12px 40px rgba(16,24,40,.2);color:#243041;font-family:Inter,ui-sans-serif,system-ui,sans-serif}" +
    "body.tutorial-form-step #form-view,body.tutorial-form-step #start-view{padding-top:148px}" +
    "#tutorial-note[hidden],#tutorial-hole[hidden]{display:none!important}" +
    "#tutorial-note .tutorial-progress{margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#1a6e5c}" +
    "#tutorial-note .tutorial-text{margin:0;font-size:14px;line-height:1.45}" +
    "#tutorial-note .tutorial-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:12px}" +
    "#tutorial-end{border:0;background:transparent;color:#6d7482;font:inherit;font-size:13px;font-weight:600;cursor:pointer;padding:6px 4px}" +
    "#tutorial-done{border:0;background:#1a6e5c;color:#fff;font:inherit;font-size:14px;font-weight:600;border-radius:999px;height:34px;padding:0 16px;cursor:pointer}" +
    "#board-view header{position:relative}" +
    "#start-tutorial{position:absolute;top:18px;right:22px;height:36px;padding:0 16px;border:0;border-radius:999px;background:#1a6e5c;color:#fff;font:inherit;font-size:14px;font-weight:600;cursor:pointer}";
  document.head.appendChild(style);

  var startBtn = document.createElement("button");
  startBtn.id = "start-tutorial";
  startBtn.type = "button";
  startBtn.textContent = "Start tutorial";
  var boardHeader = document.querySelector("#board-view header");
  if (boardHeader) boardHeader.appendChild(startBtn);

  hole = document.createElement("div");
  hole.id = "tutorial-hole";
  hole.hidden = true;
  note = document.createElement("div");
  note.id = "tutorial-note";
  note.hidden = true;
  note.setAttribute("role", "dialog");
  note.setAttribute("aria-live", "polite");
  progressEl = document.createElement("p");
  progressEl.className = "tutorial-progress";
  textEl = document.createElement("p");
  textEl.className = "tutorial-text";
  var actions = document.createElement("div");
  actions.className = "tutorial-actions";
  endBtn = document.createElement("button");
  endBtn.id = "tutorial-end";
  endBtn.type = "button";
  endBtn.textContent = "End tutorial";
  doneBtn = document.createElement("button");
  doneBtn.id = "tutorial-done";
  doneBtn.type = "button";
  doneBtn.textContent = "Done";
  doneBtn.hidden = true;
  actions.appendChild(endBtn);
  actions.appendChild(doneBtn);
  note.appendChild(progressEl);
  note.appendChild(textEl);
  note.appendChild(actions);
  document.body.appendChild(hole);
  document.body.appendChild(note);

  function card(title) {
    var cards = document.querySelectorAll("#board-view a.card");
    for (var i = 0; i < cards.length; i++) {
      var heading = cards[i].querySelector("h2");
      if (heading && heading.textContent.trim() === title) return cards[i];
    }
    return null;
  }

  function firstAction() {
    var links = document.querySelectorAll("#rows a.action");
    for (var i = 0; i < links.length; i++) {
      if (links[i].textContent.indexOf("Take an action") !== -1) return links[i];
    }
    return null;
  }

  function buildSteps() {
    var list = [
      {
        part: "labor-intro",
        text: "After offers are accepted, come to the Actions tab of Onboarding. Depending on the location, there may be a form you have to fill out and submit to kick off the candidate's onboarding package. Click Complete LA Labor Form.",
        advance: "click",
        before: function () { showBoard(); },
        target: function () { return card("Complete LA Labor Form"); }
      },
      {
        part: "labor-do",
        text: "Click Take an action to open the form for this candidate.",
        advance: "click",
        before: function () { showList("Complete LA Labor Form"); },
        target: firstAction
      },
      {
        part: "labor-do",
        text: "Fill out the form, then click Submit. You will return to the onboarding dashboard.",
        advance: "submit",
        formId: "schedule-form",
        target: function () { return document.getElementById("schedule-form"); }
      },
      {
        part: "bg-intro",
        background: true,
        text: "After you completed any forms in the first column, the candidate received an email and initiated their background screen. Now click on Approve Background Check.",
        advance: "click",
        before: function () { showBoard(); },
        target: function () { return card("Approve Background Check"); }
      },
      {
        part: "bg-do",
        background: true,
        text: "Click Take an action to review this candidate's background check.",
        advance: "click",
        before: function () { showList("Approve Background Check"); },
        target: firstAction
      },
      {
        part: "bg-do",
        background: true,
        text: "Click Approve to clear the background check. You will return to the dashboard.",
        advance: "click-board",
        wait: 280,
        target: function () { return document.getElementById("drawer-approve"); }
      },
      {
        part: "start",
        text: "Click Update Candidate Start Date to confirm the candidate's start date.",
        advance: "click",
        before: function () { showBoard(); },
        target: function () { return card("Update Candidate Start Date"); }
      },
      {
        part: "start",
        text: "Click Take an action to set the start date.",
        advance: "click",
        before: function () { showList("Update Candidate Start Date"); },
        target: firstAction
      },
      {
        part: "start",
        text: "Enter the date of joining, then click Submit.",
        advance: "submit",
        formId: "start-form",
        target: function () { return document.getElementById("start-form"); }
      },
      {
        part: "i9",
        text: mode === "ac"
          ? "Now that the start date is set, we initiate the first part of the I9. Part two happens on day 1. Click Initiate I9 Process."
          : "Now that the candidate passed the background check and the start date is set, we initiate the first part of the I9. Part two happens on day 1. Click Initiate I9 Process.",
        advance: "click",
        before: function () { showBoard(); },
        target: function () { return card("Initiate I9 Process"); }
      },
      {
        part: "i9",
        text: "Click Take an action to start part 1 of the I9.",
        advance: "click",
        before: function () { showList("Initiate I9 Process"); },
        target: firstAction
      },
      {
        part: "i9",
        text: "Click Initiate. You will return to the dashboard.",
        advance: "click-board",
        wait: 280,
        target: function () { return document.getElementById("drawer-approve"); }
      },
      {
        part: "ready",
        text: "Now that the candidate has completed all onboarding steps, click Ready to Hire. You will click Yes to confirm they are ready to move to hired.",
        advance: "click",
        before: function () { showBoard(); },
        target: function () { return card("Ready to Hire"); }
      },
      {
        part: "ready",
        text: "Click Take an action for this candidate.",
        advance: "click",
        before: function () { showList("Ready to Hire"); },
        target: firstAction
      },
      {
        part: "ready",
        text: "Click Yes to confirm they are ready to move to hired.",
        advance: "click-board",
        wait: 280,
        target: function () { return document.getElementById("drawer-approve"); }
      },
      {
        part: "finale",
        text: "A final step would be clicking Complete I9 Form 2 under Day 1. This is done by someone at the store or office. They fill in part 2 of the form and submit it. Onboarding is complete.",
        advance: "finish",
        before: function () { showBoard(); },
        target: function () { return card("Complete I9 Form 2"); }
      }
    ];

    if (mode === "ac") list = list.filter(function (step) { return !step.background; });

    var partOrder = [];
    list.forEach(function (step) {
      if (partOrder.indexOf(step.part) === -1) partOrder.push(step.part);
      step.stage = partOrder.indexOf(step.part) + 1;
    });
    var total = partOrder.length;
    list.forEach(function (step) { step.total = total; });
    return list;
  }

  function place(step, el) {
    if (!el) return;
    document.body.classList.toggle("tutorial-form-step", !!step.formId);
    var rect = el.getBoundingClientRect();
    var pad = 8;
    var radius = window.getComputedStyle(el).borderRadius;
    hole.hidden = false;
    hole.style.top = (rect.top - pad) + "px";
    hole.style.left = (rect.left - pad) + "px";
    hole.style.width = (rect.width + pad * 2) + "px";
    hole.style.height = (rect.height + pad * 2) + "px";
    hole.style.borderRadius = radius && radius !== "0px" ? radius : "12px";

    progressEl.textContent = "Step " + step.stage + " of " + step.total;
    textEl.textContent = step.text;
    doneBtn.hidden = step.advance !== "finish";
    endBtn.hidden = step.advance === "finish";
    note.hidden = false;

    if (step.formId) {
      note.style.top = "12px";
      note.style.bottom = "auto";
      note.style.left = "12px";
      note.style.width = "min(460px, calc(100vw - 24px))";
      return;
    }
    note.style.bottom = "auto";
    note.style.width = "min(340px, calc(100vw - 24px))";

    var margin = 12;
    var width = note.offsetWidth;
    var height = note.offsetHeight;
    var left = rect.left;
    var top = rect.bottom + margin + 4;
    if (rect.height > window.innerHeight * 0.5) {
      left = Math.min(window.innerWidth - width - margin, rect.right + margin);
      top = margin;
      if (left < rect.right && left + width > rect.left) left = margin;
    } else if (top + height > window.innerHeight - margin) {
      top = rect.top - margin - height;
    }
    if (top < margin) top = margin;
    if (left + width > window.innerWidth - margin) left = window.innerWidth - margin - width;
    if (left < margin) left = margin;
    note.style.top = top + "px";
    note.style.left = left + "px";
  }

  function show(i) {
    if (i >= steps.length) {
      end();
      return;
    }
    index = i;
    var step = steps[i];
    if (step.before) step.before();
    setTimeout(function () {
      var el = step.target();
      currentEl = el;
      if (el) el.scrollIntoView({ block: "nearest", inline: "center" });
      setTimeout(function () {
        currentEl = step.target();
        place(step, currentEl);
      }, 60);
    }, step.wait || 0);
  }

  function advance(kind) {
    if (!running || advancing) return;
    var step = steps[index];
    if (kind === "click" && step.advance !== "click" && step.advance !== "click-board") return;
    if (kind === "submit" && step.advance !== "submit") return;
    advancing = true;
    var toBoard = step.advance === "click-board";
    var next = index + 1;
    setTimeout(function () {
      advancing = false;
      if (toBoard) showBoard();
      show(next);
    }, 40);
  }

  function start() {
    steps = buildSteps();
    running = true;
    advancing = false;
    showBoard();
    show(0);
  }

  function end() {
    running = false;
    currentEl = null;
    document.body.classList.remove("tutorial-form-step");
    hole.hidden = true;
    note.hidden = true;
    showBoard();
  }

  document.addEventListener("keydown", function (event) {
    if (!event.ctrlKey || !event.shiftKey || event.code !== "Digit3" || event.repeat) return;
    event.preventDefault();
    start();
  });

  document.addEventListener("click", function (event) {
    if (!running) return;
    if (event.target.closest("#tutorial-note") || event.target.closest("#start-tutorial")) return;
    var step = steps[index];
    if (step.advance === "finish") {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (currentEl && currentEl.contains(event.target)) {
      if (step.advance === "click" || step.advance === "click-board") advance("click");
      return;
    }
    event.preventDefault();
    event.stopPropagation();
  }, true);

  document.addEventListener("submit", function (event) {
    if (!running) return;
    var step = steps[index];
    if (step.advance === "submit" && event.target.id === step.formId) {
      setTimeout(function () {
        showBoard();
        show(index + 1);
      }, 40);
    }
  }, true);

  endBtn.addEventListener("click", end);
  doneBtn.addEventListener("click", end);
  startBtn.addEventListener("click", start);

  window.addEventListener("resize", function () {
    if (running) place(steps[index], steps[index].target());
  });
  window.addEventListener("scroll", function () {
    if (running) place(steps[index], steps[index].target());
  }, true);
})();
