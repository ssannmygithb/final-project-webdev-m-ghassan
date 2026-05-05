const input = document.getElementById("usernameInput");
const btn = document.getElementById("scanBtn");
const resultArea = document.getElementById("resultArea");
const loadingBox = document.getElementById("loadingBox");

// Allow Enter key to trigger scan
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") runScan();
});

async function runScan() {
  const username = input.value.trim();

  // Validation
  if (!username) {
    showError(
      "INPUT_ERROR: Username tidak boleh kosong. Masukkan target GitHub username.",
    );
    return;
  }

  if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(username)) {
    showError("INPUT_ERROR: Format username tidak valid.");
    return;
  }
  setLoading(true);
  resultArea.style.display = "none";

  try {
    // Fetch user profile and repos in parallel
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`),
      fetch(
        `https://api.github.com/users/${username}/repos?sort=updated&per_page=5&type=owner`,
      ),
    ]);

    if (userRes.status === 404) {
      throw new Error("404");
    }
    if (!userRes.ok) {
      throw new Error(userRes.status.toString());
    }

    const user = await userRes.json();
    const repos = reposRes.ok ? await reposRes.json() : [];

    renderResult(user, repos);
  } catch (err) {
    if (err.message === "404") {
      showError(
        `ERROR 404: Target Not Found — username "${username}" tidak ditemukan di GitHub.`,
      );
    } else if (err.message === "403") {
      showError(
        "ERROR 403: Rate Limit Exceeded — terlalu banyak request. Coba beberapa menit lagi.",
      );
    } else {
      showError(
        `NETWORK_ERROR: Gagal terhubung ke GitHub API. Periksa koneksi internet kamu. (${err.message})`,
      );
    }
  } finally {
    setLoading(false);
  }
}

function setLoading(state) {
  btn.disabled = state;
  btn.textContent = state ? "Scanning..." : "Execute Scan";
  loadingBox.classList.toggle("visible", state);
}

function showError(msg) {
  setLoading(false);
  resultArea.style.display = "block";
  resultArea.innerHTML = `
          <div class="error-box">
            <span>${escHtml(msg)}</span>
          </div>
        `;
  resultArea.style.animation = "none";
  void resultArea.offsetWidth;
  resultArea.style.animation = "";
}

function renderResult(user, repos) {
  const joinDate = new Date(user.created_at).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const langColors = {
    JavaScript: "#f7df1e",
    TypeScript: "#3178c6",
    Python: "#3572a5",
    HTML: "#e44b23",
    CSS: "#563d7c",
    Java: "#b07219",
    "C++": "#f34b7d",
    PHP: "#4f5d95",
    Go: "#00add8",
    Rust: "#dea584",
    Ruby: "#701516",
    Shell: "#89e051",
    default: "#8b949e",
  };

  const getColor = (lang) => langColors[lang] || langColors.default;

  // Build repos HTML
  const reposHtml =
    repos.length > 0
      ? repos
          .slice(0, 3)
          .map(
            (repo) => `
            <div class="repo-item">
              <div class="repo-top">
                <a href="${escHtml(repo.html_url)}" target="_blank" class="repo-name">${escHtml(repo.name)}</a>
                <span class="repo-visibility">${repo.private ? "private" : "public"}</span>
              </div>
              ${repo.description ? `<p class="repo-desc">${escHtml(repo.description)}</p>` : '<p class="repo-desc" style="font-style:italic;opacity:0.5">— no description —</p>'}
              <div class="repo-meta">
                ${
                  repo.language
                    ? `
                  <span class="repo-meta-item">
                    <span class="lang-dot" style="background:${getColor(repo.language)}"></span>
                    ${escHtml(repo.language)}
                  </span>`
                    : ""
                }
                <span class="repo-meta-item">★ ${repo.stargazers_count}</span>
                <span class="repo-meta-item">⑂ ${repo.forks_count}</span>
                <span class="repo-meta-item">updated: ${timeAgo(repo.updated_at)}</span>
              </div>
            </div>
          `,
          )
          .join("")
      : '<p style="color:var(--text-dim);font-size:0.82rem;padding:1rem 0">// No public repositories found</p>';

  resultArea.innerHTML = `
          <div class="profile-card">
            <div class="profile-header-bar">SCAN_RESULT :: ${escHtml(user.login)}</div>
            <div class="profile-body">
              <img class="profile-avatar" src="${escHtml(user.avatar_url)}" alt="${escHtml(user.login)}" />
              <div class="profile-info">
                <div class="profile-name">${escHtml(user.name || user.login)}</div>
                <div class="profile-login">@${escHtml(user.login)}</div>
                ${user.bio ? `<p class="profile-bio">${escHtml(user.bio)}</p>` : ""}
                <div class="profile-stats">
                  <div class="pstat">
                    <span class="pstat-num">${user.public_repos}</span>
                    <span class="pstat-label">Repos</span>
                  </div>
                  <div class="pstat">
                    <span class="pstat-num">${user.followers}</span>
                    <span class="pstat-label">Followers</span>
                  </div>
                  <div class="pstat">
                    <span class="pstat-num">${user.following}</span>
                    <span class="pstat-label">Following</span>
                  </div>
                  ${
                    user.public_gists > 0
                      ? `
                  <div class="pstat">
                    <span class="pstat-num">${user.public_gists}</span>
                    <span class="pstat-label">Gists</span>
                  </div>`
                      : ""
                  }
                </div>
                <div class="profile-meta">
                  ${user.company ? `<div class="profile-meta-item"><span class="key">company:</span> ${escHtml(user.company)}</div>` : ""}
                  ${user.location ? `<div class="profile-meta-item"><span class="key">location:</span> ${escHtml(user.location)}</div>` : ""}
                  ${user.blog ? `<div class="profile-meta-item"><span class="key">website:</span> <a href="${escHtml(user.blog.startsWith("http") ? user.blog : "https://" + user.blog)}" target="_blank">${escHtml(user.blog)}</a></div>` : ""}
                  <div class="profile-meta-item"><span class="key">joined:</span> ${joinDate}</div>
                  <div class="profile-meta-item"><span class="key">profile:</span> <a href="${escHtml(user.html_url)}" target="_blank">${escHtml(user.html_url)}</a></div>
                </div>
              </div>
            </div>
          </div>
 
          <div>
            <div class="repos-header">recent repositories (top 3)</div>
            <div class="repo-list">${reposHtml}</div>
          </div>
        `;

  resultArea.style.display = "block";
}

function escHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr);
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}
