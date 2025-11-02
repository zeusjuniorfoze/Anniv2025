// ===== CONFIGURATION GLOBALE =====
const messagesEl = document.getElementById("messages");
const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const statusEl = document.getElementById("status");
const overlay = document.getElementById("gift-overlay");
const giftBox = document.getElementById("gift-box");
const openBtn = document.getElementById("open-gift-btn");
const confettiEl = document.getElementById("confetti");
const floatLayer = document.getElementById("float-layer");
const bgDecor = document.getElementById("bg-decor");

// Config celebrant depuis l'URL
const params = new URLSearchParams(location.search);
const celebrant = params.get("celebrant") || "Junior";

// Adapter titre
const titleEl = document.querySelector(".info .title");
if (titleEl) titleEl.textContent = "Bot Anniv' de " + celebrant;

// Variables globales
let currentName = "";
let audioCtx;

// ===== INITIALISATION =====
// Init AOS
if (window.AOS) {
  try {
    AOS.init({
      once: true,
      duration: 600,
      easing: "ease-out",
      offset: 50,
    });
  } catch {}
}

// Gestionnaire d'événements centralisé
const EventManager = {
  handlers: new Map(),

  on(element, event, handler) {
    if (!this.handlers.has(element)) this.handlers.set(element, new Map());
    this.handlers.get(element).set(event, handler);
    element.addEventListener(event, handler);
  },

  cleanup() {
    for (const [element, events] of this.handlers) {
      for (const [event, handler] of events) {
        element.removeEventListener(event, handler);
      }
    }
    this.handlers.clear();
  },
};

// ===== FONCTIONS UTILITAIRES =====
// Confetti
function spawnConfetti(n = 80) {
  if (!confettiEl) return;
  const colors = [
    "#ff5b8a",
    "#ffd166",
    "#66d2ff",
    "#8be78b",
    "#ff9fb8",
    "#ffc7a6",
  ];
  
  confettiEl.innerHTML = '';
  
  for (let i = 0; i < n; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    const left = Math.random() * 100;
    const delay = (Math.random() * 0.6).toFixed(2);
    const dur = 1.1 + Math.random() * 1.2;
    const color = colors[(Math.random() * colors.length) | 0];
    piece.style.left = left + "vw";
    piece.style.background = color;
    piece.style.animationDelay = delay + "s";
    piece.style.animationDuration = dur + "s";
    confettiEl.appendChild(piece);
    setTimeout(() => {
      if (piece.parentNode === confettiEl) {
        piece.remove();
      }
    }, (parseFloat(delay) + dur) * 1000);
  }
}

// Audio
function getCtx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AC();
  }
  return audioCtx;
}

function playPopBurst() {
  try {
    const ctx = getCtx();
    const bufferSize = 0.2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < buffer.length; i++)
      data[i] = (Math.random() * 2 - 1) * (1 - i / buffer.length);
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 3000;
    const gain = ctx.createGain();
    gain.gain.value = 0.25;
    noise.connect(bp).connect(gain).connect(ctx.destination);
    noise.start();
    noise.stop(ctx.currentTime + 0.18);

    const pops = [0, 0.06, 0.12];
    pops.forEach((t, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = 400 + i * 80;
      g.gain.value = 0.22;
      osc.connect(g).connect(ctx.destination);
      const start = ctx.currentTime + t;
      const end = start + 0.12;
      g.gain.setValueAtTime(0.22, start);
      g.gain.exponentialRampToValueAtTime(0.001, end);
      osc.start(start);
      osc.stop(end);
    });
  } catch (error) {
    console.log("Audio non supporté");
  }
}

function playHappyBirthday() {
  try {
    const ctx = getCtx();
    const seq = [
      [392, 0.35], [392, 0.15], [440, 0.5], [392, 0.5],
      [523.25, 0.5], [493.88, 0.8], [392, 0.35], [392, 0.15],
      [440, 0.5], [392, 0.5], [587.33, 0.5], [523.25, 0.8],
      [392, 0.35], [392, 0.15], [784, 0.5], [659.25, 0.5],
      [523.25, 0.5], [493.88, 0.5], [440, 0.8], [698.46, 0.35],
      [698.46, 0.15], [659.25, 0.5], [523.25, 0.5], [587.33, 0.5],
      [523.25, 0.9]
    ];
    
    let t = ctx.currentTime + 0.1;
    seq.forEach(([freq, dur]) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      g.gain.value = 0.0001;
      osc.connect(g).connect(ctx.destination);
      
      const a = 0.01;
      const d = 0.06;
      const s = 0.15;
      const rel = 0.06;
      
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.2, t + a);
      g.gain.linearRampToValueAtTime(s, t + a + d);
      g.gain.setValueAtTime(s, t + Math.max(0.05, dur - rel));
      g.gain.linearRampToValueAtTime(0.0001, t + dur);
      
      osc.start(t);
      osc.stop(t + dur + 0.02);
      t += dur + 0.02;
    });
  } catch (error) {
    console.log("Audio non supporté");
  }
}

// ===== ANIMATIONS DÉCORATIVES =====
// Ballons flottants
function spawnBalloon() {
  if (!floatLayer) return;
  const b = document.createElement("div");
  b.className = "float-balloon";
  const colors = ["#ff9fb8", "#ffd166", "#66d2ff", "#8be78b"];
  const color = colors[(Math.random() * colors.length) | 0];
  const left = Math.random() * 92 + 2;
  const size = 26 + Math.random() * 18;
  const dur = 8 + Math.random() * 8;
  
  b.style.left = left + "%";
  b.style.background = color;
  b.style.width = size + "px";
  b.style.height = size * 1.3 + "px";
  b.style.animationDuration = dur + "s";
  
  floatLayer.appendChild(b);
  setTimeout(() => b.remove(), dur * 1000);
}

