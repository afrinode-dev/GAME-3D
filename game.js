// ============================================
// RPG GABONAIS 3D FPS - GAME.JS (248KB)
// Version complète fusionnée avec CoffeeScript
// ============================================

(function() {
    "use strict";
    
    // Détection de l'environnement
    if (typeof window === 'undefined') {
        console.error("Ce jeu doit être exécuté dans un navigateur");
        return;
    }
    
    // Vérifier WebGL
    var Detector = {
        webgl: !!window.WebGLRenderingContext,
        addGetWebGLMessage: function() {
            alert("Votre navigateur ne supporte pas WebGL. Ce jeu nécessite WebGL pour fonctionner.");
        }
    };
    
    // Objet global du jeu
    window.Game = {
        // ============================================
        // CONSTANTES
        // ============================================
        SPRITE_NONE: 0,
        SPRITE_PLAYER: 1,
        SPRITE_TILES: 2,
        SPRITE_ENEMY: 4,
        SPRITE_BULLET: 8,
        SPRITE_ITEM: 16,
        SPRITE_NPC: 32,
        SPRITE_3D_OBJECT: 64,
        SPRITE_ALL: 0xFFFF,
        
        // ============================================
        // ÉTAT DU JEU
        // ============================================
        state: {
            health: 100,
            maxHealth: 100,
            armor: 50,
            maxArmor: 50,
            xp: 0,
            xpToNext: 100,
            level: 1,
            score: 0,
            kills: 0,
            money: 0,
            ammo: 30,
            maxAmmo: 30,
            currentWeapon: 0,
            questProgress: 0,
            questTarget: 5,
            activeQuest: null,
            enemiesRemaining: 5,
            currentLevel: 1,
            lives: 3,
            hasKey: false,
            speed: 0.15,
            day: 1,
            time: 8.0, // 8:00 AM
            weight: 0,
            maxWeight: 100
        },
        
        // ============================================
        // DONNÉES DU JEU
        // ============================================
        cities: [
            {
                name: "Libreville",
                districts: ["Glass", "Nombakélé", "Lalala", "Akébé", "Mont-Bouët"],
                environment: "urban",
                color: 0x009e60,
                music: "music-libreville",
                ambient: "urban",
                description: "La capitale du Gabon, moderne et dynamique"
            },
            {
                name: "Port-Gentil",
                districts: ["Grand Village", "Beau Séjour", "Lowé"],
                environment: "coastal",
                color: 0x3a75c4,
                music: "music-portgentil",
                ambient: "coastal",
                description: "La capitale économique, au bord de l'océan"
            },
            {
                name: "Franceville",
                districts: ["Mvouli", "Mikolongo", "Okoloville"],
                environment: "jungle",
                color: 0x228B22,
                music: "music-franceville",
                ambient: "jungle",
                description: "Au cœur de la forêt équatoriale"
            }
        ],
        
        npcs: [
            { 
                name: "Maman Régine", 
                dialogue: "Eh mon fils! Bienvenue au quartier Glass! Fais attention aux bandits ici.", 
                quest: "Élimine 5 bandits pour sécuriser le quartier Glass.",
                reward: "100 XP + Clé du marché + 500 FCFA",
                type: "civilian"
            },
            { 
                name: "Papa Joseph", 
                dialogue: "Fais attention oh! Les bandits volent nos marchandises depuis une semaine.", 
                quest: "Ramasse 3 kits de soin pour aider les blessés.",
                reward: "Kit de soin amélioré + Armure +50",
                type: "merchant"
            },
            { 
                name: "Tata Odile", 
                dialogue: "Tu as faim? J'ai du bon ndolé et du manioc! Mais les bandits ont pris mes provisions...", 
                quest: "Trouve 5 noix de coco pour préparer le repas communautaire.",
                reward: "Nourriture permanente +20 santé max",
                type: "civilian"
            },
            { 
                name: "Oncle Alain", 
                dialogue: "Cette ville devient dangereuse mon gars! Protège-nous s'il te plaît.", 
                quest: "Protège le marché contre 7 pillards.",
                reward: "Fusil d'assaut + 50 munitions",
                type: "soldier"
            },
            { 
                name: "Frère Marcel", 
                dialogue: "Tu cherches quelque chose? Je peux t'aider! Mais d'abord, aide-moi...", 
                quest: "Livraison de médicaments au village voisin.",
                reward: "Accès au quartier Nombakélé + 1000 FCFA",
                type: "priest"
            }
        ],
        
        weapons: [
            { 
                name: "Pistolet Makarov", 
                damage: 15, 
                ammo: 30, 
                maxAmmo: 30, 
                fireRate: 300,
                accuracy: 0.9,
                icon: "🔫",
                sound: "sfx-shoot",
                type: "pistol",
                price: 500,
                unlockLevel: 1
            },
            { 
                name: "Fusil AK-47", 
                damage: 30, 
                ammo: 15, 
                maxAmmo: 15, 
                fireRate: 500,
                accuracy: 0.8,
                icon: "🔫",
                sound: "sfx-shoot",
                type: "rifle",
                price: 1500,
                unlockLevel: 3
            },
            { 
                name: "Mitraillette Uzi", 
                damage: 10, 
                ammo: 50, 
                maxAmmo: 50, 
                fireRate: 150,
                accuracy: 0.7,
                icon: "🔫",
                sound: "sfx-shoot",
                type: "smg",
                price: 1000,
                unlockLevel: 2
            },
            { 
                name: "Fusil à pompe", 
                damage: 40, 
                ammo: 8, 
                maxAmmo: 8, 
                fireRate: 800,
                accuracy: 0.6,
                icon: "🔫",
                sound: "sfx-shoot",
                type: "shotgun",
                price: 2000,
                unlockLevel: 5
            }
        ],
        
        enemies: [
            {
                type: "Bandit",
                health: 50,
                damage: 10,
                speed: 2.5,
                color: 0x8B0000,
                points: 100,
                money: 50,
                drops: ["ammo", "health", "money"],
                model: "bandit",
                aggression: 0.8
            },
            {
                type: "Boss",
                health: 200,
                damage: 25,
                speed: 1.8,
                color: 0x4B0000,
                points: 500,
                money: 500,
                drops: ["special", "weapon", "armor"],
                model: "boss",
                aggression: 1.0
            },
            {
                type: "Sniper",
                health: 30,
                damage: 40,
                speed: 1.2,
                color: 0x696969,
                points: 200,
                money: 100,
                drops: ["ammo", "ammo", "special"],
                model: "sniper",
                aggression: 0.6
            },
            {
                type: "Gangster",
                health: 75,
                damage: 15,
                speed: 2.2,
                color: 0x800080,
                points: 150,
                money: 75,
                drops: ["ammo", "money", "health"],
                model: "gangster",
                aggression: 0.9
            }
        ],
        
        items: [
            {
                name: "Kit de soin",
                type: "health",
                value: 25,
                icon: "❤️",
                weight: 1,
                price: 100,
                description: "Restaure 25 points de santé"
            },
            {
                name: "Boîte de munitions",
                type: "ammo",
                value: 30,
                icon: "📦",
                weight: 2,
                price: 50,
                description: "30 munitions supplémentaires"
            },
            {
                name: "Clé en or",
                type: "key",
                value: 1,
                icon: "🗝️",
                weight: 0.5,
                price: 500,
                description: "Ouvre les portes spéciales"
            },
            {
                name: "Potion de force",
                type: "special",
                value: 50,
                icon: "🧪",
                weight: 1,
                price: 200,
                description: "Augmente les dégâts temporairement"
            },
            {
                name: "Pièces d'or",
                type: "money",
                value: 100,
                icon: "💰",
                weight: 0.1,
                price: 0,
                description: "100 FCFA"
            },
            {
                name: "Veste pare-balles",
                type: "armor",
                value: 25,
                icon: "🛡️",
                weight: 5,
                price: 300,
                description: "+25 points d'armure"
            }
        ],
        
        // ============================================
        // VARIABLES DU MOTEUR 3D
        // ============================================
        threeScene: null,
        threeCamera: null,
        threeRenderer: null,
        playerModel: null,
        enemyModels: [],
        npcModels: [],
        buildingModels: [],
        treeModels: [],
        pickupModels: [],
        bulletModels: [],
        particleSystems: [],
        lights: [],
        
        // ============================================
        // CONTRÔLES ET INTERACTION
        // ============================================
        keys: {},
        mouse: { x: 0, y: 0, dx: 0, dy: 0 },
        joystickVector: { x: 0, y: 0 },
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent),
        joystickActive: false,
        mouseSensitivity: 5,
        
        // ============================================
        // PHYSIQUE ET MOUVEMENT
        // ============================================
        velocity: null,
        isOnGround: true,
        gravity: 0.03,
        jumpForce: 0.18,
        moveSpeed: 0.15,
        sprintSpeed: 0.25,
        isSprinting: false,
        cameraBob: 0,
        cameraBobSpeed: 0.1,
        cameraBobAmount: 0.05,
        
        // ============================================
        // AUDIO ET MUSIQUE
        // ============================================
        audioManager: null,
        currentMusic: null,
        volume: 0.7,
        muted: false,
        sounds: {},
        
        // ============================================
        // ÉTAT DU JEU
        // ============================================
        gameStarted: false,
        gamePaused: false,
        gameTime: 0,
        currentCity: 0,
        currentDistrict: 0,
        playerInventory: [],
        activeQuests: [],
        completedQuests: [],
        flashlight: false,
        flashlightLight: null,
        stats: null,
        loadingProgress: 0,
        totalAssets: 50,
        loadedAssets: 0,
        
        // ============================================
        // SYSTÈMES
        // ============================================
        questSystem: null,
        combatSystem: null,
        inventorySystem: null,
        saveSystem: null,
        weatherSystem: null,
        timeSystem: null,
        
        // ============================================
        // INITIALISATION
        // ============================================
        init: function() {
            console.log("🇬🇦 Initialisation du RPG Gabonais 3D...");
            
            // Vérifier WebGL
            if (!Detector.webgl) {
                Detector.addGetWebGLMessage();
                return;
            }
            
            this.initGlobalHelpers();
            this.initUIEvents();
            this.prepareAssets();
            this.initAudioManager();
            this.init3DEngine();
            this.initGameSystems();
            
            // Démarrer le chargement
            this.startLoading();
        },
        
        // ============================================
        // HELPERS GLOBAUX
        // ============================================
        initGlobalHelpers: function() {
            // Helper pour les positions
            this.tilePos = function(col, row, otherParams) {
                var tileSize = 70;
                var position = {
                    x: col * tileSize + tileSize/2,
                    y: row * tileSize + tileSize/2
                };
                return Object.assign(position, otherParams || {});
            };
            
            // Interpolation linéaire
            this.lerp = function(a, b, t) {
                return a + (b - a) * Math.min(1, Math.max(0, t));
            };
            
            // Clamp
            this.clamp = function(value, min, max) {
                return Math.min(max, Math.max(min, value));
            };
            
            // Distance entre deux points 3D
            this.distance3D = function(p1, p2) {
                var dx = p2.x - p1.x;
                var dy = p2.y - p1.y;
                var dz = p2.z - p1.z;
                return Math.sqrt(dx*dx + dy*dy + dz*dz);
            };
            
            // Formatage du temps
            this.formatTime = function(seconds) {
                var hours = Math.floor(seconds / 3600);
                var minutes = Math.floor((seconds % 3600) / 60);
                var secs = Math.floor(seconds % 60);
                
                if (hours > 0) {
                    return hours + "h " + minutes.toString().padStart(2, '0') + "m " + secs.toString().padStart(2, '0') + "s";
                } else if (minutes > 0) {
                    return minutes + "m " + secs.toString().padStart(2, '0') + "s";
                } else {
                    return secs + "s";
                }
            };
            
            // Formatage de l'argent
            this.formatMoney = function(amount) {
                return amount.toLocaleString('fr-FR') + " FCFA";
            };
            
            // Statistiques FPS
            if (typeof Stats !== 'undefined') {
                this.stats = new Stats();
                this.stats.showPanel(0);
                document.body.appendChild(this.stats.dom);
                this.stats.dom.style.position = 'absolute';
                this.stats.dom.style.top = '0';
                this.stats.dom.style.left = '0';
                this.stats.dom.style.zIndex = '1000';
                this.stats.dom.style.display = 'none'; // Caché par défaut
            }
        },
        
        // ============================================
        // ÉVÉNEMENTS UI
        // ============================================
        initUIEvents: function() {
            var self = this;
            
            // Boutons principaux
            document.getElementById('start-btn')?.addEventListener('click', function() {
                self.playSound('click');
                self.stageLevel(1);
            });
            
            document.getElementById('continue-btn')?.addEventListener('click', function() {
                self.playSound('click');
                if (self.saveSystem && self.saveSystem.load()) {
                    self.stageLevel(self.state.currentLevel);
                } else {
                    self.showMessage("Aucune sauvegarde trouvée", 2000);
                    self.stageLevel(1);
                }
            });
            
            document.getElementById('controls-btn')?.addEventListener('click', function() {
                self.playSound('click');
                self.showMessage(
                    "🎮 CONTRÔLES COMPLETS:\n\n" +
                    "Z/W = Avancer\n" +
                    "S = Reculer\n" +
                    "Q/A = Gauche\n" +
                    "D = Droite\n" +
                    "ESPACE = Sauter\n" +
                    "SHIFT = Sprint\n" +
                    "CLIC GAUCHE = Tirer\n" +
                    "CLIC DROIT = Viseur\n" +
                    "E = Interagir\n" +
                    "F = Lampe torche\n" +
                    "I = Inventaire\n" +
                    "TAB = Carte\n" +
                    "ECHAP = Pause\n" +
                    "1-4 = Changer d'arme\n" +
                    "R = Recharger\n" +
                    "C = S'accroupir",
                    7000
                );
            });
            
            document.getElementById('settings-btn')?.addEventListener('click', function() {
                self.playSound('click');
                self.showSettings();
            });
            
            // Boutons pause
            document.getElementById('resume-btn')?.addEventListener('click', function() {
                self.playSound('click');
                self.togglePause();
            });
            
            document.getElementById('save-btn')?.addEventListener('click', function() {
                self.playSound('click');
                self.saveGame();
            });
            
            document.getElementById('quit-btn')?.addEventListener('click', function() {
                self.playSound('click');
                if (confirm("Quitter vers le menu principal?")) {
                    self.saveGame();
                    self.stageStartScreen();
                }
            });
            
            document.getElementById('settings-menu-btn')?.addEventListener('click', function() {
                self.playSound('click');
                self.showSettings();
            });
            
            // Boutons inventaire
            document.getElementById('close-inventory')?.addEventListener('click', function() {
                self.playSound('click');
                self.toggleInventory();
            });
            
            document.getElementById('sort-inventory')?.addEventListener('click', function() {
                self.playSound('click');
                self.sortInventory();
            });
            
            // Boutons réglages
            document.getElementById('settings-back')?.addEventListener('click', function() {
                self.playSound('click');
                self.hideSettings();
            });
            
            document.getElementById('settings-apply')?.addEventListener('click', function() {
                self.playSound('click');
                self.applySettings();
            });
            
            document.getElementById('settings-default')?.addEventListener('click', function() {
                self.playSound('click');
                self.resetSettings();
            });
            
            document.getElementById('settings-close')?.addEventListener('click', function() {
                self.playSound('click');
                self.hideSettings();
            });
            
            // Sliders
            document.getElementById('volume-slider')?.addEventListener('input', function(e) {
                var value = e.target.value;
                document.getElementById('settings-volume-text').textContent = value + "%";
                document.getElementById('volume-text').textContent = value + "%";
                self.setVolume(value / 100);
            });
            
            document.getElementById('mouse-sensitivity')?.addEventListener('input', function(e) {
                self.mouseSensitivity = e.target.value;
            });
            
            document.getElementById('graphics-quality')?.addEventListener('change', function(e) {
                self.applyGraphicsQuality(e.target.value);
            });
            
            // Message OK
            document.getElementById('message-ok')?.addEventListener('click', function() {
                document.getElementById('message-box').style.display = 'none';
                self.playSound('click');
            });
        },
        
        // ============================================
        // CHARGEMENT DES ASSETS
        // ============================================
        startLoading: function() {
            var self = this;
            var loadingText = document.getElementById('loading-text');
            var loaderBar = document.getElementById('loader-bar');
            
            var loadSteps = [
                { text: "Initialisation du moteur 3D...", progress: 10 },
                { text: "Chargement des textures...", progress: 25 },
                { text: "Chargement des modèles...", progress: 40 },
                { text: "Chargement des sons...", progress: 60 },
                { text: "Initialisation des systèmes...", progress: 80 },
                { text: "Préparation de l'environnement...", progress: 95 },
                { text: "Lancement du jeu...", progress: 100 }
            ];
            
            var currentStep = 0;
            
            function nextStep() {
                if (currentStep < loadSteps.length) {
                    var step = loadSteps[currentStep];
                    loadingText.textContent = step.text;
                    loaderBar.style.width = step.progress + "%";
                    
                    setTimeout(function() {
                        currentStep++;
                        nextStep();
                    }, 300 + Math.random() * 200);
                } else {
                    self.finishLoading();
                }
            }
            
            // Simuler le chargement
            setTimeout(nextStep, 500);
        },
        
        finishLoading: function() {
            document.getElementById('loading-screen').style.display = 'none';
            document.getElementById('start-screen').style.display = 'flex';
            this.playMusic('music-main');
            console.log("✅ Chargement terminé");
        },
        
        prepareAssets: function() {
            this.assets = {
                tileSize: 70,
                models: {
                    player: "models/player.glb",
                    bandit: "models/bandit.glb",
                    civilian: "models/civilian.glb",
                    building1: "models/building1.glb",
                    tree1: "models/tree1.glb"
                },
                textures: {
                    ground: "textures/ground.jpg",
                    wall: "textures/wall.jpg",
                    roof: "textures/roof.jpg"
                }
            };
        },
        
        // ============================================
        // MOTEUR 3D
        // ============================================
        init3DEngine: function() {
            try {
                // Initialiser Three.js
                this.threeScene = new THREE.Scene();
                this.threeScene.fog = new THREE.Fog(0x87CEEB, 50, 500);
                
                // Caméra
                this.threeCamera = new THREE.PerspectiveCamera(
                    75, 
                    window.innerWidth / window.innerHeight, 
                    0.1, 
                    2000
                );
                this.threeCamera.position.set(0, 10, 15);
                
                // Rendu
                var canvas = document.getElementById('game-canvas');
                this.threeRenderer = new THREE.WebGLRenderer({
                    canvas: canvas,
                    antialias: true,
                    alpha: true,
                    powerPreference: "high-performance"
                });
                
                this.threeRenderer.setSize(window.innerWidth, window.innerHeight);
                this.threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                this.threeRenderer.shadowMap.enabled = true;
                this.threeRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
                this.threeRenderer.outputEncoding = THREE.sRGBEncoding;
                this.threeRenderer.toneMapping = THREE.ACESFilmicToneMapping;
                this.threeRenderer.toneMappingExposure = 1.0;
                
                // Initialiser la physique
                this.velocity = new THREE.Vector3(0, 0, 0);
                
                // Créer l'environnement de base
                this.createAdvancedEnvironment();
                
                // Configurer les contrôles
                this.initAdvancedControls();
                
                console.log("✅ Moteur 3D initialisé avec succès");
            } catch (e) {
                console.error("Erreur d'initialisation 3D:", e);
                this.showMessage("Erreur d'initialisation 3D. Vérifiez la compatibilité WebGL.", 0);
            }
        },
        
        createAdvancedEnvironment: function() {
            // Lumière ambiante améliorée
            var ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
            this.threeScene.add(ambientLight);
            this.lights.push(ambientLight);
            
            // Soleil dynamique
            this.sun = new THREE.DirectionalLight(0xffd700, 1.5);
            this.sun.position.set(100, 150, 100);
            this.sun.castShadow = true;
            this.sun.shadow.mapSize.width = 4096;
            this.sun.shadow.mapSize.height = 4096;
            this.sun.shadow.camera.near = 0.5;
            this.sun.shadow.camera.far = 800;
            this.sun.shadow.camera.left = -200;
            this.sun.shadow.camera.right = 200;
            this.sun.shadow.camera.top = 200;
            this.sun.shadow.camera.bottom = -200;
            this.threeScene.add(this.sun);
            this.lights.push(this.sun);
            
            // Lumière de remplissage
            var fillLight = new THREE.DirectionalLight(0x87CEEB, 0.4);
            fillLight.position.set(-100, 100, -100);
            this.threeScene.add(fillLight);
            this.lights.push(fillLight);
            
            // Lumière hémisphérique pour ambiance
            var hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x006400, 0.3);
            this.threeScene.add(hemisphereLight);
            this.lights.push(hemisphereLight);
            
            // Ciel avancé
            var skyGeometry = new THREE.SphereGeometry(1000, 64, 64);
            var skyMaterial = new THREE.MeshBasicMaterial({
                color: 0x87CEEB,
                side: THREE.BackSide,
                fog: false
            });
            this.skybox = new THREE.Mesh(skyGeometry, skyMaterial);
            this.threeScene.add(this.skybox);
            
            // Sol avancé avec textures
            var groundGeometry = new THREE.PlaneGeometry(1000, 1000, 100, 100);
            
            // Créer un matériau avec dégradé
            var canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 512;
            var ctx = canvas.getContext('2d');
            
            // Dégradé pour le sol
            var gradient = ctx.createLinearGradient(0, 0, 512, 512);
            gradient.addColorStop(0, '#8B4513');
            gradient.addColorStop(0.5, '#DEB887');
            gradient.addColorStop(1, '#A0522D');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 512, 512);
            
            // Ajouter du bruit pour texture
            for (var i = 0; i < 10000; i++) {
                var x = Math.random() * 512;
                var y = Math.random() * 512;
                ctx.fillStyle = 'rgba(0,0,0,' + (Math.random() * 0.1) + ')';
                ctx.fillRect(x, y, 1, 1);
            }
            
            var texture = new THREE.CanvasTexture(canvas);
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(20, 20);
            
            var groundMaterial = new THREE.MeshStandardMaterial({
                map: texture,
                roughness: 0.9,
                metalness: 0.1
            });
            
            this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
            this.ground.rotation.x = -Math.PI / 2;
            this.ground.receiveShadow = true;
            this.threeScene.add(this.ground);
            
            // Ajouter des rochers et détails
            this.createEnvironmentDetails();
            
            console.log("✅ Environnement avancé créé");
        },
        
        createEnvironmentDetails: function() {
            // Créer quelques rochers
            var rockGeometry = new THREE.DodecahedronGeometry(3, 0);
            var rockMaterial = new THREE.MeshStandardMaterial({
                color: 0x888888,
                roughness: 0.8,
                metalness: 0.2
            });
            
            for (var i = 0; i < 20; i++) {
                var rock = new THREE.Mesh(rockGeometry, rockMaterial);
                rock.position.set(
                    (Math.random() - 0.5) * 800,
                    1.5,
                    (Math.random() - 0.5) * 800
                );
                rock.scale.set(
                    Math.random() * 2 + 0.5,
                    Math.random() * 2 + 0.5,
                    Math.random() * 2 + 0.5
                );
                rock.rotation.set(
                    Math.random() * Math.PI,
                    Math.random() * Math.PI,
                    Math.random() * Math.PI
                );
                rock.castShadow = true;
                rock.receiveShadow = true;
                this.threeScene.add(rock);
            }
            
            // Créer de l'herbe
            var grassGeometry = new THREE.ConeGeometry(0.5, 2, 8);
            var grassMaterial = new THREE.MeshStandardMaterial({
                color: 0x32CD32,
                roughness: 0.9
            });
            
            for (var j = 0; j < 100; j++) {
                var grass = new THREE.Mesh(grassGeometry, grassMaterial);
                grass.position.set(
                    (Math.random() - 0.5) * 900,
                    1,
                    (Math.random() - 0.5) * 900
                );
                grass.rotation.x = Math.random() * 0.2;
                grass.rotation.z = Math.random() * 0.2;
                this.threeScene.add(grass);
            }
        },
        
        // ============================================
        // CONTRÔLES AVANCÉS
        // ============================================
        initAdvancedControls: function() {
            var self = this;
            
            // Événements clavier avancés
            document.addEventListener('keydown', function(e) {
                var key = e.key.toLowerCase();
                self.keys[key] = true;
                
                // Empêcher le comportement par défaut pour certaines touches
                if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
                    e.preventDefault();
                }
                
                switch (key) {
                    case ' ':
                        if (self.isOnGround && self.gameStarted && !self.gamePaused) {
                            self.playerJump();
                        }
                        break;
                    case 'e':
                        if (self.gameStarted && !self.gamePaused) {
                            self.playerInteract();
                        }
                        break;
                    case 'i':
                        if (self.gameStarted && !self.gamePaused) {
                            self.toggleInventory();
                        }
                        break;
                    case 'f':
                        if (self.gameStarted && !self.gamePaused) {
                            self.toggleFlashlight();
                        }
                        break;
                    case 'escape':
                        if (self.gameStarted) {
                            self.togglePause();
                        }
                        break;
                    case 'tab':
                        if (self.gameStarted && !self.gamePaused) {
                            self.toggleMinimap();
                        }
                        break;
                    case 'shift':
                        self.isSprinting = true;
                        break;
                    case 'r':
                        if (self.gameStarted && !self.gamePaused) {
                            self.reloadWeapon();
                        }
                        break;
                    case 'c':
                        if (self.gameStarted && !self.gamePaused) {
                            self.toggleCrouch();
                        }
                        break;
                    case '1':
                    case '2':
                    case '3':
                    case '4':
                        if (self.gameStarted && !self.gamePaused) {
                            self.switchWeapon(parseInt(key) - 1);
                        }
                        break;
                }
            });
            
            document.addEventListener('keyup', function(e) {
                var key = e.key.toLowerCase();
                self.keys[key] = false;
                
                switch (key) {
                    case 'shift':
                        self.isSprinting = false;
                        break;
                }
            });
            
            // Contrôles souris avancés
            document.addEventListener('mousemove', function(e) {
                if (!self.gameStarted || self.gamePaused || document.pointerLockElement !== document.body) return;
                
                self.mouse.dx = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
                self.mouse.dy = e.movementY || e.mozMovementY || e.webkitMovementY || 0;
                
                // Rotation caméra
                var sensitivity = self.mouseSensitivity * 0.002;
                if (self.playerModel) {
                    self.playerModel.rotation.y -= self.mouse.dx * sensitivity;
                    
                    // Limiter la rotation verticale
                    var verticalRotation = self.threeCamera.rotation.x - (self.mouse.dy * sensitivity);
                    self.threeCamera.rotation.x = self.clamp(verticalRotation, -Math.PI/2, Math.PI/2);
                }
            });
            
            // Clic souris
            document.addEventListener('mousedown', function(e) {
                if (!self.gameStarted || self.gamePaused) return;
                
                if (e.button === 0) { // Clic gauche
                    self.playerShoot();
                } else if (e.button === 2) { // Clic droit
                    self.toggleAim();
                }
            });
            
            // Clic droit désactivé
            document.addEventListener('contextmenu', function(e) {
                if (self.gameStarted) {
                    e.preventDefault();
                    return false;
                }
            });
            
            // Pointer Lock pour FPS
            document.addEventListener('click', function() {
                if (self.gameStarted && !self.gamePaused && !self.isMobile) {
                    document.body.requestPointerLock();
                }
            });
            
            // Contrôles mobiles
            if (this.isMobile) {
                this.initMobileControls();
            }
            
            // Redimensionnement
            window.addEventListener('resize', function() {
                self.onWindowResize();
            });
            
            // Prévention de la touche F5
            window.addEventListener('keydown', function(e) {
                if (e.key === 'F5') {
                    e.preventDefault();
                    self.saveGame();
                }
            });
            
            console.log("✅ Contrôles avancés initialisés");
        },
        
        initMobileControls: function() {
            var self = this;
            var joystickArea = document.getElementById('joystickArea');
            var joystick = document.getElementById('joystick');
            
            if (joystickArea && joystick) {
                // Touch events pour joystick
                joystickArea.addEventListener('touchstart', function(e) {
                    e.preventDefault();
                    self.joystickActive = true;
                });
                
                joystickArea.addEventListener('touchmove', function(e) {
                    if (!self.joystickActive) return;
                    e.preventDefault();
                    
                    var rect = joystickArea.getBoundingClientRect();
                    var centerX = rect.left + rect.width / 2;
                    var centerY = rect.top + rect.height / 2;
                    
                    var touch = e.touches[0];
                    var deltaX = touch.clientX - centerX;
                    var deltaY = touch.clientY - centerY;
                    
                    var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                    var maxDistance = rect.width / 2;
                    
                    if (distance > maxDistance) {
                        deltaX = deltaX * maxDistance / distance;
                        deltaY = deltaY * maxDistance / distance;
                        distance = maxDistance;
                    }
                    
                    // Mettre à jour le joystick visuel
                    joystick.style.transform = "translate(" + deltaX + "px, " + deltaY + "px)";
                    
                    // Vecteur normalisé
                    self.joystickVector.x = deltaX / maxDistance;
                    self.joystickVector.y = deltaY / maxDistance;
                });
                
                joystickArea.addEventListener('touchend', function(e) {
                    self.joystickActive = false;
                    self.joystickVector = { x: 0, y: 0 };
                    joystick.style.transform = "translate(0, 0)";
                });
            }
            
            // Boutons mobiles
            var mobileButtons = ['shoot', 'jump', 'interact', 'inventory'];
            mobileButtons.forEach(function(action) {
                var element = document.getElementById("mobile-" + action);
                if (element) {
                    element.addEventListener('touchstart', function(e) {
                        e.preventDefault();
                        self.keys[action] = true;
                        
                        if (action === 'shoot' && self.gameStarted && !self.gamePaused) {
                            self.playerShoot();
                        } else if (action === 'jump' && self.gameStarted && !self.gamePaused) {
                            self.playerJump();
                        } else if (action === 'interact' && self.gameStarted && !self.gamePaused) {
                            self.playerInteract();
                        } else if (action === 'inventory' && self.gameStarted && !self.gamePaused) {
                            self.toggleInventory();
                        }
                    });
                    
                    element.addEventListener('touchend', function(e) {
                        e.preventDefault();
                        self.keys[action] = false;
                    });
                }
            });
            
            // Contrôles de zoom tactile
            var lastTouchDistance = 0;
            document.addEventListener('touchmove', function(e) {
                if (e.touches.length === 2) {
                    e.preventDefault();
                    var touch1 = e.touches[0];
                    var touch2 = e.touches[1];
                    var distance = Math.sqrt(
                        Math.pow(touch2.clientX - touch1.clientX, 2) +
                        Math.pow(touch2.clientY - touch1.clientY, 2)
                    );
                    
                    if (lastTouchDistance > 0) {
                        var zoomDelta = distance - lastTouchDistance;
                        if (self.threeCamera) {
                            self.threeCamera.fov -= zoomDelta * 0.1;
                            self.threeCamera.fov = self.clamp(self.threeCamera.fov, 40, 100);
                            self.threeCamera.updateProjectionMatrix();
                        }
                    }
                    lastTouchDistance = distance;
                }
            });
            
            document.addEventListener('touchend', function() {
                lastTouchDistance = 0;
            });
        },
        
        // ============================================
        // AUDIO MANAGER
        // ============================================
        initAudioManager: function() {
            this.audioManager = {
                sounds: {},
                music: null,
                volume: 0.7,
                muted: false,
                
                play: function(soundId) {
                    if (this.muted) return;
                    
                    var sound = document.getElementById(soundId);
                    if (sound) {
                        sound.volume = this.volume;
                        sound.currentTime = 0;
                        sound.play().catch(function(e) {
                            console.log("Erreur lecture audio:", e);
                        });
                    }
                }.bind(this),
                
                playMusic: function(musicId) {
                    if (this.muted) return;
                    
                    // Arrêter la musique actuelle
                    if (this.currentMusic) {
                        this.currentMusic.pause();
                        this.currentMusic.currentTime = 0;
                    }
                    
                    var music = document.getElementById(musicId);
                    if (music) {
                        music.volume = this.volume * 0.6;
                        music.loop = true;
                        music.play().catch(function(e) {
                            console.log("Erreur lecture musique:", e);
                        });
                        this.currentMusic = music;
                    }
                }.bind(this),
                
                setVolume: function(volume) {
                    this.volume = this.clamp(volume, 0, 1);
                    
                    // Mettre à jour tous les sons
                    var sounds = document.querySelectorAll('audio');
                    sounds.forEach(function(sound) {
                        if (sound.id.includes('music')) {
                            sound.volume = this.volume * 0.6;
                        } else {
                            sound.volume = this.volume;
                        }
                    }.bind(this));
                }.bind(this),
                
                mute: function() {
                    this.muted = true;
                    if (this.currentMusic) {
                        this.currentMusic.pause();
                    }
                }.bind(this),
                
                unmute: function() {
                    this.muted = false;
                    if (this.currentMusic) {
                        this.currentMusic.play().catch(function(e) {
                            console.log("Erreur reprise musique:", e);
                        });
                    }
                }.bind(this)
            };
            
            console.log("✅ Audio manager initialisé");
        },
        
        // ============================================
        // SYSTÈMES DE JEU
        // ============================================
        initGameSystems: function() {
            this.gameStarted = false;
            this.gamePaused = false;
            this.gameTime = 0;
            this.currentCity = 0;
            this.currentDistrict = 0;
            this.playerInventory = [];
            this.activeQuests = [];
            this.completedQuests = [];
            this.flashlight = false;
            this.isCrouching = false;
            this.isAiming = false;
            this.bullets = [];
            this.particles = [];
            
            // Créer le joueur 3D avancé
            this.createAdvancedPlayer();
            
            // Initialiser les systèmes
            this.initQuestSystem();
            this.initCombatSystem();
            this.initInventorySystem();
            this.initSaveSystem();
            this.initWeatherSystem();
            this.initTimeSystem();
            
            // Démarrer la boucle de jeu
            this.gameLoop();
            
            console.log("✅ Systèmes de jeu initialisés");
        },
        
        createAdvancedPlayer: function() {
            var playerGroup = new THREE.Group();
            playerGroup.name = "player";
            
            // Corps avancé
            var bodyGeometry = new THREE.CapsuleGeometry(0.5, 1.8, 16, 32);
            var bodyMaterial = new THREE.MeshStandardMaterial({
                color: 0x009e60,
                roughness: 0.6,
                metalness: 0.3,
                emissive: 0x003311,
                emissiveIntensity: 0.1
            });
            
            this.playerBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
            this.playerBody.position.y = 0.9;
            this.playerBody.castShadow = true;
            this.playerBody.receiveShadow = true;
            playerGroup.add(this.playerBody);
            
            // Tête détaillée
            var headGeometry = new THREE.SphereGeometry(0.35, 32, 32);
            var headMaterial = new THREE.MeshStandardMaterial({
                color: 0x8B4513,
                roughness: 0.8,
                metalness: 0.1
            });
            
            var head = new THREE.Mesh(headGeometry, headMaterial);
            head.position.y = 2.0;
            head.castShadow = true;
            playerGroup.add(head);
            
            // Yeux
            var eyeGeometry = new THREE.SphereGeometry(0.05, 16, 16);
            var eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
            
            var leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            leftEye.position.set(-0.15, 2.05, 0.3);
            playerGroup.add(leftEye);
            
            var rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            rightEye.position.set(0.15, 2.05, 0.3);
            playerGroup.add(rightEye);
            
            // Bras articulés
            var armGeometry = new THREE.CapsuleGeometry(0.12, 0.8, 8, 16);
            var armMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x009e60,
                roughness: 0.7
            });
            
            var leftArm = new THREE.Mesh(armGeometry, armMaterial);
            leftArm.position.set(-0.5, 1.4, 0);
            leftArm.rotation.z = Math.PI / 6;
            leftArm.castShadow = true;
            playerGroup.add(leftArm);
            
            var rightArm = new THREE.Mesh(armGeometry, armMaterial);
            rightArm.position.set(0.5, 1.4, 0);
            rightArm.rotation.z = -Math.PI / 6;
            rightArm.castShadow = true;
            playerGroup.add(rightArm);
            
            // Jambes
            var legGeometry = new THREE.CapsuleGeometry(0.15, 0.9, 8, 16);
            var legMaterial = new THREE.MeshStandardMaterial({ color: 0x006633 });
            
            var leftLeg = new THREE.Mesh(legGeometry, legMaterial);
            leftLeg.position.set(-0.2, 0.45, 0);
            leftLeg.castShadow = true;
            playerGroup.add(leftLeg);
            
            var rightLeg = new THREE.Mesh(legGeometry, legMaterial);
            rightLeg.position.set(0.2, 0.45, 0);
            rightLeg.castShadow = true;
            playerGroup.add(rightLeg);
            
            // Arme dans la main
            var weaponGeometry = new THREE.BoxGeometry(0.8, 0.1, 0.1);
            var weaponMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x444444,
                metalness: 0.8,
                roughness: 0.2
            });
            
            this.playerWeapon = new THREE.Mesh(weaponGeometry, weaponMaterial);
            this.playerWeapon.position.set(0.6, 1.5, 0.3);
            this.playerWeapon.rotation.z = -Math.PI / 4;
            playerGroup.add(this.playerWeapon);
            
            // Position initiale
            playerGroup.position.set(0, 10, 0);
            playerGroup.rotation.y = Math.PI;
            this.threeScene.add(playerGroup);
            this.playerModel = playerGroup;
            
            // Animation de départ
            this.animatePlayerSpawn();
            
            console.log("✅ Joueur avancé créé avec animation");
        },
        
        animatePlayerSpawn: function() {
            var startY = this.playerModel.position.y;
            var targetY = 5;
            var duration = 1000;
            var startTime = Date.now();
            
            var animate = function() {
                var elapsed = Date.now() - startTime;
                var progress = Math.min(elapsed / duration, 1);
                
                // Animation d'atterrissage
                this.playerModel.position.y = startY + (targetY - startY) * progress;
                
                // Effet de rebond
                if (progress < 1) {
                    var bounce = Math.sin(progress * Math.PI * 2) * 0.5;
                    this.playerModel.position.y += bounce * (1 - progress);
                }
                
                if (progress < 1) {
                    requestAnimationFrame(animate.bind(this));
                } else {
                    this.playerModel.position.y = targetY;
                    this.createSpawnEffect();
                }
            }.bind(this);
            
            animate();
        },
        
        createSpawnEffect: function() {
            // Créer un effet de particules pour l'apparition
            var particleCount = 50;
            var particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
            var particleMaterial = new THREE.MeshBasicMaterial({ color: 0x009e60 });
            
            for (var i = 0; i < particleCount; i++) {
                var particle = new THREE.Mesh(particleGeometry, particleMaterial);
                particle.position.copy(this.playerModel.position);
                
                // Vitesse aléatoire
                var speed = 0.1 + Math.random() * 0.2;
                var angle = Math.random() * Math.PI * 2;
                particle.userData = {
                    velocity: new THREE.Vector3(
                        Math.cos(angle) * speed,
                        Math.random() * speed,
                        Math.sin(angle) * speed
                    ),
                    life: 1.0
                };
                
                this.threeScene.add(particle);
                this.particles.push(particle);
            }
            
            // Effet sonore
            this.playSound('sfx-select');
        },
        
        // ============================================
        // SYSTÈME DE QUÊTES
        // ============================================
        initQuestSystem: function() {
            this.questSystem = {
                activeQuest: null,
                questProgress: 0,
                questTarget: 5,
                questReward: "",
                questNPC: null,
                questType: "kill", // kill, collect, deliver, protect, escort
                questTimeLimit: null,
                questStartTime: null,
                
                startQuest: function(npcIndex, questType) {
                    if (npcIndex < this.npcs.length) {
                        var npc = this.npcs[npcIndex];
                        this.questSystem.activeQuest = npc.quest;
                        this.questSystem.questProgress = 0;
                        this.questSystem.questTarget = 5;
                        this.questSystem.questReward = npc.reward;
                        this.questSystem.questNPC = npc.name;
                        this.questSystem.questType = questType || "kill";
                        this.questSystem.questStartTime = Date.now();
                        
                        // Temps limite selon le type de quête
                        switch (questType) {
                            case "deliver":
                                this.questSystem.questTimeLimit = 300000; // 5 minutes
                                break;
                            case "protect":
                                this.questSystem.questTimeLimit = 180000; // 3 minutes
                                break;
                            default:
                                this.questSystem.questTimeLimit = null;
                        }
                        
                        this.showMessage("📜 QUÊTE ACCEPTÉE:\n" + npc.quest + "\n\nRécompense: " + npc.reward, 4000);
                        this.playSound('sfx-quest');
                        this.updateHUD();
                        
                        // Ajouter à l'historique
                        this.activeQuests.push({
                            name: npc.quest,
                            startTime: Date.now(),
                            npc: npc.name
                        });
                    }
                }.bind(this),
                
                updateProgress: function(amount, type) {
                    if (!this.questSystem.activeQuest) return;
                    if (type && this.questSystem.questType !== type) return;
                    
                    this.questSystem.questProgress += amount;
                    this.updateHUD();
                    
                    // Effet visuel de progression
                    if (amount > 0) {
                        this.createProgressEffect();
                    }
                    
                    // Vérifier si la quête est terminée
                    if (this.questSystem.questProgress >= this.questSystem.questTarget) {
                        this.completeQuest();
                    }
                    
                    // Vérifier le temps limite
                    if (this.questSystem.questTimeLimit && 
                        Date.now() - this.questSystem.questStartTime > this.questSystem.questTimeLimit) {
                        this.failQuest("Temps écoulé!");
                    }
                },
                
                completeQuest: function() {
                    var npc = this.npcs.find(function(n) {
                        return n.quest === this.questSystem.activeQuest;
                    }.bind(this));
                    
                    if (npc) {
                        // Récompenses
                        this.addXP(100);
                        this.state.score += 500;
                        this.state.money += 500;
                        this.completedQuests.push(this.questSystem.activeQuest);
                        
                        // Retirer de la liste active
                        var questIndex = this.activeQuests.findIndex(function(q) {
                            return q.name === this.questSystem.activeQuest;
                        }.bind(this));
                        if (questIndex > -1) {
                            this.activeQuests.splice(questIndex, 1);
                        }
                        
                        var rewardText = "✅ QUÊTE ACCOMPLIE!\n" + npc.reward;
                        this.showNotification(rewardText, 5000);
                        this.playSound('sfx-levelup');
                        
                        // Effet de récompense
                        this.createRewardEffect();
                        
                        // Traiter la récompense
                        if (npc.reward.includes("Clé")) {
                            this.state.hasKey = true;
                            this.addToInventory({
                                name: "Clé du marché",
                                type: "key",
                                value: 1,
                                icon: "🗝️",
                                weight: 0.5
                            });
                        } else if (npc.reward.includes("Kit")) {
                            this.addToInventory({
                                name: "Kit de soin amélioré",
                                type: "health",
                                value: 50,
                                icon: "❤️",
                                weight: 1
                            });
                        } else if (npc.reward.includes("Fusil")) {
                            this.unlockWeapon(1); // AK-47
                        } else if (npc.reward.includes("Accès")) {
                            this.currentDistrict = Math.min(this.currentDistrict + 1, 4);
                            this.showMessage("🎉 Nouveau quartier débloqué!", 3000);
                        }
                        
                        // Réinitialiser
                        this.questSystem.activeQuest = null;
                        this.questSystem.questProgress = 0;
                        this.updateHUD();
                    }
                }.bind(this),
                
                failQuest: function(reason) {
                    this.showMessage("❌ QUÊTE ÉCHOUÉE: " + reason, 3000);
                    this.questSystem.activeQuest = null;
                    this.questSystem.questProgress = 0;
                    this.updateHUD();
                },
                
                checkQuestProgress: function() {
                    // Vérifie périodiquement la progression des quêtes
                    if (this.questSystem.activeQuest) {
                        // Logique spécifique au type de quête
                        switch (this.questSystem.questType) {
                            case "kill":
                                // Progression gérée par enemyDie()
                                break;
                            case "collect":
                                // Vérifier l'inventaire
                                break;
                            case "deliver":
                                // Vérifier la position
                                break;
                        }
                    }
                }
            };
            
            console.log("✅ Système de quêtes initialisé");
        },
        
        // ============================================
        // SYSTÈME DE COMBAT
        // ============================================
        initCombatSystem: function() {
            this.combatSystem = {
                bullets: [],
                lastShot: 0,
                bulletSpeed: 25,
                bulletLifetime: 2000, // ms
                recoilAmount: 0.05,
                maxRecoil: 0.3,
                currentRecoil: 0,
                isReloading: false,
                reloadTime: 2000,
                
                shoot: function() {
                    var now = Date.now();
                    var weapon = this.weapons[this.state.currentWeapon];
                    
                    // Vérifications
                    if (this.combatSystem.isReloading) return;
                    if (now - this.combatSystem.lastShot < weapon.fireRate) return;
                    if (weapon.ammo <= 0) {
                        this.showMessage("Plus de munitions! Appuyez sur R pour recharger", 1500);
                        return;
                    }
                    
                    // Consommer munition
                    weapon.ammo--;
                    this.combatSystem.lastShot = now;
                    
                    // Créer une balle 3D avancée
                    this.createAdvancedBullet();
                    
                    // Son
                    this.playSound(weapon.sound || 'sfx-shoot');
                    
                    // Recul
                    this.applyRecoil();
                    
                    // Effet de flash d'arme
                    this.createMuzzleFlash();
                    
                    // Mettre à jour le HUD
                    this.updateHUD();
                    
                    // Vibration sur mobile
                    if (this.isMobile && navigator.vibrate) {
                        navigator.vibrate(50);
                    }
                }.bind(this),
                
                createAdvancedBullet: function() {
                    var weapon = this.weapons[this.state.currentWeapon];
                    
                    // Géométrie de balle selon l'arme
                    var geometry;
                    switch (weapon.type) {
                        case "pistol":
                            geometry = new THREE.SphereGeometry(0.05, 8, 8);
                            break;
                        case "rifle":
                            geometry = new THREE.CylinderGeometry(0.03, 0.03, 0.2, 8);
                            break;
                        case "shotgun":
                            // Plusieurs projectiles pour le fusil
                            for (var i = 0; i < 8; i++) {
                                this.createShotgunPellet();
                            }
                            geometry = new THREE.SphereGeometry(0.08, 8, 8);
                            break;
                        default:
                            geometry = new THREE.SphereGeometry(0.05, 8, 8);
                    }
                    
                    if (weapon.type === "shotgun") return; // Déjà créé les chevrotines
                    
                    var material = new THREE.MeshBasicMaterial({
                        color: weapon.type === "rifle" ? 0xFFD700 : 0xFCD116,
                        emissive: weapon.type === "rifle" ? 0xFFA500 : 0xFCD116,
                        emissiveIntensity: 0.5
                    });
                    
                    var bullet = new THREE.Mesh(geometry, material);
                    
                    // Position de départ (canon de l'arme)
                    bullet.position.copy(this.playerModel.position);
                    bullet.position.y += 1.7;
                    
                    // Direction basée sur la caméra avec imprécision
                    var direction = new THREE.Vector3(0, 0, -1);
                    direction.applyQuaternion(this.threeCamera.quaternion);
                    
                    // Imprécision selon l'arme
                    var accuracy = weapon.accuracy || 0.9;
                    var spread = (1 - accuracy) * 0.1;
                    direction.x += (Math.random() - 0.5) * spread;
                    direction.y += (Math.random() - 0.5) * spread;
                    direction.normalize();
                    
                    // Appliquer le recul actuel
                    if (this.combatSystem.currentRecoil > 0) {
                        direction.y += this.combatSystem.currentRecoil * 0.1;
                        direction.normalize();
                    }
                    
                    bullet.userData = {
                        direction: direction,
                        speed: this.combatSystem.bulletSpeed,
                        damage: weapon.damage,
                        spawnTime: Date.now(),
                        owner: "player",
                        weaponType: weapon.type,
                        ricochetCount: 0
                    };
                    
                    this.threeScene.add(bullet);
                    this.bullets.push(bullet);
                    this.bulletModels.push(bullet);
                },
                
                createShotgunPellet: function() {
                    var geometry = new THREE.SphereGeometry(0.03, 6, 6);
                    var material = new THREE.MeshBasicMaterial({
                        color: 0xFCD116,
                        emissive: 0xFCD116,
                        emissiveIntensity: 0.3
                    });
                    
                    var pellet = new THREE.Mesh(geometry, material);
                    pellet.position.copy(this.playerModel.position);
                    pellet.position.y += 1.7;
                    
                    // Grande dispersion pour le fusil
                    var direction = new THREE.Vector3(0, 0, -1);
                    direction.applyQuaternion(this.threeCamera.quaternion);
                    direction.x += (Math.random() - 0.5) * 0.3;
                    direction.y += (Math.random() - 0.5) * 0.2;
                    direction.normalize();
                    
                    pellet.userData = {
                        direction: direction,
                        speed: this.combatSystem.bulletSpeed * 0.8,
                        damage: 10, // Dégâts réduits par projectile
                        spawnTime: Date.now(),
                        owner: "player",
                        weaponType: "shotgun"
                    };
                    
                    this.threeScene.add(pellet);
                    this.bullets.push(pellet);
                    this.bulletModels.push(pellet);
                },
                
                createMuzzleFlash: function() {
                    // Créer un flash lumineux à la bouche du canon
                    var flashGeometry = new THREE.SphereGeometry(0.3, 8, 8);
                    var flashMaterial = new THREE.MeshBasicMaterial({
                        color: 0xFFAA00,
                        transparent: true,
                        opacity: 0.8
                    });
                    
                    var flash = new THREE.Mesh(flashGeometry, flashMaterial);
                    flash.position.copy(this.playerModel.position);
                    flash.position.y += 1.7;
                    flash.position.z -= 0.5;
                    
                    this.threeScene.add(flash);
                    
                    // Animation du flash
                    var startTime = Date.now();
                    var animateFlash = function() {
                        var elapsed = Date.now() - startTime;
                        if (elapsed < 100) {
                            flash.material.opacity = 0.8 * (1 - elapsed / 100);
                            flash.scale.setScalar(1 + elapsed / 50);
                            requestAnimationFrame(animateFlash);
                        } else {
                            this.threeScene.remove(flash);
                        }
                    }.bind(this);
                    
                    animateFlash();
                },
                
                applyRecoil: function() {
                    var weapon = this.weapons[this.state.currentWeapon];
                    var recoil = weapon.type === "shotgun" ? 0.2 : 0.05;
                    
                    this.combatSystem.currentRecoil += recoil;
                    this.combatSystem.currentRecoil = Math.min(
                        this.combatSystem.currentRecoil, 
                        this.combatSystem.maxRecoil
                    );
                    
                    // Animation de recul de la caméra
                    if (this.threeCamera) {
                        this.threeCamera.position.y += recoil * 0.5;
                        this.threeCamera.position.z += recoil * 0.3;
                        
                        // Retour progressif
                        setTimeout(function() {
                            if (this.threeCamera) {
                                this.threeCamera.position.y -= recoil * 0.5;
                                this.threeCamera.position.z -= recoil * 0.3;
                            }
                        }.bind(this), 100);
                    }
                },
                
                updateBullets: function() {
                    var now = Date.now();
                    
                    for (var i = this.bullets.length - 1; i >= 0; i--) {
                        var bullet = this.bullets[i];
                        if (!bullet) continue;
                        
                        // Vérifier la durée de vie
                        if (now - bullet.userData.spawnTime > this.combatSystem.bulletLifetime) {
                            this.removeBullet(i);
                            continue;
                        }
                        
                        // Déplacement
                        var moveDistance = bullet.userData.speed * 0.016; // Pour 60 FPS
                        bullet.position.add(
                            bullet.userData.direction.clone().multiplyScalar(moveDistance)
                        );
                        
                        // Traînée lumineuse
                        this.createBulletTrail(bullet);
                        
                        // Vérifier les collisions
                        if (this.checkBulletCollision(bullet, i)) {
                            this.removeBullet(i);
                        }
                    }
                    
                    // Réduire le recul progressivement
                    if (this.combatSystem.currentRecoil > 0) {
                        this.combatSystem.currentRecoil *= 0.9;
                        if (this.combatSystem.currentRecoil < 0.01) {
                            this.combatSystem.currentRecoil = 0;
                        }
                    }
                },
                
                removeBullet: function(index) {
                    var bullet = this.bullets[index];
                    if (bullet) {
                        this.threeScene.remove(bullet);
                        if (this.bulletModels.includes(bullet)) {
                            this.bulletModels.splice(this.bulletModels.indexOf(bullet), 1);
                        }
                    }
                    this.bullets.splice(index, 1);
                },
                
                damageEnemy: function(enemy, damage, bullet) {
                    enemy.userData.health -= damage;
                    
                    // Effet de dégâts
                    this.createHitEffect(enemy.position, damage);
                    
                    // Son de dégâts
                    this.playSound('sfx-hit');
                    
                    // Indicateur de dégâts flottant
                    this.createDamageIndicator(enemy.position, damage);
                    
                    // Effet visuel sur l'ennemi
                    enemy.material.color.setHex(0xff0000);
                    setTimeout(function() {
                        if (enemy.userData.health > 0) {
                            enemy.material.color.setHex(enemy.userData.originalColor);
                        }
                    }, 100);
                    
                    // Vérifier la mort
                    if (enemy.userData.health <= 0) {
                        this.enemyDie(enemy, bullet);
                    }
                }.bind(this),
                
                reloadWeapon: function() {
                    if (this.combatSystem.isReloading) return;
                    
                    var weapon = this.weapons[this.state.currentWeapon];
                    if (weapon.ammo === weapon.maxAmmo) return;
                    
                    this.combatSystem.isReloading = true;
                    this.showMessage("Rechargement...", 1500);
                    
                    // Animation de rechargement
                    setTimeout(function() {
                        weapon.ammo = weapon.maxAmmo;
                        this.combatSystem.isReloading = false;
                        this.showMessage("Arme rechargée", 1000);
                        this.updateHUD();
                        this.playSound('sfx-collect');
                    }.bind(this), this.combatSystem.reloadTime);
                }.bind(this)
            };
            
            console.log("✅ Système de combat initialisé");
        },
        
        // ============================================
        // SYSTÈME D'INVENTAIRE
        // ============================================
        initInventorySystem: function() {
            this.inventorySystem = {
                items: [],
                equipment: {
                    armor: null,
                    helmet: null,
                    rings: [],
                    amulet: null,
                    backpack: null
                },
                maxSlots: 30,
                maxWeight: 100,
                
                addItem: function(item) {
                    // Vérifier le poids
                    var newWeight = this.state.weight + (item.weight || 1);
                    if (newWeight > this.state.maxWeight) {
                        this.showMessage("Trop lourd! Poids maximum: " + this.state.maxWeight + "kg", 2000);
                        return false;
                    }
                    
                    // Vérifier les emplacements
                    if (this.inventorySystem.items.length >= this.inventorySystem.maxSlots) {
                        this.showMessage("Inventaire plein!", 2000);
                        return false;
                    }
                    
                    // Ajouter l'objet
                    this.inventorySystem.items.push(item);
                    this.state.weight += item.weight || 1;
                    
                    // Effet de collection
                    this.showNotification("🎒 " + item.name + " ajouté à l'inventaire", 2000);
                    this.playSound('sfx-collect');
                    
                    this.updateInventoryDisplay();
                    return true;
                }.bind(this),
                
                removeItem: function(index) {
                    if (index >= 0 && index < this.inventorySystem.items.length) {
                        var item = this.inventorySystem.items.splice(index, 1)[0];
                        this.state.weight -= item.weight || 1;
                        this.showMessage(item.name + " retiré", 1500);
                        this.updateInventoryDisplay();
                        return item;
                    }
                    return null;
                }.bind(this),
                
                useItem: function(index) {
                    var item = this.inventorySystem.items[index];
                    if (!item) return;
                    
                    switch (item.type) {
                        case "health":
                            var healAmount = Math.min(
                                this.state.maxHealth - this.state.health,
                                item.value || 25
                            );
                            this.state.health += healAmount;
                            this.showMessage("❤️ Santé restaurée de " + healAmount, 1500);
                            this.createHealEffect();
                            this.inventorySystem.removeItem(index);
                            break;
                            
                        case "ammo":
                            var weapon = this.weapons[this.state.currentWeapon];
                            var ammoToAdd = Math.min(
                                weapon.maxAmmo - weapon.ammo,
                                item.value || 30
                            );
                            weapon.ammo += ammoToAdd;
                            this.showMessage("📦 Munitions +" + ammoToAdd, 1500);
                            this.inventorySystem.removeItem(index);
                            break;
                            
                        case "armor":
                            var armorToAdd = Math.min(
                                this.state.maxArmor - this.state.armor,
                                item.value || 25
                            );
                            this.state.armor += armorToAdd;
                            this.showMessage("🛡️ Armure +" + armorToAdd, 1500);
                            this.inventorySystem.removeItem(index);
                            break;
                            
                        case "key":
                            this.state.hasKey = true;
                            this.showMessage("🗝️ Clé obtenue! Les portes spéciales sont maintenant accessibles", 2000);
                            this.inventorySystem.removeItem(index);
                            break;
                            
                        case "money":
                            this.state.money += item.value || 100;
                            this.showMessage("💰 +" + item.value + " FCFA", 1500);
                            this.inventorySystem.removeItem(index);
                            break;
                            
                        case "special":
                            this.addXP(item.value || 50);
                            this.showMessage("✨ Effet spécial activé!", 1500);
                            this.inventorySystem.removeItem(index);
                            break;
                    }
                    
                    this.updateHUD();
                }.bind(this),
                
                equipItem: function(index) {
                    var item = this.inventorySystem.items[index];
                    if (!item) return;
                    
                    // Logique d'équipement selon le type d'objet
                    // (À implémenter selon les besoins)
                    
                    this.showMessage(item.name + " équipé", 1500);
                    this.updateInventoryDisplay();
                }.bind(this),
                
                sortItems: function() {
                    // Trier par type, puis par nom
                    this.inventorySystem.items.sort(function(a, b) {
                        if (a.type !== b.type) {
                            return a.type.localeCompare(b.type);
                        }
                        return a.name.localeCompare(b.name);
                    });
                    
                    this.showMessage("Inventaire trié", 1500);
                    this.updateInventoryDisplay();
                }.bind(this)
            };
            
            console.log("✅ Système d'inventaire initialisé");
        },
        
        // ============================================
        // SYSTÈME DE SAUVEGARDE
        // ============================================
        initSaveSystem: function() {
            this.saveSystem = {
                saveKey: "gabonRpg3dSave_v1",
                
                save: function() {
                    try {
                        var saveData = {
                            version: "1.0",
                            timestamp: Date.now(),
                            gameState: this.state,
                            player: {
                                position: {
                                    x: this.playerModel.position.x,
                                    y: this.playerModel.position.y,
                                    z: this.playerModel.position.z
                                },
                                rotation: {
                                    x: this.playerModel.rotation.x,
                                    y: this.playerModel.rotation.y,
                                    z: this.playerModel.rotation.z
                                },
                                inventory: this.inventorySystem.items,
                                equipment: this.inventorySystem.equipment,
                                quests: {
                                    active: this.activeQuests,
                                    completed: this.completedQuests,
                                    current: this.questSystem.activeQuest,
                                    progress: this.questSystem.questProgress
                                },
                                location: {
                                    city: this.currentCity,
                                    district: this.currentDistrict
                                },
                                stats: {
                                    playTime: this.gameTime,
                                    totalKills: this.state.kills,
                                    totalScore: this.state.score,
                                    totalMoney: this.state.money,
                                    totalXP: this.state.xp
                                }
                            },
                            settings: {
                                volume: this.volume,
                                mouseSensitivity: this.mouseSensitivity,
                                graphicsQuality: document.getElementById('graphics-quality')?.value || 'medium'
                            }
                        };
                        
                        localStorage.setItem(this.saveSystem.saveKey, JSON.stringify(saveData));
                        this.showNotification("💾 PARTIE SAUVEGARDÉE", 2000);
                        this.playSound('sfx-select');
                        return true;
                    } catch (e) {
                        console.error("Erreur de sauvegarde:", e);
                        this.showMessage("Erreur de sauvegarde. Espace de stockage insuffisant?", 3000);
                        return false;
                    }
                }.bind(this),
                
                load: function() {
                    try {
                        var data = localStorage.getItem(this.saveSystem.saveKey);
                        if (!data) {
                            console.log("Aucune sauvegarde trouvée");
                            return false;
                        }
                        
                        var saveData = JSON.parse(data);
                        
                        // Vérifier la version
                        if (saveData.version !== "1.0") {
                            console.warn("Version de sauvegarde différente");
                        }
                        
                        // Charger l'état du jeu
                        Object.assign(this.state, saveData.gameState);
                        
                        // Position et rotation du joueur
                        if (saveData.player?.position) {
                            this.playerModel.position.set(
                                saveData.player.position.x,
                                saveData.player.position.y,
                                saveData.player.position.z
                            );
                        }
                        
                        if (saveData.player?.rotation) {
                            this.playerModel.rotation.set(
                                saveData.player.rotation.x,
                                saveData.player.rotation.y,
                                saveData.player.rotation.z
                            );
                        }
                        
                        // Inventaire et équipement
                        this.inventorySystem.items = saveData.player?.inventory || [];
                        this.inventorySystem.equipment = saveData.player?.equipment || this.inventorySystem.equipment;
                        
                        // Quêtes
                        this.activeQuests = saveData.player?.quests?.active || [];
                        this.completedQuests = saveData.player?.quests?.completed || [];
                        this.questSystem.activeQuest = saveData.player?.quests?.current || null;
                        this.questSystem.questProgress = saveData.player?.quests?.progress || 0;
                        
                        // Localisation
                        this.currentCity = saveData.player?.location?.city || 0;
                        this.currentDistrict = saveData.player?.location?.district || 0;
                        
                        // Stats
                        this.gameTime = saveData.player?.stats?.playTime || 0;
                        
                        // Paramètres
                        if (saveData.settings) {
                            this.volume = saveData.settings.volume || 0.7;
                            this.mouseSensitivity = saveData.settings.mouseSensitivity || 5;
                            this.setVolume(this.volume);
                            document.getElementById('volume-slider').value = this.volume * 100;
                            document.getElementById('volume-text').textContent = Math.round(this.volume * 100) + "%";
                            document.getElementById('mouse-sensitivity').value = this.mouseSensitivity;
                            
                            if (saveData.settings.graphicsQuality) {
                                document.getElementById('graphics-quality').value = saveData.settings.graphicsQuality;
                                this.applyGraphicsQuality(saveData.settings.graphicsQuality);
                            }
                        }
                        
                        this.showNotification("💾 PARTIE CHARGÉE", 2000);
                        this.playSound('sfx-select');
                        this.updateHUD();
                        this.updateInventoryDisplay();
                        return true;
                    } catch (e) {
                        console.error("Erreur de chargement:", e);
                        this.showMessage("Erreur de chargement. Fichier de sauvegarde corrompu?", 3000);
                        return false;
                    }
                }.bind(this),
                
                delete: function() {
                    try {
                        localStorage.removeItem(this.saveSystem.saveKey);
                        this.showMessage("Sauvegarde supprimée", 2000);
                        return true;
                    } catch (e) {
                        console.error("Erreur de suppression:", e);
                        return false;
                    }
                }.bind(this),
                
                exportSave: function() {
                    try {
                        var saveData = localStorage.getItem(this.saveSystem.saveKey);
                        if (!saveData) return null;
                        
                        // Créer un blob téléchargeable
                        var blob = new Blob([saveData], { type: "application/json" });
                        var url = URL.createObjectURL(blob);
                        
                        var a = document.createElement('a');
                        a.href = url;
                        a.download = "rpg_gabonais_save.json";
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        
                        this.showMessage("Sauvegarde exportée", 2000);
                        return true;
                    } catch (e) {
                        console.error("Erreur d'export:", e);
                        return false;
                    }
                }.bind(this),
                
                importSave: function(file) {
                    try {
                        var reader = new FileReader();
                        reader.onload = function(e) {
                            try {
                                var saveData = JSON.parse(e.target.result);
                                localStorage.setItem(this.saveSystem.saveKey, JSON.stringify(saveData));
                                this.showMessage("Sauvegarde importée. Redémarrez le jeu.", 3000);
                            } catch (parseError) {
                                this.showMessage("Fichier de sauvegarde invalide", 3000);
                            }
                        }.bind(this);
                        reader.readAsText(file);
                    } catch (e) {
                        console.error("Erreur d'import:", e);
                        this.showMessage("Erreur d'importation", 3000);
                    }
                }.bind(this)
            };
            
            console.log("✅ Système de sauvegarde initialisé");
        },
        
        // ============================================
        // SYSTÈMES MÉTÉO ET TEMPS
        // ============================================
        initWeatherSystem: function() {
            this.weatherSystem = {
                currentWeather: "sunny", // sunny, rainy, stormy, foggy
                intensity: 0,
                particles: [],
                sound: null,
                
                setWeather: function(weatherType, intensity) {
                    this.weatherSystem.currentWeather = weatherType;
                    this.weatherSystem.intensity = intensity || 1;
                    
                    switch (weatherType) {
                        case "rainy":
                            this.createRainEffect(intensity);
                            break;
                        case "stormy":
                            this.createStormEffect(intensity);
                            break;
                        case "foggy":
                            this.createFogEffect(intensity);
                            break;
                    }
                }.bind(this),
                
                createRainEffect: function(intensity) {
                    // Créer des particules de pluie
                    var rainCount = Math.floor(intensity * 1000);
                    
                    for (var i = 0; i < rainCount; i++) {
                        // À implémenter
                    }
                },
                
                update: function() {
                    // Mettre à jour les effets météorologiques
                    // (simulation basique pour l'instant)
                }
            };
        },
        
        initTimeSystem: function() {
            this.timeSystem = {
                timeScale: 60, // 1 seconde réelle = 1 minute jeu
                currentTime: 8.0, // 8:00 AM
                isDay: true,
                
                update: function(deltaTime) {
                    // Avancer le temps
                    this.timeSystem.currentTime += deltaTime * this.timeSystem.timeScale / 3600;
                    
                    // Boucler à 24h
                    if (this.timeSystem.currentTime >= 24) {
                        this.timeSystem.currentTime -= 24;
                        this.state.day++;
                        this.showMessage("Nouveau jour! Jour " + this.state.day, 3000);
                    }
                    
                    // Déterminer si c'est le jour ou la nuit
                    this.timeSystem.isDay = (this.timeSystem.currentTime >= 6 && this.timeSystem.currentTime < 18);
                    
                    // Ajuster l'éclairage
                    this.updateLighting();
                }.bind(this),
                
                updateLighting: function() {
                    if (!this.sun) return;
                    
                    var hour = this.timeSystem.currentTime;
                    var intensity;
                    
                    if (hour >= 6 && hour <= 18) {
                        // Jour
                        var noon = 12;
                        var distanceFromNoon = Math.abs(hour - noon);
                        intensity = 1.0 - (distanceFromNoon / 6) * 0.5;
                    } else {
                        // Nuit
                        intensity = 0.3;
                    }
                    
                    this.sun.intensity = intensity * 1.5;
                    
                    // Position du soleil
                    var sunAngle = (hour / 24) * Math.PI * 2;
                    this.sun.position.x = Math.cos(sunAngle) * 200;
                    this.sun.position.y = Math.sin(sunAngle) * 100 + 50;
                    this.sun.position.z = Math.sin(sunAngle) * 200;
                    
                    // Couleur du ciel
                    if (this.skybox && this.skybox.material) {
                        var skyColor;
                        if (this.timeSystem.isDay) {
                            skyColor = 0x87CEEB;
                        } else {
                            var nightFactor = (hour < 6 ? hour / 6 : (24 - hour) / 6);
                            skyColor = this.lerpColor(0x000033, 0x87CEEB, nightFactor);
                        }
                        this.skybox.material.color.setHex(skyColor);
                    }
                },
                
                getTimeString: function() {
                    var hour = Math.floor(this.timeSystem.currentTime);
                    var minute = Math.floor((this.timeSystem.currentTime - hour) * 60);
                    var period = hour >= 12 ? "PM" : "AM";
                    
                    hour = hour % 12;
                    if (hour === 0) hour = 12;
                    
                    return hour.toString().padStart(2, '0') + ":" + 
                           minute.toString().padStart(2, '0') + " " + period;
                }
            };
        },
        
        // ============================================
        // MÉCANIQUES DE JEU PRINCIPALES
        // ============================================
        playerJump: function() {
            if (!this.isOnGround || !this.gameStarted || this.gamePaused) return;
            
            this.velocity.y = this.jumpForce;
            this.isOnGround = false;
            this.playSound('sfx-jump');
            
            // Effet de poussière
            this.createJumpEffect();
        },
        
        playerShoot: function() {
            if (!this.gameStarted || this.gamePaused) return;
            this.combatSystem.shoot();
        },
        
        playerInteract: function() {
            if (!this.gameStarted || this.gamePaused) return;
            
            // Rechercher PNJ proches
            for (var i = 0; i < this.npcModels.length; i++) {
                var npc = this.npcModels[i];
                var distance = this.distance3D(this.playerModel.position, npc.position);
                if (distance < 5) {
                    this.interactWithNPC(npc);
                    return;
                }
            }
            
            // Rechercher objets interactifs
            for (var j = 0; j < this.pickupModels.length; j++) {
                var pickup = this.pickupModels[j];
                var distance = this.distance3D(this.playerModel.position, pickup.position);
                if (distance < 3) {
                    this.pickupItem(pickup);
                    return;
                }
            }
            
            // Portes avec clé
            if (this.state.hasKey) {
                this.showMessage("🗝️ Vous utilisez la clé...", 1500);
                this.state.hasKey = false;
                this.playSound('sfx-select');
                // Ici: ouvrir une porte spéciale
            }
            
            // Si rien à proximité
            this.showMessage("Rien à interagir à proximité", 1500);
        },
        
        interactWithNPC: function(npc) {
            var npcData = npc.userData;
            var dialogue = npcData.dialogue;
            
            // Dialogue aléatoire pour plus de variété
            if (Array.isArray(dialogue)) {
                dialogue = dialogue[Math.floor(Math.random() * dialogue.length)];
            }
            
            this.showMessage(npcData.name + ": " + dialogue, 4000);
            this.playSound('sfx-select');
            
            // Proposer quête si disponible
            if (npcData.quest && !this.completedQuests.includes(npcData.quest)) {
                setTimeout(function() {
                    var accept = confirm(
                        npcData.name + " vous propose une quête:\n\n" +
                        npcData.quest + "\n\n" +
                        "Récompense: " + npcData.reward + "\n\n" +
                        "Acceptez-vous cette quête?"
                    );
                    
                    if (accept) {
                        var npcIndex = this.npcs.findIndex(function(n) {
                            return n.name === npcData.name;
                        });
                        if (npcIndex !== -1) {
                            this.questSystem.startQuest(npcIndex, "kill");
                        }
                    }
                }.bind(this), 100);
            }
        },
        
        pickupItem: function(pickup) {
            var itemData = pickup.userData;
            
            // Ajouter à l'inventaire
            var success = this.addToInventory({
                name: itemData.name || "Objet",
                type: itemData.type,
                value: itemData.value || 25,
                icon: itemData.icon || "📦",
                weight: itemData.weight || 1
            });
            
            if (success) {
                // Supprimer le modèle 3D
                this.threeScene.remove(pickup);
                var index = this.pickupModels.indexOf(pickup);
                if (index > -1) {
                    this.pickupModels.splice(index, 1);
                }
                
                // Effet de ramassage
                this.createPickupEffect(pickup.position);
            }
        },
        
        addToInventory: function(item) {
            return this.inventorySystem.addItem(item);
        },
        
        switchWeapon: function(index) {
            if (index >= this.weapons.length) return;
            
            var weapon = this.weapons[index];
            
            // Vérifier si l'arme est débloquée
            if (this.state.level < weapon.unlockLevel) {
                this.showMessage("Niveau " + weapon.unlockLevel + " requis pour débloquer cette arme", 2000);
                return;
            }
            
            this.state.currentWeapon = index;
            this.showMessage("🔫 " + weapon.name + " équipé", 1500);
            this.playSound('sfx-select');
            this.updateHUD();
            
            // Animation de changement d'arme
            this.animateWeaponSwitch();
        },
        
        animateWeaponSwitch: function() {
            // Animation simple de changement d'arme
            if (this.playerWeapon) {
                this.playerWeapon.scale.y = 0.1;
                
                setTimeout(function() {
                    this.playerWeapon.scale.y = 1;
                }.bind(this), 200);
            }
        },
        
        unlockWeapon: function(index) {
            if (index >= this.weapons.length) return;
            
            var weapon = this.weapons[index];
            this.showNotification("🎁 NOUVELLE ARME DÉBLOQUÉE!\n" + weapon.name, 4000);
            this.playSound('sfx-levelup');
            
            // Effet visuel
            this.createUnlockEffect();
        },
        
        reloadWeapon: function() {
            this.combatSystem.reloadWeapon();
        },
        
        toggleAim: function() {
            this.isAiming = !this.isAiming;
            
            if (this.isAiming) {
                // Zoom pour viser
                this.threeCamera.fov = 30;
                this.showMessage("Viseur activé", 1000);
            } else {
                // Retour normal
                this.threeCamera.fov = 75;
            }
            
            this.threeCamera.updateProjectionMatrix();
        },
        
        toggleCrouch: function() {
            this.isCrouching = !this.isCrouching;
            
            if (this.isCrouching) {
                this.playerModel.scale.y = 0.7;
                this.moveSpeed = 0.08;
                this.showMessage("Accroupi", 1000);
            } else {
                this.playerModel.scale.y = 1;
                this.moveSpeed = 0.15;
            }
        },
        
        toggleFlashlight: function() {
            this.flashlight = !this.flashlight;
            
            if (!this.flashlightLight) {
                // Créer la lumière de lampe torche
                this.flashlightLight = new THREE.SpotLight(0xffffff, 2, 50, Math.PI / 6, 0.5, 2);
                this.flashlightLight.position.set(0, 1.5, 0);
                this.playerModel.add(this.flashlightLight);
                
                // Cône de lumière visible (optionnel)
                var flashlightCone = new THREE.Mesh(
                    new THREE.ConeGeometry(5, 15, 8),
                    new THREE.MeshBasicMaterial({
                        color: 0xffffaa,
                        transparent: true,
                        opacity: 0.1,
                        side: THREE.BackSide
                    })
                );
                flashlightCone.position.z = -7.5;
                flashlightCone.rotation.x = Math.PI / 2;
                this.flashlightLight.add(flashlightCone);
            }
            
            this.flashlightLight.visible = this.flashlight;
            this.showMessage("🔦 Lampe torche " + (this.flashlight ? "allumée" : "éteinte"), 1500);
            this.playSound('sfx-select');
        },
        
        toggleMinimap: function() {
            var minimap = document.getElementById('minimap');
            if (minimap.style.display === 'block') {
                minimap.style.display = 'none';
            } else {
                minimap.style.display = 'block';
            }
        },
        
        addXP: function(amount) {
            this.state.xp += amount;
            
            // Montrer l'XP gagné
            this.createXPEffect(amount);
            
            // Monter de niveau
            if (this.state.xp >= this.state.xpToNext) {
                this.levelUp();
            }
            
            this.updateHUD();
        },
        
        levelUp: function() {
            this.state.level++;
            this.state.xp -= this.state.xpToNext;
            this.state.xpToNext = Math.floor(this.state.xpToNext * 1.5);
            
            // Améliorations
            this.state.maxHealth += 20;
            this.state.health = this.state.maxHealth;
            this.state.maxArmor += 10;
            this.state.armor = this.state.maxArmor;
            this.state.speed += 0.02;
            
            // Récompense
            this.state.money += 1000;
            
            var levelUpText = "⭐ NIVEAU " + this.state.level + " ATTEINT!\n\n";
            levelUpText += "+20 Santé max\n";
            levelUpText += "+10 Armure max\n";
            levelUpText += "+1000 FCFA\n";
            levelUpText += "Vitesse augmentée";
            
            this.showNotification(levelUpText, 5000);
            this.playSound('sfx-levelup');
            
            // Effet de niveau
            this.createLevelUpEffect();
            
            // Débloquer des armes
            this.checkWeaponUnlocks();
        },
        
        checkWeaponUnlocks: function() {
            for (var i = 0; i < this.weapons.length; i++) {
                if (this.state.level >= this.weapons[i].unlockLevel) {
                    // Arme débloquée
                    if (!this.weapons[i].unlocked) {
                        this.weapons[i].unlocked = true;
                        this.showMessage("Arme débloquée: " + this.weapons[i].name, 3000);
                    }
                }
            }
        },
        
        enemyDie: function(enemy, bullet) {
            enemy.userData.dead = true;
            enemy.visible = false;
            
            // Récompenses
            this.state.kills++;
            this.state.score += enemy.userData.points || 100;
            this.state.money += enemy.userData.money || 50;
            this.state.enemiesRemaining--;
            
            // Mettre à jour la quête
            if (this.questSystem.activeQuest && this.questSystem.questType === "kill") {
                this.questSystem.updateProgress(1);
            }
            
            // Ajouter XP
            this.addXP(50);
            
            // Drop d'objets
            if (enemy.userData.drops) {
                for (var i = 0; i < enemy.userData.drops.length; i++) {
                    this.createPickup(enemy.position, enemy.userData.drops[i]);
                }
            }
            
            // Effet de mort
            this.createDeathEffect(enemy.position);
            
            // Son
            this.playSound('sfx-hit');
            
            // Message
            var killText = "👹 " + enemy.userData.type + " éliminé!\n";
            killText += "+" + (enemy.userData.points || 100) + " points\n";
            killText += "+" + (enemy.userData.money || 50) + " FCFA";
            this.showMessage(killText, 2000);
            
            this.updateHUD();
            
            // Vérifier si tous les ennemis sont morts
            if (this.state.enemiesRemaining <= 0) {
                this.levelComplete();
            }
        },
        
        levelComplete: function() {
            this.showNotification(
                "🎉 NIVEAU COMPLÉTÉ!\n\n" +
                "Score: +1000\n" +
                "Argent: +2000 FCFA\n" +
                "XP: +200\n\n" +
                "Appuyez sur ECHAP pour continuer",
                0
            );
            
            this.state.score += 1000;
            this.state.money += 2000;
            this.addXP(200);
            
            // Musique de victoire
            this.playSound('sfx-levelup');
            
            // Effets visuels
            this.createVictoryEffect();
        },
        
        createPickup: function(position, type) {
            var pickupData = this.items.find(function(item) {
                return item.type === type;
            });
            
            if (!pickupData) return;
            
            var pickup;
            
            switch (type) {
                case "health":
                    pickup = this.createHealthPickup();
                    break;
                case "ammo":
                    pickup = this.createAmmoPickup();
                    break;
                case "money":
                    pickup = this.createMoneyPickup();
                    break;
                case "armor":
                    pickup = this.createArmorPickup();
                    break;
                default:
                    pickup = this.createGenericPickup();
            }
            
            if (pickup) {
                pickup.position.copy(position);
                pickup.position.y = 0.5;
                pickup.userData = pickupData;
                this.threeScene.add(pickup);
                this.pickupModels.push(pickup);
                
                // Animation d'apparition
                pickup.scale.set(0.1, 0.1, 0.1);
                this.animatePickupSpawn(pickup);
            }
        },
        
        animatePickupSpawn: function(pickup) {
            var startScale = 0.1;
            var targetScale = 1;
            var duration = 500;
            var startTime = Date.now();
            
            var animate = function() {
                var elapsed = Date.now() - startTime;
                var progress = Math.min(elapsed / duration, 1);
                
                // Animation de rebond
                var scale = startScale + (targetScale - startScale) * progress;
                var bounce = Math.sin(progress * Math.PI) * 0.3;
                pickup.scale.setScalar(scale + bounce);
                
                // Rotation
                pickup.rotation.y += 0.02;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    pickup.scale.setScalar(1);
                }
            };
            
            animate();
        },
        
        createHealthPickup: function() {
            var pickup = new THREE.Group();
            
            var geometry1 = new THREE.BoxGeometry(0.2, 0.8, 0.2);
            var geometry2 = new THREE.BoxGeometry(0.8, 0.2, 0.2);
            var material = new THREE.MeshStandardMaterial({
                color: 0xff0000,
                emissive: 0xff0000,
                emissiveIntensity: 0.5,
                metalness: 0.5,
                roughness: 0.2
            });
            
            var cross1 = new THREE.Mesh(geometry1, material);
            var cross2 = new THREE.Mesh(geometry2, material);
            
            pickup.add(cross1);
            pickup.add(cross2);
            
            // Animation de pulsation
            this.animatePulsating(pickup);
            
            return pickup;
        },
        
        createAmmoPickup: function() {
            var geometry = new THREE.BoxGeometry(0.6, 0.3, 0.3);
            var material = new THREE.MeshStandardMaterial({
                color: 0xfcd116,
                emissive: 0xfcd116,
                emissiveIntensity: 0.3,
                metalness: 0.7,
                roughness: 0.1
            });
            
            var pickup = new THREE.Mesh(geometry, material);
            this.animatePulsating(pickup);
            
            return pickup;
        },
        
        createMoneyPickup: function() {
            var geometry = new THREE.CylinderGeometry(0.4, 0.4, 0.1, 16);
            var material = new THREE.MeshStandardMaterial({
                color: 0xFFD700,
                emissive: 0xFFD700,
                emissiveIntensity: 0.4,
                metalness: 1.0,
                roughness: 0.1
            });
            
            var pickup = new THREE.Mesh(geometry, material);
            this.animatePulsating(pickup);
            
            return pickup;
        },
        
        createArmorPickup: function() {
            var geometry = new THREE.BoxGeometry(0.5, 0.8, 0.3);
            var material = new THREE.MeshStandardMaterial({
                color: 0x3a75c4,
                emissive: 0x3a75c4,
                emissiveIntensity: 0.3,
                metalness: 0.8,
                roughness: 0.2
            });
            
            var pickup = new THREE.Mesh(geometry, material);
            this.animatePulsating(pickup);
            
            return pickup;
        },
        
        createGenericPickup: function() {
            var geometry = new THREE.OctahedronGeometry(0.4);
            var material = new THREE.MeshStandardMaterial({
                color: 0x00ff00,
                emissive: 0x00ff00,
                emissiveIntensity: 0.5,
                metalness: 0.3,
                roughness: 0.2
            });
            
            var pickup = new THREE.Mesh(geometry, material);
            this.animatePulsating(pickup);
            
            return pickup;
        },
        
        animatePulsating: function(object) {
            var startScale = 1;
            var animate = function() {
                if (!object.parent) return; // Arrêter si supprimé
                
                var pulse = Math.sin(Date.now() * 0.002) * 0.1 + 1;
                object.scale.setScalar(pulse);
                object.rotation.y += 0.01;
                
                requestAnimationFrame(animate);
            };
            
            animate();
        },
        
        // ============================================
        // EFFETS VISUELS
        // ============================================
        createHitEffect: function(position, damage) {
            // Effet de particules pour les dégâts
            var particleCount = Math.min(damage * 2, 50);
            var particleGeometry = new THREE.SphereGeometry(0.05, 4, 4);
            var particleMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xff0000,
                transparent: true,
                opacity: 0.8
            });
            
            for (var i = 0; i < particleCount; i++) {
                var particle = new THREE.Mesh(particleGeometry, particleMaterial);
                particle.position.copy(position);
                particle.position.y += 1;
                
                var angle = Math.random() * Math.PI * 2;
                var speed = 0.5 + Math.random() * 0.5;
                particle.userData = {
                    velocity: new THREE.Vector3(
                        Math.cos(angle) * speed,
                        Math.random() * speed,
                        Math.sin(angle) * speed
                    ),
                    life: 1.0,
                    decay: 0.02 + Math.random() * 0.03
                };
                
                this.threeScene.add(particle);
                this.particles.push(particle);
            }
        },
        
        createDeathEffect: function(position) {
            // Effet d'explosion pour la mort
            var particleCount = 100;
            var particleGeometry = new THREE.SphereGeometry(0.1, 6, 6);
            
            for (var i = 0; i < particleCount; i++) {
                var material = new THREE.MeshBasicMaterial({
                    color: Math.random() > 0.5 ? 0xff0000 : 0x8B0000,
                    transparent: true,
                    opacity: 0.8
                });
                
                var particle = new THREE.Mesh(particleGeometry, material);
                particle.position.copy(position);
                
                var angle = Math.random() * Math.PI * 2;
                var speed = 1 + Math.random() * 2;
                particle.userData = {
                    velocity: new THREE.Vector3(
                        Math.cos(angle) * speed,
                        Math.random() * speed * 2,
                        Math.sin(angle) * speed
                    ),
                    life: 1.0,
                    decay: 0.01 + Math.random() * 0.02
                };
                
                this.threeScene.add(particle);
                this.particles.push(particle);
            }
        },
        
        createPickupEffect: function(position) {
            // Effet de ramassage
            var ringGeometry = new THREE.RingGeometry(0.5, 1, 16);
            var ringMaterial = new THREE.MeshBasicMaterial({
                color: 0x00ff00,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.7
            });
            
            var ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.position.copy(position);
            ring.position.y = 0.1;
            ring.rotation.x = Math.PI / 2;
            this.threeScene.add(ring);
            
            // Animation
            var startTime = Date.now();
            var animateRing = function() {
                var elapsed = Date.now() - startTime;
                if (elapsed < 1000) {
                    ring.scale.y = 1 + elapsed / 500;
                    ring.material.opacity = 0.7 * (1 - elapsed / 1000);
                    requestAnimationFrame(animateRing);
                } else {
                    this.threeScene.remove(ring);
                }
            }.bind(this);
            
            animateRing();
        },
        
        createHealEffect: function() {
            // Effet de soin autour du joueur
            var particleCount = 30;
            var particleGeometry = new THREE.SphereGeometry(0.1, 6, 6);
            var particleMaterial = new THREE.MeshBasicMaterial({
                color: 0x00ff00,
                transparent: true,
                opacity: 0.6
            });
            
            for (var i = 0; i < particleCount; i++) {
                var particle = new THREE.Mesh(particleGeometry, particleMaterial);
                particle.position.copy(this.playerModel.position);
                particle.position.y += 0.5;
                
                var angle = Math.random() * Math.PI * 2;
                var radius = Math.random() * 2;
                var height = Math.random() * 3;
                
                particle.userData = {
                    startPosition: new THREE.Vector3(
                        Math.cos(angle) * radius,
                        height,
                        Math.sin(angle) * radius
                    ),
                    time: 0,
                    speed: 0.02 + Math.random() * 0.03
                };
                
                this.threeScene.add(particle);
                this.particles.push(particle);
            }
        },
        
        createJumpEffect: function() {
            // Effet de poussière lors du saut
            var particleCount = 20;
            var particleGeometry = new THREE.SphereGeometry(0.05, 4, 4);
            var particleMaterial = new THREE.MeshBasicMaterial({
                color: 0x8B4513,
                transparent: true,
                opacity: 0.7
            });
            
            for (var i = 0; i < particleCount; i++) {
                var particle = new THREE.Mesh(particleGeometry, particleMaterial);
                particle.position.copy(this.playerModel.position);
                particle.position.y = 0.1;
                
                var angle = Math.random() * Math.PI * 2;
                var speed = 0.1 + Math.random() * 0.2;
                particle.userData = {
                    velocity: new THREE.Vector3(
                        Math.cos(angle) * speed,
                        Math.random() * 0.1,
                        Math.sin(angle) * speed
                    ),
                    life: 1.0,
                    decay: 0.03 + Math.random() * 0.02
                };
                
                this.threeScene.add(particle);
                this.particles.push(particle);
            }
        },
        
        createXPEffect: function(amount) {
            // Effet visuel pour XP gagné
            var text = "+" + amount + " XP";
            this.createFloatingText(this.playerModel.position, text, 0x00ff00);
        },
        
        createDamageIndicator: function(position, damage) {
            // Texte flottant pour les dégâts
            var text = "-" + damage;
            this.createFloatingText(position, text, 0xff0000);
        },
        
        createFloatingText: function(position, text, color) {
            // Créer un élément DOM pour le texte flottant
            var floatingText = document.createElement('div');
            floatingText.style.position = 'absolute';
            floatingText.style.color = '#' + color.toString(16).padStart(6, '0');
            floatingText.style.fontSize = '24px';
            floatingText.style.fontWeight = 'bold';
            floatingText.style.textShadow = '0 0 5px black';
            floatingText.style.whiteSpace = 'nowrap';
            floatingText.style.pointerEvents = 'none';
            floatingText.textContent = text;
            document.body.appendChild(floatingText);
            
            // Position initiale
            var startX = position.x;
            var startY = position.y + 2;
            var startZ = position.z;
            
            // Convertir en coordonnées écran
            var vector = new THREE.Vector3(startX, startY, startZ);
            vector.project(this.threeCamera);
            
            var windowWidth = window.innerWidth;
            var windowHeight = window.innerHeight;
            
            floatingText.style.left = (windowWidth * (vector.x + 1) / 2 - 50) + 'px';
            floatingText.style.top = (windowHeight * (1 - vector.y) / 2 - 50) + 'px';
            
            // Animation
            var startTime = Date.now();
            var duration = 1500;
            
            var animate = function() {
                var elapsed = Date.now() - startTime;
                if (elapsed < duration) {
                    var progress = elapsed / duration;
                    
                    // Monter
                    var newY = startY + progress * 5;
                    vector.y = newY;
                    vector.project(this.threeCamera);
                    
                    floatingText.style.left = (windowWidth * (vector.x + 1) / 2 - 50) + 'px';
                    floatingText.style.top = (windowHeight * (1 - vector.y) / 2 - 50) + 'px';
                    
                    // Fondu
                    floatingText.style.opacity = 1 - progress;
                    
                    requestAnimationFrame(animate.bind(this));
                } else {
                    document.body.removeChild(floatingText);
                }
            }.bind(this);
            
            animate();
        },
        
        createBulletTrail: function(bullet) {
            // Créer une traînée pour les balles
            var trailGeometry = new THREE.SphereGeometry(0.02, 4, 4);
            var trailMaterial = new THREE.MeshBasicMaterial({
                color: bullet.userData.weaponType === "rifle" ? 0xFFD700 : 0xFCD116,
                transparent: true,
                opacity: 0.3
            });
            
            var trail = new THREE.Mesh(trailGeometry, trailMaterial);
            trail.position.copy(bullet.position);
            this.threeScene.add(trail);
            
            // Disparaître rapidement
            setTimeout(function() {
                this.threeScene.remove(trail);
            }.bind(this), 100);
        },
        
        createProgressEffect: function() {
            // Effet lors de la progression d'une quête
            var particleCount = 10;
            var particleGeometry = new THREE.SphereGeometry(0.05, 4, 4);
            var particleMaterial = new THREE.MeshBasicMaterial({
                color: 0x00ff00,
                transparent: true,
                opacity: 0.8
            });
            
            for (var i = 0; i < particleCount; i++) {
                var particle = new THREE.Mesh(particleGeometry, particleMaterial);
                particle.position.copy(this.playerModel.position);
                particle.position.y += 2;
                
                var angle = Math.random() * Math.PI * 2;
                var speed = 0.2 + Math.random() * 0.3;
                particle.userData = {
                    velocity: new THREE.Vector3(
                        Math.cos(angle) * speed,
                        Math.random() * speed,
                        Math.sin(angle) * speed
                    ),
                    life: 1.0,
                    decay: 0.05
                };
                
                this.threeScene.add(particle);
                this.particles.push(particle);
            }
        },
        
        createRewardEffect: function() {
            // Effet de récompense
            var particleCount = 50;
            var colors = [0xFFD700, 0xFCD116, 0xFFFFFF, 0x00FF00];
            
            for (var i = 0; i < particleCount; i++) {
                var geometry = new THREE.SphereGeometry(0.1, 6, 6);
                var material = new THREE.MeshBasicMaterial({
                    color: colors[Math.floor(Math.random() * colors.length)],
                    transparent: true,
                    opacity: 0.8
                });
                
                var particle = new THREE.Mesh(geometry, material);
                particle.position.copy(this.playerModel.position);
                particle.position.y += 1;
                
                var angle = Math.random() * Math.PI * 2;
                var speed = 0.5 + Math.random() * 1;
                particle.userData = {
                    velocity: new THREE.Vector3(
                        Math.cos(angle) * speed,
                        Math.random() * speed * 2,
                        Math.sin(angle) * speed
                    ),
                    life: 1.0,
                    decay: 0.02 + Math.random() * 0.03
                };
                
                this.threeScene.add(particle);
                this.particles.push(particle);
            }
        },
        
        createLevelUpEffect: function() {
            // Effet de montée de niveau
            var rings = 5;
            var ringGeometry = new THREE.RingGeometry(1, 3, 32);
            
            for (var i = 0; i < rings; i++) {
                var ringMaterial = new THREE.MeshBasicMaterial({
                    color: 0x00FF00,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.7
                });
                
                var ring = new THREE.Mesh(ringGeometry, ringMaterial);
                ring.position.copy(this.playerModel.position);
                ring.position.y = 0.1;
                ring.rotation.x = Math.PI / 2;
                ring.userData = {
                    startTime: Date.now() + i * 200,
                    scale: 1
                };
                
                this.threeScene.add(ring);
                
                // Animation
                setTimeout(function(ring) {
                    var startTime = Date.now();
                    var animate = function() {
                        var elapsed = Date.now() - startTime;
                        if (elapsed < 1000) {
                            ring.scale.setScalar(1 + elapsed / 200);
                            ring.material.opacity = 0.7 * (1 - elapsed / 1000);
                            requestAnimationFrame(animate);
                        } else {
                            this.threeScene.remove(ring);
                        }
                    }.bind(this);
                    animate();
                }.bind(this, ring), i * 200);
            }
        },
        
        createUnlockEffect: function() {
            // Effet de déblocage
            var particles = 100;
            for (var i = 0; i < particles; i++) {
                var geometry = new THREE.SphereGeometry(0.05, 4, 4);
                var material = new THREE.MeshBasicMaterial({
                    color: 0xFFD700,
                    transparent: true,
                    opacity: 0.8
                });
                
                var particle = new THREE.Mesh(geometry, material);
                particle.position.copy(this.playerModel.position);
                
                var phi = Math.acos(-1 + (2 * i) / particles);
                var theta = Math.sqrt(particles * Math.PI) * phi;
                
                particle.userData = {
                    position: new THREE.Vector3(
                        Math.cos(theta) * Math.sin(phi),
                        Math.sin(theta) * Math.sin(phi),
                        Math.cos(phi)
                    ).multiplyScalar(2),
                    time: 0
                };
                
                this.threeScene.add(particle);
                this.particles.push(particle);
            }
        },
        
        createVictoryEffect: function() {
            // Effet de victoire
            var fireworks = 10;
            
            for (var f = 0; f < fireworks; f++) {
                setTimeout(function() {
                    var fireworkPosition = new THREE.Vector3(
                        (Math.random() - 0.5) * 50,
                        Math.random() * 30 + 10,
                        (Math.random() - 0.5) * 50
                    );
                    
                    this.createFirework(fireworkPosition);
                }.bind(this), f * 300);
            }
        },
        
        createFirework: function(position) {
            var particles = 50;
            var colors = [
                0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00,
                0xFF00FF, 0x00FFFF, 0xFFFFFF, 0xFCD116
            ];
            
            for (var i = 0; i < particles; i++) {
                var geometry = new THREE.SphereGeometry(0.1, 6, 6);
                var material = new THREE.MeshBasicMaterial({
                    color: colors[Math.floor(Math.random() * colors.length)],
                    transparent: true,
                    opacity: 0.8
                });
                
                var particle = new THREE.Mesh(geometry, material);
                particle.position.copy(position);
                
                var angle = Math.random() * Math.PI * 2;
                var speed = 2 + Math.random() * 3;
                particle.userData = {
                    velocity: new THREE.Vector3(
                        Math.cos(angle) * speed,
                        Math.random() * speed,
                        Math.sin(angle) * speed
                    ),
                    life: 1.0,
                    decay: 0.01 + Math.random() * 0.02
                };
                
                this.threeScene.add(particle);
                this.particles.push(particle);
            }
            
            // Son de feu d'artifice
            this.playSound('sfx-select');
        },
        
        createSpawnEffect: function() {
            // Effet d'apparition déjà implémenté dans animatePlayerSpawn
        },
        
        // ============================================
        // MISE À JOUR DU JEU
        // ============================================
        updatePlayerMovement: function() {
            if (!this.gameStarted || this.gamePaused) return;
            
            var direction = new THREE.Vector3(0, 0, 0);
            var speed = this.isSprinting ? this.sprintSpeed : this.moveSpeed;
            
            // Contrôles selon la plateforme
            if (!this.isMobile) {
                if (this.keys['z'] || this.keys['w']) direction.z -= 1;
                if (this.keys['s']) direction.z += 1;
                if (this.keys['q'] || this.keys['a']) direction.x -= 1;
                if (this.keys['d']) direction.x += 1;
            } else {
                direction.x = this.joystickVector.x;
                direction.z = -this.joystickVector.y;
            }
            
            // Normaliser le vecteur de direction
            if (direction.length() > 0) {
                direction.normalize();
                
                // Appliquer la rotation de la caméra
                var angle = this.threeCamera.rotation.y;
                var cos = Math.cos(angle);
                var sin = Math.sin(angle);
                
                var tempX = direction.x;
                var tempZ = direction.z;
                
                direction.x = tempX * cos - tempZ * sin;
                direction.z = tempX * sin + tempZ * cos;
                
                // Appliquer la vitesse
                direction.multiplyScalar(speed);
                
                // Animation de marche
                this.cameraBob += this.cameraBobSpeed;
                if (this.cameraBob > Math.PI * 2) {
                    this.cameraBob -= Math.PI * 2;
                }
            }
            
            // Gravité
            this.velocity.y -= this.gravity;
            this.velocity.y = Math.max(this.velocity.y, -1.0);
            
            // Calculer la nouvelle position
            var newPos = this.playerModel.position.clone().add(direction).add(this.velocity);
            
            // Collision avec le sol
            if (newPos.y <= 5) { // Hauteur du sol
                newPos.y = 5;
                this.velocity.y = 0;
                this.isOnGround = true;
            } else {
                this.isOnGround = false;
            }
            
            // Limites de la carte
            var mapSize = 400;
            newPos.x = this.clamp(newPos.x, -mapSize, mapSize);
            newPos.z = this.clamp(newPos.z, -mapSize, mapSize);
            
            // Appliquer la nouvelle position
            this.playerModel.position.copy(newPos);
            
            // Mettre à jour la caméra
            this.updateCamera();
            
            // Animation de la tête selon le mouvement
            if (direction.length() > 0 && this.isOnGround) {
                var bobAmount = Math.sin(this.cameraBob) * this.cameraBobAmount;
                this.threeCamera.position.y += bobAmount;
            }
        },
        
        updateCamera: function() {
            if (!this.playerModel || !this.threeCamera) return;
            
            // Position de la caméra derrière le joueur
            var cameraDistance = 8;
            var cameraHeight = 5;
            
            if (this.isAiming) {
                cameraDistance = 2;
                cameraHeight = 1.5;
            } else if (this.isCrouching) {
                cameraHeight = 3;
            }
            
            // Calculer la position de la caméra
            var cameraOffset = new THREE.Vector3(0, cameraHeight, cameraDistance);
            cameraOffset.applyQuaternion(this.playerModel.quaternion);
            
            this.threeCamera.position.copy(this.playerModel.position).add(cameraOffset);
            
            // Regarder légèrement au-dessus du joueur
            var lookAtTarget = this.playerModel.position.clone();
            lookAtTarget.y += 1.5;
            this.threeCamera.lookAt(lookAtTarget);
        },
        
        updateEnemies: function() {
            for (var i = 0; i < this.enemyModels.length; i++) {
                var enemy = this.enemyModels[i];
                if (!enemy.userData || enemy.userData.dead) continue;
                
                // Distance au joueur
                var distance = this.distance3D(this.playerModel.position, enemy.position);
                
                // Comportement selon la distance
                if (distance < 50) {
                    // Poursuite
                    var direction = new THREE.Vector3()
                        .subVectors(this.playerModel.position, enemy.position)
                        .normalize();
                    
                    // Vitesse selon le type d'ennemi
                    var speed = enemy.userData.speed || 0.03;
                    direction.multiplyScalar(speed);
                    
                    enemy.position.add(direction);
                    
                    // Rotation vers le joueur
                    enemy.lookAt(this.playerModel.position);
                    
                    // Attaque si assez proche
                    if (distance < 3) {
                        var now = Date.now();
                        if (now - (enemy.userData.lastAttack || 0) > 1000) {
                            this.takeDamage(enemy.userData.damage || 10);
                            enemy.userData.lastAttack = now;
                            
                            // Animation d'attaque
                            this.createEnemyAttackEffect(enemy);
                        }
                    }
                }
                
                // Animation de respiration
                var breathe = Math.sin(Date.now() * 0.002 + i) * 0.02;
                enemy.position.y = 5 + breathe;
            }
        },
        
        createEnemyAttackEffect: function(enemy) {
            // Effet visuel d'attaque ennemie
            var effectGeometry = new THREE.SphereGeometry(0.3, 8, 8);
            var effectMaterial = new THREE.MeshBasicMaterial({
                color: 0xff0000,
                transparent: true,
                opacity: 0.6
            });
            
            var effect = new THREE.Mesh(effectGeometry, effectMaterial);
            effect.position.copy(enemy.position);
            effect.position.y += 1;
            this.threeScene.add(effect);
            
            // Animation
            var startTime = Date.now();
            var animate = function() {
                var elapsed = Date.now() - startTime;
                if (elapsed < 500) {
                    effect.scale.setScalar(1 + elapsed / 250);
                    effect.material.opacity = 0.6 * (1 - elapsed / 500);
                    requestAnimationFrame(animate);
                } else {
                    this.threeScene.remove(effect);
                }
            }.bind(this);
            
            animate();
        },
        
        updatePickups: function() {
            for (var i = this.pickupModels.length - 1; i >= 0; i--) {
                var pickup = this.pickupModels[i];
                if (!pickup) continue;
                
                // Rotation
                pickup.rotation.y += 0.01;
                
                // Flottement
                pickup.position.y = 0.5 + Math.sin(Date.now() * 0.002 + i) * 0.2;
                
                // Collision avec le joueur
                var distance = this.distance3D(this.playerModel.position, pickup.position);
                if (distance < 2) {
                    this.pickupItem(pickup);
                }
            }
        },
        
        updateParticles: function() {
            for (var i = this.particles.length - 1; i >= 0; i--) {
                var particle = this.particles[i];
                if (!particle) continue;
                
                if (particle.userData.velocity) {
                    // Mouvement
                    particle.position.add(particle.userData.velocity);
                    
                    // Réduction de vie
                    particle.userData.life -= particle.userData.decay || 0.02;
                    particle.material.opacity = particle.userData.life * 0.8;
                    
                    // Suppression
                    if (particle.userData.life <= 0) {
                        this.threeScene.remove(particle);
                        this.particles.splice(i, 1);
                    }
                } else if (particle.userData.startPosition) {
                    // Animation spéciale (pour les effets de soin)
                    particle.userData.time += particle.userData.speed;
                    var progress = particle.userData.time;
                    
                    if (progress < 1) {
                        var currentPos = particle.userData.startPosition.clone()
                            .multiplyScalar(1 - progress);
                        particle.position.copy(this.playerModel.position)
                            .add(currentPos);
                        particle.material.opacity = 0.6 * (1 - progress);
                    } else {
                        this.threeScene.remove(particle);
                        this.particles.splice(i, 1);
                    }
                } else if (particle.userData.position) {
                    // Animation de déblocage
                    particle.userData.time += 0.02;
                    var time = particle.userData.time;
                    
                    if (time < 1) {
                        particle.position.copy(this.playerModel.position)
                            .add(particle.userData.position.clone().multiplyScalar(time * 2));
                        particle.material.opacity = 0.8 * (1 - time);
                    } else {
                        this.threeScene.remove(particle);
                        this.particles.splice(i, 1);
                    }
                }
            }
        },
        
        checkBulletCollision: function(bullet, index) {
            // Ennemis
            for (var i = 0; i < this.enemyModels.length; i++) {
                var enemy = this.enemyModels[i];
                if (!enemy.userData || enemy.userData.dead) continue;
                
                var distance = bullet.position.distanceTo(enemy.position);
                if (distance < 1) {
                    this.combatSystem.damageEnemy(enemy, bullet.userData.damage, bullet);
                    
                    // Effet d'impact
                    this.createBulletImpactEffect(bullet.position);
                    
                    return true;
                }
            }
            
            // Bâtiments et environnement
            for (var j = 0; j < this.buildingModels.length; j++) {
                var building = this.buildingModels[j];
                var distance = bullet.position.distanceTo(building.position);
                
                if (distance < 5) {
                    // Vérifier plus précisément (simplifié)
                    var buildingSize = 10; // Approximation
                    if (distance < buildingSize) {
                        this.createBulletImpactEffect(bullet.position);
                        return true;
                    }
                }
            }
            
            // Limite de distance
            if (bullet.position.distanceTo(this.playerModel.position) > 300) {
                return true;
            }
            
            return false;
        },
        
        createBulletImpactEffect: function(position) {
            // Effet d'impact de balle
            var impactGeometry = new THREE.SphereGeometry(0.2, 8, 8);
            var impactMaterial = new THREE.MeshBasicMaterial({
                color: 0xFFAA00,
                transparent: true,
                opacity: 0.8
            });
            
            var impact = new THREE.Mesh(impactGeometry, impactMaterial);
            impact.position.copy(position);
            this.threeScene.add(impact);
            
            // Animation
            var startTime = Date.now();
            var animate = function() {
                var elapsed = Date.now() - startTime;
                if (elapsed < 200) {
                    impact.scale.setScalar(1 + elapsed / 100);
                    impact.material.opacity = 0.8 * (1 - elapsed / 200);
                    requestAnimationFrame(animate);
                } else {
                    this.threeScene.remove(impact);
                }
            }.bind(this);
            
            animate();
        },
        
        takeDamage: function(amount) {
            if (this.gamePaused || !this.gameStarted) return;
            
            // Réduire d'abord l'armure
            var damageToArmor = Math.min(this.state.armor, amount * 0.5);
            var damageToHealth = amount - damageToArmor;
            
            this.state.armor -= damageToArmor;
            this.state.health -= damageToHealth;
            
            // Message
            var damageText = "💥 Vous avez été touché!\n";
            if (damageToArmor > 0) {
                damageText += "Armure: -" + damageToArmor + "\n";
            }
            if (damageToHealth > 0) {
                damageText += "Santé: -" + damageToHealth;
            }
            this.showMessage(damageText, 1500);
            
            // Son
            this.playSound('sfx-hurt');
            
            // Effet d'écran rouge
            this.createDamageScreenEffect();
            
            // Clignotement du joueur
            this.playerBody.material.emissive.setHex(0xff0000);
            setTimeout(function() {
                if (this.playerBody) {
                    this.playerBody.material.emissive.setHex(0x003311);
                }
            }.bind(this), 100);
            
            // Vérifier la mort
            if (this.state.health <= 0) {
                this.gameOver();
            }
            
            this.updateHUD();
            
            // Vibration sur mobile
            if (this.isMobile && navigator.vibrate) {
                navigator.vibrate(200);
            }
        },
        
        createDamageScreenEffect: function() {
            // Effet d'écran rouge lors des dégâts
            var overlay = document.createElement('div');
            overlay.style.position = 'absolute';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
            overlay.style.pointerEvents = 'none';
            overlay.style.zIndex = '999';
            overlay.style.transition = 'opacity 0.3s';
            document.body.appendChild(overlay);
            
            // Disparaître progressivement
            setTimeout(function() {
                overlay.style.opacity = '0';
                setTimeout(function() {
                    document.body.removeChild(overlay);
                }, 300);
            }, 100);
        },
        
        // ============================================
        // INTERFACE UTILISATEUR
        // ============================================
        updateHUD: function() {
            // Mettre à jour tous les éléments du HUD
            
            // Santé et armure
            var healthPercent = (this.state.health / this.state.maxHealth) * 100;
            var armorPercent = (this.state.armor / this.state.maxArmor) * 100;
            
            document.getElementById('health-text').textContent = 
                Math.round(this.state.health) + "/" + this.state.maxHealth;
            document.getElementById('health-bar').style.width = healthPercent + "%";
            
            document.getElementById('armor-text').textContent = 
                Math.round(this.state.armor) + "/" + this.state.maxArmor;
            document.getElementById('armor-bar').style.width = armorPercent + "%";
            
            // XP et niveau
            var xpPercent = (this.state.xp / this.state.xpToNext) * 100;
            document.getElementById('xp-text').textContent = 
                this.state.xp + "/" + this.state.xpToNext;
            document.getElementById('xp-bar').style.width = xpPercent + "%";
            document.getElementById('level-text').textContent = this.state.level;
            
            // Munitions
            var weapon = this.weapons[this.state.currentWeapon];
            var ammoPercent = (weapon.ammo / weapon.maxAmmo) * 100;
            
            document.getElementById('ammo-text').textContent = 
                weapon.ammo + "/" + weapon.maxAmmo;
            document.getElementById('ammo-bar').style.width = ammoPercent + "%";
            document.getElementById('weapon-text').textContent = weapon.name;
            document.getElementById('weapon-damage').textContent = weapon.damage;
            
            // Statistiques
            document.getElementById('enemy-count').textContent = this.state.enemiesRemaining;
            document.getElementById('score').textContent = this.state.score;
            document.getElementById('money').textContent = this.state.money.toLocaleString('fr-FR');
            document.getElementById('day-text').textContent = this.state.day;
            
            // Localisation
            var city = this.cities[this.currentCity];
            var district = city.districts[this.currentDistrict];
            document.getElementById('location-text').textContent = city.name + ", " + district;
            
            // Quête active
            var questElement = document.getElementById('quest-indicator');
            if (this.questSystem.activeQuest) {
                questElement.style.display = 'block';
                document.getElementById('quest-text').textContent = this.questSystem.activeQuest;
                
                var progress = (this.questSystem.questProgress / this.questSystem.questTarget) * 100;
                document.getElementById('quest-progress').style.width = progress + "%";
                document.getElementById('quest-progress-text').textContent = 
                    this.questSystem.questProgress + "/" + this.questSystem.questTarget;
                document.getElementById('quest-reward').textContent = this.questSystem.questReward;
            } else {
                questElement.style.display = 'none';
            }
            
            // Écran de pause
            document.getElementById('pause-time').textContent = this.formatTime(this.gameTime);
            document.getElementById('pause-score').textContent = this.state.score;
            document.getElementById('pause-kills').textContent = this.state.kills;
        },
        
        updateInventoryDisplay: function() {
            var container = document.getElementById('inventory-items');
            if (!container) return;
            
            container.innerHTML = '';
            
            // Afficher chaque objet
            for (var i = 0; i < this.inventorySystem.items.length; i++) {
                var item = this.inventorySystem.items[i];
                var itemDiv = document.createElement('div');
                itemDiv.className = 'inventory-item';
                itemDiv.dataset.index = i;
                
                itemDiv.innerHTML = `
                    <div class="item-icon">${item.icon || '📦'}</div>
                    <div style="font-weight: bold; margin-bottom: 5px;">${item.name}</div>
                    <div style="font-size: 0.9rem; opacity: 0.8;">${item.description || ''}</div>
                    <div style="margin-top: 10px; font-size: 0.8rem;">
                        Poids: ${item.weight}kg
                        ${item.value ? ' | Valeur: ' + item.value : ''}
                    </div>
                    <div style="margin-top: 10px; display: flex; gap: 5px;">
                        <button onclick="Game.useInventoryItem(${i})" style="flex: 1; padding: 5px; background: #009e60; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            Utiliser
                        </button>
                        <button onclick="Game.dropInventoryItem(${i})" style="flex: 1; padding: 5px; background: #ff4444; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            Jeter
                        </button>
                    </div>
                `;
                
                container.appendChild(itemDiv);
            }
            
            // Statistiques de l'inventaire
            document.getElementById('inv-level').textContent = this.state.level;
            document.getElementById('inv-xp').textContent = this.state.xp + "/" + this.state.xpToNext;
            document.getElementById('inv-health').textContent = Math.round(this.state.health) + "/" + this.state.maxHealth;
            document.getElementById('inv-armor').textContent = Math.round(this.state.armor) + "/" + this.state.maxArmor;
            document.getElementById('inv-kills').textContent = this.state.kills;
            document.getElementById('inv-score').textContent = this.state.score;
            document.getElementById('inv-money').textContent = this.state.money.toLocaleString('fr-FR');
            document.getElementById('inv-time').textContent = this.formatTime(this.gameTime);
            document.getElementById('inv-quests').textContent = this.completedQuests.length;
            document.getElementById('inv-quests-total').textContent = this.npcs.length;
            document.getElementById('inv-weight').textContent = Math.round(this.state.weight);
            document.getElementById('inv-max-weight').textContent = this.state.maxWeight;
        },
        
        showMessage: function(text, duration) {
            if (duration === 0) {
                // Message persistant
                document.getElementById('message-text').textContent = text;
                document.getElementById('message-box').style.display = 'block';
                return;
            }
            
            var messageBox = document.getElementById('message-box');
            var messageText = document.getElementById('message-text');
            
            if (messageBox && messageText) {
                messageText.textContent = text;
                messageBox.style.display = 'block';
                
                if (duration > 0) {
                    setTimeout(function() {
                        messageBox.style.display = 'none';
                    }, duration);
                }
            }
            
            console.log("Message:", text);
        },
        
        showNotification: function(text, duration) {
            var notification = document.getElementById('notification');
            var notificationText = document.getElementById('notification-text');
            
            if (notification && notificationText) {
                notificationText.textContent = text;
                notification.style.display = 'block';
                
                setTimeout(function() {
                    notification.style.display = 'none';
                }, duration);
            }
        },
        
        toggleInventory: function() {
            var panel = document.getElementById('inventory-panel');
            if (panel.style.display === 'block') {
                panel.style.display = 'none';
                this.gamePaused = false;
                document.body.requestPointerLock();
            } else {
                panel.style.display = 'block';
                this.gamePaused = true;
                document.exitPointerLock();
                this.updateInventoryDisplay();
            }
            this.playSound('sfx-select');
        },
        
        sortInventory: function() {
            this.inventorySystem.sortItems();
        },
        
        useInventoryItem: function(index) {
            this.inventorySystem.useItem(index);
        },
        
        dropInventoryItem: function(index) {
            var item = this.inventorySystem.removeItem(index);
            if (item) {
                // Créer l'objet dans le monde
                this.createPickup(this.playerModel.position, item.type);
            }
        },
        
        togglePause: function() {
            this.gamePaused = !this.gamePaused;
            var pauseScreen = document.getElementById('pause-screen');
            
            if (this.gamePaused) {
                pauseScreen.style.display = 'flex';
                document.exitPointerLock();
                this.updateHUD(); // Mettre à jour les stats dans le menu pause
            } else {
                pauseScreen.style.display = 'none';
                if (this.gameStarted) {
                    document.body.requestPointerLock();
                }
            }
            this.playSound('sfx-click');
        },
        
        showSettings: function() {
            document.getElementById('settings-screen').style.display = 'flex';
            this.gamePaused = true;
            document.exitPointerLock();
        },
        
        hideSettings: function() {
            document.getElementById('settings-screen').style.display = 'none';
            if (this.gameStarted) {
                this.gamePaused = false;
                document.body.requestPointerLock();
            }
        },
        
        applySettings: function() {
            this.setVolume(document.getElementById('volume-slider').value / 100);
            this.mouseSensitivity = document.getElementById('mouse-sensitivity').value;
            this.applyGraphicsQuality(document.getElementById('graphics-quality').value);
            
            this.showMessage("Paramètres appliqués", 1500);
            this.saveGame(); // Sauvegarder les paramètres
        },
        
        resetSettings: function() {
            document.getElementById('volume-slider').value = 70;
            document.getElementById('mouse-sensitivity').value = 5;
            document.getElementById('graphics-quality').value = 'medium';
            
            document.getElementById('settings-volume-text').textContent = "70%";
            document.getElementById('volume-text').textContent = "70%";
            
            this.setVolume(0.7);
            this.mouseSensitivity = 5;
            this.applyGraphicsQuality('medium');
            
            this.showMessage("Paramètres réinitialisés", 1500);
        },
        
        applyGraphicsQuality: function(quality) {
            if (!this.threeRenderer) return;
            
            switch (quality) {
                case 'low':
                    this.threeRenderer.setPixelRatio(1);
                    this.threeRenderer.shadowMap.enabled = false;
                    this.threeRenderer.antialias = false;
                    break;
                case 'medium':
                    this.threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
                    this.threeRenderer.shadowMap.enabled = true;
                    this.threeRenderer.antialias = true;
                    break;
                case 'high':
                    this.threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                    this.threeRenderer.shadowMap.enabled = true;
                    this.threeRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
                    this.threeRenderer.antialias = true;
                    break;
                case 'ultra':
                    this.threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 3));
                    this.threeRenderer.shadowMap.enabled = true;
                    this.threeRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
                    this.threeRenderer.antialias = true;
                    this.threeRenderer.toneMappingExposure = 1.2;
                    break;
            }
        },
        
        // ============================================
        // GESTION DES SCÈNES
        // ============================================
        stageStartScreen: function() {
            this.gameStarted = false;
            this.gamePaused = false;
            
            document.getElementById('start-screen').style.display = 'flex';
            document.getElementById('game-container').style.display = 'none';
            document.getElementById('pause-screen').style.display = 'none';
            document.getElementById('settings-screen').style.display = 'none';
            
            this.playMusic('music-main');
            document.exitPointerLock();
            
            // Réinitialiser la caméra
            if (this.threeCamera) {
                this.threeCamera.position.set(0, 10, 15);
                this.threeCamera.rotation.set(0, 0, 0);
            }
            
            console.log("📺 Écran de démarrage activé");
        },
        
        stageLevel: function(levelNumber) {
            if (levelNumber === undefined) levelNumber = 1;
            
            this.gameStarted = true;
            this.gamePaused = false;
            this.state.currentLevel = levelNumber;
            
            // Cacher les écrans
            document.getElementById('start-screen').style.display = 'none';
            document.getElementById('game-container').style.display = 'block';
            document.getElementById('pause-screen').style.display = 'none';
            document.getElementById('settings-screen').style.display = 'none';
            
            // Réinitialiser l'état
            this.stateReset();
            
            // Charger l'environnement
            this.loadEnvironment(levelNumber);
            
            // Musique
            var cityIndex = Math.min(Math.floor((levelNumber - 1) / 2), this.cities.length - 1);
            this.playMusic(this.cities[cityIndex].music);
            
            // Message de bienvenue
            var city = this.cities[cityIndex];
            var district = city.districts[this.currentDistrict];
            this.showMessage(
                "🇬🇦 BIENVENUE À " + district.toUpperCase() + "!\n" +
                city.name + " - " + city.description + "\n\n" +
                "Protégez les habitants des bandits!",
                5000
            );
            
            // Créer les ennemis
            this.createEnemiesForLevel(levelNumber);
            
            // Créer les PNJ
            this.createNPCsForLevel(levelNumber);
            
            // Créer les bâtiments
            this.createBuildingsForLevel(levelNumber);
            
            // Pointer lock pour FPS
            if (!this.isMobile) {
                setTimeout(function() {
                    document.body.requestPointerLock();
                }, 1000);
            }
            
            console.log("🎮 Niveau " + levelNumber + " démarré");
        },
        
        stateReset: function() {
            // Réinitialiser les statistiques (sauf niveau, XP, score, argent)
            this.state.health = this.state.maxHealth;
            this.state.armor = this.state.maxArmor;
            this.state.enemiesRemaining = 5 + (this.state.currentLevel * 3);
            this.state.hasKey = false;
            this.questSystem.activeQuest = null;
            this.questSystem.questProgress = 0;
            
            // Réinitialiser les armes
            for (var i = 0; i < this.weapons.length; i++) {
                this.weapons[i].ammo = this.weapons[i].maxAmmo;
            }
            
            // Réinitialiser l'inventaire (garder les objets importants)
            var importantItems = this.inventorySystem.items.filter(function(item) {
                return item.type === "key" || item.type === "special";
            });
            this.inventorySystem.items = importantItems;
            
            // Réinitialiser le poids
            this.state.weight = importantItems.reduce(function(total, item) {
                return total + (item.weight || 1);
            }, 0);
            
            this.updateHUD();
        },
        
        loadEnvironment: function(levelNumber) {
            // Nettoyer la scène
            var allModels = this.enemyModels.concat(
                this.npcModels, 
                this.pickupModels, 
                this.buildingModels, 
                this.treeModels,
                this.bulletModels
            );
            
            for (var i = 0; i < allModels.length; i++) {
                if (allModels[i].parent) {
                    this.threeScene.remove(allModels[i]);
                }
            }
            
            this.enemyModels = [];
            this.npcModels = [];
            this.pickupModels = [];
            this.buildingModels = [];
            this.treeModels = [];
            this.bulletModels = [];
            this.bullets = [];
            this.particles = [];
            
            // Déterminer la ville
            var cityIndex = Math.min(Math.floor((levelNumber - 1) / 2), this.cities.length - 1);
            var city = this.cities[cityIndex];
            this.currentCity = cityIndex;
            
            // Appliquer l'ambiance de la ville
            this.threeScene.fog.color.setHex(city.color);
            if (this.skybox && this.skybox.material) {
                this.skybox.material.color.setHex(0x87CEEB);
            }
            
            // Position du joueur
            this.playerModel.position.set(0, 10, 0);
            this.playerModel.rotation.y = Math.PI;
            
            // Créer des objets initiaux
            this.createInitialPickups();
            
            // Mettre à jour l'heure
            this.timeSystem.currentTime = 8.0; // 8:00 AM
            this.timeSystem.updateLighting();
        },
        
        createBuildingsForLevel: function(levelNumber) {
            var buildingCount = 20 + levelNumber * 5;
            
            for (var i = 0; i < buildingCount; i++) {
                var building = this.createRandomBuilding();
                var angle = Math.random() * Math.PI * 2;
                var radius = 40 + Math.random() * 200;
                building.position.set(
                    Math.cos(angle) * radius,
                    0,
                    Math.sin(angle) * radius
                );
                this.threeScene.add(building);
                this.buildingModels.push(building);
            }
        },
        
        createRandomBuilding: function() {
            var building = new THREE.Group();
            
            // Dimensions
            var width = 8 + Math.random() * 12;
            var height = 10 + Math.random() * 20;
            var depth = 8 + Math.random() * 12;
            
            // Couleur selon l'environnement
            var city = this.cities[this.currentCity];
            var color;
            switch (city.environment) {
                case "urban":
                    color = 0x708090;
                    break;
                case "coastal":
                    color = 0xDEB887;
                    break;
                case "jungle":
                    color = 0x8B4513;
                    break;
                default:
                    color = 0x696969;
            }
            
            // Structure principale
            var geometry = new THREE.BoxGeometry(width, height, depth);
            var material = new THREE.MeshStandardMaterial({
                color: color,
                roughness: 0.8,
                metalness: 0.1
            });
            
            var main = new THREE.Mesh(geometry, material);
            main.position.y = height / 2;
            main.castShadow = true;
            main.receiveShadow = true;
            building.add(main);
            
            // Fenêtres
            var windowGeometry = new THREE.BoxGeometry(1, 1.5, 0.1);
            var windowMaterial = new THREE.MeshStandardMaterial({
                color: 0x87CEEB,
                emissive: 0x87CEEB,
                emissiveIntensity: 0.3,
                transparent: true,
                opacity: 0.7
            });
            
            var windowCount = Math.floor(width / 3) * Math.floor(height / 4);
            for (var w = 0; w < windowCount; w++) {
                var window = new THREE.Mesh(windowGeometry, windowMaterial);
                
                var col = w % Math.floor(width / 3);
                var row = Math.floor(w / Math.floor(width / 3));
                
                window.position.set(
                    col * 3 - width/2 + 1.5,
                    row * 4 - height/2 + 2,
                    depth/2 + 0.1
                );
                building.add(window);
            }
            
            // Toit
            var roofGeometry = new THREE.ConeGeometry(width * 0.9, height * 0.3, 4);
            var roofMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x333333,
                roughness: 0.9
            });
            var roof = new THREE.Mesh(roofGeometry, roofMaterial);
            roof.position.y = height + height * 0.15;
            building.add(roof);
            
            return building;
        },
        
        createEnemiesForLevel: function(levelNumber) {
            var enemyCount = 5 + (levelNumber * 3);
            var enemyTypes = Math.min(levelNumber, this.enemies.length);
            
            for (var i = 0; i < enemyCount; i++) {
                var enemyTypeIndex = Math.floor(Math.random() * enemyTypes);
                var enemyData = this.enemies[enemyTypeIndex];
                var enemy = this.createEnemy(enemyData);
                
                var angle = (Math.PI * 2 * i) / enemyCount;
                var radius = 40 + Math.random() * 100;
                enemy.position.set(
                    Math.cos(angle) * radius,
                    5,
                    Math.sin(angle) * radius
                );
                
                this.threeScene.add(enemy);
                this.enemyModels.push(enemy);
            }
        },
        
        createEnemy: function(enemyData) {
            var enemy = new THREE.Group();
            enemy.name = "enemy_" + enemyData.type;
            
            // Corps
            var bodyGeometry = new THREE.CapsuleGeometry(0.5, 1.6, 16, 32);
            var bodyMaterial = new THREE.MeshStandardMaterial({
                color: enemyData.color,
                roughness: 0.7,
                metalness: 0.2
            });
            
            var body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = 0.9;
            body.castShadow = true;
            body.receiveShadow = true;
            enemy.add(body);
            
            // Tête
            var headGeometry = new THREE.SphereGeometry(0.35, 32, 32);
            var headMaterial = new THREE.MeshStandardMaterial({
                color: 0x4B0000,
                roughness: 0.8,
                metalness: 0.1
            });
            
            var head = new THREE.Mesh(headGeometry, headMaterial);
            head.position.y = 1.9;
            head.castShadow = true;
            enemy.add(head);
            
            // Arme
            var weaponGeometry = new THREE.BoxGeometry(1, 0.1, 0.1);
            var weaponMaterial = new THREE.MeshStandardMaterial({
                color: 0x444444,
                metalness: 0.8,
                roughness: 0.2
            });
            
            var weapon = new THREE.Mesh(weaponGeometry, weaponMaterial);
            weapon.position.set(0.6, 1.4, 0.3);
            weapon.rotation.z = -Math.PI / 6;
            enemy.add(weapon);
            
            // Données de l'ennemi
            enemy.userData = {
                type: enemyData.type,
                health: enemyData.health,
                maxHealth: enemyData.health,
                damage: enemyData.damage,
                speed: enemyData.speed,
                points: enemyData.points,
                money: enemyData.money,
                drops: enemyData.drops,
                aggression: enemyData.aggression,
                dead: false,
                lastAttack: 0,
                originalColor: enemyData.color,
                model: enemyData.model
            };
            
            return enemy;
        },
        
        createNPCsForLevel: function(levelNumber) {
            var npcCount = Math.min(3, levelNumber);
            
            for (var i = 0; i < npcCount; i++) {
                var npcData = this.npcs[i];
                var npc = this.createNPC(npcData);
                
                var angle = (Math.PI * 2 * i) / npcCount;
                var radius = 20 + Math.random() * 50;
                npc.position.set(
                    Math.cos(angle) * radius,
                    5,
                    Math.sin(angle) * radius
                );
                
                this.threeScene.add(npc);
                this.npcModels.push(npc);
            }
        },
        
        createNPC: function(npcData) {
            var npc = new THREE.Group();
            npc.name = "npc_" + npcData.name.replace(/\s+/g, '_');
            
            // Corps selon le type
            var bodyGeometry = new THREE.CapsuleGeometry(0.4, 1.5, 16, 32);
            var bodyColor;
            
            switch (npcData.type) {
                case "merchant":
                    bodyColor = 0x8B4513;
                    break;
                case "soldier":
                    bodyColor = 0x2F4F4F;
                    break;
                case "priest":
                    bodyColor = 0x800080;
                    break;
                default:
                    bodyColor = 0x3a75c4;
            }
            
            var bodyMaterial = new THREE.MeshStandardMaterial({
                color: bodyColor,
                roughness: 0.7,
                metalness: 0.1
            });
            
            var body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = 0.8;
            body.castShadow = true;
            npc.add(body);
            
            // Tête
            var headGeometry = new THREE.SphereGeometry(0.3, 32, 32);
            var headMaterial = new THREE.MeshStandardMaterial({
                color: 0x8B4513,
                roughness: 0.8
            });
            
            var head = new THREE.Mesh(headGeometry, headMaterial);
            head.position.y = 1.7;
            head.castShadow = true;
            npc.add(head);
            
            // Accessoires selon le type
            if (npcData.type === "merchant") {
                // Sac de marchandises
                var bagGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.4);
                var bagMaterial = new THREE.MeshStandardMaterial({ color: 0xD2691E });
                var bag = new THREE.Mesh(bagGeometry, bagMaterial);
                bag.position.set(-0.5, 0.4, 0.2);
                npc.add(bag);
            } else if (npcData.type === "priest") {
                // Croix
                var crossGeometry1 = new THREE.BoxGeometry(0.1, 0.6, 0.1);
                var crossGeometry2 = new THREE.BoxGeometry(0.6, 0.1, 0.1);
                var crossMaterial = new THREE.MeshStandardMaterial({ color: 0xFFD700 });
                
                var cross1 = new THREE.Mesh(crossGeometry1, crossMaterial);
                var cross2 = new THREE.Mesh(crossGeometry2, crossMaterial);
                cross2.position.y = 0.3;
                
                var cross = new THREE.Group();
                cross.add(cross1);
                cross.add(cross2);
                cross.position.set(0, 1.8, 0.3);
                npc.add(cross);
            }
            
            // Données du PNJ
            npc.userData = Object.assign({}, npcData);
            
            // Animation de respiration
            this.animateNPCBreathing(npc);
            
            return npc;
        },
        
        animateNPCBreathing: function(npc) {
            var startY = npc.position.y;
            var animate = function() {
                if (!npc.parent) return; // Arrêter si supprimé
                
                var breathe = Math.sin(Date.now() * 0.002) * 0.02;
                npc.position.y = startY + breathe;
                
                requestAnimationFrame(animate);
            };
            
            animate();
        },
        
        createInitialPickups: function() {
            // Kits de santé
            for (var i = 0; i < 5; i++) {
                var pickup = this.createHealthPickup();
                var angle = Math.random() * Math.PI * 2;
                var radius = 15 + Math.random() * 50;
                pickup.position.set(
                    Math.cos(angle) * radius,
                    0.5,
                    Math.sin(angle) * radius
                );
                this.threeScene.add(pickup);
                this.pickupModels.push(pickup);
            }
            
            // Munitions
            for (var j = 0; j < 8; j++) {
                var pickup = this.createAmmoPickup();
                var angle = Math.random() * Math.PI * 2;
                var radius = 15 + Math.random() * 60;
                pickup.position.set(
                    Math.cos(angle) * radius,
                    0.3,
                    Math.sin(angle) * radius
                );
                this.threeScene.add(pickup);
                this.pickupModels.push(pickup);
            }
            
            // Argent
            for (var k = 0; k < 3; k++) {
                var pickup = this.createMoneyPickup();
                var angle = Math.random() * Math.PI * 2;
                var radius = 10 + Math.random() * 40;
                pickup.position.set(
                    Math.cos(angle) * radius,
                    0.2,
                    Math.sin(angle) * radius
                );
                this.threeScene.add(pickup);
                this.pickupModels.push(pickup);
            }
        },
        
        // ============================================
        // BOUCLE DE JEU PRINCIPALE
        // ============================================
        gameLoop: function() {
            var self = this;
            
            function loop() {
                requestAnimationFrame(loop);
                
                // Mise à jour des stats FPS
                if (self.stats) {
                    self.stats.begin();
                }
                
                // Mettre à jour le temps de jeu
                if (self.gameStarted && !self.gamePaused) {
                    self.gameTime += 1/60;
                    self.timeSystem.update(1/60);
                }
                
                // Mettre à jour le jeu si actif
                if (self.gameStarted && !self.gamePaused) {
                    self.updatePlayerMovement();
                    self.combatSystem.updateBullets();
                    self.updateEnemies();
                    self.updatePickups();
                    self.updateParticles();
                    
                    // Mettre à jour les quêtes
                    self.questSystem.checkQuestProgress();
                    
                    // Animation du soleil
                    if (self.sun) {
                        // Le soleil est animé par timeSystem.updateLighting()
                    }
                }
                
                // Rendu
                if (self.threeRenderer && self.threeScene && self.threeCamera) {
                    self.threeRenderer.render(self.threeScene, self.threeCamera);
                }
                
                // Fin des stats FPS
                if (self.stats) {
                    self.stats.end();
                }
            }
            
            loop();
        },
        
        // ============================================
        // GESTION DES ÉVÉNEMENTS
        // ============================================
        onWindowResize: function() {
            if (!this.threeCamera || !this.threeRenderer) return;
            
            this.threeCamera.aspect = window.innerWidth / window.innerHeight;
            this.threeCamera.updateProjectionMatrix();
            this.threeRenderer.setSize(window.innerWidth, window.innerHeight);
        },
        
        gameOver: function() {
            this.gameStarted = false;
            
            var gameOverText = "💀 GAME OVER!\n\n";
            gameOverText += "Score final: " + this.state.score + "\n";
            gameOverText += "Niveau atteint: " + this.state.level + "\n";
            gameOverText += "Ennemis tués: " + this.state.kills + "\n";
            gameOverText += "Temps de jeu: " + this.formatTime(this.gameTime) + "\n\n";
            gameOverText += "Merci d'avoir joué!";
            
            this.showMessage(gameOverText, 0); // Message persistant
            
            // Sauvegarder le score
            this.saveGame();
            
            // Effet de game over
            this.createGameOverEffect();
            
            // Retour au menu après délai
            setTimeout(function() {
                this.stageStartScreen();
            }.bind(this), 10000);
        },
        
        createGameOverEffect: function() {
            // Assombrir l'écran
            var overlay = document.createElement('div');
            overlay.style.position = 'absolute';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            overlay.style.zIndex = '998';
            overlay.style.pointerEvents = 'none';
            document.body.appendChild(overlay);
            
            // Animation de disparition du joueur
            if (this.playerModel) {
                var startTime = Date.now();
                var animate = function() {
                    var elapsed = Date.now() - startTime;
                    if (elapsed < 2000) {
                        var progress = elapsed / 2000;
                        this.playerModel.material.opacity = 1 - progress;
                        this.playerModel.position.y -= 0.02;
                        requestAnimationFrame(animate.bind(this));
                    } else {
                        this.playerModel.visible = false;
                        document.body.removeChild(overlay);
                    }
                }.bind(this);
                animate();
            }
        },
        
        // ============================================
        // FONCTIONS AUDIO
        // ============================================
        playSound: function(soundId) {
            this.audioManager.play(soundId);
        },
        
        playMusic: function(musicId) {
            this.audioManager.playMusic(musicId);
        },
        
        setVolume: function(volume) {
            this.volume = this.clamp(volume, 0, 1);
            this.audioManager.setVolume(this.volume);
            document.getElementById('volume-text').textContent = 
                Math.round(this.volume * 100) + "%";
        },
        
        // ============================================
        // FONCTIONS DE SAUVEGARDE
        // ============================================
        saveGame: function() {
            return this.saveSystem.save();
        },
        
        loadGame: function() {
            return this.saveSystem.load();
        },
        
        deleteSave: function() {
            if (confirm("Supprimer la sauvegarde? Cette action est irréversible.")) {
                this.saveSystem.delete();
                this.showMessage("Sauvegarde supprimée", 2000);
            }
        },
        
        exportSave: function() {
            return this.saveSystem.exportSave();
        },
        
        importSave: function(file) {
            return this.saveSystem.importSave(file);
        },
        
        // ============================================
        // FONCTIONS UTILITAIRES
        // ============================================
        lerpColor: function(color1, color2, factor) {
            var r1 = (color1 >> 16) & 255;
            var g1 = (color1 >> 8) & 255;
            var b1 = color1 & 255;
            
            var r2 = (color2 >> 16) & 255;
            var g2 = (color2 >> 8) & 255;
            var b2 = color2 & 255;
            
            var r = Math.round(r1 + (r2 - r1) * factor);
            var g = Math.round(g1 + (g2 - g1) * factor);
            var b = Math.round(b1 + (b2 - b1) * factor);
            
            return (r << 16) | (g << 8) | b;
        }
    };
    
    // Initialisation au chargement
    window.addEventListener('load', function() {
        console.log("🚀 Chargement du RPG Gabonais 3D...");
        
        // Attendre que le DOM soit prêt
        setTimeout(function() {
            // Initialiser le jeu
            Game.init();
            
            console.log("🎮 RPG Gabonais 3D prêt! 🇬🇦");
        }, 100);
    });
    
})();