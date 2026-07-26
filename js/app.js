/**
 * Smart Home Dashboard - Main Application
 * Gère l'authentification, les relais, le thermostat et l'éclairage
 */

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  // PIN par défaut (à remplacer par une vérification serveur)
  DEFAULT_PIN: '1234',
  
  // Délai de synchronisation automatique (ms)
  SYNC_INTERVAL: 4000,
  
  // Délai de blocage après interaction utilisateur (ms)
  INTERACTION_LOCK: 5000,
  
  // Plages de température
  MIN_TEMP: 16,
  MAX_TEMP: 30,
  
  // Plages d'intensité lumineuse
  MIN_LIGHT: 0,
  MAX_LIGHT: 100
};

// ============================================
// ÉTAT DE L'APPLICATION
// ============================================

const state = {
  // Authentification
  userPin: '',
  isAuthenticated: false,
  
  // États des relais (0 = OFF, 1 = ON)
  relayStates: [0, 0, 0, 0],
  
  // État de l'éclairage
  lightIntensity: 80,
  lightPower: true,
  
  // État du thermostat
  thermostat: {
    power: true,
    currentTemp: 23,
    targetTemp: 20,
    mode: 'cool', // 'cool', 'heat', 'auto'
    timer: 2,
    humidity: 36
  },
  
  // Synchronisation
  isUserInteracting: false,
  lastSync: null,
  syncTimer: null,
  interactionTimer: null,
  
  // Système
  systemStatus: 'waiting', // 'waiting', 'connected', 'disconnected', 'sending'
  connectedDevices: 0,
  
  // Météo
  weather: {
    temp: 31,
    description: 'Ensoleillé',
    icon: 'sun'
  },
  
  // Musique
  music: {
    isPlaying: false,
    title: 'Ambient Track',
    artist: 'Chill Lounge',
    progress: 0,
    duration: 225
  },
  
  // Statistiques
  stats: {
    energy: 12.5,
    cost: 1.87,
    co2: 2.4
  }
};

// ============================================
// INITIALISATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initDate();
  initEventListeners();
  initDialController();
  
  // Mettre à jour l'interface avec l'état initial
  updateAllUI();
});

/**
 * Initialise l'affichage de la date
 */
function initDate() {
  const options = { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short',
    year: 'numeric'
  };
  
  const dateElement = document.getElementById('navDate');
  if (dateElement) {
    dateElement.textContent = new Date().toLocaleDateString('fr-FR', options);
  }
}

/**
 * Initialise les écouteurs d'événements
 */
function initEventListeners() {
  // Navigation entre les onglets
  const tabItems = document.querySelectorAll('.tab-item');
  tabItems.forEach(tab => {
    tab.addEventListener('click', () => {
      // Retirer la classe active de tous les onglets
      tabItems.forEach(t => t.classList.remove('active'));
      // Ajouter la classe active à l'onglet cliqué
      tab.classList.add('active');
      
      // Ici, vous pourriez charger le contenu spécifique à la pièce
      showToast(`Pièce sélectionnée: ${tab.textContent}`, 'info');
    });
  });
  
  // Boutons de contrôle de la musique
  const playBtn = document.querySelector('.music-btn.play-btn');
  if (playBtn) {
    playBtn.addEventListener('click', toggleMusicPlayback);
  }
  
  // Simulation de progression de la musique
  setInterval(() => {
    if (state.music.isPlaying) {
      state.music.progress = (state.music.progress + 1) % state.music.duration;
      updateMusicProgress();
    }
  }, 1000);
  
  // Mise à jour de l'heure toutes les minutes
  setInterval(initDate, 60000);
}

/**
 * Initialise le contrôleur circulaire de l'éclairage
 */