// Décor de fond
function spawnFlyingGarland() {
  if (!bgDecor) return;
  const g = document.createElement("div");
  g.className = "flying-garland" + (Math.random() > 0.5 ? " rev" : "");
  const y = Math.random() > 0.5 ? -10 + Math.random() * 30 : undefined;
  if (y !== undefined) g.style.top = y + "px";
  
  const dur = 18 + Math.random() * 16;
  g.style.animationDuration = dur + "s";
  
  bgDecor.appendChild(g);
  setTimeout(() => g.remove(), dur * 1000);
}

function spawnPompon() {
  if (!bgDecor) return;
  const p = document.createElement("div");
  const cls = ["pompon", "pompon alt", "pompon alt2"];
  p.className = cls[(Math.random() * cls.length) | 0];
  const startX = Math.random() * 100;
  const size = 10 + Math.random() * 18;
  const dur = 10 + Math.random() * 10;
  
  p.style.left = startX + "vw";
  p.style.bottom = "-24px";
  p.style.width = size + "px";
  p.style.height = size + "px";
  p.style.animationDuration = dur + "s, 2.6s";
  
  bgDecor.appendChild(p);
  setTimeout(() => p.remove(), dur * 1000);
}

// ===== SYSTÈME DE NAVIGATION =====
const lobbyEl = document.getElementById("view-lobby");
const chatView = document.getElementById("view-chat");
const wishesView = document.getElementById("view-wishes");
const memoryView = document.getElementById("view-memory");
const pollsView = document.getElementById("view-polls");
const galleryView = document.getElementById("view-gallery");
const quizView = document.getElementById("view-quiz");
const hubCeleb = document.getElementById("hub-celebrant");

if (hubCeleb) hubCeleb.textContent = celebrant;

function showView(name) {
  const views = {
    lobby: lobbyEl,
    chat: chatView,
    wishes: wishesView,
    memory: memoryView,
    polls: pollsView,
    gallery: galleryView,
    quiz: quizView
  };
  
  // Cacher toutes les vues
  Object.values(views).forEach((v) => v && (v.hidden = true));
  
  // Afficher la vue demandée
  if (views[name]) {
    views[name].hidden = false;
    
    // Initialisations spécifiques aux vues
    if (name === "gallery") {
      loadGallery();
    } else if (name === "quiz" && !isAdminMode) {
      restartQuiz();
    }
  }
}

// Navigation depuis le hub
document.querySelectorAll(".hub-card[data-view]").forEach((btn) => {
  EventManager.on(btn, "click", () => {
    const viewName = btn.getAttribute("data-view");
    if (viewName) {
      showView(viewName);
    }
  });
});

// ===== RÉCUPÉRATION ET AFFICHAGE DU MEILLEUR SCORE =====
async function loadBestMemoryScore() {
    try {
        const response = await fetch("https://anniv-backend-2025-1.onrender.com/games/memory/best");
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        const bestScoreElement = document.getElementById("mem-best");
        if (bestScoreElement && data.global_best_ms) {
            const bestSeconds = data.global_best_ms / 1000;
            bestScoreElement.textContent = `${bestSeconds.toFixed(1)}s`;
        } else if (bestScoreElement) {
            bestScoreElement.textContent = "--";
        }
    } catch (error) {
        console.error("Erreur chargement meilleur score:", error);
        const bestScoreElement = document.getElementById("mem-best");
        if (bestScoreElement) {
            bestScoreElement.textContent = "--";
        }
    }
}

// Modifier la fonction setupMemory pour charger le meilleur score
function setupMemory() {
    const deck = shuffle([...memIcons, ...memIcons]);
    memGrid.innerHTML = "";
    memFirst = null;
    memLock = false;
    memMatches = 0;
    memStart = 0;
    if (memTimer) {
        clearInterval(memTimer);
        memTimer = null;
    }
    memTimeEl.textContent = "0.0s";
    
    // Charger le meilleur score
    loadBestMemoryScore();
    
    deck.forEach((ico, idx) => {
        const c = document.createElement("div");
        c.className = "card";
        c.dataset.icon = ico;
        c.dataset.idx = idx;
        c.textContent = "❓";
        EventManager.on(c, "click", () => onCardClick(c));
        memGrid.appendChild(c);
    });
}

// Modifier la fonction onCardClick pour mettre à jour le meilleur score si nécessaire
function onCardClick(c) {
    if (memLock || c.classList.contains("revealed") || c.classList.contains("matched")) {
        return;
    }
    
    if (!memStart) {
        memStart = performance.now();
        memTimer = setInterval(() => {
            memTimeEl.textContent = ((performance.now() - memStart) / 1000).toFixed(1) + "s";
        }, 100);
    }
    
    c.classList.add("revealed");
    c.textContent = c.dataset.icon;
    
    if (!memFirst) {
        memFirst = c;
        return;
    }
    
    if (memFirst.dataset.icon === c.dataset.icon) {
        memFirst.classList.add("matched");
        c.classList.add("matched");
        memMatches++;
        memFirst = null;
        
        if (memMatches === memIcons.length) {
            clearInterval(memTimer);
            const elapsed = Math.round(performance.now() - memStart);
            
            try {
                fetch("https://anniv-backend-2025-1.onrender.com/games/memory/best", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: currentName || "Invité",
                        best_time_ms: elapsed,
                    }),
                }).then(() => {
                    // Recharger le meilleur score après avoir sauvegardé
                    loadBestMemoryScore();
                });
            } catch {}
            
            spawnConfetti(120);
        }
    } else {
        memLock = true;
        setTimeout(() => {
            memFirst.classList.remove("revealed");
            memFirst.textContent = "❓";
            c.classList.remove("revealed");
            c.textContent = "❓";
            memFirst = null;
            memLock = false;
        }, 700);
    }
}
// Boutons retour
const backButtons = [
  "back-to-lobby-1", "back-to-lobby-2", "back-to-lobby-3", 
  "back-to-lobby-4", "back-to-lobby-chat", "back-to-lobby-quiz"
];

