# Smart Home Dashboard

Un tableau de bord moderne et interactif pour contrôler votre maison intelligente. Ce projet offre une interface utilisateur intuitive pour gérer l'éclairage, la climatisation, les relais ESP32 et bien plus encore.

## 📁 Structure du projet

```
smart/
├── index.html          # Page principale du dashboard
├── README.md           # Documentation
├── css/
│   ├── styles.css      # Styles principaux
│   └── animations.css  # Animations CSS
└── js/
    └── app.js          # Logique de l'application
```

## ✨ Fonctionnalités

### 🔐 Authentification
- Page de connexion sécurisée avec code PIN
- Validation côté client et serveur (Google Apps Script)
- Gestion des erreurs de connexion

### 💡 Contrôle de l'éclairage
- **Contrôleur circulaire interactif** : Réglez l'intensité lumineuse en faisant glisser le cadran
- **Bouton d'alimentation** : Allumez/éteignez la lumière principale
- **Préréglages** : Tamisé (25%), Moyen (50%), Vif (75%), Max (100%)
- **Affichage en temps réel** : Pourcentage d'intensité affiché au centre

### ⚡ Commandes des relais ESP32
- Contrôle de 4 relais indépendants
- Basculer l'état (ON/OFF) d'un simple clic
- Inverser tous les relais d'un coup
- Indicateurs visuels clairs (couleurs, icônes)
- Noms personnalisables pour chaque relais

### ❄️ Climatisation
- **Contrôle de la température** : Augmentez/diminuez la température cible
- **Modes de fonctionnement** : Froid, Chaud, Automatique
- **Affichage complet** : Température actuelle, cible, humidité
- **Minuterie** : Réglage de la durée de fonctionnement
- **Bouton d'alimentation** : Allumez/éteignez le système

### 🎵 Contrôle musical
- Lecture/Pause
- Piste précédente/Suivante
- Barre de progression avec temps écoulé
- Affichage du titre et de l'artiste

### 🌤️ Météo
- Affichage de la température extérieure
- Description des conditions météo
- Icône météo dynamique

### 📊 Statistiques énergétiques
- Consommation d'énergie (kWh)
- Coût estimé
- CO2 évité
- Sélection de la période (jour, semaine, mois)

### 🔄 Synchronisation automatique
- Mise à jour périodique des états (toutes les 4 secondes)
- Verrouillage pendant les interactions utilisateur
- Gestion des erreurs réseau

### 📱 Responsive Design
- Adapté aux écrans de toutes tailles
- Optimisé pour mobile, tablette et desktop
- Navigation intuitive

## 🚀 Installation et utilisation

### Méthode 1 : Utilisation locale (pour tests)

1. Clonez ce dépôt ou téléchargez les fichiers
2. Ouvrez `index.html` dans votre navigateur
3. Utilisez le code PIN par défaut : **1234**

> ⚠️ **Note** : En mode local, les données sont simulées. Pour une utilisation réelle, vous devez configurer le backend.

### Méthode 2 : Avec Google Apps Script (recommandé)

1. Créez un nouveau projet Google Apps Script
2. Copiez le code serveur depuis le fichier `server.gs` (à créer)
3. Déployez comme application Web
4. Utilisez l'URL de déploiement pour accéder au dashboard

### Méthode 3 : Avec un serveur backend personnalisé

1. Configurez votre serveur pour gérer les requêtes HTTP
2. Modifiez les fonctions `sendState()` et `checkStatus()` dans `app.js`
3. Adaptez les endpoints selon votre API

## 🔧 Configuration

### Modifier le code PIN

Dans `js/app.js`, modifiez la constante :
```javascript
const CONFIG = {
  DEFAULT_PIN: '1234',  // Changez cette valeur
  // ...
};
```

### Personnaliser les relais

Modifiez les noms et icônes dans `index.html` :
```html
<div class="relay-info">
  <div class="name">Relais 1 - Salon</div>
  <div id="r1-status" class="status">OFF</div>
</div>
```

### Changer les plages de température

Dans `js/app.js` :
```javascript
const CONFIG = {
  // ...
  MIN_TEMP: 16,
  MAX_TEMP: 30,
  // ...
};
```

## 🎨 Personnalisation du design

### Couleurs

