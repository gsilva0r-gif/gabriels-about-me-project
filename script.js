/* ================================================================
   EDIT YOUR CONTENT HERE

   Change image file names and testimonial text in this section.
   Put replacement pictures inside the "assets" folder.
================================================================ */

const portfolioContent = {
  images: {
    hero: "assets/mechanical-hero.png",
    professional: "assets/gabriel-professional.jpg",
    alternate: "assets/gabriel-alt.png"
  },

  testimonials: [
    {
      name: "Recommendation 01",
      relationship: "Former colleague",
      quote: "Gabriel brings persistence and curiosity to every challenge. He listens carefully, communicates clearly, and keeps working until the solution is useful.",
      linkedin: ""
    },
    {
      name: "Recommendation 02",
      relationship: "Program mentor",
      quote: "What stands out is his ability to lead under pressure while continuing to learn. He connects real operational experience with growing technical skill.",
      linkedin: ""
    }
  ]
};

/* ================================================================
   WEBSITE CODE
   You usually do not need to edit anything below this line.
================================================================ */

const fallbackSkills = [
  { name: "HTML", percent: 38 },
  { name: "CSS", percent: 30 },
  { name: "JavaScript", percent: 22 },
  { name: "Python", percent: 10 }
];

function applyEditableContent() {
  document.querySelector("#hero-image").src = portfolioContent.images.hero;
  document.querySelector("#professional-photo").src = portfolioContent.images.professional;
  document.querySelector("#alternate-photo").src = portfolioContent.images.alternate;

  const testimonialGrid = document.querySelector("#testimonial-grid");
  testimonialGrid.innerHTML = "";

  portfolioContent.testimonials.forEach((testimonial, index) => {
    const article = document.createElement("article");
    article.className = "testimonial-card";

    const number = document.createElement("span");
    number.textContent = `${String(index + 1).padStart(2, "0")} / Recommendation`;

    const quote = document.createElement("blockquote");
    quote.textContent = testimonial.quote;

    const attribution = document.createElement("p");
    if (testimonial.linkedin) {
      const link = document.createElement("a");
      link.href = testimonial.linkedin;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.textContent = testimonial.name;
      attribution.append(link);
    } else {
      attribution.append(testimonial.name);
    }

    if (testimonial.relationship) {
      attribution.append(` · ${testimonial.relationship}`);
    }

    article.append(number, quote, attribution);
    testimonialGrid.append(article);
  });

  const note = document.createElement("aside");
  note.className = "testimonial-note";
  note.innerHTML = `
    <p>Recommendations from people who have worked, learned, or built alongside me.</p>
    <a href="https://www.linkedin.com/in/gabriel-silva-orozco/" target="_blank" rel="noreferrer">View LinkedIn profile ↗</a>
  `;
  testimonialGrid.append(note);
}

function setupProjectDeck() {
  const button = document.querySelector("#project-toggle");
  const digitalPanel = document.querySelector("#digital-panel");
  const engineeringPanel = document.querySelector("#engineering-panel");
  const title = document.querySelector("#deck-title");
  const digitalLabel = button.querySelector(".digital-label");
  const engineeringLabel = button.querySelector(".engineering-label");
  let engineeringIsOpen = false;

  button.addEventListener("click", () => {
    engineeringIsOpen = !engineeringIsOpen;

    digitalPanel.hidden = engineeringIsOpen;
    engineeringPanel.hidden = !engineeringIsOpen;
    digitalPanel.classList.toggle("active", !engineeringIsOpen);
    engineeringPanel.classList.toggle("active", engineeringIsOpen);
    digitalLabel.classList.toggle("active", !engineeringIsOpen);
    engineeringLabel.classList.toggle("active", engineeringIsOpen);
    button.classList.toggle("engineering", engineeringIsOpen);
    button.setAttribute("aria-pressed", String(engineeringIsOpen));
    title.textContent = engineeringIsOpen ? "Engineering builds" : "Digital work";
  });
}