backButtons.forEach((id) => {
  const el = document.getElementById(id);
  if (el) {
    EventManager.on(el, "click", () => showView("lobby"));
  }
});

// ===== MODULE CHAT BOT =====
function addMessage(text, from = "bot") {
  const div = document.createElement("div");
  const anim = from === "user" ? "animate__fadeInRight" : "animate__fadeInUp";
  div.className = `msg ${from} animate__animated ${anim}`;
  div.textContent = text;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  
  div.addEventListener("animationend", () => {
    div.classList.remove("animate__animated", anim);
  }, { once: true });
}

// API URL
const apiUrl = "https://anniv-backend-2025-1.onrender.com/message";

// Message d'accueil
addMessage("Joyeux anniversaire " + celebrant + " ! Tape 'aide' pour voir les commandes.");

// Soumission du formulaire de chat
EventManager.on(form, "submit", async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  // Déterminer le prénom
  if (!currentName) {
    const first = text.split(" ")[0] || "";
    currentName = first.charAt(0).toUpperCase() + first.slice(1);
  }

  addMessage(text, "user");
  input.value = "";
  statusEl.textContent = "écrit...";

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, name: currentName, celebrant }),
    });
    
    const data = await res.json();
    (data.replies || []).forEach((r) => addMessage(r, "bot"));
    
    if (data.filter_image) {
      const img = document.createElement("img");
      img.src = data.filter_image;
      img.className = "filter-img";
      messagesEl.appendChild(img);
    }
    
    messagesEl.scrollTop = messagesEl.scrollHeight;
    statusEl.textContent = "en ligne";
  } catch (err) {
    addMessage("Le bot est indisponible. Réessaie plus tard.", "bot");
    statusEl.textContent = "hors ligne";
  }
});

// ===== MODULE CADEAU =====
// ===== MODULE CADEAU =====
function openGift() {
  if (!overlay || !giftBox) return;
  
  giftBox.classList.add("open");
  spawnConfetti(140);
  
  try { playPopBurst(); } catch {}
  
  // Créer le bouton stop s'il n'existe pas
  createMusicButton();
  
  // Essayez de lire le morceau personnalisé si présent; sinon, fallback sur l'air synthétique
  setTimeout(() => {
    const audio = document.getElementById("gift-song");
    if (audio && typeof audio.play === "function") {
      try {
        audio.currentTime = 0;
        audio.volume = 1.0;
        
        // Ajouter un événement pour relancer la musique quand elle se termine
        const handleSongEnd = () => {
          audio.currentTime = 0;
          audio.play().catch(() => {});
        };
        
        audio.addEventListener('ended', handleSongEnd);
        audio.play().catch(() => { 
          try { playHappyBirthday(); } catch {} 
        });
      } catch {
        try { playHappyBirthday(); } catch {}
      }
    } else {
      try { playHappyBirthday(); } catch {}
    }
  }, 300);
  
  setTimeout(() => {
    overlay.classList.add("hidden");
    setTimeout(() => {
      overlay.style.display = "none";
    }, 650);
  }, 1100);
}

// Variable globale pour suivre l'état de la musique
let isMusicPlaying = true;

// Fonction pour créer le bouton de contrôle de musique
function createMusicButton() {
  // Vérifier si le bouton existe déjà
  let musicBtn = document.getElementById("music-control-btn");
  
  if (!musicBtn) {
    musicBtn = document.createElement("button");
    musicBtn.id = "music-control-btn";
    musicBtn.innerHTML = '<i class="bx bx-pause-circle"></i> Couper le song';
    musicBtn.className = "music-control-btn";
    
    // Styles pour le bouton
    musicBtn.style.position = "fixed";
    musicBtn.style.bottom = "20px";
    musicBtn.style.right = "20px";
    musicBtn.style.zIndex = "10000";
    musicBtn.style.background = "rgba(255, 91, 138, 0.9)";
    musicBtn.style.color = "white";
    musicBtn.style.border = "none";
    musicBtn.style.borderRadius = "25px";
    musicBtn.style.padding = "12px 20px";
    musicBtn.style.fontSize = "14px";
    musicBtn.style.fontWeight = "bold";
    musicBtn.style.cursor = "pointer";
    musicBtn.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
    musicBtn.style.display = "flex";
    musicBtn.style.alignItems = "center";
    musicBtn.style.gap = "8px";
    musicBtn.style.transition = "all 0.3s ease";
    
    // Effet au survol
    musicBtn.addEventListener("mouseenter", function() {
      this.style.background = "rgba(255, 91, 138, 1)";
      this.style.transform = "scale(1.05)";
    });
    
    musicBtn.addEventListener("mouseleave", function() {
      this.style.background = "rgba(255, 91, 138, 0.9)";
      this.style.transform = "scale(1)";
    });
    
    // Fonction pour toggle la musique
    musicBtn.addEventListener("click", function() {
      toggleMusic();
    });
    
    document.body.appendChild(musicBtn);
  }
}