Modifiez les variables CSS dans `css/styles.css` :
```css
:root {
  --bg-main: #0b0d12;
  --accent-orange: #ff6b35;
  --accent-blue: #00d2ff;
  /* ... */
}
```

### Polices

Le projet utilise **Inter** de Google Fonts. Vous pouvez la changer dans `index.html` :
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

## 🔌 Intégration avec du matériel

### ESP32 (Arduino)

Exemple de code pour contrôler les relais :

```cpp
#include <WiFi.h>
#include <WebServer.h>

WebServer server(80);

int relayPins[] = {23, 22, 21, 19}; // Broches des relais
bool relayStates[] = {false, false, false, false};

void setup() {
  Serial.begin(115200);
  
  // Configurer les broches
  for (int i = 0; i < 4; i++) {
    pinMode(relayPins[i], OUTPUT);
    digitalWrite(relayPins[i], LOW);
  }
  
  // Connexion WiFi
  WiFi.begin("SSID", "PASSWORD");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  // Configurer les routes
  server.on("/state", HTTP_GET, handleGetState);
  server.on("/state", HTTP_POST, handleSetState);
  
  server.begin();
}

void loop() {
  server.handleClient();
}

void handleGetState() {
  String json = "{";
  for (int i = 0; i < 4; i++) {
    json += "\"relay" + String(i+1) + "\":" + (relayStates[i] ? "1" : "0");
    if (i < 3) json += ",";
  }
  json += "}";
  server.send(200, "application/json", json);
}

void handleSetState() {
  if (server.hasArg("plain")) {
    String body = server.arg("plain");
    // Parser le JSON et mettre à jour les états
    // ...
    
    for (int i = 0; i < 4; i++) {
      digitalWrite(relayPins[i], relayStates[i] ? HIGH : LOW);
    }
    
    server.send(200, "application/json", "{\"status\":\"ok\"}");
  }
}
```

## 📡 API (pour intégration backend)

### Récupérer l'état

**Requête** : `GET /state`

**Réponse** :
```json
{
  "relay1": 0,
  "relay2": 1,
  "relay3": 0,
  "relay4": 0,
  "lightIntensity": 80,
  "lightPower": 1,
  "thermostat": {
    "power": 1,
    "currentTemp": 23,
    "targetTemp": 20,
    "mode": "cool",
    "timer": 2,
    "humidity": 36
  },
  "updated": "14:30:45"
}
```

### Mettre à jour l'état

**Requête** : `POST /state`

**Corps** :
```json
{
  "relay1": 1,
  "relay2": 0,
  "relay3": 1,
  "relay4": 0,
  "lightIntensity": 75,
  "lightPower": 1,
  "pin": "1234"
}
```

**Réponse** :
```json
{
  "status": "ok",
  "updated": "14:30:45"
}
```

## 🎯 Bonnes pratiques

1. **Sécurité** :
   - Changez le code PIN par défaut
   - Utilisez HTTPS pour les connexions
   - Implémentez une authentification côté serveur

2. **Performance** :
   - Limitez la fréquence de synchronisation
   - Utilisez des WebSockets pour les mises à jour en temps réel

3. **Accessibilité** :
   - Utilisez un clavier pour naviguer
   - Vérifiez les contrastes de couleurs
   - Ajoutez des descriptions pour les icônes

## 🐛 Dépannage

### Le dashboard ne se connecte pas
- Vérifiez que vous utilisez le bon code PIN
- Assurez-vous que le serveur backend est en cours d'exécution
- Vérifiez la console du navigateur pour les erreurs

### Les relais ne répondent pas
- Vérifiez la connexion WiFi de votre ESP32
- Assurez-vous que les broches sont correctement configurées
- Testez avec un programme simple pour vérifier le matériel

### L'interface est lente
- Réduisez l'intervalle de synchronisation
- Utilisez des images optimisées
- Minifiez le CSS et JavaScript

## 📜 Licence

Ce projet est sous licence MIT. Vous êtes libre de l'utiliser, le modifier et le distribuer.

## 🙏 Remerciements

- [Inter Font](https://rsms.me/inter/) - Police utilisée dans le projet
- [Feather Icons](https://feathericons.com/) - Inspiration pour les icônes SVG
- [Google Apps Script](https://script.google.com/) - Pour le backend optionnel

---

**Version** : 2.0.0
**Auteur** : Smart Home Team
**Dernière mise à jour** : 2024