function initDialController() {
  const dial = document.getElementById('lightDial');
  if (!dial) return;
  
  let isDragging = false;
  let startAngle = 0;
  let currentAngle = state.lightIntensity / 100 * 360;
  
  // Position initiale du thumb
  updateDialPosition();
  
  // Événements tactiles et souris
  const startDrag = (e) => {
    isDragging = true;
    const rect = dial.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;
    
    startAngle = calculateAngle(centerX, centerY, clientX, clientY);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchmove', drag);
    document.addEventListener('touchend', stopDrag);
    
    e.preventDefault();
  };
  
  const drag = (e) => {
    if (!isDragging) return;
    
    const rect = dial.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;
    
    currentAngle = calculateAngle(centerX, centerY, clientX, clientY);
    const normalizedAngle = normalizeAngle(currentAngle - startAngle);
    
    // Convertir l'angle en valeur (0-100)
    let newValue = Math.round((normalizedAngle / 360) * 100);
    newValue = Math.max(CONFIG.MIN_LIGHT, Math.min(CONFIG.MAX_LIGHT, newValue));
    
    state.lightIntensity = newValue;
    updateDialPosition();
    updateLightDisplay();
    
    // Envoyer la mise à jour (si connecté)
    if (state.isAuthenticated) {
      sendLightState();
    }
  };
  
  const stopDrag = () => {
    isDragging = false;
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('touchmove', drag);
    document.removeEventListener('touchend', stopDrag);
  };
  
  // Événements
  dial.addEventListener('mousedown', startDrag);
  dial.addEventListener('touchstart', startDrag);
  
  // Clic sur le dial pour basculer l'alimentation
  dial.addEventListener('click', (e) => {
    if (isDragging) return;
    const rect = dial.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distance = Math.sqrt(
      Math.pow(e.clientX - centerX, 2) + 
      Math.pow(e.clientY - centerY, 2)
    );
    const dialRadius = rect.width / 2;
    
    // Si clic au centre, basculer l'alimentation
    if (distance < dialRadius * 0.3) {
      toggleLightPower();
    }
  });
  
  // Fonction utilitaire pour calculer l'angle
  function calculateAngle(centerX, centerY, clientX, clientY) {
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    return (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;
  }
  
  // Normaliser l'angle entre 0 et 360
  function normalizeAngle(angle) {
    return ((angle % 360) + 360) % 360;
  }
}

/**
 * Met à jour la position du cadran
 */
function updateDialPosition() {
  const dialFill = document.getElementById('dialFill');
  const dialThumb = document.getElementById('dialThumb');
  const dialValue = document.getElementById('dialValue');
  
  if (dialFill) {
    dialFill.style.setProperty('--dial-value', state.lightIntensity);
  }
  
  if (dialThumb) {
    dialThumb.style.transform = `rotate(${state.lightIntensity * 3.6}deg) translateY(-80px)`;
  }
  
  if (dialValue) {
    dialValue.textContent = `${state.lightIntensity}%`;
  }
}

// ============================================
// FONCTIONS D'AUTHENTIFICATION
// ============================================

/**
 * Fonction de connexion
 */
function login() {
  const pinInput = document.getElementById('pinInput');
  const statusElement = document.getElementById('loginStatus');
  
  if (!pinInput || !statusElement) return;
  
  const pin = pinInput.value.trim();
  
  if (!pin) {
    showStatus(statusElement, '⚠️ Entrez votre code PIN', 'danger');
    animateShake('pinInput');
    return;
  }
  
  showStatus(statusElement, '⏳ Vérification...', 'info');
  
  // Vérification du PIN
  // Dans une application réelle, cela serait fait côté serveur
  if (typeof google !== 'undefined' && google.script && google.script.run) {
    // Version Google Apps Script
    google.script.run
      .withSuccessHandler((isValid) => {
        handleLoginResult(isValid, pin, statusElement);
      })
      .withFailureHandler((err) => {
        showStatus(statusElement, `⚠️ Erreur : ${err.message || err}`, 'danger');
      })
      .verifyPin(pin);
  } else {
    // Version locale pour test
    setTimeout(() => {
      handleLoginResult(pin === CONFIG.DEFAULT_PIN, pin, statusElement);
    }, 1000);
  }
}

/**
 * Gère le résultat de la connexion
 */
function handleLoginResult(isValid, pin, statusElement) {
  if (isValid) {
    state.userPin = pin;
    state.isAuthenticated = true;
    
    // Masquer la page de login
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    
    // Démarrer la synchronisation automatique
    startAutoSync();
    
    // Mettre à jour l'interface
    updateAllUI();
    
    showToast('Connexion réussie !', 'success');
  } else {
    showStatus(statusElement, '❌ Code PIN incorrect', 'danger');
    animateShake('pinInput');
    animateShake('loginPage');
  }
}

/**
 * Déconnexion
 */
function logout() {
  state.isAuthenticated = false;
  state.userPin = '';
  
  // Arrêter la synchronisation
  stopAutoSync();
  
  // Réinitialiser l'interface
  document.getElementById('loginPage').classList.remove('hidden');
  document.getElementById('dashboard').classList.add('hidden');
  
  // Réinitialiser le champ PIN
  const pinInput = document.getElementById('pinInput');
  if (pinInput) {
    pinInput.value = '';
    pinInput.focus();
  }
  
  showToast('Déconnexion effectuée', 'info');
}

// ============================================
// FONCTIONS DE SYNCHRONISATION
// ============================================

/**
 * Démarre la synchronisation automatique
 */
function startAutoSync() {
  // Vérifier l'état initial
  checkStatus();
  
  // Démarrer l'intervalle de synchronisation
  state.syncTimer = setInterval(() => {
    if (!state.isUserInteracting) {
      checkStatus();
    }
  }, CONFIG.SYNC_INTERVAL);
}

/**
 * Arrête la synchronisation automatique
 */
function stopAutoSync() {
  if (state.syncTimer) {
    clearInterval(state.syncTimer);
    state.syncTimer = null;
  }
  if (state.interactionTimer) {
    clearTimeout(state.interactionTimer);
    state.interactionTimer = null;
  }
}

/**
 * Vérifie l'état du serveur
 */
function checkStatus() {
  if (!state.isAuthenticated) return;
  
  setSystemStatus('sending');
  
  if (typeof google !== 'undefined' && google.script && google.script.run) {
    // Version Google Apps Script
    google.script.run
      .withSuccessHandler(updateUIFromServer)
      .withFailureHandler(() => {
        setSystemStatus('disconnected');
      })
      .getStateForHtml(state.userPin);
  } else {
    // Version locale pour test
    setTimeout(() => {
      // Simuler une réponse du serveur
      updateUIFromServer({
        relay1: state.relayStates[0],
        relay2: state.relayStates[1],
        relay3: state.relayStates[2],
        relay4: state.relayStates[3],
        lightIntensity: state.lightIntensity,
        lightPower: state.lightPower ? 1 : 0,
        thermostat: state.thermostat,
        updated: new Date().toLocaleTimeString('fr-FR')
      });
    }, 500);
  }
}

/**
 * Met à jour l'interface depuis les données du serveur
 */
function updateUIFromServer(data) {
  if (!data || data.error || state.isUserInteracting) return;
  
  // Mettre à jour les états des relais
  if (data.relay1 !== undefined) state.relayStates[0] = data.relay1;
  if (data.relay2 !== undefined) state.relayStates[1] = data.relay2;
  if (data.relay3 !== undefined) state.relayStates[2] = data.relay3;
  if (data.relay4 !== undefined) state.relayStates[3] = data.relay4;
  
  // Mettre à jour l'éclairage
  if (data.lightIntensity !== undefined) {
    state.lightIntensity = data.lightIntensity;
    updateDialPosition();
  }
  if (data.lightPower !== undefined) {
    state.lightPower = data.lightPower === 1;
  }
  
  // Mettre à jour le thermostat
  if (data.thermostat) {
    state.thermostat = { ...state.thermostat, ...data.thermostat };
  }
  
  // Mettre à jour la dernière synchronisation
  if (data.updated) {
    state.lastSync = data.updated;
  }
  
  // Mettre à jour l'interface
  updateAllUI();
  setSystemStatus('connected');
}

/**
 * Envoie l'état au serveur
 */
function sendState() {
  if (!state.isAuthenticated) return;
  
  setSystemStatus('sending');
  
  if (typeof google !== 'undefined' && google.script && google.script.run) {
    // Version Google Apps Script
    google.script.run
      .withSuccessHandler((data) => {
        if (data && data.updated) {
          state.lastSync = data.updated;
          updateSystemUI();
        }
        setSystemStatus('connected');
      })
      .withFailureHandler(() => {
        setSystemStatus('disconnected');
      })
      .setStateFromHtml(
        state.relayStates[0],
        state.relayStates[1],
        state.relayStates[2],
        state.relayStates[3],
        state.lightIntensity,
        state.lightPower ? 1 : 0,
        state.userPin
      );
  } else {
    // Version locale pour test
    setTimeout(() => {
      state.lastSync = new Date().toLocaleTimeString('fr-FR');
      updateSystemUI();
      setSystemStatus('connected');
      showToast('État synchronisé', 'success');
    }, 500);
  }
}

/**
 * Envoie l'état de l'éclairage
 */
function sendLightState() {
  if (!state.isAuthenticated) return;
  
  // Bloquer la synchronisation automatique pendant un court instant
  state.isUserInteracting = true;
  clearTimeout(state.interactionTimer);
  state.interactionTimer = setTimeout(() => {
    state.isUserInteracting = false;
  }, CONFIG.INTERACTION_LOCK);
  
  setSystemStatus('sending');
  
  // Dans une vraie application, envoyer au serveur
  // Pour la démo, on simule
  setTimeout(() => {
    setSystemStatus('connected');
  }, 300);
}

// ============================================
// FONCTIONS DE CONTRÔLE DES RELAIS
// ============================================

/**
 * Bascule l'état d'un relais
 */
function toggleRelay(n) {
  if (!state.isAuthenticated) {
    showToast('Veuillez vous connecter', 'warning');
    return;
  }
  
  // Bloquer la synchronisation automatique
  state.isUserInteracting = true;
  clearTimeout(state.interactionTimer);
  state.interactionTimer = setTimeout(() => {
    state.isUserInteracting = false;
  }, CONFIG.INTERACTION_LOCK);
  
  // Basculer la valeur locale
  const index = n - 1;
  state.relayStates[index] = state.relayStates[index] === 1 ? 0 : 1;
  
  // Mettre à jour l'affichage
  updateRelayCard(`r${n}`, state.relayStates[index]);
  
  // Envoyer au serveur
  sendState();
  
  // Notification
  const relayNames = {
    1: 'Salon',
    2: 'Chambre 1',
    3: 'Chambre 2',
    4: 'Cuisine'
  };
  const status = state.relayStates[index] === 1 ? 'ALLUMÉ' : 'ÉTEINT';
  showToast(`Relais ${n} (${relayNames[n]}) : ${status}`, 'info');
}

/**
 * Bascule tous les relais
 */
function toggleAllRelays() {
  if (!state.isAuthenticated) {
    showToast('Veuillez vous connecter', 'warning');
    return;
  }
  
  state.isUserInteracting = true;
  clearTimeout(state.interactionTimer);
  state.interactionTimer = setTimeout(() => {
    state.isUserInteracting = false;
  }, CONFIG.INTERACTION_LOCK);
  
  // Inverser tous les états
  state.relayStates = state.relayStates.map(s => s === 1 ? 0 : 1);
  
  // Mettre à jour l'interface
  for (let i = 1; i <= 4; i++) {
    updateRelayCard(`r${i}`, state.relayStates[i - 1]);
  }
  
  // Envoyer au serveur
  sendState();
  
  showToast('Tous les relais inversés', 'info');
}

/**
 * Met à jour l'affichage d'une carte de relais
 */
function updateRelayCard(id, stateValue) {
  const card = document.getElementById(id);
  const statusText = document.getElementById(`${id}-status`);
  
  if (!card || !statusText) return;
  
  if (stateValue === 1) {
    card.classList.add('active');
    card.setAttribute('aria-pressed', 'true');
    statusText.textContent = 'ALLUMÉ';
  } else {
    card.classList.remove('active');
    card.setAttribute('aria-pressed', 'false');
    statusText.textContent = 'ÉTEINT';
  }
}

// ============================================
// FONCTIONS DE CONTRÔLE DE L'ÉCLAIRAGE
// ============================================

/**
 * Bascule l'alimentation de la lumière
 */
function toggleLightPower() {
  if (!state.isAuthenticated) {
    showToast('Veuillez vous connecter', 'warning');
    return;
  }
  
  state.lightPower = !state.lightPower;
  
  const powerBtn = document.getElementById('lightPowerBtn');
  if (powerBtn) {
    powerBtn.classList.toggle('active', state.lightPower);
    powerBtn.setAttribute('aria-pressed', state.lightPower);
  }
  
  // Si on éteint, mettre l'intensité à 0
  if (!state.lightPower) {
    state.lightIntensity = 0;
    updateDialPosition();
  } else {
    // Si on allume, restaurer à 80% par défaut
    if (state.lightIntensity === 0) {
      state.lightIntensity = 80;
      updateDialPosition();
    }
  }
  
  updateLightDisplay();
  sendLightState();
  
  showToast(`Lumière ${state.lightPower ? 'allumée' : 'éteinte'}`, 'info');
}

/**
 * Définit un préréglage d'éclairage
 */
function setLightPreset(value) {
  if (!state.isAuthenticated) {
    showToast('Veuillez vous connecter', 'warning');
    return;
  }
  
  state.lightIntensity = value;
  state.lightPower = true;
  
  updateDialPosition();
  updateLightDisplay();
  sendLightState();
  
  const presetNames = {
    25: 'Tamisé',
    50: 'Moyen',
    75: 'Vif',
    100: 'Max'
  };
  showToast(`Lumière réglée sur ${presetNames[value] || value + '%'}`, 'info');
}

/**
 * Met à jour l'affichage de l'éclairage
 */
function updateLightDisplay() {
  const powerBtn = document.getElementById('lightPowerBtn');
  if (powerBtn) {
    powerBtn.classList.toggle('active', state.lightPower);
    powerBtn.setAttribute('aria-pressed', state.lightPower);
  }
  
  // Mettre à jour le dial
  updateDialPosition();
}

// ============================================
// FONCTIONS DE CONTRÔLE DU THERMOSTAT
// ============================================

/**
 * Bascule l'alimentation de la climatisation
 */
function toggleACPowers() {
  if (!state.isAuthenticated) {
    showToast('Veuillez vous connecter', 'warning');
    return;
  }
  
  state.thermostat.power = !state.thermostat.power;
  
  const powerBtn = document.getElementById('acPowerBtn');
  if (powerBtn) {
    powerBtn.classList.toggle('active', state.thermostat.power);
    powerBtn.setAttribute('aria-pressed', state.thermostat.power);
  }
  
  updateThermostatDisplay();
  sendState();
  
  showToast(`Climatisation ${state.thermostat.power ? 'allumée' : 'éteinte'}`, 'info');
}

/**
 * Augmente la température cible
 */
function increaseTargetTemp() {
  if (!state.isAuthenticated) {
    showToast('Veuillez vous connecter', 'warning');
    return;
  }
  
  if (state.thermostat.targetTemp < CONFIG.MAX_TEMP) {
    state.thermostat.targetTemp++;
    updateThermostatDisplay();
    sendState();
    showToast(`Température cible: ${state.thermostat.targetTemp}°C`, 'info');
  } else {
    showToast(`Température maximale atteinte (${CONFIG.MAX_TEMP}°C)`, 'warning');
  }
}

/**
 * Diminue la température cible
 */
function decreaseTargetTemp() {
  if (!state.isAuthenticated) {
    showToast('Veuillez vous connecter', 'warning');
    return;
  }
  
  if (state.thermostat.targetTemp > CONFIG.MIN_TEMP) {
    state.thermostat.targetTemp--;
    updateThermostatDisplay();
    sendState();
    showToast(`Température cible: ${state.thermostat.targetTemp}°C`, 'info');
  } else {
    showToast(`Température minimale atteinte (${CONFIG.MIN_TEMP}°C)`, 'warning');
  }
}

/**
 * Définit le mode du thermostat
 */
function setThermostatMode(mode) {
  if (!state.isAuthenticated) {
    showToast('Veuillez vous connecter', 'warning');
    return;
  }
  
  state.thermostat.mode = mode;
  
  // Mettre à jour les boutons
  const modeButtons = document.querySelectorAll('.mode-btn');
  modeButtons.forEach(btn => {
    const isActive = btn.dataset.mode === mode;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive);
  });
  
  updateThermostatDisplay();
  sendState();
  
  const modeNames = {
    cool: 'Refroidissement',
    heat: 'Chauffage',
    auto: 'Automatique'
  };
  showToast(`Mode: ${modeNames[mode]}`, 'info');
}