// Fonction pour arrêter/relancer la musique
function toggleMusic() {
  const musicBtn = document.getElementById("music-control-btn");
  const audio = document.getElementById("gift-song");
  
  if (isMusicPlaying) {
    // Arrêter la musique
    if (audio) {
      audio.pause();
    }
    
    // Arrêter l'audio synthétique (si en cours)
    if (audioCtx) {
      audioCtx.close().catch(() => {});
      audioCtx = null;
    }
    
    // Changer le bouton pour "Remettre le song"
    musicBtn.innerHTML = '<i class="bx bx-play-circle"></i> Remettre le song';
    musicBtn.style.background = "rgba(76, 175, 80, 0.9)";
    
    isMusicPlaying = false;
  } else {
    // Relancer la musique
    if (audio) {
      audio.play().catch(() => {
        // Fallback sur l'audio synthétique si l'audio personnalisé échoue
        try { playHappyBirthday(); } catch {}
      });
    } else {
      // Relancer l'audio synthétique
      try { playHappyBirthday(); } catch {}
    }
    
    // Changer le bouton pour "Couper le song"
    musicBtn.innerHTML = '<i class="bx bx-pause-circle"></i> Couper le song';
    musicBtn.style.background = "rgba(255, 91, 138, 0.9)";
    
    isMusicPlaying = true;
  }
}

// Fonction pour réinitialiser l'état de la musique (au cas où)
function resetMusicState() {
  isMusicPlaying = true;
  const musicBtn = document.getElementById("music-control-btn");
  if (musicBtn) {
    musicBtn.innerHTML = '<i class="bx bx-pause-circle"></i> Couper le song';
    musicBtn.style.background = "rgba(255, 91, 138, 0.9)";
  }
}

if (overlay && openBtn) {
  EventManager.on(openBtn, "click", openGift);
  EventManager.on(overlay, "click", (e) => {
    if (e.target.id !== "open-gift-btn") {
      openGift();
    }
  });
}

// ===== MODULE COMPTE À REBOURS =====
function startCountdown() {
  const nextBirthday = new Date("2025-11-03T00:00:00");

  function updateCountdown() {
    const now = new Date();
    const diff = nextBirthday - now;

    if (diff <= 0) {
      document.getElementById("countdown-timer").innerHTML =
        '<span style="color: #fff; font-size: 18px;">🎉 Joyeux Anniversaire ! 🎉</span>';
      spawnConfetti(100);
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    document.getElementById("countdown-days").textContent = days;
    document.getElementById("countdown-hours").textContent = hours;
    document.getElementById("countdown-minutes").textContent = minutes;
  }

  updateCountdown();
  setInterval(updateCountdown, 60000);
}

// ===== MODULE PARTAGE =====
const shareModal = document.getElementById("share-modal");
const shareBtn = document.getElementById("share-btn");
const closeShareModal = document.getElementById("close-share-modal");

if (shareBtn) {
  EventManager.on(shareBtn, "click", () => {
    shareModal.hidden = false;
  });
}

if (closeShareModal) {
  EventManager.on(closeShareModal, "click", () => {
    shareModal.hidden = true;
  });
}

// Options de partage
document.querySelectorAll(".share-option").forEach((btn) => {
  EventManager.on(btn, "click", () => {
    const platform = btn.getAttribute("data-platform");
    shareEvent(platform);
  });
});

// Copier le lien
const copyLinkBtn = document.getElementById("copy-link");
if (copyLinkBtn) {
  EventManager.on(copyLinkBtn, "click", async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Lien copié dans le presse-papier !");
      shareModal.hidden = true;
    } catch (err) {
      alert("Impossible de copier le lien");
    }
  });
}

function shareEvent(platform) {
  const text = `Joyeux anniversaire ${celebrant} ! 🎉 Rejoins la fête ici :`;
  const url = window.location.href;

  const shareUrls = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  };

  if (shareUrls[platform]) {
    window.open(shareUrls[platform], "_blank", "width=600,height=400");
    shareModal.hidden = true;
  }
}

// ===== MODULE MUR DE VŒUX =====
const wishesListEl = document.getElementById("wishes-list");
const wishForm = document.getElementById("wish-form");
const wishMsgEl = document.getElementById("wish-message");
const wishCounterEl = document.getElementById("wish-counter");

function updateWishCounter() {
  if (!wishMsgEl || !wishCounterEl) return;
  
  if (wishMsgEl.value.length > 1000) {
    wishMsgEl.value = wishMsgEl.value.slice(0, 1000);
  }
  
  wishCounterEl.textContent = String(wishMsgEl.value.length);
  wishMsgEl.style.height = "auto";
  wishMsgEl.style.height = Math.min(wishMsgEl.scrollHeight, 360) + "px";
}

if (wishMsgEl) {
  ["input", "change"].forEach((evt) =>
    EventManager.on(wishMsgEl, evt, updateWishCounter)
  );
  setTimeout(updateWishCounter, 0);
}