function setupTechnologyInteractions() {
  const icons = [...document.querySelectorAll(".technology-icon")];
  const readout = document.querySelector("#technology-readout");

  function showReadout(icon) {
    const visiblePanel = icon.closest(".project-panel");
    const panelIcons = [...visiblePanel.querySelectorAll(".technology-icon")];
    const number = String(panelIcons.indexOf(icon) + 1).padStart(2, "0");
    readout.innerHTML = `${icon.dataset.label}<sup>(${number})</sup>`;
    readout.classList.add("visible");
  }

  function hideReadout() {
    readout.classList.remove("visible");
  }

  icons.forEach((icon) => {
    icon.addEventListener("mouseenter", () => showReadout(icon));
    icon.addEventListener("mouseleave", hideReadout);
    icon.addEventListener("focus", () => showReadout(icon));
    icon.addEventListener("blur", hideReadout);
  });

  document.querySelectorAll(".project-card[data-tech]").forEach((card) => {
    const languages = card.dataset.tech.split(" ");

    function highlight() {
      const panel = card.closest(".project-panel");
      panel.querySelectorAll(".technology-icon").forEach((icon) => {
        icon.classList.toggle("highlighted", languages.includes(icon.dataset.language));
      });
    }

    function clearHighlight() {
      card.closest(".project-panel").querySelectorAll(".technology-icon").forEach((icon) => {
        icon.classList.remove("highlighted");
      });
    }

    card.addEventListener("mouseenter", highlight);
    card.addEventListener("mouseleave", clearHighlight);
    card.addEventListener("focusin", highlight);
    card.addEventListener("focusout", clearHighlight);
  });
}

function renderSkills(skills, status) {
  const statusElement = document.querySelector("#skills-status");
  const barsElement = document.querySelector("#skills-bars");

  statusElement.classList.toggle("live", status === "live");
  statusElement.innerHTML = `<span></span>${status === "live" ? "Live GitHub language data" : "Recent portfolio snapshot"}`;
  barsElement.innerHTML = "";

  skills.forEach((skill) => {
    const row = document.createElement("div");
    row.className = "skill-row";
    row.innerHTML = `
      <div><b>${skill.name}</b><span>${skill.percent}%</span></div>
      <span class="skill-track"><i style="width:${skill.percent}%"></i></span>
    `;
    barsElement.append(row);
  });
}

async function loadGithubSkills() {
  try {
    const reposResponse = await fetch("https://api.github.com/users/gsilva0r-gif/repos?per_page=30&sort=updated", {
      headers: { Accept: "application/vnd.github+json" }
    });

    if (!reposResponse.ok) throw new Error("GitHub request failed");
    const repos = await reposResponse.json();

    const languageResponses = await Promise.all(
      repos
        .filter((repo) => !repo.fork)
        .slice(0, 12)
        .map(async (repo) => {
          const response = await fetch(repo.languages_url, {
            headers: { Accept: "application/vnd.github+json" }
          });
          return response.ok ? response.json() : {};
        })
    );

    const totals = {};
    languageResponses.forEach((languages) => {
      Object.entries(languages).forEach(([name, bytes]) => {
        totals[name] = (totals[name] || 0) + bytes;
      });
    });

    const totalBytes = Object.values(totals).reduce((sum, bytes) => sum + bytes, 0);
    if (!totalBytes) throw new Error("No language data");

    const skills = Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, bytes]) => ({
        name,
        percent: Math.max(2, Math.round((bytes / totalBytes) * 100))
      }));

    renderSkills(skills, "live");
  } catch (error) {
    renderSkills(fallbackSkills, "fallback");
  }
}

function setupClickAnimation() {
  document.addEventListener("click", (event) => {
    if (!event.target.closest("a, button")) return;
    const pulse = document.createElement("span");
    pulse.className = "click-pulse";
    pulse.style.left = `${event.clientX}px`;
    pulse.style.top = `${event.clientY}px`;
    document.body.append(pulse);
    pulse.addEventListener("animationend", () => pulse.remove());
  });
}

applyEditableContent();
setupProjectDeck();
setupTechnologyInteractions();
setupClickAnimation();
renderSkills(fallbackSkills, "fallback");
loadGithubSkills();