/**
 * Met à jour l'affichage du thermostat
 */
function updateThermostatDisplay() {
  // Mettre à jour la température actuelle
  const currentTempElement = document.getElementById('currentTemp');
  if (currentTempElement) {
    currentTempElement.textContent = `${state.thermostat.currentTemp}°C`;
  }
  
  // Mettre à jour la température cible
  const targetTempElement = document.getElementById('targetTemp');
  if (targetTempElement) {
    targetTempElement.textContent = `${state.thermostat.targetTemp}°C`;
  }
  
  // Mettre à jour le mode
  const modeElement = document.getElementById('thermostatMode');
  if (modeElement) {
    const modeBadge = modeElement.querySelector('.mode-badge');
    if (modeBadge) {
      modeBadge.textContent = state.thermostat.mode === 'cool' ? 'REFROIDISSEMENT' :
                               state.thermostat.mode === 'heat' ? 'CHAUFFAGE' : 'AUTOMATIQUE';
      modeBadge.className = `mode-badge ${state.thermostat.mode}`;
    }
  }
  
  // Mettre à jour l'humidité
  const humidityElement = document.getElementById('humidity');
  if (humidityElement) {
    humidityElement.textContent = `${state.thermostat.humidity}%`;
  }
  
  // Mettre à jour le timer
  const timerElement = document.getElementById('acTimer');
  if (timerElement) {
    timerElement.textContent = `${state.thermostat.timer}h`;
  }
  
  // Mettre à jour le bouton d'alimentation
  const powerBtn = document.getElementById('acPowerBtn');
  if (powerBtn) {
    powerBtn.classList.toggle('active', state.thermostat.power);
    powerBtn.setAttribute('aria-pressed', state.thermostat.power);
  }
}