async function refreshWishes() {
  try {
    const r = await fetch("https://anniv-backend-2025-1.onrender.com/wishes");
    const data = await r.json();
    const items = data.wishes || [];
    
    wishesListEl.innerHTML = "";
    
    const decodeEntities = (s) => {
      const d = document.createElement("div");
      d.innerHTML = s;
      return d.textContent || "";
    };
    
    items.forEach((w) => {
      const row = document.createElement("div");
      row.className = "wish-item";

      const content = document.createElement("div");
      content.className = "content";

      const nameWrap = document.createElement("div");
      const nameEl = document.createElement("strong");
      nameEl.textContent = w.name || "Invité";
      nameWrap.appendChild(nameEl);

      const metaEl = document.createElement("div");
      metaEl.className = "meta";
      const fullDecoded = decodeEntities(String(w.message || ""));
      const needsToggle = fullDecoded.length > 220;
      
      const applyText = (expanded) => {
        metaEl.textContent = expanded
          ? fullDecoded
          : needsToggle
          ? fullDecoded.slice(0, 220) + "…"
          : fullDecoded;
      };
      
      applyText(false);

      content.appendChild(nameWrap);
      content.appendChild(metaEl);

      if (needsToggle) {
        const toggleBtn = document.createElement("button");
        toggleBtn.className = "icon-btn-sm read-more";
        toggleBtn.textContent = "Lire plus";
        let expanded = false;
        
        EventManager.on(toggleBtn, "click", () => {
          expanded = !expanded;
          applyText(expanded);
          toggleBtn.textContent = expanded ? "Lire moins" : "Lire plus";
        });
        
        content.appendChild(toggleBtn);
      }

      const actions = document.createElement("div");
      actions.className = "wish-actions";
      const heartBtn = document.createElement("button");
      heartBtn.className = "heart-btn";
      heartBtn.setAttribute("data-id", w.id);
      heartBtn.innerHTML = `<i class='bx bx-heart'></i> <span>${w.hearts || 0}</span>`;
      actions.appendChild(heartBtn);

      row.appendChild(content);
      row.appendChild(actions);
      wishesListEl.appendChild(row);
    });

    // Gestion des cœurs
    wishesListEl.querySelectorAll(".heart-btn").forEach((b) => {
      EventManager.on(b, "click", async () => {
        const id = b.getAttribute("data-id");
        try {
          const rr = await fetch("https://anniv-backend-2025-1.onrender.com/wishes/heart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
          });
          const dj = await rr.json();
          if (dj.hearts != null) {
            b.querySelector("span").textContent = dj.hearts;
          }
        } catch {}
      });
    });
  } catch (error) {
    console.error("Erreur chargement vœux:", error);
  }
}

if (wishForm) {
  EventManager.on(wishForm, "submit", async (e) => {
    e.preventDefault();
    const n = (document.getElementById("wish-name").value || currentName || "").trim();
    const m = (document.getElementById("wish-message").value || "").trim();
    
    if (!n || !m) return;
    
    try {
      await fetch("https://anniv-backend-2025-1.onrender.com/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: n, message: m }),
      });
      
      document.getElementById("wish-message").value = "";
      refreshWishes();
      spawnConfetti(60);
    } catch (error) {
      console.error("Erreur envoi vœu:", error);
    }
  });
}

// ===== MODULE MEMORY =====
const memGrid = document.getElementById("memory-grid");
const memTimeEl = document.getElementById("mem-time");
const memRestart = document.getElementById("mem-restart");

let memFirst = null,
  memLock = false,
  memMatches = 0,
  memStart = 0,
  memTimer = null;

const memIcons = ["🎂", "🎈", "🎉", "🎁", "⭐", "🍰", "🥳", "🍭"];

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function setupMemory() {
  const deck = shuffle([...memIcons, ...memIcons]);
  memGrid.innerHTML = "";
  
  memFirst = null;
  memLock = false;
  memMatches = 0;
  memStart = 0;
  
  if (memTimer) {
    clearInterval(memTimer);
    memTimer = null;
  }
  
  memTimeEl.textContent = "0.0s";
  
  deck.forEach((ico, idx) => {
    const c = document.createElement("div");
    c.className = "card";
    c.dataset.icon = ico;
    c.dataset.idx = idx;
    c.textContent = "❓";
    EventManager.on(c, "click", () => onCardClick(c));
    memGrid.appendChild(c);
  });
}

function onCardClick(c) {
  if (memLock || c.classList.contains("revealed") || c.classList.contains("matched")) {
    return;
  }
  
  if (!memStart) {
    memStart = performance.now();
    memTimer = setInterval(() => {
      memTimeEl.textContent = ((performance.now() - memStart) / 1000).toFixed(1) + "s";
    }, 100);
  }
  
  c.classList.add("revealed");
  c.textContent = c.dataset.icon;
  
  if (!memFirst) {
    memFirst = c;
    return;
  }
  
  if (memFirst.dataset.icon === c.dataset.icon) {
    memFirst.classList.add("matched");
    c.classList.add("matched");
    memMatches++;
    memFirst = null;
    
    if (memMatches === memIcons.length) {
      clearInterval(memTimer);
      const elapsed = Math.round(performance.now() - memStart);
      
      try {
        fetch("https://anniv-backend-2025-1.onrender.com/games/memory/best", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: currentName || "Invité",
            best_time_ms: elapsed,
          }),
        });
      } catch {}
      
      spawnConfetti(120);
    }
  } else {
    memLock = true;
    setTimeout(() => {
      memFirst.classList.remove("revealed");
      memFirst.textContent = "❓";
      c.classList.remove("revealed");
      c.textContent = "❓";
      memFirst = null;
      memLock = false;
    }, 700);
  }
}

if (memRestart) {
  EventManager.on(memRestart, "click", setupMemory);
}

