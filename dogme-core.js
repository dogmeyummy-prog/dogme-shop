// dogme-core.js

// Core helper & UI glue for Dogme site

const LevelSystem = {
  levels: [
    { name: '萌新', min: 0, color: '#FF8D36', glow: 'rgba(255,141,54,0.12)' },
    { name: '进阶', min: 10, color: '#FF7A18', glow: 'rgba(255,122,24,0.12)' },
    { name: '资深', min: 30, color: '#E63946', glow: 'rgba(230,57,70,0.12)' }
  ],

  getLevelInfo() {
    const exp = parseFloat(localStorage.getItem('dogme_user_exp') || '0');
    let current = this.levels[0];
    let next = null;
    for (let i = 0; i < this.levels.length; i++) {
      if (exp >= this.levels[i].min) {
        current = this.levels[i];
        next = this.levels[i + 1] || null;
      }
    }
    const range = next ? next.min - current.min : 100;
    const progress = next ? ((exp - current.min) / range) * 100 : 100;
    return { ...current, progress };
  },

  updateUI() {
    const info = this.getLevelInfo();
    const isLoggedIn = localStorage.getItem('dogme_user_logged') === 'true';

    const homeBadge = document.getElementById('home-user-badge');
    if (homeBadge) {
      if (isLoggedIn) {
        homeBadge.classList.remove('opacity-0', 'translate-y-4');
        homeBadge.style.boxShadow = `0 10px 30px ${info.glow}`;
        homeBadge.style.borderColor = info.color + '44';

        const tag = document.getElementById('rank-level-tag');
        tag.innerText = `V${info.rank}`;
        tag.style.background = `linear-gradient(135deg, ${info.color}, ${this.darkenColor(info.color)})`;

        const bar = document.getElementById('exp-mini-bar');
        bar.style.background = `linear-gradient(90deg, ${info.color} 0%, #fff 50%, ${info.color} 100%)`;
        bar.style.backgroundSize = '200% 100%';
        setTimeout(() => {
          bar.style.width = `${info.progress}%`;
        }, 100);

        document.getElementById('rank-name-text').innerText = info.name;
      } else {
        homeBadge.style.display = 'none';
      }
    }
  },

  darkenColor(hex) {
    return hex === '#2d3436' ? '#000000' : hex + 'cc';
  }
};

const style = document.createElement('style');
style.innerHTML = `
    @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
    .shimmer-anim { animation: shimmer 2.5s infinite linear; }
    .rank-inline-card { transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); border: 2px solid transparent; }
`;
document.head.appendChild(style);

const DogmeCore = {
  init() {
    LevelSystem.updateUI();
    this.updateCartCount();
  },
  handleUserRoute() {
    const isLogged = localStorage.getItem('dogme_user_logged') === 'true';
    // use replace to avoid adding extra history entry and to be deterministic
    window.location.replace(isLogged ? 'Log-in.html' : 'user.html');
  },
  updateCartCount() {
    const badge = document.getElementById('cart-count');
    const cart = JSON.parse(localStorage.getItem('dogme_cart')) || [];
    if (badge) {
      badge.innerText = cart.length;
      badge.style.display = cart.length > 0 ? 'flex' : 'none';
    }
  }
};

window.onload = () => DogmeCore.init();