// ============================================
// FONCTIONS DE CONTRÔLE DE LA MUSIQUE
// ============================================

/**
 * Bascule la lecture/pause de la musique
 */
function toggleMusicPlayback() {
  state.music.isPlaying = !state.music.isPlaying;
  
  const playBtn = document.querySelector('.music-btn.play-btn');
  if (playBtn) {
    const playIcon = playBtn.querySelector('.icon-play');
    const pauseIcon = playBtn.querySelector('.icon-pause');
    
    if (playIcon && pauseIcon) {
      playIcon.classList.toggle('hidden', state.music.isPlaying);
      pauseIcon.classList.toggle('hidden', !state.music.isPlaying);
    }
  }
  
  showToast(state.music.isPlaying ? 'Lecture en cours...' : 'Pause', 'info');
}

/**
 * Met à jour la barre de progression de la musique
 */
function updateMusicProgress() {
  const progressBar = document.querySelector('.progress-fill');
  if (progressBar) {
    const progressPercent = (state.music.progress / state.music.duration) * 100;
    progressBar.style.width = `${progressPercent}%`;
  }
  
  const progressTime = document.querySelector('.progress-time');
  if (progressTime) {
    const currentMinutes = Math.floor(state.music.progress / 60);
    const currentSeconds = state.music.progress % 60;
    const durationMinutes = Math.floor(state.music.duration / 60);
    const durationSeconds = state.music.duration % 60;
    
    progressTime.textContent = `${currentMinutes}:${currentSeconds.toString().padStart(2, '0')} / ${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`;
  }
}

