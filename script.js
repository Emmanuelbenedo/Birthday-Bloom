// ── ÉTAT GLOBAL ──
let celebrationData = {};

// ── INIT : lecture URL au chargement ──
(function init() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("c");

  if (code) {
    // Mode destinataire : afficher gift-screen uniquement
    try {
      const data = JSON.parse(decodeURIComponent(atob(code)));
      celebrationData = data;

      // Appliquer couleurs blobs
      if (data.c1) document.getElementById("blob1").style.setProperty("--c1", data.c1);
      if (data.c2) document.getElementById("blob2").style.setProperty("--c2", data.c2);
      if (data.c3) document.getElementById("blob3").style.setProperty("--c3", data.c3);

      // Masquer créateur, afficher gift-screen
      document.getElementById("creator").style.display = "none";
      document.getElementById("gift-screen").style.display = "flex";

    } catch (e) {
      console.error("Lien invalide :", e);
      // Lien corrompu → rester sur le créateur
    }
  }
  // Pas de ?c= → on reste sur le créateur (display:none inline sur gift-screen et celebration)
})();

// ── LIVE PREVIEW COULEURS (créateur) ──
["color1", "color2", "color3"].forEach((id, i) => {
  const el = document.getElementById(id);
  const blobId = ["blob1", "blob2", "blob3"][i];
  const cssVar = ["--c1", "--c2", "--c3"][i];
  if (el) {
    el.addEventListener("input", () => {
      document.getElementById(blobId).style.setProperty(cssVar, el.value);
    });
  }
});

// ── GÉNÉRATION DU LIEN ──
function generateLink() {
  const name    = document.getElementById("input-name").value.trim();
  const message = document.getElementById("input-message").value.trim();
  const from    = document.getElementById("input-from").value.trim();
  const c1      = document.getElementById("color1").value;
  const c2      = document.getElementById("color2").value;
  const c3      = document.getElementById("color3").value;

  if (!name) {
    document.getElementById("input-name").focus();
    return;
  }

  const payload = JSON.stringify({
    n: name,
    m: message || "🎉 Passe une merveilleuse journée !",
    f: from    || "Quelqu'un qui pense à toi",
    c1, c2, c3
  });

  const encoded = btoa(encodeURIComponent(payload));
  const url = window.location.origin + window.location.pathname + "?c=" + encoded;

  document.getElementById("generated-link").value = url;
  document.getElementById("link-result").style.display = "block";
}

// ── COPIER LE LIEN ──
function copyLink() {
  const input = document.getElementById("generated-link");
  navigator.clipboard.writeText(input.value);
  const check = document.getElementById("copy-check");
  check.style.display = "block";
  setTimeout(() => { check.style.display = "none"; }, 2000);
}

// ── BOUTON OUVRIR LE CADEAU ──
document.getElementById("open-gift")?.addEventListener("click", () => {
  const data = celebrationData;

  // Remplir le contenu AVANT d'afficher
  document.getElementById("display-name").textContent = data.n || "";
  document.getElementById("display-from").textContent = `De la part de ${data.f} 💕`;

  // Masquer gift-screen, afficher celebration
  document.getElementById("gift-screen").style.display = "none";
  document.getElementById("celebration").style.display = "flex";

  // Lancer les effets
  spawnHearts();
  launchStarConfetti();
  typeWriter(
    document.getElementById("display-message"),
    data.m || "🎉 Passe une merveilleuse journée !"
  );
});

// ── TYPEWRITER ──
function typeWriter(el, text) {
  el.textContent = "";
  let i = 0;
  const t = setInterval(() => {
    el.textContent += text.charAt(i);
    i++;
    if (i >= text.length) clearInterval(t);
  }, 38);
}

// ── FLOATING HEARTS ──
function spawnHearts() {
  const container = document.getElementById("hearts-container");
  container.innerHTML = ""; // nettoyer si relancé
  const sizes = ["18px", "22px", "28px", "16px", "24px"];
  for (let i = 0; i < 22; i++) {
    const h = document.createElement("div");
    h.className = "heart-float";
    h.textContent = "❤️";
    h.style.left = Math.random() * 100 + "vw";
    h.style.fontSize = sizes[Math.floor(Math.random() * sizes.length)];
    const dur = 7 + Math.random() * 9;
    h.style.animationDuration = dur + "s";
    h.style.animationDelay = (Math.random() * dur) + "s";
    container.appendChild(h);
  }
}

// ── STAR CONFETTI ──
function launchStarConfetti() {
  const canvas = document.getElementById("confetti-canvas");
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext("2d");

  const colors = ["#ffe9f3", "#d4b8ff", "#b8d8ff", "#ffd6a5", "#b8ffe4", "#fff"];
  const shapes = ["star", "diamond", "circle"];

  const particles = Array.from({ length: 180 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height - canvas.height,
    size: 4 + Math.random() * 7,
    color: colors[Math.floor(Math.random() * colors.length)],
    shape: shapes[Math.floor(Math.random() * shapes.length)],
    dy: 0.8 + Math.random() * 1.8,
    dx: (Math.random() - 0.5) * 0.6,
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.12,
    twinkle: Math.random(),
    twinkleSpeed: 0.03 + Math.random() * 0.04,
    alpha: 0.7 + Math.random() * 0.3
  }));

  function drawStar(ctx, x, y, r, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = (i * 4 * Math.PI / 5) - Math.PI / 2;
      const b = (i * 4 * Math.PI / 5 + 2 * Math.PI / 5) - Math.PI / 2;
      i === 0 ? ctx.moveTo(x + r * Math.cos(a), y + r * Math.sin(a))
              : ctx.lineTo(x + r * Math.cos(a), y + r * Math.sin(a));
      ctx.lineTo(x + (r * 0.4) * Math.cos(b), y + (r * 0.4) * Math.sin(b));
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawDiamond(ctx, x, y, r, angle, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(r * 0.6, 0);
    ctx.lineTo(0, r);
    ctx.lineTo(-r * 0.6, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.twinkle += p.twinkleSpeed;
      const glimmer = 0.5 + 0.5 * Math.sin(p.twinkle * 6);
      const alpha = p.alpha * glimmer;
      ctx.fillStyle = p.color;

      if (p.shape === "star") {
        drawStar(ctx, p.x, p.y, p.size, alpha);
      } else if (p.shape === "diamond") {
        drawDiamond(ctx, p.x, p.y, p.size * 0.8, p.angle, alpha);
      } else {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      p.y += p.dy;
      p.x += p.dx;
      p.angle += p.spin;

      if (p.y > canvas.height + 20) {
        p.y = -20;
        p.x = Math.random() * canvas.width;
      }
    });
    requestAnimationFrame(animate);
  }

  animate();

  window.addEventListener("resize", () => {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}
