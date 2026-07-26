# Smart Home Dashboard

<p align="center">
  <img src="https://img.shields.io/badge/Version-2.0.0-blue?style=for-the-badge" alt="Version">
  <img src="https://img.shields.io/badge/Licence-MIT-green?style=for-the-badge" alt="Licence">
  <img src="https://img.shields.io/badge/ESP32-Ready-brightgreen?style=for-the-badge" alt="ESP32">
</p>

Un **tableau de bord moderne et interactif** pour contrôler votre maison intelligente. Ce projet offre une interface utilisateur intuitive pour gérer l'éclairage, la climatisation, les relais ESP32, la musique et bien plus encore.

---

## 📁 Structure du projet

```
smart/
├── index.html              # Page principale du dashboard
├── README.md               # Documentation complète
├── css/
│   ├── styles.css          # Styles principaux (26 Ko)
│   └── animations.css      # Animations CSS (12 Ko)
└── js/
    └── app.js              # Logique de l'application (32 Ko)
```

---

## ✨ Fonctionnalités

### 🔐 Authentification
- Page de connexion sécurisée avec code PIN
- Validation côté client et serveur (Google Apps Script compatible)
- Gestion des erreurs de connexion
- Notifications visuelles

### 💡 Contrôle de l'éclairage
- **Contrôleur circulaire interactif** : Réglez l'intensité lumineuse en faisant glisser le cadran
- **Bouton d'alimentation** : Allumez/éteignez la lumière principale
- **4 préréglages** : Tamisé (25%), Moyen (50%), Vif (75%), Max (100%)
- **Affichage en temps réel** du pourcentage d'intensité

### ⚡ Commandes des relais ESP32
- Contrôle de **4 relais indépendants**
- Basculer l'état (ON/OFF) d'un simple clic
- Inverser tous les relais d'un coup
- Indicateurs visuels clairs (couleurs, icônes SVG)
- Noms personnalisables pour chaque relais

### ❄️ Climatisation
- **Contrôle de la température** : Augmentez/diminuez la température cible (16-30°C)
- **3 modes** : Froid, Chaud, Automatique
- **Affichage circulaire** avec température actuelle et cible
- **Indicateur d'humidité** et minuterie

### 🎵 Contrôle musical
- Lecture/Pause avec icônes dynamiques
- Piste précédente/Suivante
- Barre de progression animée
- Affichage du titre et de l'artiste

### 🌤️ Météo
- Affichage de la température extérieure
- Description des conditions météo
- Icône météo SVG dynamique

### 📊 Statistiques énergétiques
- Consommation en kWh
- Coût estimé
- CO2 évité
- Sélecteur de période (jour/semaine/mois)

---

## 🚀 Installation et utilisation

### Méthode 1 : Utilisation locale (pour tests)

1. Clonez ce dépôt ou téléchargez les fichiers
2. Ouvrez `index.html` dans votre navigateur
3. Utilisez le code PIN par défaut : **`1234`**

> ⚠️ **Note** : En mode local, les données sont simulées. Pour une utilisation réelle, configurez le backend.

### Méthode 2 : Avec Google Apps Script