// ============================================
// FONCTIONS D'AFFICHAGE
// ============================================

/**
 * Met à jour toute l'interface
 */
function updateAllUI() {
  updateSystemUI();
  updateRelayUI();
  updateLightDisplay();
  updateThermostatDisplay();
  updateMusicProgress();
  updateWeatherDisplay();
  updateStatsDisplay();
}

/**
 * Met à jour l'affichage du système
 */
function updateSystemUI() {
  const statusElement = document.getElementById('systemStatus');
  const statusTextElement = document.getElementById('systemStatusText');
  const lastSyncElement = document.getElementById('lastSync');
  const indicatorDot = document.querySelector('.indicator-dot');
  
  if (statusTextElement) {
    const statusMessages = {
      waiting: 'En attente...',
      connected: 'Connecté',
      disconnected: 'Hors ligne',
      sending: 'Envoi...'
    };
    statusTextElement.textContent = statusMessages[state.systemStatus] || state.systemStatus;
  }
  
  if (indicatorDot) {
    indicatorDot.className = `indicator-dot ${state.systemStatus}`;
  }
  
  if (lastSyncElement) {
    lastSyncElement.textContent = state.lastSync || '--';
  }
  
  // Mettre à jour le nombre d'appareils connectés
  const devicesElement = document.getElementById('connectedDevices');
  if (devicesElement) {
    devicesElement.textContent = state.connectedDevices;
  }
  
  // Mettre à jour l'uptime
  const uptimeElement = document.getElementById('systemUptime');
  if (uptimeElement) {
    // Calculer l'uptime (simulé)
    const uptime = state.isAuthenticated ? '2h 34m' : '--';
    uptimeElement.textContent = uptime;
  }
}