// ===== MODULE SONDAGES =====
const pollBlock = document.getElementById("poll-block");

async function loadPoll() {
  try {
    let res = await fetch("https://anniv-backend-2025-1.onrender.com/polls/cake");
    let data = await res.json();
    
    if (!data.poll || !data.poll.options) {
      await fetch("https://anniv-backend-2025-1.onrender.com/polls/cake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          question: "Quel gâteau pour Junior ?",
          options: ["Choco", "Vanille", "Fraise"],
        }),
      });
      res = await fetch("https://anniv-backend-2025-1.onrender.com/polls/cake");
      data = await res.json();
    }
    
    const poll = data.poll || {};
    const counts = poll.counts || {};
    pollBlock.innerHTML = "";
    
    const q = document.createElement("div");
    q.className = "poll-q";
    q.textContent = poll.question || "";
    pollBlock.appendChild(q);
    
    const opts = poll.options || {};
    Object.keys(opts).forEach((id) => {
      const row = document.createElement("div");
      row.className = "poll-option";
      const label = opts[id].label || id;
      const cnt = counts[id] || 0;
      
      row.innerHTML = `
        <span>${label}</span>
        <div>
          <strong>${cnt}</strong> 
          <button data-id="${id}">Voter</button>
        </div>
      `;
      
      EventManager.on(row.querySelector("button"), "click", async () => {
        try {
          await fetch("https://anniv-backend-2025-1.onrender.com/polls/cake", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "vote",
              name: currentName || "Invité",
              option_id: id,
            }),
          });
          loadPoll();
        } catch {}
      });
      
      pollBlock.appendChild(row);
    });
  } catch (error) {
    console.error("Erreur chargement sondage:", error);
  }
}

// ===== MODULE GALERIE PHOTO =====
const galleryGrid = document.getElementById("gallery-grid");
const uploadArea = document.getElementById("upload-area");
const photoUpload = document.getElementById("photo-upload");
const uploadTrigger = document.getElementById("upload-trigger");

const defaultPhotos = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=300&h=300&fit=crop",
    caption: "Souvenir d'anniversaire",
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1559622214-f8a9850965bb?w=300&h=300&fit=crop",
    caption: "Fête entre amis",
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=300&h=300&fit=crop",
    caption: "Gâteau d'anniversaire",
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1545696563-af8f6ec2295a?w=300&h=300&fit=crop",
    caption: "Célébration",
  },
];

function loadGallery() {
  galleryGrid.innerHTML = "";

  defaultPhotos.forEach((photo) => {
    const item = document.createElement("div");
    item.className = "gallery-item";
    item.innerHTML = `
      <img src="${photo.url}" alt="${photo.caption}" loading="lazy">
      <div class="gallery-item-overlay">${photo.caption}</div>
    `;
    galleryGrid.appendChild(item);
  });
}

// Gestion de l'upload
if (uploadTrigger && photoUpload) {
  EventManager.on(uploadTrigger, "click", () => {
    photoUpload.click();
  });
}

if (uploadArea) {
  EventManager.on(uploadArea, "click", () => {
    photoUpload.click();
  });

  EventManager.on(uploadArea, "dragover", (e) => {
    e.preventDefault();
    uploadArea.style.background = "rgba(255,91,138,0.15)";
  });

  EventManager.on(uploadArea, "dragleave", () => {
    uploadArea.style.background = "rgba(255,91,138,0.05)";
  });

  EventManager.on(uploadArea, "drop", (e) => {
    e.preventDefault();
    uploadArea.style.background = "rgba(255,91,138,0.05)";
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageUpload(files[0]);
    }
  });
}

if (photoUpload) {
  EventManager.on(photoUpload, "change", (e) => {
    if (e.target.files.length > 0) {
      handleImageUpload(e.target.files[0]);
    }
  });
}

function handleImageUpload(file) {
  if (!file.type.startsWith("image/")) {
    alert("Veuillez sélectionner une image valide");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const newPhoto = {
      id: Date.now(),
      url: e.target.result,
      caption: "Nouvelle photo",
    };

    const item = document.createElement("div");
    item.className = "gallery-item";
    item.innerHTML = `
      <img src="${newPhoto.url}" alt="${newPhoto.caption}" loading="lazy">
      <div class="gallery-item-overlay">${newPhoto.caption}</div>
    `;
    galleryGrid.prepend(item);

    spawnConfetti(30);
  };
  reader.readAsDataURL(file);
}

// ===== MODULE QUIZ INTERACTIF =====
const quizAdminPanel = document.getElementById("quiz-admin-panel");
const quizPlayerPanel = document.getElementById("quiz-player-panel");
const quizQuestionForm = document.getElementById("quiz-question-form");
const quizQuestionsList = document.getElementById("quiz-questions-list");
const quizCurrentQuestion = document.getElementById("quiz-current-question");
const quizOptionsGrid = document.getElementById("quiz-options-grid");
const quizCurrentNumber = document.getElementById("quiz-current-number");
const quizTotalQuestions = document.getElementById("quiz-total-questions");
const quizResults = document.getElementById("quiz-results");
const quizScoreValue = document.getElementById("quiz-score-value");
const quizTotalAnswered = document.getElementById("quiz-total-answered");
const quizResultMessage = document.getElementById("quiz-result-message");
const quizRestartBtn = document.getElementById("quiz-restart-btn");
const questionsHistoryList = document.getElementById("questions-history-list");

// Mode administrateur (doit être déclaré avant usage)
let isAdminMode = false;

