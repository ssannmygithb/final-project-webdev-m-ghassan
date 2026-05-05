// ── 1. HAMBURGER MENU ──────────────────────────────────────
const hamburger = document.getElementById("hamburger");
const mobileNav = document.getElementById("mobileNav");

if (hamburger && mobileNav) {
  hamburger.addEventListener("click", () => {
    mobileNav.classList.toggle("open");
  });
  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileNav.classList.remove("open");
    });
  });
}

// ── 2. NAV HIGHLIGHT ─────────────────────────
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-links a:not(.nav-cta)");

const observerOptions = {
  root: null,
  rootMargin: "-40% 0px -55% 0px",
  threshold: 0,
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      navLinks.forEach((link) => {
        link.style.color = "";
        if (link.getAttribute("href") === `#${entry.target.id}`) {
          link.style.color = "var(--green)";
        }
      });
    }
  });
}, observerOptions);

sections.forEach((section) => observer.observe(section));

// ── 3. CONTACT FORM ─────────────────
const contactForm = document.getElementById("contactForm");
const formMsg = document.getElementById("formMsg");

if (contactForm && formMsg) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const nama = document.getElementById("nama")?.value.trim();
    const email = document.getElementById("email-input")?.value.trim();
    const pesan = document.getElementById("pesan")?.value.trim();
    const kategori = document.getElementById("kerjasama")?.value;

    formMsg.style.display = "none";
    formMsg.textContent = "";

    if (!nama) {
      showFormMsg('[!] ERROR: Field "nama" tidak boleh kosong.', "error");
      return;
    }

    if (!email || !isValidEmail(email)) {
      showFormMsg("[!] ERROR: Format e-mail tidak valid.", "error");
      return;
    }

    if (!pesan) {
      showFormMsg('[!] ERROR: Field "pesan" tidak boleh kosong.', "error");
      return;
    }

    if (!kategori) {
      showFormMsg(
        "[!] ERROR: Silakan pilih kategori terlebih dahulu.",
        "error",
      );
      return;
    }

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "mengirim_pesan()...";

    setTimeout(() => {
      showFormMsg(
        `[✓] SUCCESS: Pesan dari "${nama}" berhasil dikirim! Akan segera dibalas.`,
        "success",
      );
      contactForm.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = "kirim_pesan()";
    }, 1200);
  });
}

function showFormMsg(msg, type) {
  if (!formMsg) return;
  formMsg.textContent = msg;
  formMsg.style.display = "block";
  formMsg.style.color =
    type === "error" ? "var(--red, #ff4560)" : "var(--green, #00ff9d)";
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ── 4. SKILL LIST ───────────────────────
const additionalHardSkills = ["VS Code", "Git & GitHub"];
const hardSkillContainer = document.getElementById("hard-skill-container");

if (hardSkillContainer) {
  additionalHardSkills.forEach((skill) => {
    const existing = Array.from(hardSkillContainer.querySelectorAll("li")).some(
      (li) => li.textContent.trim().toLowerCase() === skill.toLowerCase(),
    );
    if (!existing) {
      const li = document.createElement("li");
      li.className = "skill-item";
      li.innerHTML = `<span class="skill-dot"></span>${skill}`;
      hardSkillContainer.appendChild(li);
    }
  });
}

// ── 5. HERO NAME TYPING EFFECT ──────────────────────────────
const heroName = document.getElementById("heroName");
if (heroName) {
  const name = heroName.textContent.trim();
  heroName.textContent = "";
  let i = 0;

  const typeInterval = setInterval(() => {
    if (i < name.length) {
      heroName.textContent += name[i];
      i++;
    } else {
      clearInterval(typeInterval);
    }
  }, 80);
}

// ── 6. SCROLL REVEAL ────────────────────────────────────────
const revealEls = document.querySelectorAll(
  ".card, .project-card, .cert-card, .stat-card",
);

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: "0px 0px -30px 0px" },
);

revealEls.forEach((el) => {
  el.style.opacity = "0";
  el.style.transform = "translateY(20px)";
  el.style.transition = "opacity 0.5s ease, transform 0.5s ease";
  revealObserver.observe(el);
});