/**
 * Met à jour l'affichage des relais
 */
function updateRelayUI() {
  for (let i = 1; i <= 4; i++) {
    updateRelayCard(`r${i}`, state.relayStates[i - 1]);
  }
}

/**
 * Met à jour l'affichage de la météo
 */
function updateWeatherDisplay() {
  const tempElement = document.getElementById('weatherTemp');
  const descElement = document.getElementById('weatherDesc');
  const iconElement = document.getElementById('weatherIcon');
  
  if (tempElement) {
    tempElement.textContent = `${state.weather.temp}°C`;
  }
  
  if (descElement) {
    descElement.textContent = state.weather.description;
  }
  
  if (iconElement) {
    // Mettre à jour l'icône en fonction de la météo
    const weatherIcons = {
      sun: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3"/>
        <line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/>
        <line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>`,
      cloud: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
      </svg>`,
      rain: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
        <line x1="12" y1="18" x2="12" y2="22"/>
        <line x1="8" y1="20" x2="8" y2="24"/>
        <line x1="16" y1="20" x2="16" y2="24"/>
        <line x1="10" y1="22" x2="10" y2="26"/>
        <line x1="14" y1="22" x2="14" y2="26"/>
      </svg>`,
      snow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
        <line x1="12" y1="18" x2="12" y2="22"/>
        <line x1="8" y1="20" x2="8" y2="24"/>
        <line x1="16" y1="20" x2="16" y2="24"/>
        <line x1="10" y1="18" x2="10" y2="22"/>
        <line x1="14" y1="18" x2="14" y2="22"/>
        <line x1="12" y1="22" x2="12" y2="26"/>
      </svg>`
    };
    
    iconElement.innerHTML = weatherIcons[state.weather.icon] || weatherIcons.sun;
  }
}