// Constantes globales
const QUIZ_SAMPLE_SIZE = 5;
const optionLetters = ["A", "B", "C", "D"];

// État du quiz
let allQuizQuestions = []; // sera rempli depuis Firebase
let quizQuestions = [];
let currentQuestionIndex = 0;
let userScore = 0;
let userAnswers = [];

// Fonction : échantillonnage aléatoire de questions
function sampleQuestions(list, n) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, Math.max(0, Math.min(n, arr.length)));
}

// Exemple d'initialisation (quand Firebase aura chargé)
function initQuiz(loadedQuestions) {
  allQuizQuestions = loadedQuestions;
  quizQuestions = isAdminMode
    ? allQuizQuestions
    : sampleQuestions(allQuizQuestions, QUIZ_SAMPLE_SIZE);

  currentQuestionIndex = 0;
  userScore = 0;
  userAnswers = [];
}


async function loadQuizQuestions() {
  try {
    const response = await fetch("https://anniv-backend-2025-1.onrender.com/quiz/questions");
    const data = await response.json();

    const fetched = Array.isArray(data.questions) ? data.questions : [];
    allQuizQuestions = fetched;

    if (allQuizQuestions.length) {
      if (isAdminMode) {
        quizQuestions = allQuizQuestions;
      } else {
        quizQuestions = sampleQuestions(allQuizQuestions, QUIZ_SAMPLE_SIZE);
      }
      quizTotalQuestions.textContent = quizQuestions.length;
      updateAdminQuestionsList();
      if (quizQuestions.length > 0 && !isAdminMode) {
        showQuestion(currentQuestionIndex);
      }
    }
  } catch (error) {
    console.error("Erreur chargement questions:", error);
    loadDefaultQuestions();
  }
}
// Questions par défaut
function loadDefaultQuestions() {
  const defaults = [
    {
      id: 1,
      question: "Quel est mon langage de programmation préféré ?",
      options: ["JavaScript", "Python", "Java", "PHP"],
      correctAnswer: 1,
    },
    {
      id: 2,
      question: "Quelle est ma série TV préférée ?",
      options: ["Game of Thrones", "Breaking Bad", "Stranger Things", "The Office"],
      correctAnswer: 2,
    },
    {
      id: 3,
      question: "Quel est mon plat préféré ?",
      options: ["Pizza", "Sushi", "Tacos", "Pâtes Carbonara"],
      correctAnswer: 0,
    },
  ];
  allQuizQuestions = defaults;
  quizQuestions = isAdminMode ? allQuizQuestions : sampleQuestions(allQuizQuestions, QUIZ_SAMPLE_SIZE);

  quizTotalQuestions.textContent = quizQuestions.length;
  updateAdminQuestionsList();

  if (quizQuestions.length > 0 && !isAdminMode) {
    showQuestion(currentQuestionIndex);
  }
}// Afficher une question
function showQuestion(index) {
  if (index >= quizQuestions.length) {
    showResults();
    return;
  }

  const question = quizQuestions[index];
  quizCurrentQuestion.textContent = question.question;
  quizCurrentNumber.textContent = index + 1;
  quizOptionsGrid.innerHTML = "";

  question.options.forEach((option, optionIndex) => {
    const optionBtn = document.createElement("button");
    optionBtn.className = "quiz-option-btn";
    optionBtn.innerHTML = `
      <span class="quiz-option-letter">${optionLetters[optionIndex]}</span>
      <span class="quiz-option-text">${option}</span>
    `;

    EventManager.on(optionBtn, "click", () => {
      handleAnswer(optionIndex, question);
    });

    quizOptionsGrid.appendChild(optionBtn);
  });
}

// Gérer la réponse
function handleAnswer(selectedIndex, question) {
  const isCorrect = selectedIndex === question.correctAnswer;

  if (isCorrect) {
    userScore++;
  }

  userAnswers.push({
    question: question.question,
    userAnswer: question.options[selectedIndex],
    correctAnswer: question.options[question.correctAnswer],
    isCorrect: isCorrect,
  });

  // Feedback visuel
  const optionButtons = quizOptionsGrid.querySelectorAll(".quiz-option-btn");
  optionButtons.forEach((btn, index) => {
    if (index === question.correctAnswer) {
      btn.classList.add("correct");
    } else if (index === selectedIndex && !isCorrect) {
      btn.classList.add("incorrect");
    }
    btn.disabled = true;
  });

  updateQuestionsHistory();

  setTimeout(() => {
    currentQuestionIndex++;
    if (currentQuestionIndex < quizQuestions.length) {
      showQuestion(currentQuestionIndex);
    } else {
      showResults();
    }
  }, 2000);
}

// Afficher les résultats
function showResults() {
  quizPlayerPanel.querySelector("#quiz-current").hidden = true;
  quizResults.hidden = false;

  quizScoreValue.textContent = userScore;
  quizTotalAnswered.textContent = quizQuestions.length;

  const percentage = (userScore / quizQuestions.length) * 100;
  let message = "";

  if (percentage >= 80) {
    message = "🎉 Excellent ! Tu me connais parfaitement !";
  } else if (percentage >= 60) {
    message = "👍 Bien joué ! Tu me connais plutôt bien !";
  } else if (percentage >= 40) {
    message = "😊 Pas mal ! On peut encore améliorer ça !";
  } else {
    message = "🤔 On dirait qu'on a encore des choses à découvrir ensemble !";
  }

  quizResultMessage.textContent = message;
  saveQuizScore();
}