1. Créez un nouveau projet [Google Apps Script](https://script.google.com/)
2. Copiez le code serveur depuis la section [Backend](#-backend-google-apps-script)
3. Déployez comme **application Web** (Publier > Déployer comme application Web)
4. Utilisez l'URL de déploiement pour accéder au dashboard

### Méthode 3 : Avec un serveur backend personnalisé

1. Configurez votre serveur (Node.js, Python, PHP, etc.)
2. Implémentez les endpoints API décrits dans [API Documentation](#-api-pour-intégration-backend)
3. Modifiez les fonctions `sendState()` et `checkStatus()` dans `js/app.js`

---

## 🔌 Intégration Matérielle

### 📡 Architecture Recommandée

```
+------------------+     +-------------------+     +------------------+
|                  |     |                   |     |                  |
|   Dashboard      +<--->+    Backend         +<--->+    ESP32         |
|   (HTML/JS)      |     |   (Node.js/GASS)  |     |   (WiFi)         |
|                  |     |                   |     |                  |
+------------------+     +-------------------+     +--------+--------+
                                                       |        |
                                                       v        v
                                              +------------------+------------------+
                                              | Relais 1 | Relais 2 | Relais 3 | Relais 4 |
                                              |  💡      |  🌙      |  🪟      |  🍳      |
                                              | Salon    | Chambre1| Chambre2| Cuisine  |
                                              +------------------+------------------+
```

---

## 🤖 Intégration ESP32 (Arduino) - Guide Complet

### 📋 Prérequis

| Composant | Quantité | Rôle |
|-----------|----------|------|
| ESP32 (ex: ESP32-WROOM-32) | 1 | Microcontrôleur WiFi |
| Module relais 5V | 4 | Contrôle des appareils 220V |
| Alimentation 5V | 1 | Alimentation de l'ESP32 |
| Câbles de connexion | - | Connexion entre ESP32 et relais |
| Breadboard (optionnel) | 1 | Prototypage |

### 🔌 Schéma de câblage

```
ESP32 Pinout:
┌───────────────────────────┐
│ ESP32                     │
│                           │
│  3.3V ────┬───── VCC (Relay)│
│  GND   ────┴───── GND (Relay)│
│                           │
│  GPIO 23 ──────── Relais 1 │  💡 Salon
│  GPIO 22 ──────── Relais 2 │  🌙 Chambre 1
│  GPIO 21 ──────── Relais 3 │  🪟 Chambre 2
│  GPIO 19 ──────── Relais 4 │  🍳 Cuisine
│                           │
└───────────────────────────┘

Module Relais 5V:
┌───────────────────────────┐
│ Relay Module              │
│                           │
│  VCC ──── 5V (ESP32 5V)    │
│  GND ──── GND (ESP32 GND)  │
│  IN1 ──── GPIO 23          │
│  IN2 ──── GPIO 22          │
│  IN3 ──── GPIO 21          │
│  IN4 ──── GPIO 19          │
│                           │
│  COM1 ──── Appareil 1 (220V)│
│  NO1  ──── Appareil 1      │
│  COM2 ──── Appareil 2 (220V)│
│  NO2  ──── Appareil 2      │
└───────────────────────────┘
```

> ⚠️ **ATTENTION** : Travaillez avec des tensions dangereuses (220V). Assurez-vous que l'alimentation est coupée avant toute manipulation. Utilisez des modules relais **isolés** pour la sécurité.

### 📦 Bibliothèques requises

Installez ces bibliothèques via le **Library Manager** dans l'IDE Arduino :

1. **WiFi** (incluse avec ESP32)
2. **WebServer** (incluse avec ESP32)
3. **ArduinoJSON** (pour le parsing JSON)
   - Par **Benoit Blanchon**
   - Version recommandée : 6.x

Pour installer ArduinoJSON :
```
Sketch > Include Library > Manage Libraries > Chercher "ArduinoJSON" > Installer
```

### 📄 Code ESP32 Complet

Voici un code **complet et fonctionnel** pour votre ESP32 :

```cpp
#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJSON.h>

// ============================================
// CONFIGURATION
// ============================================

// Identifiants WiFi
const char* ssid = "VOTRE_SSID";
const char* password = "VOTRE_MOT_DE_PASSE";

// Code PIN pour l'authentification (doit correspondre à celui du dashboard)
const char* authPin = "1234";

// Broches des relais
const int relayPins[] = {23, 22, 21, 19}; // GPIO pour Relais 1-4

// Noms des relais (pour les logs)
const char* relayNames[] = {"Salon", "Chambre 1", "Chambre 2", "Cuisine"};

// États des relais (0 = OFF, 1 = ON)
int relayStates[] = {0, 0, 0, 0};

// État de l'éclairage
int lightIntensity = 80;
bool lightPower = true;

// État du thermostat (simulé)
float currentTemp = 23.0;
float targetTemp = 20.0;
bool acPower = true;
String acMode = "cool";
int humidity = 36;

// ============================================
// INITIALISATION
// ============================================

WebServer server(80);

void setup() {
  Serial.begin(115200);
  
  // Initialiser les broches des relais
  for (int i = 0; i < 4; i++) {
    pinMode(relayPins[i], OUTPUT);
    digitalWrite(relayPins[i], LOW); // Éteindre tous les relais au démarrage
  }
  
  // Connexion WiFi
  connectToWiFi();
  
  // Configurer les routes du serveur
  setupRoutes();
  
  // Démarrer le serveur
  server.begin();
  Serial.println("Serveur HTTP démarré");
  Serial.print("Adresse IP: ");
  Serial.println(WiFi.localIP());
  
  // Afficher le QR code pour la connexion (optionnel)
  printQRCode();
}

// ============================================
// CONNEXION WIFI
// ============================================

void connectToWiFi() {
  Serial.println();
  Serial.print("Connexion à ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.println("WiFi connecté !");
    Serial.print("Adresse IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println();
    Serial.println("Échec de la connexion WiFi !");
    Serial.println("Redémarrage dans 5 secondes...");
    delay(5000);
    ESP.restart();
  }
}

// ============================================
// CONFIGURATION DES ROUTES
// ============================================

void setupRoutes() {
  // Route pour vérifier l'état (GET)
  server.on("/state", HTTP_GET, handleGetState);
  
  // Route pour mettre à jour l'état (POST)
  server.on("/state", HTTP_POST, handleSetState);
  
  // Route pour vérifier le PIN (GET)
  server.on("/verify-pin", HTTP_GET, handleVerifyPin);
  
  // Route racine (redirige vers /state)
  server.on("/", HTTP_GET, []() {
    server.sendHeader("Location", "/state");
    server.send(302, "text/plain", "Redirecting...");
  });
  
  // Route 404
  server.onNotFound(handleNotFound);
}

// ============================================
// GESTIONNAIRES DE ROUTES
// ============================================

// Récupérer l'état actuel
void handleGetState() {
  // Vérifier l'authentification
  if (!checkAuthentication()) {
    server.send(401, "application/json", "{\"error\":\"Non autorisé\"}");
    return;
  }
  
  // Créer l'objet JSON de réponse
  DynamicJsonDocument doc(1024);
  
  // Ajouter les états des relais
  for (int i = 0; i < 4; i++) {
    doc["relay" + String(i+1)] = relayStates[i];
  }
  
  // Ajouter l'état de l'éclairage
  doc["lightIntensity"] = lightIntensity;
  doc["lightPower"] = lightPower ? 1 : 0;
  
  // Ajouter l'état du thermostat
  JsonObject thermostat = doc.createNestedObject("thermostat");
  thermostat["power"] = acPower ? 1 : 0;
  thermostat["currentTemp"] = currentTemp;
  thermostat["targetTemp"] = targetTemp;
  thermostat["mode"] = acMode;
  thermostat["timer"] = 2; // Minuterie fixe pour l'exemple
  thermostat["humidity"] = humidity;
  
  // Ajouter la date de mise à jour
  doc["updated"] = getCurrentTime();
  
  // Envoyer la réponse
  String jsonResponse;
  serializeJson(doc, jsonResponse);
  server.send(200, "application/json", jsonResponse);
}

// Mettre à jour l'état
void handleSetState() {
  // Vérifier l'authentification
  if (!checkAuthentication()) {
    server.send(401, "application/json", "{\"error\":\"Non autorisé\"}");
    return;
  }
  
  // Vérifier qu'il y a des données
  if (!server.hasArg("plain")) {
    server.send(400, "application/json", "{\"error\":\"Aucune donnée reçue\"}");
    return;
  }
  
  // Parser le JSON reçu
  String body = server.arg("plain");
  DynamicJsonDocument doc(1024);
  DeserializationError error = deserializeJson(doc, body);
  
  if (error) {
    Serial.print("Erreur de parsing JSON: ");
    Serial.println(error.c_str());
    server.send(400, "application/json", "{\"error\":\"JSON invalide\"}");
    return;
  }
  
  // Mettre à jour les états des relais
  for (int i = 0; i < 4; i++) {
    String relayKey = "relay" + String(i+1);
    if (doc.containsKey(relayKey)) {
      relayStates[i] = doc[relayKey];
      digitalWrite(relayPins[i], relayStates[i] ? HIGH : LOW);
      Serial.print("Relais ");
      Serial.print(i+1);
      Serial.print(" (");
      Serial.print(relayNames[i]);
      Serial.print("): ");
      Serial.println(relayStates[i] ? "ON" : "OFF");
    }
  }
  
  // Mettre à jour l'éclairage
  if (doc.containsKey("lightIntensity")) {
    lightIntensity = doc["lightIntensity"];
    // Ici, vous pourriez contrôler un PWM pour l'éclairage
    Serial.print("Intensité lumière: ");
    Serial.print(lightIntensity);
    Serial.println("%");
  }
  
  if (doc.containsKey("lightPower")) {
    lightPower = doc["lightPower"] == 1;
    Serial.print("Lumière: ");
    Serial.println(lightPower ? "ON" : "OFF");
  }
  
  // Mettre à jour le thermostat (simulation)
  if (doc.containsKey("thermostat")) {
    JsonObject thermostat = doc["thermostat"];
    if (thermostat.containsKey("targetTemp")) {
      targetTemp = thermostat["targetTemp"];
    }
    if (thermostat.containsKey("mode")) {
      acMode = thermostat["mode"];
    }
    if (thermostat.containsKey("power")) {
      acPower = thermostat["power"] == 1;
    }
  }
  
  // Envoyer la réponse
  DynamicJsonDocument response(256);
  response["status"] = "ok";
  response["updated"] = getCurrentTime();
  
  String jsonResponse;
  serializeJson(response, jsonResponse);
  server.send(200, "application/json", jsonResponse);
}

// Vérifier le PIN
void handleVerifyPin() {
  if (!server.hasArg("pin")) {
    server.send(400, "application/json", "{\"error\":\"PIN manquant\"}");
    return;
  }
  
  String receivedPin = server.arg("pin");
  bool isValid = (receivedPin == authPin);
  
  DynamicJsonDocument doc(256);
  doc["valid"] = isValid;
  
  String jsonResponse;
  serializeJson(doc, jsonResponse);
  server.send(200, "application/json", jsonResponse);
}

// Route 404
void handleNotFound() {
  String message = "File Not Found\n\n";
  message += "URI: ";
  message += server.uri();
  message += "\nMethod: ";
  message += (server.method() == HTTP_GET) ? "GET" : "POST";
  message += "\nArguments: ";
  message += server.args();
  message += "\n";
  
  for (uint8_t i = 0; i < server.args(); i++) {
    message += " " + server.argName(i) + ": " + server.arg(i) + "\n";
  }
  
  server.send(404, "text/plain", message);
}

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

// Vérifier l'authentification
bool checkAuthentication() {
  // Vérifier le header Authorization
  if (server.hasHeader("Authorization")) {
    String authHeader = server.header("Authorization");
    // Format attendu: "Bearer <PIN>"
    if (authHeader.startsWith("Bearer ")) {
      String pin = authHeader.substring(7);
      return (pin == authPin);
    }
  }
  
  // Vérifier le paramètre PIN dans l'URL (pour GET)
  if (server.hasArg("pin")) {
    return (server.arg("pin") == authPin);
  }
  
  return false;
}

// Obtenir l'heure actuelle au format HH:MM:SS
String getCurrentTime() {
  // Note: ESP32 n'a pas d'horloge temps réel par défaut
  // Pour une utilisation réelle, ajoutez un module RTC ou utilisez NTP
  
  // Heure simulée (à remplacer par une vraie implémentation)
  unsigned long milliseconds = millis();
  int seconds = (milliseconds / 1000) % 60;
  int minutes = (milliseconds / (1000 * 60)) % 60;
  int hours = (milliseconds / (1000 * 60 * 60)) % 24;
  
  char timeStr[9];
  sprintf(timeStr, "%02d:%02d:%02d", hours, minutes, seconds);
  return String(timeStr);
}

// Afficher un QR code pour la connexion (optionnel)
void printQRCode() {
  Serial.println();
  Serial.println("Scannez ce QR code pour vous connecter:");
  Serial.println("https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" + String("http://") + WiFi.localIP().toString());
  Serial.println();
}

// ============================================
// BOUCLE PRINCIPALE
// ============================================

void loop() {
  server.handleClient();
  
  // Simuler une variation de température (optionnel)
  static unsigned long lastTempUpdate = 0;
  if (millis() - lastTempUpdate > 30000) { // Toutes les 30 secondes
    lastTempUpdate = millis();
    
    // Variation aléatoire de ±0.5°C
    currentTemp += (random(-5, 6) / 10.0);
    
    // Limiter la température
    if (currentTemp < 15.0) currentTemp = 15.0;
    if (currentTemp > 35.0) currentTemp = 35.0;
    
    // Variation de l'humidité
    humidity += random(-2, 3);
    if (humidity < 20) humidity = 20;
    if (humidity > 80) humidity = 80;
    
    Serial.print("Température: ");
    Serial.print(currentTemp);
    Serial.print("°C, Humidité: ");
    Serial.print(humidity);
    Serial.println("%");
  }
  
  // Clignoter la LED intégrée pour indiquer que le système est actif
  static unsigned long lastBlink = 0;
  if (millis() - lastBlink > 1000) {
    lastBlink = millis();
    digitalWrite(LED_BUILTIN, !digitalRead(LED_BUILTIN));
  }
}
```

---

### 📋 Configuration du Code

1. **Modifiez les identifiants WiFi** :
   ```cpp
   const char* ssid = "VOTRE_SSID";
   const char* password = "VOTRE_MOT_DE_PASSE";
   ```

2. **Modifiez le code PIN** (doit correspondre à celui du dashboard) :
   ```cpp
   const char* authPin = "1234";
   ```

3. **Adaptez les broches des relais** selon votre câblage :
   ```cpp
   const int relayPins[] = {23, 22, 21, 19}; // GPIO pour Relais 1-4
   ```

4. **Personnalisez les noms des relais** :
   ```cpp
   const char* relayNames[] = {"Salon", "Chambre 1", "Chambre 2", "Cuisine"};
   ```

---

### 🔌 Configuration du Dashboard

Modifiez `js/app.js` pour pointer vers votre ESP32 :

```javascript
// Dans la fonction checkStatus() et sendState(), remplacez :
if (typeof google !== 'undefined' && google.script && google.script.run) {
  // Code Google Apps Script
} else {
  // Version ESP32 directe
  fetch(`http://${ESP32_IP}/state?pin=${state.userPin}`)
    .then(response => response.json())
    .then(data => updateUIFromServer(data))
    .catch(error => setSystemStatus('disconnected'));
}
```

> Remplacez `ESP32_IP` par l'adresse IP de votre ESP32 (ex: `192.168.1.100`)

---

### 🛠️ Matériel Recommandé

| Composant | Lien | Prix Estimé |
|-----------|------|--------------|
| ESP32-WROOM-32 | [Amazon](https://www.amazon.fr/) | ~10-15€ |
| Module Relais 5V 4 canaux | [Amazon](https://www.amazon.fr/) | ~8-12€ |
| Alimentation 5V 2A | [Amazon](https://www.amazon.fr/) | ~5-8€ |
| Breadboard | [Amazon](https://www.amazon.fr/) | ~5€ |
| Câbles de connexion | [Amazon](https://www.amazon.fr/) | ~3-5€ |

**Total estimé** : ~30-45€

---

### ⚡ Schéma de Connexion Électrique

```
+-------------------+       +-------------------+       +-------------------+
|     ESP32         |       |   Module Relais   |       |    Appareil      |
|                   |       |                   |       |    220V         |
|  5V   ------------>| VCC   |                   |       |                 |
|  GND  ------------>| GND   |                   |       |                 |
|  GPIO 23 -------->| IN1   |                   |       |                 |
|  GPIO 22 -------->| IN2   |----+              |       |                 |
|  GPIO 21 -------->| IN3   |    | COM1 -------->|------->| L1 (Phase)      |
|  GPIO 19 -------->| IN4   |----+              |       |                 |
|                   |       |                   |       |                 |
+-------------------+       +-------------------+       | NO1   |------->| Appareil 1 |
                                                        |       |                 |
                                                        +-------+                 |
                                                                       +-------------------+
```

---

### 🔒 Sécurité Importante

1. **Isolation électrique** :
   - Utilisez **uniquement des modules relais isolés** (opto-isolés)
   - Ne connectez **jamais** directement l'ESP32 au 220V
   - Vérifiez que le module relais supporte la tension de votre installation

2. **Protection du circuit** :
   - Ajoutez un **fusible** sur la ligne 220V
   - Utilisez un **disjoncteur différentiel** 30mA
   - Considérez un **boîtier isolant** pour l'ESP32 et les relais

3. **Sécurité réseau** :
   - Changez le **code PIN par défaut**
   - Utilisez un **réseau WiFi sécurisé** (WPA2/WPA3)
   - Considérez l'utilisation de **HTTPS** (avec un certificat)
   - Limitez l'accès à votre **réseau local**

4. **Mises à jour** :
   - Gardez le **firmware ESP32 à jour**
   - Vérifiez régulièrement les **connexions physiques**

---

### 📊 Dépannage ESP32

#### Problème : L'ESP32 ne se connecte pas au WiFi

**Solutions** :
1. Vérifiez que le **SSID et le mot de passe** sont corrects
2. Assurez-vous que le **réseau WiFi est accessible** (pas de filtre MAC)
3. Vérifiez que l'ESP32 est **à portée** du routeur
4. Essayez avec un **autre réseau WiFi** (ex: hotspot mobile)
5. Vérifiez les **messages série** pour des indices

**Code de test WiFi** :
```cpp
#include <WiFi.h>

void setup() {
  Serial.begin(115200);
  WiFi.begin("SSID", "PASSWORD");
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println();
  Serial.println("WiFi connecté !");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}

void loop() {}
```

#### Problème : Les relais ne commutent pas

**Solutions** :
1. Vérifiez que les **broches GPIO** sont correctement configurées
2. Assurez-vous que le **module relais est alimenté** (5V et GND)
3. Vérifiez que les **connexions IN1-IN4** sont correctes
4. Testez avec un **programme simple** :
   ```cpp
   void setup() {
     pinMode(23, OUTPUT);
   }
   
   void loop() {
     digitalWrite(23, HIGH);
     delay(1000);
     digitalWrite(23, LOW);
     delay(1000);
   }
   ```
5. Vérifiez que le **module relais n'est pas défectueux**

#### Problème : Le serveur ne répond pas

**Solutions** :
1. Vérifiez que l'**IP est correcte** dans le dashboard
2. Assurez-vous que le **pare-feu** n'a pas bloqué le port 80
3. Vérifiez que l'**ESP32 est connecté au réseau**
4. Testez avec un **navigateur** : `http://[IP_ESP32]/state?pin=1234`
5. Vérifiez les **messages série** pour des erreurs

#### Problème : Erreur de parsing JSON

**Solutions** :
1. Vérifiez que vous avez installé **ArduinoJSON**
2. Assurez-vous que le **JSON envoyé** est valide
3. Vérifiez la **taille du buffer** (1024 octets dans l'exemple)
4. Utilisez un **validateur JSON** en ligne pour tester vos données

---

### 📈 Améliorations Possibles

#### 1. Ajouter un capteur de température

**Matériel** : DS18B20 (1-Wire) ou DHT22

**Code** :
```cpp
#include <OneWire.h>
#include <DallasTemperature.h>

#define ONE_WIRE_BUS 4 // GPIO pour le capteur

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

void setup() {
  sensors.begin();
}

void loop() {
  sensors.requestTemperatures();
  currentTemp = sensors.getTempCByIndex(0);
  // ...
}
```

#### 2. Ajouter un capteur d'humidité

**Matériel** : DHT22 ou SHT31

**Code** :
```cpp
#include <DHT.h>

#define DHTPIN 5
#define DHTTYPE DHT22

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  dht.begin();
}

void loop() {
  humidity = dht.readHumidity();
  // ...
}
```

#### 3. Contrôle PWM pour l'éclairage

**Matériel** : Module dimmer AC ou LED PWM

**Code** :
```cpp
const int lightPin = 25; // Broche PWM

void setup() {
  ledcSetup(0, 5000, 8); // Canal 0, 5kHz, 8 bits
  ledcAttachPin(lightPin, 0);
}

void setLightIntensity(int intensity) {
  ledcWrite(0, map(intensity, 0, 100, 0, 255));
}
```

#### 4. Ajouter OTA (Over-The-Air) Updates

**Bibliothèque** : ArduinoOTA

**Code** :
```cpp
#include <ArduinoOTA.h>

void setup() {
  ArduinoOTA.setHostname("esp32-smart-home");
  ArduinoOTA.setPassword("ota_password");
  ArduinoOTA.begin();
}

void loop() {
  ArduinoOTA.handle();
}
```

#### 5. Utiliser MQTT au lieu de HTTP

**Bibliothèque** : PubSubClient

**Avantages** :
- Communication bidirectionnelle en temps réel
- Moins de latence
- Meilleure scalabilité

---

## 🌐 Backend (Google Apps Script)

Si vous préférez utiliser **Google Apps Script** au lieu d'un ESP32 direct :

### Code pour `Code.gs`

```javascript
// Stockage des états
var states = {
  '1234': { // PIN: 1234
    relay1: 0,
    relay2: 0,
    relay3: 0,
    relay4: 0,
    lightIntensity: 80,
    lightPower: 1,
    thermostat: {
      power: 1,
      currentTemp: 23,
      targetTemp: 20,
      mode: 'cool',
      timer: 2,
      humidity: 36
    }
  }
};

// Vérifier le PIN
function verifyPin(pin) {
  return states.hasOwnProperty(pin);
}

// Récupérer l'état
function getStateForHtml(pin) {
  if (!states.hasOwnProperty(pin)) {
    return {error: "PIN invalide"};
  }
  
  var state = states[pin];
  state.updated = new Date().toLocaleTimeString('fr-FR');
  return state;
}

// Mettre à jour l'état
function setStateFromHtml(r1, r2, r3, r4, lightIntensity, lightPower, pin) {
  if (!states.hasOwnProperty(pin)) {
    return {error: "PIN invalide"};
  }
  
  states[pin] = {
    relay1: r1,
    relay2: r2,
    relay3: r3,
    relay4: r4,
    lightIntensity: lightIntensity,
    lightPower: lightPower,
    thermostat: states[pin].thermostat || {
      power: 1,
      currentTemp: 23,
      targetTemp: 20,
      mode: 'cool',
      timer: 2,
      humidity: 36
    }
  };
  
  return {status: "ok", updated: new Date().toLocaleTimeString('fr-FR')};
}
```

### Déploiement

1. Créez un nouveau projet sur [script.google.com](https://script.google.com/)
2. Copiez le code ci-dessus dans `Code.gs`
3. **Publiez** comme application Web :
   - Cliquez sur **Publier** > **Déployer comme application Web**
   - Sélectionnez **Exécuter comme** : "Moi"
   - Sélectionnez **Accès** : "Toute personne, même anonyme"
   - Cliquez sur **Déployer**
4. Copiez l'**URL de l'application Web**
5. Utilisez cette URL dans votre navigateur pour accéder au dashboard

---

## 📡 API (pour intégration backend)

### Récupérer l'état

**Requête** : `GET /state?pin=[VOTRE_PIN]`

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

**Headers** :
```
Content-Type: application/json
Authorization: Bearer [VOTRE_PIN]
```

**Corps** :
```json
{
  "relay1": 1,
  "relay2": 0,
  "relay3": 1,
  "relay4": 0,
  "lightIntensity": 75,
  "lightPower": 1,
  "thermostat": {
    "targetTemp": 22,
    "mode": "cool"
  }
}
```

**Réponse** :
```json
{
  "status": "ok",
  "updated": "14:30:45"
}
```

### Vérifier le PIN

**Requête** : `GET /verify-pin?pin=[VOTRE_PIN]`

**Réponse** :
```json
{
  "valid": true
}
```

---

## 🎨 Personnalisation

### Modifier le code PIN

Dans `js/app.js` :
```javascript
const CONFIG = {
  DEFAULT_PIN: '1234',  // Changez cette valeur
  // ...
};
```

### Personnaliser les relais

Dans `index.html` :
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

### Personnaliser les couleurs

Dans `css/styles.css` :
```css
:root {
  --bg-main: #0b0d12;
  --accent-orange: #ff6b35;
  --accent-blue: #00d2ff;
  /* ... */
}
```

---

## 📜 Bonnes pratiques

### 🔒 Sécurité

1. **Changez le code PIN par défaut**
2. **Utilisez HTTPS** pour les connexions (surtout en production)
3. **Implémentez une authentification côté serveur** robuste
4. **Limitez l'accès** à votre réseau local
5. **Mettez à jour régulièrement** le firmware de l'ESP32
6. **Utilisez des mots de passe forts** pour le WiFi

### ⚡ Performance

1. **Limitez la fréquence de synchronisation** (4-5 secondes est un bon compromis)
2. **Utilisez des WebSockets** pour les mises à jour en temps réel
3. **Minifiez le CSS et JavaScript** pour la production
4. **Optimisez les images** (utilisez des SVG quand possible)
5. **Évitez les requêtes inutiles** au serveur

### ♿ Accessibilité

1. **Utilisez un clavier** pour naviguer dans l'interface
2. **Vérifiez les contrastes de couleurs** (outils : [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/))
3. **Ajoutez des descriptions** pour les icônes (`aria-label`)
4. **Testez avec des lecteurs d'écran** (NVDA, VoiceOver)
5. **Assurez-vous que tous les éléments interactifs** sont accessibles au clavier

---

## 🐛 Dépannage

### Le dashboard ne se connecte pas

- ✅ Vérifiez que vous utilisez le **bon code PIN**
- ✅ Assurez-vous que le **serveur backend est en cours d'exécution**
- ✅ Vérifiez la **console du navigateur** pour les erreurs (F12)
- ✅ Vérifiez que l'**URL du serveur** est correcte
- ✅ Assurez-vous que le **réseau permet les connexions** (pas de blocage CORS)

### Les relais ne répondent pas

- ✅ Vérifiez la **connexion WiFi** de votre ESP32
- ✅ Assurez-vous que les **broches sont correctement configurées**
- ✅ Testez avec un **programme simple** pour vérifier le matériel
- ✅ Vérifiez que le **module relais est alimenté** (5V et GND)
- ✅ Assurez-vous que les **connexions sont solides**

### L'interface est lente

- ✅ Réduisez **l'intervalle de synchronisation**
- ✅ Utilisez des **images optimisées** (SVG, WebP)
- ✅ Minifiez le **CSS et JavaScript**
- ✅ Vérifiez votre **connexion Internet**
- ✅ Utilisez un **serveur plus puissant** si nécessaire

### Erreur "JSON invalide"

- ✅ Vérifiez que le **JSON envoyé** est valide (utilisez [JSONLint](https://jsonlint.com/))
- ✅ Assurez-vous que les **clés sont entre guillemets**
- ✅ Vérifiez que les **valeurs sont du bon type** (nombre, chaîne, booléen)
- ✅ Augmentez la **taille du buffer JSON** dans le code ESP32

---

## 📚 Ressources Utiles

### Documentation

- [ESP32 Arduino Core Documentation](https://docs.espressif.com/projects/arduino-esp32/en/latest/)
- [ArduinoJSON Documentation](https://arduinojson.org/)
- [WiFi Library for ESP32](https://www.arduino.cc/en/Reference/WiFi)
- [WebServer Library for ESP32](https://www.arduino.cc/en/Reference/WebServer)

### Tutoriels

- [ESP32 Web Server Tutorial](https://randomnerdtutorials.com/esp32-web-server-arduino-ide/)
- [ESP32 Relay Control](https://randomnerdtutorials.com/esp32-control-relay-arduino/)
- [ESP32 WiFi Station Mode](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/network/esp_wifi.html)
- [Google Apps Script Web App](https://developers.google.com/apps-script/guides/web)

### Outils

- [PlatformIO](https://platformio.org/) - IDE avancé pour ESP32
- [Arduino IDE](https://www.arduino.cc/en/software) - IDE officiel
- [Postman](https://www.postman.com/) - Pour tester les API
- [JSONLint](https://jsonlint.com/) - Valider le JSON
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) - Vérifier l'accessibilité

---

## 📜 Licence

Ce projet est sous **licence MIT**. Vous êtes libre de l'utiliser, le modifier et le distribuer, à condition de conserver la notice de copyright et la licence.

```
MIT License

Copyright (c) 2024 Smart Home Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Remerciements

- **[Inter Font](https://rsms.me/inter/)** - Police utilisée dans le projet
- **[Feather Icons](https://feathericons.com/)** - Inspiration pour les icônes SVG
- **[Google Apps Script](https://script.google.com/)** - Pour le backend optionnel
- **[Arduino](https://www.arduino.cc/)** - Plateforme de développement
- **[Espressif](https://www.espressif.com/)** - Fabricant de l'ESP32
- **[Random Nerd Tutorials](https://randomnerdtutorials.com/)** - Excellents tutoriels ESP32

---

<p align="center">
  <strong>Version</strong> : 2.0.0<br>
  <strong>Auteur</strong> : Smart Home Team<br>
  <strong>Dernière mise à jour</strong> : Juillet 2024<br>
  <strong>Compatibilité ESP32</strong> : ✅ Testé avec ESP32-WROOM-32
</p>