/**
 * Met à jour l'affichage des statistiques
 */
function updateStatsDisplay() {
  const energyElement = document.getElementById('energyConsumption');
  const costElement = document.getElementById('energyCost');
  const co2Element = document.getElementById('co2Saved');
  
  if (energyElement) {
    energyElement.textContent = `${state.stats.energy} kWh`;
  }
  
  if (costElement) {
    costElement.textContent = `€${state.stats.cost.toFixed(2)}`;
  }
  
  if (co2Element) {
    co2Element.textContent = `${state.stats.co2} kg`;
  }
}

/**
 * Définit le statut du système
 */
function setSystemStatus(status) {
  state.systemStatus = status;
  updateSystemUI();
}

/**
 * Affiche un message de statut
 */
function showStatus(element, message, type = 'info') {
  if (!element) return;
  
  element.textContent = message;
  
  const colors = {
    info: 'var(--accent-blue)',
    success: 'var(--accent-green)',
    warning: 'var(--warning)',
    danger: 'var(--danger)'
  };
  
  element.style.color = colors[type] || colors.info;
}

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

/**
 * Affiche une notification toast
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast ${type} animate-fade-in`;
  
  const icons = {
    success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>`,
    error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
    </svg>`,
    warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>`,
    info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>`
  };
  
  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || icons.info}</div>
    <span>${message}</span>
  `;
  
  container.appendChild(toast);
  
  // Supprimer après 3 secondes
  setTimeout(() => {
    toast.classList.add('animate-fade-out');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

/**
 * Anime un élément avec un effet de secousse
 */
function animateShake(elementId) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  element.classList.add('animate-shake');
  setTimeout(() => {
    element.classList.remove('animate-shake');
  }, 500);
}

/**
 * Formate un nombre avec un séparateur de milliers
 */
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/**
 * Formate une température
 */
function formatTemp(temp) {
  return `${temp}°C`;
}

/**
 * Formate une heure
 */
function formatTime(date) {
  return date.toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

// ============================================
// EXPORT POUR TESTS
// ============================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CONFIG,
    state,
    login,
    logout,
    toggleRelay,
    toggleLightPower,
    setLightPreset,
    toggleACPowers,
    increaseTargetTemp,
    decreaseTargetTemp,
    setThermostatMode,
    toggleMusicPlayback
  };
}