// Mettre à jour l'historique
function updateQuestionsHistory() {
  questionsHistoryList.innerHTML = "";

  userAnswers.forEach((answer, index) => {
    const historyItem = document.createElement("div");
    historyItem.className = `history-item ${answer.isCorrect ? "correct" : "incorrect"}`;
    historyItem.innerHTML = `
      <div class="history-question">${index + 1}. ${answer.question}</div>
      <div class="history-answer">Ta réponse: ${answer.userAnswer}</div>
      ${!answer.isCorrect ? `<div class="history-answer correct-answer">Bonne réponse: ${answer.correctAnswer}</div>` : ""}
    `;
    questionsHistoryList.appendChild(historyItem);
  });

  questionsHistoryList.scrollTop = questionsHistoryList.scrollHeight;
}

// Sauvegarder le score
async function saveQuizScore() {
  try {
    await fetch("https://anniv-backend-2025-1.onrender.com/quiz/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: currentName || "Invité",
        score: userScore,
        total: quizQuestions.length,
        answers: userAnswers,
      }),
    });
  } catch (error) {
    console.error("Erreur sauvegarde score:", error);
  }
}

// Redémarrer le quiz
function restartQuiz() {
  currentQuestionIndex = 0;
  userScore = 0;
  userAnswers = [];

  quizResults.hidden = true;
  quizPlayerPanel.querySelector("#quiz-current").hidden = false;

  if (!isAdminMode && allQuizQuestions.length) {
    quizQuestions = sampleQuestions(allQuizQuestions, QUIZ_SAMPLE_SIZE);
    quizTotalQuestions.textContent = quizQuestions.length;
  }

  if (quizQuestions.length > 0) {
    showQuestion(currentQuestionIndex);
  }
  questionsHistoryList.innerHTML = "";
}
function toggleAdminMode() {
  isAdminMode = !isAdminMode;
  quizAdminPanel.hidden = !isAdminMode;

  
}

// Ajouter une nouvelle question
async function addNewQuestion(questionData) {
  try {
    const response = await fetch("https://anniv-backend-2025-1.onrender.com/quiz/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(questionData),
    });

    if (response.ok) {
      loadQuizQuestions();
      quizQuestionForm.reset();
      return true;
    }
  } catch (error) {
    console.error("Erreur ajout question:", error);
  }
  return false;
}

// Mettre à jour la liste des questions en mode admin
function updateAdminQuestionsList() {
  quizQuestionsList.innerHTML = "";

  quizQuestions.forEach((question, index) => {
    const questionItem = document.createElement("div");
    questionItem.className = "quiz-question-item";
    questionItem.innerHTML = `
      <div class="quiz-question-content">
        <div class="quiz-question-text">${index + 1}. ${question.question}</div>
        <div class="quiz-question-options">
          ${question.options.map((option, optIndex) => `
            <div class="${optIndex === question.correctAnswer ? "quiz-option-correct" : ""}">
              ${optionLetters[optIndex]}. ${option}
            </div>
          `).join("")}
        </div>
      </div>
      <div class="quiz-question-actions">
        <button class="icon-btn-sm delete-question" data-id="${question.id}">
          <i class='bx bx-trash'></i>
        </button>
      </div>
    `;

    quizQuestionsList.appendChild(questionItem);
  });

  // Gestion de la suppression
  quizQuestionsList.querySelectorAll(".delete-question").forEach((btn) => {
    EventManager.on(btn, "click", async () => {
      const questionId = btn.getAttribute("data-id");
      await deleteQuestion(questionId);
    });
  });
}

// Supprimer une question
async function deleteQuestion(questionId) {
  try {
    const response = await fetch("https://anniv-backend-2025-1.onrender.com/quiz/questions/" + questionId, {
      method: "DELETE",
    });

    if (response.ok) {
      loadQuizQuestions();
    }
  } catch (error) {
    console.error("Erreur suppression question:", error);
  }
}

// Initialisation du Quiz
function initQuiz() {
  // Mode Admin


  // Formulaire nouvelle question
  EventManager.on(quizQuestionForm, "submit", async (e) => {
    e.preventDefault();

    const question = document.getElementById("quiz-question-input").value;
    const options = Array.from(document.querySelectorAll(".quiz-option-input")).map((input) => input.value);
    const correctAnswer = parseInt(document.getElementById("quiz-correct-answer").value);

    if (question && options.every((opt) => opt.trim()) && !isNaN(correctAnswer)) {
      const questionData = {
        question: question,
        options: options,
        correctAnswer: correctAnswer,
      };

      await addNewQuestion(questionData);
    }
  });

  // Redémarrage quiz
  EventManager.on(quizRestartBtn, "click", restartQuiz);

  // Charger les questions
  loadQuizQuestions();
}

// ===== INITIALISATION GÉNÉRALE =====
document.addEventListener("DOMContentLoaded", () => {
  // Démarrer les animations décoratives
  setInterval(spawnBalloon, 900);
  setInterval(spawnFlyingGarland, 7000);
  setInterval(spawnPompon, 1200);

  // Initialiser les modules
  startCountdown();
  setupMemory();
  loadPoll();
  loadGallery();
  initQuiz();
  refreshWishes();
  // Charger le meilleur score au démarrage (au cas où)
    loadBestMemoryScore();

  // Rafraîchir périodiquement
  setInterval(refreshWishes, 10000);

  console.log("🎉 Application d'anniversaire initialisée !");
});

// Nettoyage
window.addEventListener("beforeunload", () => {
  EventManager.cleanup();
});