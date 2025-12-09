// ============================================
// RPG GABONAIS 3D FPS - GAME.JS (Version Complète)
// Tous les assets intégrés directement dans le code
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
        VERSION: "2.0",
        DEBUG: false,
        
        // ============================================
        // TEXTURES ET MODÈLES INTÉGRÉS
        // ============================================
        assets: {
            // Textures générées dynamiquement
            textures: {
                ground: null,
                wall: null,
                roof: null,
                ui_background: null,
                water: null,
                sand: null,
                grass: null,
                stone: null,
                wood: null,
                metal: null,
                concrete: null,
                fabric: null,
                leaf: null,
                bark: null,
                brick: null,
                window: null,
                door: null
            },
            
            // Palettes de couleurs Gabonaises
            colors: {
                green: 0x009e60,
                yellow: 0xfcd116,
                blue: 0x3a75c4,
                darkGreen: 0x006633,
                lightGreen: 0x00cc88,
                red: 0xff4444,
                brown: 0x8B4513,
                gray: 0x696969,
                white: 0xffffff,
                black: 0x000000,
                gold: 0xFFD700,
                orange: 0xe37222,
                purple: 0x800080,
                sky: 0x87CEEB
            },
            
            // Matériaux pré-créés
            materials: {},
            
            // Modèles 3D de base
            models: {
                player: null,
                bandit: null,
                civilian: null,
                tree: null,
                rock: null,
                bush: null,
                building: null,
                house: null,
                market: null,
                car: null,
                animal: null,
                weapon: null,
                item: null,
                npc: null,
                vehicle: null,
                decoration: null
            }
        },
        
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
            money: 1000,
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
            time: 8.0,
            weight: 0,
            maxWeight: 100,
            reputation: 50,
            stamina: 100,
            maxStamina: 100,
            hunger: 100,
            maxHunger: 100,
            thirst: 100,
            maxThirst: 100,
            temperature: 37,
            maxTemperature: 37,
            inventory: [],
            equipment: {
                head: null,
                chest: null,
                legs: null,
                feet: null,
                hands: null,
                accessory: null
            },
            skills: {
                shooting: 1,
                melee: 1,
                stealth: 1,
                charisma: 1,
                crafting: 1,
                survival: 1
            },
            currentCity: 0,
            currentDistrict: 0
        },
        
        // ============================================
        // DONNÉES DU JEU
        // ============================================
        cities: [
            {
                name: "Libreville",
                districts: ["Glass", "Nombakélé", "Lalala", "Akébé", "Mont-Bouët", "Oloumi", "Gros-Bouquet"],
                environment: "urban",
                color: 0x009e60,
                music: "music-libreville",
                ambient: "urban",
                description: "La capitale du Gabon, moderne et dynamique",
                population: 800000,
                danger: 3,
                shops: 10,
                landmarks: ["Palais Présidentiel", "Cathédrale", "Marché Mont-Bouët"],
                biome: "coastal",
                weather: "tropical"
            },
            {
                name: "Port-Gentil",
                districts: ["Grand Village", "Beau Séjour", "Lowé", "Balise", "M'Binda"],
                environment: "coastal",
                color: 0x3a75c4,
                music: "music-portgentil",
                ambient: "coastal",
                description: "La capitale économique, au bord de l'océan",
                population: 150000,
                danger: 4,
                shops: 8,
                landmarks: ["Raffinerie", "Port", "Plage"],
                biome: "beach",
                weather: "sunny"
            },
            {
                name: "Franceville",
                districts: ["Mvouli", "Mikolongo", "Okoloville", "Mounana", "Lékoni"],
                environment: "jungle",
                color: 0x228B22,
                music: "music-franceville",
                ambient: "jungle",
                description: "Au cœur de la forêt équatoriale",
                population: 110000,
                danger: 5,
                shops: 6,
                landmarks: ["Monts de Cristal", "Forêt", "Mines"],
                biome: "jungle",
                weather: "rainy"
            },
            {
                name: "Lambaréné",
                districts: ["Rive Gauche", "Rive Droite", "Centre Ville", "Albert Schweitzer"],
                environment: "river",
                color: 0x1e90ff,
                music: "music-lambarene",
                ambient: "river",
                description: "Ville historique sur le fleuve Ogooué",
                population: 30000,
                danger: 2,
                shops: 5,
                landmarks: ["Hôpital Schweitzer", "Fleuve Ogooué"],
                biome: "river",
                weather: "humid"
            },
            {
                name: "Mouila",
                districts: ["Centre", "Nord", "Sud", "Est", "Ouest"],
                environment: "savanna",
                color: 0xdeb887,
                music: "music-mouila",
                ambient: "savanna",
                description: "Porte d'entrée du Sud Gabonais",
                population: 25000,
                danger: 3,
                shops: 4,
                landmarks: ["Savane", "Rivières"],
                biome: "savanna",
                weather: "dry"
            }
        ],
        
        npcs: [
            { 
                name: "Maman Régine", 
                dialogue: [
                    "Eh mon fils! Bienvenue au quartier Glass!",
                    "Fais attention aux bandits ici.",
                    "Les temps sont durs, mais la communauté reste forte.",
                    "As-tu vu mon neveu? Il devait m'apporter des provisions.",
                    "La vie à Libreville n'est pas facile, mais c'est chez nous."
                ],
                quest: "Élimine 5 bandits pour sécuriser le quartier Glass.",
                reward: "100 XP + Clé du marché + 500 FCFA",
                type: "civilian",
                model: "civilian_female",
                personality: "friendly",
                schedule: "day",
                shop: null,
                services: ["information", "healing"],
                voice: "female_elder",
                emotions: ["happy", "worried", "neutral"]
            },
            { 
                name: "Papa Joseph", 
                dialogue: [
                    "Fais attention oh! Les bandits volent nos marchandises.",
                    "J'ai besoin de cuivre pour réparer mes outils.",
                    "Le commerce est lent ces jours-ci.",
                    "Tu cherches quelque chose en particulier?",
                    "Respecte les anciens, c'est important."
                ],
                quest: "Apporte 3 morceaux de cuivre pour les réparations.",
                reward: "Kit de soin amélioré + Armure +50",
                type: "merchant",
                model: "civilian_male_elder",
                personality: "wise",
                schedule: "day",
                shop: "general_store",
                services: ["trade", "repair"],
                voice: "male_elder",
                emotions: ["neutral", "concerned", "happy"]
            },
            { 
                name: "Tata Odile", 
                dialogue: [
                    "Tu as faim? J'ai du bon ndolé et du manioc!",
                    "Les bandits ont pris mes provisions...",
                    "La cuisine gabonaise est la meilleure au monde!",
                    "Viens t'asseoir, raconte-moi tes aventures.",
                    "Un bon repas réchauffe le cœur."
                ],
                quest: "Trouve 5 noix de coco pour préparer le repas communautaire.",
                reward: "Nourriture permanente +20 santé max",
                type: "cook",
                model: "civilian_female_cook",
                personality: "motherly",
                schedule: "all_day",
                shop: "food_stall",
                services: ["food", "healing"],
                voice: "female_middle",
                emotions: ["happy", "sad", "excited"]
            },
            { 
                name: "Oncle Alain", 
                dialogue: [
                    "Cette ville devient dangereuse mon gars!",
                    "Protège-nous s'il te plaît.",
                    "J'ai servi dans l'armée, je sais de quoi je parle.",
                    "Respect et discipline, voilà ce qu'il nous faut.",
                    "Un homme doit savoir se défendre."
                ],
                quest: "Protège le marché contre 7 pillards.",
                reward: "Fusil d'assaut + 50 munitions",
                type: "soldier",
                model: "civilian_male_soldier",
                personality: "strict",
                schedule: "evening",
                shop: null,
                services: ["training", "protection"],
                voice: "male_deep",
                emotions: ["serious", "proud", "concerned"]
            },
            { 
                name: "Frère Marcel", 
                dialogue: [
                    "Tu cherches quelque chose? Je peux t'aider!",
                    "Mais d'abord, aide-moi...",
                    "La foi peut déplacer des montagnes.",
                    "Chaque être humain mérite le respect.",
                    "La paix commence en soi."
                ],
                quest: "Livraison de médicaments au village voisin.",
                reward: "Accès au quartier Nombakélé + 1000 FCFA",
                type: "priest",
                model: "civilian_male_priest",
                personality: "peaceful",
                schedule: "morning",
                shop: null,
                services: ["healing", "counseling"],
                voice: "male_calm",
                emotions: ["calm", "compassionate", "wise"]
            }
        ],
        
        weapons: [
            { 
                id: "pistol_makarov",
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
                unlockLevel: 1,
                weight: 1.5,
                description: "Pistolet standard de l'armée",
                rarity: "common",
                effects: [],
                model: "weapon_pistol"
            },
            { 
                id: "ak47",
                name: "Fusil AK-47", 
                damage: 30, 
                ammo: 15, 
                maxAmmo: 15, 
                fireRate: 500,
                accuracy: 0.8,
                icon: "🔫",
                sound: "sfx-shoot_rifle",
                type: "rifle",
                price: 1500,
                unlockLevel: 3,
                weight: 4.5,
                description: "Fusil d'assaut fiable et puissant",
                rarity: "rare",
                effects: ["piercing"],
                model: "weapon_rifle"
            },
            { 
                id: "uzi",
                name: "Mitraillette Uzi", 
                damage: 10, 
                ammo: 50, 
                maxAmmo: 50, 
                fireRate: 150,
                accuracy: 0.7,
                icon: "🔫",
                sound: "sfx-shoot_smg",
                type: "smg",
                price: 1000,
                unlockLevel: 2,
                weight: 3.2,
                description: "Mitraillette compacte à tir rapide",
                rarity: "uncommon",
                effects: ["rapid_fire"],
                model: "weapon_smg"
            },
            { 
                id: "shotgun",
                name: "Fusil à pompe", 
                damage: 40, 
                ammo: 8, 
                maxAmmo: 8, 
                fireRate: 800,
                accuracy: 0.6,
                icon: "🔫",
                sound: "sfx-shoot_shotgun",
                type: "shotgun",
                price: 2000,
                unlockLevel: 5,
                weight: 5.0,
                description: "Fusil à canon scié pour combat rapproché",
                rarity: "epic",
                effects: ["spread", "knockback"],
                model: "weapon_shotgun"
            },
            { 
                id: "sniper",
                name: "Fusil de précision", 
                damage: 60, 
                ammo: 5, 
                maxAmmo: 5, 
                fireRate: 1200,
                accuracy: 0.95,
                icon: "🔫",
                sound: "sfx-shoot_sniper",
                type: "sniper",
                price: 3000,
                unlockLevel: 7,
                weight: 6.5,
                description: "Fusil pour cibles à longue distance",
                rarity: "legendary",
                effects: ["piercing", "zoom"],
                model: "weapon_sniper"
            },
            { 
                id: "machete",
                name: "Machette", 
                damage: 25, 
                ammo: 0, 
                maxAmmo: 0, 
                fireRate: 400,
                accuracy: 0.9,
                icon: "🗡️",
                sound: "sfx-swing",
                type: "melee",
                price: 200,
                unlockLevel: 1,
                weight: 2.0,
                description: "Outils polyvalent pour la jungle",
                rarity: "common",
                effects: ["bleeding"],
                model: "weapon_machete"
            }
        ],
        
        enemies: [
            {
                id: "bandit_basic",
                type: "Bandit",
                health: 50,
                maxHealth: 50,
                damage: 10,
                speed: 2.5,
                color: 0x8B0000,
                points: 100,
                money: 50,
                drops: ["ammo", "health", "money"],
                model: "enemy_bandit",
                aggression: 0.8,
                detectionRange: 15,
                attackRange: 3,
                intelligence: "low",
                weapons: ["pistol_makarov", "machete"],
                armor: 0,
                xp: 25,
                behavior: "aggressive",
                sounds: ["bandit_taunt", "bandit_hurt", "bandit_die"]
            },
            {
                id: "bandit_boss",
                type: "Boss",
                health: 200,
                maxHealth: 200,
                damage: 25,
                speed: 1.8,
                color: 0x4B0000,
                points: 500,
                money: 500,
                drops: ["special", "weapon", "armor"],
                model: "enemy_boss",
                aggression: 1.0,
                detectionRange: 25,
                attackRange: 4,
                intelligence: "high",
                weapons: ["ak47", "shotgun"],
                armor: 50,
                xp: 200,
                behavior: "strategic",
                sounds: ["boss_roar", "boss_hurt", "boss_die"]
            },
            {
                id: "bandit_sniper",
                type: "Sniper",
                health: 30,
                maxHealth: 30,
                damage: 40,
                speed: 1.2,
                color: 0x696969,
                points: 200,
                money: 100,
                drops: ["ammo", "ammo", "special"],
                model: "enemy_sniper",
                aggression: 0.6,
                detectionRange: 30,
                attackRange: 20,
                intelligence: "medium",
                weapons: ["sniper"],
                armor: 20,
                xp: 75,
                behavior: "cowardly",
                sounds: ["sniper_alert", "sniper_hurt", "sniper_die"]
            },
            {
                id: "bandit_gangster",
                type: "Gangster",
                health: 75,
                maxHealth: 75,
                damage: 15,
                speed: 2.2,
                color: 0x800080,
                points: 150,
                money: 75,
                drops: ["ammo", "money", "health"],
                model: "enemy_gangster",
                aggression: 0.9,
                detectionRange: 12,
                attackRange: 2,
                intelligence: "medium",
                weapons: ["uzi", "machete"],
                armor: 25,
                xp: 50,
                behavior: "aggressive",
                sounds: ["gangster_taunt", "gangster_hurt", "gangster_die"]
            }
        ],
        
        items: [
            {
                id: "health_kit",
                name: "Kit de soin",
                type: "health",
                value: 25,
                icon: "❤️",
                weight: 1,
                price: 100,
                description: "Restaure 25 points de santé",
                rarity: "common",
                stackable: true,
                maxStack: 5,
                model: "item_health",
                sound: "sfx-heal"
            },
            {
                id: "ammo_box",
                name: "Boîte de munitions",
                type: "ammo",
                value: 30,
                icon: "📦",
                weight: 2,
                price: 50,
                description: "30 munitions supplémentaires",
                rarity: "common",
                stackable: true,
                maxStack: 3,
                model: "item_ammo",
                sound: "sfx-ammo"
            },
            {
                id: "gold_key",
                name: "Clé en or",
                type: "key",
                value: 1,
                icon: "🗝️",
                weight: 0.5,
                price: 500,
                description: "Ouvre les portes spéciales",
                rarity: "rare",
                stackable: false,
                maxStack: 1,
                model: "item_key",
                sound: "sfx-key"
            },
            {
                id: "strength_potion",
                name: "Potion de force",
                type: "special",
                value: 50,
                icon: "🧪",
                weight: 1,
                price: 200,
                description: "Augmente les dégâts temporairement",
                rarity: "uncommon",
                stackable: true,
                maxStack: 3,
                model: "item_potion",
                sound: "sfx-potion"
            },
            {
                id: "gold_coins",
                name: "Pièces d'or",
                type: "money",
                value: 100,
                icon: "💰",
                weight: 0.1,
                price: 0,
                description: "100 FCFA",
                rarity: "common",
                stackable: true,
                maxStack: 100,
                model: "item_money",
                sound: "sfx-money"
            },
            {
                id: "bulletproof_vest",
                name: "Veste pare-balles",
                type: "armor",
                value: 25,
                icon: "🛡️",
                weight: 5,
                price: 300,
                description: "+25 points d'armure",
                rarity: "uncommon",
                stackable: false,
                maxStack: 1,
                model: "item_armor",
                sound: "sfx-armor"
            },
            {
                id: "food_ndole",
                name: "Ndish de Ndolé",
                type: "food",
                value: 20,
                icon: "🍲",
                weight: 1,
                price: 50,
                description: "Plat traditionnel gabonais",
                rarity: "common",
                stackable: true,
                maxStack: 5,
                model: "item_food",
                sound: "sfx-eat"
            },
            {
                id: "water_bottle",
                name: "Bouteille d'eau",
                type: "drink",
                value: 30,
                icon: "💧",
                weight: 1,
                price: 20,
                description: "Étanche la soif",
                rarity: "common",
                stackable: true,
                maxStack: 3,
                model: "item_water",
                sound: "sfx-drink"
            },
            {
                id: "medicine",
                name: "Médicaments",
                type: "medical",
                value: 40,
                icon: "💊",
                weight: 0.5,
                price: 150,
                description: "Soigne les maladies",
                rarity: "uncommon",
                stackable: true,
                maxStack: 5,
                model: "item_medicine",
                sound: "sfx-medicine"
            },
            {
                id: "toolkit",
                name: "Kit d'outils",
                type: "tool",
                value: 0,
                icon: "🔧",
                weight: 3,
                price: 400,
                description: "Pour réparer et construire",
                rarity: "uncommon",
                stackable: false,
                maxStack: 1,
                model: "item_tool",
                sound: "sfx-tool"
            }
        ],
        
        // ============================================
        // SYSTÈMES PRINCIPAUX
        // ============================================
        systems: {
            graphics: null,
            audio: null,
            input: null,
            physics: null,
            ai: null,
            quest: null,
            inventory: null,
            craft: null,
            build: null,
            weather: null,
            time: null,
            economy: null,
            dialogue: null,
            save: null
        },
        
        // ============================================
        // ÉLÉMENTS 3D
        // ============================================
        three: {
            scene: null,
            camera: null,
            renderer: null,
            composer: null,
            controls: null,
            raycaster: null
        },
        
        world: {
            player: null,
            enemies: [],
            npcs: [],
            buildings: [],
            trees: [],
            rocks: [],
            items: [],
            particles: [],
            lights: [],
            zones: [],
            vehicles: [],
            animals: [],
            effects: [],
            projectiles: [],
            decorations: [],
            sun: null,
            ground: null,
            water: null,
            skybox: null,
            flashlight: null
        },
        
        // ============================================
        // INTERFACE UTILISATEUR
        // ============================================
        ui: {
            hud: null,
            inventory: null,
            menu: null,
            map: null,
            quest: null,
            skills: null,
            crafting: null,
            dialogue: null,
            settings: null,
            minimap: null
        },
        
        // ============================================
        // CONTRÔLES
        // ============================================
        controls: {
            keys: {},
            mouse: { x: 0, y: 0, dx: 0, dy: 0, locked: false },
            touch: { active: false, positions: {}, gestures: {} },
            gamepad: { connected: false, index: -1, buttons: {}, axes: {} },
            sensitivity: 5,
            invertedY: false,
            vibration: true
        },
        
        // ============================================
        // CONFIGURATION
        // ============================================
        config: {
            graphics: {
                quality: "medium",
                shadows: true,
                antialiasing: true,
                reflections: true,
                particles: true,
                postprocessing: true,
                bloom: true,
                ssao: true,
                motionBlur: false,
                drawDistance: 1000
            },
            audio: {
                volume: 0.7,
                music: 0.6,
                effects: 0.8,
                voice: 0.7,
                environment: 0.5,
                muted: false
            },
            game: {
                difficulty: "normal",
                language: "fr",
                autosave: true,
                autosaveInterval: 300,
                subtitles: true,
                hints: true,
                tutorial: true,
                blood: true,
                fov: 75
            },
            controls: {
                layout: "standard",
                custom: {}
            }
        },
        
        // ============================================
        // ÉTAT DU JEU
        // ============================================
        gameState: {
            started: false,
            paused: false,
            loading: false,
            inMenu: true,
            inGame: false,
            inInventory: false,
            inDialogue: false,
            inMap: false,
            inCrafting: false,
            gameOver: false,
            victory: false
        },
        
        // ============================================
        // STATISTIQUES
        // ============================================
        stats: {
            playTime: 0,
            totalKills: 0,
            totalDamage: 0,
            totalMoney: 0,
            totalXP: 0,
            itemsCollected: 0,
            questsCompleted: 0,
            buildingsBuilt: 0,
            itemsCrafted: 0,
            distanceTraveled: 0,
            deaths: 0,
            shotsFired: 0,
            accuracy: 0,
            challenges: {}
        },
        
        // ============================================
        // INITIALISATION
        // ============================================
        init: function() {
            console.log(`🎮 RPG Gabonais 3D v${this.VERSION} - Initialisation...`);
            
            // Vérifier WebGL
            if (!Detector.webgl) {
                Detector.addGetWebGLMessage();
                return;
            }
            
            try {
                // Initialiser les systèmes de base
                this.initCoreSystems();
                
                // Créer les assets intégrés
                this.createIntegratedAssets();
                
                // Initialiser Three.js
                this.initThreeJS();
                
                // Initialiser l'interface
                this.initUI();
                
                // Initialiser les contrôles
                this.initControls();
                
                // Initialiser l'audio
                this.initAudio();
                
                // Initialiser les systèmes de jeu
                this.initGameSystems();
                
                console.log("✅ Jeu initialisé avec succès!");
                
                // Cacher l'écran de chargement et afficher le menu
                setTimeout(() => {
                    document.getElementById('loading-screen').style.display = 'none';
                    document.getElementById('start-screen').style.display = 'flex';
                }, 500);
                
            } catch (error) {
                console.error("❌ Erreur d'initialisation:", error);
                this.showErrorMessage("Erreur d'initialisation du jeu: " + error.message);
            }
        },
        
        // ============================================
        // SYSTÈMES DE BASE
        // ============================================
        initCoreSystems: function() {
            // Système de logging
            this.log = {
                info: function(msg) { console.log(`ℹ️ ${msg}`); },
                warn: function(msg) { console.warn(`⚠️ ${msg}`); },
                error: function(msg) { console.error(`❌ ${msg}`); },
                debug: function(msg) { if (this.DEBUG) console.debug(`🐛 ${msg}`); }
            };
            
            // Système d'utilitaires
            this.utils = {
                // Générer un ID unique
                generateId: function() {
                    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                        return v.toString(16);
                    });
                },
                
                // Formater le temps
                formatTime: function(seconds) {
                    var hours = Math.floor(seconds / 3600);
                    var minutes = Math.floor((seconds % 3600) / 60);
                    var secs = Math.floor(seconds % 60);
                    
                    if (hours > 0) {
                        return hours + "h " + minutes.toString().padStart(2, '0') + "m";
                    } else if (minutes > 0) {
                        return minutes + "m " + secs.toString().padStart(2, '0') + "s";
                    } else {
                        return secs + "s";
                    }
                },
                
                // Formater l'argent
                formatMoney: function(amount) {
                    return amount.toLocaleString('fr-FR') + " FCFA";
                },
                
                // Interpolation linéaire
                lerp: function(a, b, t) {
                    return a + (b - a) * Math.min(1, Math.max(0, t));
                },
                
                // Interpolation couleur
                lerpColor: function(color1, color2, t) {
                    var r1 = (color1 >> 16) & 255;
                    var g1 = (color1 >> 8) & 255;
                    var b1 = color1 & 255;
                    
                    var r2 = (color2 >> 16) & 255;
                    var g2 = (color2 >> 8) & 255;
                    var b2 = color2 & 255;
                    
                    var r = Math.round(r1 + (r2 - r1) * t);
                    var g = Math.round(g1 + (g2 - g1) * t);
                    var b = Math.round(b1 + (b2 - b1) * t);
                    
                    return (r << 16) | (g << 8) | b;
                },
                
                // Distance 3D
                distance3D: function(p1, p2) {
                    var dx = p2.x - p1.x;
                    var dy = p2.y - p1.y;
                    var dz = p2.z - p1.z;
                    return Math.sqrt(dx * dx + dy * dy + dz * dz);
                },
                
                // Clamp
                clamp: function(value, min, max) {
                    return Math.min(max, Math.max(min, value));
                },
                
                // Angle entre deux vecteurs
                angleBetween: function(v1, v2) {
                    var dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
                    var mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
                    var mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z);
                    return Math.acos(dot / (mag1 * mag2));
                },
                
                // Aléatoire dans une plage
                randomRange: function(min, max) {
                    return Math.random() * (max - min) + min;
                },
                
                // Aléatoire entier
                randomInt: function(min, max) {
                    return Math.floor(Math.random() * (max - min + 1)) + min;
                },
                
                // Chance
                chance: function(percent) {
                    return Math.random() < (percent / 100);
                },
                
                // Vecteur aléatoire
                randomVector: function(radius) {
                    var angle = Math.random() * Math.PI * 2;
                    return {
                        x: Math.cos(angle) * radius,
                        y: Math.random() * radius * 2 - radius,
                        z: Math.sin(angle) * radius
                    };
                },
                
                // Vecteur depuis les angles
                vectorFromAngles: function(theta, phi) {
                    return {
                        x: Math.sin(phi) * Math.cos(theta),
                        y: Math.cos(phi),
                        z: Math.sin(phi) * Math.sin(theta)
                    };
                },
                
                // Normaliser un vecteur
                normalizeVector: function(v) {
                    var length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
                    if (length > 0) {
                        return { x: v.x / length, y: v.y / length, z: v.z / length };
                    }
                    return { x: 0, y: 0, z: 0 };
                },
                
                // Produit vectoriel
                crossProduct: function(a, b) {
                    return {
                        x: a.y * b.z - a.z * b.y,
                        y: a.z * b.x - a.x * b.z,
                        z: a.x * b.y - a.y * b.x
                    };
                },
                
                // Produit scalaire
                dotProduct: function(a, b) {
                    return a.x * b.x + a.y * b.y + a.z * b.z;
                }
            };
        },
        
        // ============================================
        // ASSETS INTÉGRÉS
        // ============================================
        createIntegratedAssets: function() {
            console.log("🎨 Création des assets intégrés...");
            
            // Créer les textures procédurales
            this.createProceduralTextures();
            
            // Créer les matériaux
            this.createMaterials();
            
            // Créer les modèles 3D de base
            this.createBasicModels();
        },
        
        createProceduralTextures: function() {
            var self = this;
            
            // Texture de sol (procédurale)
            var groundCanvas = document.createElement('canvas');
            groundCanvas.width = 512;
            groundCanvas.height = 512;
            var groundCtx = groundCanvas.getContext('2d');
            
            // Dégradé terre/herbe
            var gradient = groundCtx.createLinearGradient(0, 0, 512, 512);
            gradient.addColorStop(0, '#8B4513');
            gradient.addColorStop(0.3, '#A0522D');
            gradient.addColorStop(0.5, '#DEB887');
            gradient.addColorStop(0.7, '#8FBC8F');
            gradient.addColorStop(1, '#2E8B57');
            groundCtx.fillStyle = gradient;
            groundCtx.fillRect(0, 0, 512, 512);
            
            // Ajouter du bruit
            groundCtx.fillStyle = 'rgba(0,0,0,0.1)';
            for (var i = 0; i < 10000; i++) {
                var x = Math.random() * 512;
                var y = Math.random() * 512;
                groundCtx.fillRect(x, y, 1, 1);
            }
            
            // Ajouter des motifs
            groundCtx.strokeStyle = 'rgba(139, 69, 19, 0.2)';
            groundCtx.lineWidth = 1;
            for (var j = 0; j < 50; j++) {
                groundCtx.beginPath();
                groundCtx.moveTo(Math.random() * 512, Math.random() * 512);
                groundCtx.lineTo(Math.random() * 512, Math.random() * 512);
                groundCtx.stroke();
            }
            
            this.assets.textures.ground = new THREE.CanvasTexture(groundCanvas);
            this.assets.textures.ground.wrapS = THREE.RepeatWrapping;
            this.assets.textures.ground.wrapT = THREE.RepeatWrapping;
            this.assets.textures.ground.repeat.set(20, 20);
            
            // Texture de mur (brique)
            var wallCanvas = document.createElement('canvas');
            wallCanvas.width = 256;
            wallCanvas.height = 256;
            var wallCtx = wallCanvas.getContext('2d');
            
            wallCtx.fillStyle = '#696969';
            wallCtx.fillRect(0, 0, 256, 256);
            
            // Motif brique
            var brickWidth = 32;
            var brickHeight = 16;
            var mortar = 2;
            
            for (var row = 0; row < 16; row++) {
                for (var col = 0; col < 8; col++) {
                    var x = col * (brickWidth + mortar);
                    var y = row * (brickHeight + mortar);
                    
                    // Décaler les lignes paires
                    if (row % 2 === 0) {
                        x += brickWidth / 2;
                    }
                    
                    wallCtx.fillStyle = '#8B4513';
                    wallCtx.fillRect(x, y, brickWidth, brickHeight);
                    
                    // Ajouter de la texture
                    wallCtx.fillStyle = '#A0522D';
                    wallCtx.fillRect(x + 2, y + 2, brickWidth - 4, brickHeight - 4);
                }
            }
            
            this.assets.textures.wall = new THREE.CanvasTexture(wallCanvas);
            this.assets.textures.wall.wrapS = THREE.RepeatWrapping;
            this.assets.textures.wall.wrapT = THREE.RepeatWrapping;
            
            // Texture de toit
            var roofCanvas = document.createElement('canvas');
            roofCanvas.width = 256;
            roofCanvas.height = 256;
            var roofCtx = roofCanvas.getContext('2d');
            
            // Motif tuile
            roofCtx.fillStyle = '#2F4F4F';
            roofCtx.fillRect(0, 0, 256, 256);
            
            for (var r = 0; r < 16; r++) {
                for (var c = 0; c < 8; c++) {
                    var rx = c * 64;
                    var ry = r * 32;
                    
                    roofCtx.fillStyle = '#36454F';
                    roofCtx.beginPath();
                    roofCtx.moveTo(rx, ry);
                    roofCtx.lineTo(rx + 64, ry);
                    roofCtx.lineTo(rx + 32, ry + 32);
                    roofCtx.lineTo(rx - 32, ry + 32);
                    roofCtx.closePath();
                    roofCtx.fill();
                    
                    // Ombre
                    roofCtx.fillStyle = 'rgba(0,0,0,0.1)';
                    roofCtx.fillRect(rx, ry, 64, 2);
                }
            }
            
            this.assets.textures.roof = new THREE.CanvasTexture(roofCanvas);
            
            // Texture UI background
            var uiCanvas = document.createElement('canvas');
            uiCanvas.width = 512;
            uiCanvas.height = 512;
            var uiCtx = uiCanvas.getContext('2d');
            
            // Dégradé africain
            var uiGradient = uiCtx.createLinearGradient(0, 0, 512, 512);
            uiGradient.addColorStop(0, '#009e60');
            uiGradient.addColorStop(0.3, '#006633');
            uiGradient.addColorStop(0.5, '#fcd116');
            uiGradient.addColorStop(0.7, '#3a75c4');
            uiGradient.addColorStop(1, '#8B4513');
            uiCtx.fillStyle = uiGradient;
            uiCtx.fillRect(0, 0, 512, 512);
            
            // Motif tribal
            uiCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            uiCtx.lineWidth = 2;
            
            var centerX = 256;
            var centerY = 256;
            var radius = 200;
            
            for (var k = 0; k < 12; k++) {
                var angle = (k / 12) * Math.PI * 2;
                var x1 = centerX + Math.cos(angle) * radius;
                var y1 = centerY + Math.sin(angle) * radius;
                var x2 = centerX + Math.cos(angle + Math.PI) * radius;
                var y2 = centerY + Math.sin(angle + Math.PI) * radius;
                
                uiCtx.beginPath();
                uiCtx.moveTo(x1, y1);
                uiCtx.lineTo(x2, y2);
                uiCtx.stroke();
            }
            
            this.assets.textures.ui_background = new THREE.CanvasTexture(uiCanvas);
            
            // Autres textures procédurales
            this.createAdditionalTextures();
        },
        
        createAdditionalTextures: function() {
            // Texture d'eau
            var waterCanvas = document.createElement('canvas');
            waterCanvas.width = 256;
            waterCanvas.height = 256;
            var waterCtx = waterCanvas.getContext('2d');
            
            waterCtx.fillStyle = '#1e90ff';
            waterCtx.fillRect(0, 0, 256, 256);
            
            // Vagues
            waterCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            waterCtx.lineWidth = 2;
            
            for (var i = 0; i < 20; i++) {
                var y = i * 12;
                waterCtx.beginPath();
                waterCtx.moveTo(0, y);
                for (var x = 0; x < 256; x += 10) {
                    var waveHeight = Math.sin(x * 0.1 + i * 0.5) * 4;
                    waterCtx.lineTo(x, y + waveHeight);
                }
                waterCtx.stroke();
            }
            
            this.assets.textures.water = new THREE.CanvasTexture(waterCanvas);
            this.assets.textures.water.wrapS = THREE.RepeatWrapping;
            this.assets.textures.water.wrapT = THREE.RepeatWrapping;
            this.assets.textures.water.repeat.set(4, 4);
            
            // Texture de sable
            var sandCanvas = document.createElement('canvas');
            sandCanvas.width = 256;
            sandCanvas.height = 256;
            var sandCtx = sandCanvas.getContext('2d');
            
            sandCtx.fillStyle = '#f4a460';
            sandCtx.fillRect(0, 0, 256, 256);
            
            // Points de sable
            sandCtx.fillStyle = '#deb887';
            for (var j = 0; j < 5000; j++) {
                var x = Math.random() * 256;
                var y = Math.random() * 256;
                var size = Math.random() * 2;
                sandCtx.fillRect(x, y, size, size);
            }
            
            this.assets.textures.sand = new THREE.CanvasTexture(sandCanvas);
            
            // Texture d'herbe
            var grassCanvas = document.createElement('canvas');
            grassCanvas.width = 256;
            grassCanvas.height = 256;
            var grassCtx = grassCanvas.getContext('2d');
            
            // Base verte
            grassCtx.fillStyle = '#2E8B57';
            grassCtx.fillRect(0, 0, 256, 256);
            
            // Brins d'herbe
            grassCtx.strokeStyle = '#228B22';
            grassCtx.lineWidth = 1;
            
            for (var g = 0; g < 1000; g++) {
                var x = Math.random() * 256;
                var y = Math.random() * 256;
                var height = Math.random() * 10 + 5;
                
                grassCtx.beginPath();
                grassCtx.moveTo(x, y);
                grassCtx.lineTo(x + Math.random() * 4 - 2, y - height);
                grassCtx.stroke();
            }
            
            this.assets.textures.grass = new THREE.CanvasTexture(grassCanvas);
            
            // Texture de pierre
            var stoneCanvas = document.createElement('canvas');
            stoneCanvas.width = 256;
            stoneCanvas.height = 256;
            var stoneCtx = stoneCanvas.getContext('2d');
            
            stoneCtx.fillStyle = '#808080';
            stoneCtx.fillRect(0, 0, 256, 256);
            
            // Texture de pierre
            for (var s = 0; s < 10000; s++) {
                var x = Math.random() * 256;
                var y = Math.random() * 256;
                var shade = Math.random() * 50;
                stoneCtx.fillStyle = 'rgba(' + (128 + shade) + ',' + (128 + shade) + ',' + (128 + shade) + ',0.1)';
                stoneCtx.fillRect(x, y, 2, 2);
            }
            
            this.assets.textures.stone = new THREE.CanvasTexture(stoneCanvas);
        },
        
        createMaterials: function() {
            // Matériaux de base
            this.assets.materials = {
                ground: new THREE.MeshStandardMaterial({
                    map: this.assets.textures.ground,
                    roughness: 0.9,
                    metalness: 0.1,
                    side: THREE.DoubleSide
                }),
                
                wall: new THREE.MeshStandardMaterial({
                    map: this.assets.textures.wall,
                    roughness: 0.8,
                    metalness: 0.2
                }),
                
                roof: new THREE.MeshStandardMaterial({
                    map: this.assets.textures.roof,
                    roughness: 0.7,
                    metalness: 0.3
                }),
                
                water: new THREE.MeshStandardMaterial({
                    map: this.assets.textures.water,
                    transparent: true,
                    opacity: 0.7,
                    roughness: 0.1,
                    metalness: 0.9
                }),
                
                sand: new THREE.MeshStandardMaterial({
                    map: this.assets.textures.sand,
                    roughness: 0.9,
                    metalness: 0.0
                }),
                
                grass: new THREE.MeshStandardMaterial({
                    map: this.assets.textures.grass,
                    roughness: 0.8,
                    metalness: 0.0
                }),
                
                stone: new THREE.MeshStandardMaterial({
                    map: this.assets.textures.stone,
                    roughness: 0.6,
                    metalness: 0.4
                }),
                
                wood: new THREE.MeshStandardMaterial({
                    color: this.assets.colors.brown,
                    roughness: 0.7,
                    metalness: 0.1
                }),
                
                metal: new THREE.MeshStandardMaterial({
                    color: 0x888888,
                    roughness: 0.3,
                    metalness: 0.8
                }),
                
                concrete: new THREE.MeshStandardMaterial({
                    color: 0xcccccc,
                    roughness: 0.9,
                    metalness: 0.1
                }),
                
                fabric: new THREE.MeshStandardMaterial({
                    color: 0xf5f5f5,
                    roughness: 0.9,
                    metalness: 0.0
                }),
                
                leaf: new THREE.MeshStandardMaterial({
                    color: this.assets.colors.green,
                    roughness: 0.8,
                    metalness: 0.0
                }),
                
                bark: new THREE.MeshStandardMaterial({
                    color: 0x5d4037,
                    roughness: 0.9,
                    metalness: 0.0
                }),
                
                brick: new THREE.MeshStandardMaterial({
                    color: 0x8B4513,
                    roughness: 0.8,
                    metalness: 0.2
                }),
                
                window: new THREE.MeshStandardMaterial({
                    color: 0x87CEEB,
                    transparent: true,
                    opacity: 0.3,
                    roughness: 0.1,
                    metalness: 0.9
                }),
                
                door: new THREE.MeshStandardMaterial({
                    color: 0x8B4513,
                    roughness: 0.7,
                    metalness: 0.1
                }),
                
                player: new THREE.MeshStandardMaterial({
                    color: this.assets.colors.green,
                    roughness: 0.6,
                    metalness: 0.3,
                    emissive: this.assets.colors.darkGreen,
                    emissiveIntensity: 0.1
                }),
                
                enemy: new THREE.MeshStandardMaterial({
                    color: 0x8B0000,
                    roughness: 0.7,
                    metalness: 0.2
                }),
                
                civilian: new THREE.MeshStandardMaterial({
                    color: 0x3a75c4,
                    roughness: 0.7,
                    metalness: 0.1
                }),
                
                weapon: new THREE.MeshStandardMaterial({
                    color: 0x444444,
                    roughness: 0.2,
                    metalness: 0.8
                }),
                
                item: new THREE.MeshStandardMaterial({
                    color: 0xFFD700,
                    roughness: 0.3,
                    metalness: 0.7
                })
            };
            
            // Ajouter des variantes
            this.assets.materials.ground_wet = this.assets.materials.ground.clone();
            this.assets.materials.ground_wet.roughness = 0.3;
            
            this.assets.materials.wall_dirty = this.assets.materials.wall.clone();
            this.assets.materials.wall_dirty.color = new THREE.Color(0x666666);
            
            this.assets.materials.wood_dark = this.assets.materials.wood.clone();
            this.assets.materials.wood_dark.color = new THREE.Color(0x5d4037);
            
            this.assets.materials.metal_rusty = this.assets.materials.metal.clone();
            this.assets.materials.metal_rusty.color = new THREE.Color(0x8B4513);
            this.assets.materials.metal_rusty.roughness = 0.9;
        },
        
        createBasicModels: function() {
            // Modèle de joueur de base
            this.assets.models.player = this.createPlayerModel();
            
            // Modèle d'ennemi de base
            this.assets.models.bandit = this.createEnemyModel();
            
            // Modèle de civil de base
            this.assets.models.civilian = this.createCivilianModel();
            
            // Modèle d'arbre de base
            this.assets.models.tree = this.createTreeModel();
            
            // Modèle de rocher de base
            this.assets.models.rock = this.createRockModel();
            
            // Modèle de bâtiment de base
            this.assets.models.building = this.createBuildingModel();
            
            // Modèle de maison de base
            this.assets.models.house = this.createHouseModel();
            
            // Modèle d'arme de base
            this.assets.models.weapon = this.createWeaponModel();
            
            // Modèle d'objet de base
            this.assets.models.item = this.createItemModel();
        },
        
        createPlayerModel: function() {
            var group = new THREE.Group();
            group.name = "player_model";
            
            // Corps principal
            var bodyGeometry = new THREE.CapsuleGeometry(0.5, 1.8, 16, 32);
            var body = new THREE.Mesh(bodyGeometry, this.assets.materials.player);
            body.position.y = 0.9;
            body.castShadow = true;
            body.receiveShadow = true;
            group.add(body);
            
            // Tête
            var headGeometry = new THREE.SphereGeometry(0.35, 32, 32);
            var headMaterial = this.assets.materials.player.clone();
            headMaterial.color = new THREE.Color(this.assets.colors.brown);
            var head = new THREE.Mesh(headGeometry, headMaterial);
            head.position.y = 2.0;
            head.castShadow = true;
            group.add(head);
            
            // Bras
            var armGeometry = new THREE.CapsuleGeometry(0.12, 0.8, 8, 16);
            var leftArm = new THREE.Mesh(armGeometry, this.assets.materials.player);
            leftArm.position.set(-0.5, 1.4, 0);
            leftArm.rotation.z = Math.PI / 6;
            leftArm.castShadow = true;
            group.add(leftArm);
            
            var rightArm = new THREE.Mesh(armGeometry, this.assets.materials.player);
            rightArm.position.set(0.5, 1.4, 0);
            rightArm.rotation.z = -Math.PI / 6;
            rightArm.castShadow = true;
            group.add(rightArm);
            
            // Jambes
            var legGeometry = new THREE.CapsuleGeometry(0.15, 0.9, 8, 16);
            var legMaterial = this.assets.materials.player.clone();
            legMaterial.color = new THREE.Color(this.assets.colors.darkGreen);
            
            var leftLeg = new THREE.Mesh(legGeometry, legMaterial);
            leftLeg.position.set(-0.2, 0.45, 0);
            leftLeg.castShadow = true;
            group.add(leftLeg);
            
            var rightLeg = new THREE.Mesh(legGeometry, legMaterial);
            rightLeg.position.set(0.2, 0.45, 0);
            rightLeg.castShadow = true;
            group.add(rightLeg);
            
            // Arme (main droite)
            var weaponGeometry = new THREE.BoxGeometry(0.8, 0.1, 0.1);
            var weapon = new THREE.Mesh(weaponGeometry, this.assets.materials.weapon);
            weapon.position.set(0.6, 1.5, 0.3);
            weapon.rotation.z = -Math.PI / 4;
            group.add(weapon);
            
            return group;
        },
        
        createEnemyModel: function() {
            var group = new THREE.Group();
            group.name = "enemy_model";
            
            // Corps
            var bodyGeometry = new THREE.CapsuleGeometry(0.5, 1.6, 16, 32);
            var body = new THREE.Mesh(bodyGeometry, this.assets.materials.enemy);
            body.position.y = 0.8;
            body.castShadow = true;
            group.add(body);
            
            // Tête
            var headGeometry = new THREE.SphereGeometry(0.35, 32, 32);
            var headMaterial = this.assets.materials.enemy.clone();
            headMaterial.color = new THREE.Color(0x4B0000);
            var head = new THREE.Mesh(headGeometry, headMaterial);
            head.position.y = 1.9;
            head.castShadow = true;
            group.add(head);
            
            // Arme
            var weaponGeometry = new THREE.BoxGeometry(1, 0.1, 0.1);
            var weapon = new THREE.Mesh(weaponGeometry, this.assets.materials.weapon);
            weapon.position.set(0.6, 1.4, 0.3);
            weapon.rotation.z = -Math.PI / 6;
            group.add(weapon);
            
            // Accessoires (bandana, etc.)
            var bandanaGeometry = new THREE.TorusGeometry(0.4, 0.05, 8, 16, Math.PI);
            var bandanaMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
            var bandana = new THREE.Mesh(bandanaGeometry, bandanaMaterial);
            bandana.position.set(0, 2.0, 0.3);
            bandana.rotation.x = Math.PI / 2;
            group.add(bandana);
            
            return group;
        },
        
        createCivilianModel: function() {
            var group = new THREE.Group();
            group.name = "civilian_model";
            
            // Corps
            var bodyGeometry = new THREE.CapsuleGeometry(0.45, 1.5, 16, 32);
            var body = new THREE.Mesh(bodyGeometry, this.assets.materials.civilian);
            body.position.y = 0.75;
            body.castShadow = true;
            group.add(body);
            
            // Tête
            var headGeometry = new THREE.SphereGeometry(0.32, 32, 32);
            var headMaterial = this.assets.materials.civilian.clone();
            headMaterial.color = new THREE.Color(this.assets.colors.brown);
            var head = new THREE.Mesh(headGeometry, headMaterial);
            head.position.y = 1.75;
            head.castShadow = true;
            group.add(head);
            
            // Vêtements
            var shirtGeometry = new THREE.CylinderGeometry(0.5, 0.6, 0.8, 16);
            var shirtMaterial = new THREE.MeshStandardMaterial({ 
                color: this.assets.colors.yellow,
                roughness: 0.8
            });
            var shirt = new THREE.Mesh(shirtGeometry, shirtMaterial);
            shirt.position.y = 1.3;
            shirt.castShadow = true;
            group.add(shirt);
            
            // Pantalon
            var pantsGeometry = new THREE.CylinderGeometry(0.4, 0.5, 0.7, 16);
            var pantsMaterial = new THREE.MeshStandardMaterial({ 
                color: this.assets.colors.darkGreen,
                roughness: 0.9
            });
            var pants = new THREE.Mesh(pantsGeometry, pantsMaterial);
            pants.position.y = 0.7;
            pants.castShadow = true;
            group.add(pants);
            
            return group;
        },
        
        createTreeModel: function() {
            var group = new THREE.Group();
            group.name = "tree_model";
            
            // Tronc
            var trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 4, 8);
            var trunk = new THREE.Mesh(trunkGeometry, this.assets.materials.bark);
            trunk.position.y = 2;
            trunk.castShadow = true;
            trunk.receiveShadow = true;
            group.add(trunk);
            
            // Feuillage
            var foliageGeometry = new THREE.SphereGeometry(2, 8, 6);
            var foliage = new THREE.Mesh(foliageGeometry, this.assets.materials.leaf);
            foliage.position.y = 5;
            foliage.castShadow = true;
            group.add(foliage);
            
            // Branches
            for (var i = 0; i < 4; i++) {
                var branchGeometry = new THREE.CylinderGeometry(0.1, 0.15, 1.5, 6);
                var branch = new THREE.Mesh(branchGeometry, this.assets.materials.bark);
                var angle = (i / 4) * Math.PI * 2;
                branch.position.set(Math.cos(angle) * 0.8, 3, Math.sin(angle) * 0.8);
                branch.rotation.z = angle;
                branch.castShadow = true;
                group.add(branch);
            }
            
            return group;
        },
        
        createRockModel: function() {
            var group = new THREE.Group();
            group.name = "rock_model";
            
            // Rocher principal
            var rockGeometry = new THREE.DodecahedronGeometry(1, 1);
            var rock = new THREE.Mesh(rockGeometry, this.assets.materials.stone);
            rock.castShadow = true;
            rock.receiveShadow = true;
            group.add(rock);
            
            // Petits rochers
            for (var i = 0; i < 3; i++) {
                var smallRockGeometry = new THREE.DodecahedronGeometry(0.3 + Math.random() * 0.2, 0);
                var smallRock = new THREE.Mesh(smallRockGeometry, this.assets.materials.stone);
                smallRock.position.set(
                    Math.random() * 1.5 - 0.75,
                    -0.2,
                    Math.random() * 1.5 - 0.75
                );
                smallRock.castShadow = true;
                group.add(smallRock);
            }
            
            return group;
        },
        
        createBuildingModel: function() {
            var group = new THREE.Group();
            group.name = "building_model";
            
            // Structure principale
            var width = 10;
            var height = 8;
            var depth = 8;
            
            var mainGeometry = new THREE.BoxGeometry(width, height, depth);
            var main = new THREE.Mesh(mainGeometry, this.assets.materials.wall);
            main.position.y = height / 2;
            main.castShadow = true;
            main.receiveShadow = true;
            group.add(main);
            
            // Toit
            var roofGeometry = new THREE.ConeGeometry(width * 0.9, 3, 4);
            var roof = new THREE.Mesh(roofGeometry, this.assets.materials.roof);
            roof.position.y = height + 1.5;
            roof.castShadow = true;
            group.add(roof);
            
            // Fenêtres
            var windowGeometry = new THREE.BoxGeometry(1, 1.5, 0.1);
            var windowMaterial = this.assets.materials.window.clone();
            
            for (var i = 0; i < 4; i++) {
                for (var j = 0; j < 2; j++) {
                    var window = new THREE.Mesh(windowGeometry, windowMaterial);
                    window.position.set(
                        (i - 1.5) * 2,
                        (j + 1) * 2,
                        depth / 2 + 0.1
                    );
                    group.add(window);
                }
            }
            
            // Porte
            var doorGeometry = new THREE.BoxGeometry(2, 3, 0.2);
            var door = new THREE.Mesh(doorGeometry, this.assets.materials.door);
            door.position.set(0, 1.5, depth / 2 + 0.2);
            door.castShadow = true;
            group.add(door);
            
            return group;
        },
        
        createHouseModel: function() {
            var group = new THREE.Group();
            group.name = "house_model";
            
            // Structure principale
            var width = 6;
            var height = 5;
            var depth = 5;
            
            var mainGeometry = new THREE.BoxGeometry(width, height, depth);
            var main = new THREE.Mesh(mainGeometry, this.assets.materials.wall_dirty);
            main.position.y = height / 2;
            main.castShadow = true;
            main.receiveShadow = true;
            group.add(main);
            
            // Toit pentu
            var roofGeometry = new THREE.ConeGeometry(width * 0.8, 2, 4);
            var roof = new THREE.Mesh(roofGeometry, this.assets.materials.roof);
            roof.position.y = height + 1;
            roof.castShadow = true;
            group.add(roof);
            
            // Cheminée
            var chimneyGeometry = new THREE.BoxGeometry(0.5, 1.5, 0.5);
            var chimney = new THREE.Mesh(chimneyGeometry, this.assets.materials.brick);
            chimney.position.set(1.5, height + 0.75, 0);
            chimney.castShadow = true;
            group.add(chimney);
            
            // Porte
            var doorGeometry = new THREE.BoxGeometry(1.2, 2.2, 0.2);
            var door = new THREE.Mesh(doorGeometry, this.assets.materials.wood_dark);
            door.position.set(0, 1.1, depth / 2 + 0.1);
            door.castShadow = true;
            group.add(door);
            
            // Fenêtres
            var windowGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.1);
            var windowMaterial = this.assets.materials.window.clone();
            
            for (var i = 0; i < 2; i++) {
                var window = new THREE.Mesh(windowGeometry, windowMaterial);
                window.position.set(
                    (i - 0.5) * 2,
                    2.5,
                    depth / 2 + 0.1
                );
                group.add(window);
            }
            
            return group;
        },
        
        createWeaponModel: function() {
            var group = new THREE.Group();
            group.name = "weapon_model";
            
            // Canon
            var barrelGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
            var barrel = new THREE.Mesh(barrelGeometry, this.assets.materials.metal);
            barrel.rotation.x = Math.PI / 2;
            group.add(barrel);
            
            // Crosse
            var stockGeometry = new THREE.BoxGeometry(0.3, 0.1, 0.8);
            var stock = new THREE.Mesh(stockGeometry, this.assets.materials.wood);
            stock.position.z = -0.4;
            group.add(stock);
            
            // Poignée
            var gripGeometry = new THREE.BoxGeometry(0.1, 0.3, 0.2);
            var grip = new THREE.Mesh(gripGeometry, this.assets.materials.wood);
            grip.position.set(0, -0.15, -0.2);
            group.add(grip);
            
            // Chargeur
            var magazineGeometry = new THREE.BoxGeometry(0.2, 0.3, 0.1);
            var magazine = new THREE.Mesh(magazineGeometry, this.assets.materials.metal);
            magazine.position.set(0, 0, -0.1);
            group.add(magazine);
            
            return group;
        },
        
        createItemModel: function() {
            var group = new THREE.Group();
            group.name = "item_model";
            
            // Objet brillant
            var itemGeometry = new THREE.OctahedronGeometry(0.3, 1);
            var item = new THREE.Mesh(itemGeometry, this.assets.materials.item);
            item.castShadow = true;
            group.add(item);
            
            // Effet de brillance
            var glowGeometry = new THREE.SphereGeometry(0.35, 8, 8);
            var glowMaterial = new THREE.MeshBasicMaterial({
                color: 0xffff00,
                transparent: true,
                opacity: 0.3,
                side: THREE.BackSide
            });
            var glow = new THREE.Mesh(glowGeometry, glowMaterial);
            group.add(glow);
            
            return group;
        },
        
        // ============================================
        // THREE.JS INITIALISATION
        // ============================================
        initThreeJS: function() {
            try {
                console.log("🎨 Initialisation Three.js...");
                
                // Créer la scène
                this.three.scene = new THREE.Scene();
                this.three.scene.background = new THREE.Color(this.assets.colors.sky);
                this.three.scene.fog = new THREE.Fog(this.assets.colors.sky, 50, 1000);
                
                // Créer la caméra
                this.three.camera = new THREE.PerspectiveCamera(
                    75,
                    window.innerWidth / window.innerHeight,
                    0.1,
                    2000
                );
                this.three.camera.position.set(0, 10, 15);
                
                // Créer le renderer
                var canvas = document.getElementById('game-canvas');
                this.three.renderer = new THREE.WebGLRenderer({
                    canvas: canvas,
                    antialias: this.config.graphics.antialiasing,
                    alpha: true,
                    powerPreference: "high-performance"
                });
                
                this.three.renderer.setSize(window.innerWidth, window.innerHeight);
                this.three.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                this.three.renderer.shadowMap.enabled = this.config.graphics.shadows;
                this.three.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
                this.three.renderer.outputEncoding = THREE.sRGBEncoding;
                this.three.renderer.toneMapping = THREE.ACESFilmicToneMapping;
                this.three.renderer.toneMappingExposure = 1.0;
                
                // Raycaster pour les interactions
                this.three.raycaster = new THREE.Raycaster();
                
                // Créer l'environnement de base
                this.createEnvironment();
                
                console.log("✅ Three.js initialisé");
            } catch (error) {
                console.error("❌ Erreur Three.js:", error);
                throw error;
            }
        },
        
        createEnvironment: function() {
            console.log("🌍 Création de l'environnement...");
            
            // Lumière ambiante
            var ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
            this.three.scene.add(ambientLight);
            this.world.lights.push(ambientLight);
            
            // Soleil (lumière directionnelle)
            this.world.sun = new THREE.DirectionalLight(0xffd700, 1.2);
            this.world.sun.position.set(100, 150, 100);
            this.world.sun.castShadow = true;
            this.world.sun.shadow.mapSize.width = 2048;
            this.world.sun.shadow.mapSize.height = 2048;
            this.world.sun.shadow.camera.near = 0.5;
            this.world.sun.shadow.camera.far = 500;
            this.world.sun.shadow.camera.left = -100;
            this.world.sun.shadow.camera.right = 100;
            this.world.sun.shadow.camera.top = 100;
            this.world.sun.shadow.camera.bottom = -100;
            this.three.scene.add(this.world.sun);
            this.world.lights.push(this.world.sun);
            
            // Lumière de remplissage
            var fillLight = new THREE.DirectionalLight(0x87CEEB, 0.3);
            fillLight.position.set(-100, 50, -100);
            this.three.scene.add(fillLight);
            this.world.lights.push(fillLight);
            
            // Lumière hémisphérique
            var hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x006400, 0.2);
            this.three.scene.add(hemisphereLight);
            this.world.lights.push(hemisphereLight);
            
            // Ciel
            var skyGeometry = new THREE.SphereGeometry(800, 64, 64);
            var skyMaterial = new THREE.MeshBasicMaterial({
                color: this.assets.colors.sky,
                side: THREE.BackSide,
                fog: false
            });
            this.world.skybox = new THREE.Mesh(skyGeometry, skyMaterial);
            this.three.scene.add(this.world.skybox);
            
            // Sol
            var groundGeometry = new THREE.PlaneGeometry(2000, 2000, 100, 100);
            this.world.ground = new THREE.Mesh(groundGeometry, this.assets.materials.ground);
            this.world.ground.rotation.x = -Math.PI / 2;
            this.world.ground.receiveShadow = true;
            this.three.scene.add(this.world.ground);
            
            // Océan/rivière
            var waterGeometry = new THREE.PlaneGeometry(500, 500, 1, 1);
            this.world.water = new THREE.Mesh(waterGeometry, this.assets.materials.water);
            this.world.water.rotation.x = -Math.PI / 2;
            this.world.water.position.y = -0.1;
            this.three.scene.add(this.world.water);
            
            // Créer des éléments naturels
            this.createNaturalElements();
            
            // Créer des bâtiments
            this.createCityElements();
            
            console.log("✅ Environnement créé");
        },
        
        createNaturalElements: function() {
            // Arbres
            for (var i = 0; i < 100; i++) {
                var tree = this.assets.models.tree.clone();
                tree.position.set(
                    this.utils.randomRange(-400, 400),
                    0,
                    this.utils.randomRange(-400, 400)
                );
                tree.scale.setScalar(this.utils.randomRange(0.8, 1.5));
                tree.rotation.y = Math.random() * Math.PI * 2;
                this.three.scene.add(tree);
                this.world.trees.push(tree);
            }
            
            // Rochers
            for (var j = 0; j < 50; j++) {
                var rock = this.assets.models.rock.clone();
                rock.position.set(
                    this.utils.randomRange(-300, 300),
                    0,
                    this.utils.randomRange(-300, 300)
                );
                rock.scale.setScalar(this.utils.randomRange(0.5, 2));
                rock.rotation.y = Math.random() * Math.PI * 2;
                this.three.scene.add(rock);
                this.world.rocks.push(rock);
            }
            
            // Buissons
            for (var k = 0; k < 200; k++) {
                var bushGeometry = new THREE.SphereGeometry(0.5 + Math.random() * 1, 6, 6);
                var bush = new THREE.Mesh(bushGeometry, this.assets.materials.leaf);
                bush.position.set(
                    this.utils.randomRange(-350, 350),
                    0.3,
                    this.utils.randomRange(-350, 350)
                );
                bush.castShadow = true;
                this.three.scene.add(bush);
                this.world.decorations.push(bush);
            }
            
            // Herbes
            for (var l = 0; l < 500; l++) {
                var grassGeometry = new THREE.ConeGeometry(0.1, 0.5 + Math.random() * 0.5, 4);
                var grass = new THREE.Mesh(grassGeometry, this.assets.materials.grass);
                grass.position.set(
                    this.utils.randomRange(-450, 450),
                    0.25,
                    this.utils.randomRange(-450, 450)
                );
                grass.rotation.x = Math.random() * 0.2;
                grass.rotation.z = Math.random() * 0.2;
                this.three.scene.add(grass);
                this.world.decorations.push(grass);
            }
        },
        
        createCityElements: function() {
            // Bâtiments principaux
            var buildingPositions = [
                { x: -50, z: -50, scale: 1.5 },
                { x: 50, z: -50, scale: 1.2 },
                { x: -50, z: 50, scale: 1.3 },
                { x: 50, z: 50, scale: 1.4 },
                { x: 0, z: -80, scale: 2.0 },
                { x: -80, z: 0, scale: 1.1 },
                { x: 80, z: 0, scale: 1.6 },
                { x: 0, z: 80, scale: 1.8 }
            ];
            
            for (var i = 0; i < buildingPositions.length; i++) {
                var pos = buildingPositions[i];
                var building = this.assets.models.building.clone();
                building.position.set(pos.x, 0, pos.z);
                building.scale.setScalar(pos.scale);
                building.rotation.y = Math.random() * Math.PI * 2;
                this.three.scene.add(building);
                this.world.buildings.push(building);
            }
            
            // Maisons
            for (var j = 0; j < 20; j++) {
                var house = this.assets.models.house.clone();
                var angle = Math.random() * Math.PI * 2;
                var radius = 100 + Math.random() * 150;
                house.position.set(
                    Math.cos(angle) * radius,
                    0,
                    Math.sin(angle) * radius
                );
                house.scale.setScalar(0.8 + Math.random() * 0.4);
                house.rotation.y = Math.random() * Math.PI * 2;
                this.three.scene.add(house);
                this.world.buildings.push(house);
            }
            
            // Lampadaires
            for (var k = 0; k < 30; k++) {
                var lampPost = this.createLampPost();
                var angle = Math.random() * Math.PI * 2;
                var radius = 30 + Math.random() * 120;
                lampPost.position.set(
                    Math.cos(angle) * radius,
                    0,
                    Math.sin(angle) * radius
                );
                this.three.scene.add(lampPost);
                this.world.decorations.push(lampPost);
            }
            
            // Bancs
            for (var l = 0; l < 10; l++) {
                var bench = this.createBench();
                var angle = Math.random() * Math.PI * 2;
                var radius = 40 + Math.random() * 80;
                bench.position.set(
                    Math.cos(angle) * radius,
                    0,
                    Math.sin(angle) * radius
                );
                bench.rotation.y = Math.random() * Math.PI * 2;
                this.three.scene.add(bench);
                this.world.decorations.push(bench);
            }
        },
        
        createLampPost: function() {
            var group = new THREE.Group();
            
            // Poteau
            var poleGeometry = new THREE.CylinderGeometry(0.1, 0.15, 5, 8);
            var pole = new THREE.Mesh(poleGeometry, this.assets.materials.metal);
            pole.position.y = 2.5;
            pole.castShadow = true;
            group.add(pole);
            
            // Lumière
            var lightGeometry = new THREE.SphereGeometry(0.3, 8, 8);
            var lightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffaa });
            var light = new THREE.Mesh(lightGeometry, lightMaterial);
            light.position.y = 5;
            group.add(light);
            
            // Source lumineuse
            var pointLight = new THREE.PointLight(0xffffaa, 1, 10);
            pointLight.position.y = 5;
            group.add(pointLight);
            
            return group;
        },
        
        createBench: function() {
            var group = new THREE.Group();
            
            // Siège
            var seatGeometry = new THREE.BoxGeometry(2, 0.1, 0.6);
            var seat = new THREE.Mesh(seatGeometry, this.assets.materials.wood);
            seat.position.y = 0.5;
            seat.castShadow = true;
            group.add(seat);
            
            // Dossiers
            var backGeometry = new THREE.BoxGeometry(2, 0.8, 0.05);
            var back = new THREE.Mesh(backGeometry, this.assets.materials.wood);
            back.position.set(0, 0.9, 0.3);
            back.castShadow = true;
            group.add(back);
            
            // Pieds
            var legGeometry = new THREE.BoxGeometry(0.1, 0.5, 0.1);
            
            for (var i = 0; i < 4; i++) {
                var leg = new THREE.Mesh(legGeometry, this.assets.materials.wood);
                var x = (i % 2) * 1.8 - 0.9;
                var z = Math.floor(i / 2) * 0.5 - 0.25;
                leg.position.set(x, 0.25, z);
                leg.castShadow = true;
                group.add(leg);
            }
            
            return group;
        },
        
        // ============================================
        // INTERFACE UTILISATEUR
        // ============================================
        initUI: function() {
            console.log("🖥️ Initialisation de l'interface...");
            
            this.ui = {
                elements: {},
                updateFunctions: {},
                state: {}
            };
            
            // Initialiser les éléments UI
            this.initUIElements();
            
            // Initialiser les écrans
            this.initUIScreens();
            
            // Initialiser les HUD
            this.initHUD();
            
            console.log("✅ Interface initialisée");
        },
        
        initUIElements: function() {
            // Référencer tous les éléments UI importants
            this.ui.elements = {
                startScreen: document.getElementById('start-screen'),
                gameContainer: document.getElementById('game-container'),
                messageBox: document.getElementById('message-box'),
                notification: document.getElementById('notification'),
                pauseScreen: document.getElementById('pause-screen'),
                inventoryPanel: document.getElementById('inventory-panel'),
                crosshair: document.getElementById('crosshair'),
                mobileControls: document.getElementById('mobile-controls'),
                
                // Boutons
                startBtn: document.getElementById('start-btn'),
                continueBtn: document.getElementById('continue-btn'),
                controlsBtn: document.getElementById('controls-btn'),
                settingsBtn: document.getElementById('settings-btn'),
                resumeBtn: document.getElementById('resume-btn'),
                saveBtn: document.getElementById('save-btn'),
                quitBtn: document.getElementById('quit-btn'),
                closeInventory: document.getElementById('close-inventory'),
                
                // Textes HUD
                healthText: document.getElementById('health-text'),
                healthBar: document.getElementById('health-bar'),
                xpText: document.getElementById('xp-text'),
                xpBar: document.getElementById('xp-bar'),
                ammoText: document.getElementById('ammo-text'),
                ammoBar: document.getElementById('ammo-bar'),
                weaponText: document.getElementById('weapon-text'),
                locationText: document.getElementById('location-text'),
                enemyCount: document.getElementById('enemy-count'),
                score: document.getElementById('score'),
                money: document.getElementById('money'),
                dayText: document.getElementById('day-text'),
                
                // Quête
                questIndicator: document.getElementById('quest-indicator'),
                questText: document.getElementById('quest-text'),
                questProgress: document.getElementById('quest-progress'),
                questProgressText: document.getElementById('quest-progress-text'),
                
                // Inventaire
                inventoryItems: document.getElementById('inventory-items'),
                invLevel: document.getElementById('inv-level'),
                invXp: document.getElementById('inv-xp'),
                invHealth: document.getElementById('inv-health'),
                invKills: document.getElementById('inv-kills'),
                invScore: document.getElementById('inv-score'),
                invMoney: document.getElementById('inv-money'),
                invTime: document.getElementById('inv-time'),
                invQuests: document.getElementById('inv-quests'),
                invQuestsTotal: document.getElementById('inv-quests-total'),
                invWeight: document.getElementById('inv-weight'),
                invMaxWeight: document.getElementById('inv-max-weight')
            };
            
            // Vérifier les éléments critiques
            if (!this.ui.elements.messageBox) {
                console.warn("⚠️ messageBox non trouvé dans le DOM");
            }
            if (!this.ui.elements.startScreen) {
                console.warn("⚠️ startScreen non trouvé dans le DOM");
            }
        },
        
        initUIScreens: function() {
            // Cacher tous les écrans sauf le démarrage
            this.ui.elements.gameContainer.style.display = 'none';
            this.ui.elements.messageBox.style.display = 'none';
            this.ui.elements.pauseScreen.style.display = 'none';
            this.ui.elements.inventoryPanel.style.display = 'none';
            
            // Événements des boutons
            this.initUIEvents();
        },
        
        initUIEvents: function() {
            var self = this;
            
            // Bouton Nouvelle Partie
            this.ui.elements.startBtn.addEventListener('click', function() {
                self.playSound('sfx-click');
                self.startNewGame();
            });
            
            // Bouton Continuer
            this.ui.elements.continueBtn.addEventListener('click', function() {
                self.playSound('sfx-click');
                if (self.loadGame()) {
                    self.startGame();
                } else {
                    self.showMessage("Aucune sauvegarde trouvée", 2000);
                }
            });
            
            // Bouton Contrôles
            this.ui.elements.controlsBtn.addEventListener('click', function() {
                self.playSound('sfx-click');
                self.showMessage(
                    "🎮 CONTRÔLES COMPLETS:\n\n" +
                    "Z/W = Avancer\nS = Reculer\nQ/A = Gauche\nD = Droite\n" +
                    "ESPACE = Sauter\nSHIFT = Sprint\n" +
                    "CLIC GAUCHE = Tirer\nCLIC DROIT = Viseur\n" +
                    "E = Interagir\nF = Lampe torche\nI = Inventaire\n" +
                    "TAB = Carte\nECHAP = Pause\n1-6 = Armes\n" +
                    "R = Recharger\nC = S'accroupir\nV = Mode véhicule\n" +
                    "M = Carte monde\nJ = Journal\nK = Compétences\n" +
                    "U = Construire\nO = Options\nP = Photo mode",
                    8000
                );
            });
            
            // Bouton Paramètres
            if (this.ui.elements.settingsBtn) {
                this.ui.elements.settingsBtn.addEventListener('click', function() {
                    self.playSound('sfx-click');
                    self.showSettings();
                });
            }
            
            // Boutons pause
            this.ui.elements.resumeBtn.addEventListener('click', function() {
                self.playSound('sfx-click');
                self.togglePause();
            });
            
            this.ui.elements.saveBtn.addEventListener('click', function() {
                self.playSound('sfx-click');
                self.saveGame();
                self.showMessage("Partie sauvegardée", 1500);
            });
            
            this.ui.elements.quitBtn.addEventListener('click', function() {
                self.playSound('sfx-click');
                if (confirm("Retourner au menu principal?")) {
                    self.saveGame();
                    self.returnToMenu();
                }
            });
            
            // Bouton fermer inventaire
            this.ui.elements.closeInventory.addEventListener('click', function() {
                self.playSound('sfx-click');
                self.toggleInventory();
            });
            
            // Fermer message avec clic
            this.ui.elements.messageBox.addEventListener('click', function() {
                if (this.style.display === 'block') {
                    this.style.display = 'none';
                    self.playSound('sfx-click');
                }
            });
        },
        
        initHUD: function() {
            // Mettre à jour le HUD périodiquement
            var self = this;
            this.ui.updateFunctions.hud = function() {
                if (!self.gameState.inGame) return;
                
                // Santé
                var healthPercent = (self.state.health / self.state.maxHealth) * 100;
                self.ui.elements.healthText.textContent = 
                    Math.round(self.state.health) + "/" + self.state.maxHealth;
                self.ui.elements.healthBar.style.width = healthPercent + "%";
                
                // XP
                var xpPercent = (self.state.xp / self.state.xpToNext) * 100;
                self.ui.elements.xpText.textContent = 
                    self.state.xp + "/" + self.state.xpToNext;
                self.ui.elements.xpBar.style.width = xpPercent + "%";
                
                // Munitions
                var weapon = self.weapons[self.state.currentWeapon];
                var ammoPercent = (weapon.ammo / weapon.maxAmmo) * 100;
                self.ui.elements.ammoText.textContent = 
                    weapon.ammo + "/" + weapon.maxAmmo;
                self.ui.elements.ammoBar.style.width = ammoPercent + "%";
                self.ui.elements.weaponText.textContent = weapon.name;
                
                // Localisation
                var city = self.cities[self.state.currentCity];
                var district = city.districts[self.state.currentDistrict];
                self.ui.elements.locationText.textContent = city.name + ", " + district;
                
                // Statistiques
                self.ui.elements.enemyCount.textContent = self.state.enemiesRemaining;
                self.ui.elements.score.textContent = self.state.score;
                self.ui.elements.money.textContent = self.utils.formatMoney(self.state.money);
                self.ui.elements.dayText.textContent = "Jour " + self.state.day;
            };
        },
        
        // ============================================
        // CONTRÔLES
        // ============================================
        initControls: function() {
            console.log("🎮 Initialisation des contrôles...");
            
            var self = this;
            
            // Clavier
            document.addEventListener('keydown', function(e) {
                if (self.gameState.paused || self.gameState.inMenu) return;
                
                var key = e.key.toLowerCase();
                self.controls.keys[key] = true;
                
                switch (key) {
                    case 'escape':
                        e.preventDefault();
                        self.togglePause();
                        break;
                    case 'e':
                        if (self.gameState.inGame) self.playerInteract();
                        break;
                    case 'i':
                        if (self.gameState.inGame) self.toggleInventory();
                        break;
                    case 'f':
                        if (self.gameState.inGame) self.toggleFlashlight();
                        break;
                    case ' ':
                        if (self.gameState.inGame && self.world.player) self.playerJump();
                        break;
                    case 'r':
                        if (self.gameState.inGame) self.reloadWeapon();
                        break;
                    case 'c':
                        if (self.gameState.inGame) self.toggleCrouch();
                        break;
                    case 'tab':
                        if (self.gameState.inGame) self.toggleMap();
                        break;
                    case '1': case '2': case '3': case '4': case '5': case '6':
                        if (self.gameState.inGame) {
                            var weaponIndex = parseInt(key) - 1;
                            if (weaponIndex < self.weapons.length) {
                                self.switchWeapon(weaponIndex);
                            }
                        }
                        break;
                }
            });
            
            document.addEventListener('keyup', function(e) {
                var key = e.key.toLowerCase();
                self.controls.keys[key] = false;
            });
            
            // Souris
            document.addEventListener('mousemove', function(e) {
                if (!self.gameState.inGame || self.gameState.paused || !self.controls.mouse.locked) return;
                
                self.controls.mouse.dx = e.movementX || 0;
                self.controls.mouse.dy = e.movementY || 0;
                
                // Rotation de la caméra
                if (self.world.player) {
                    var sensitivity = self.controls.sensitivity * 0.002;
                    self.world.player.rotation.y -= self.controls.mouse.dx * sensitivity;
                    
                    if (self.three.camera) {
                        var verticalRotation = self.three.camera.rotation.x - 
                            (self.controls.mouse.dy * sensitivity * (self.controls.invertedY ? -1 : 1));
                        self.three.camera.rotation.x = self.utils.clamp(verticalRotation, -Math.PI/2, Math.PI/2);
                    }
                }
            });
            
            document.addEventListener('mousedown', function(e) {
                if (!self.gameState.inGame || self.gameState.paused) return;
                
                if (e.button === 0) { // Clic gauche
                    self.playerShoot();
                } else if (e.button === 2) { // Clic droit
                    self.toggleAim();
                }
            });
            
            // Empêcher le menu contextuel
            document.addEventListener('contextmenu', function(e) {
                if (self.gameState.inGame) {
                    e.preventDefault();
                    return false;
                }
            });
            
            // Pointer lock pour FPS
            document.addEventListener('click', function() {
                if (self.gameState.inGame && !self.gameState.paused && !self.isMobile()) {
                    document.body.requestPointerLock();
                    self.controls.mouse.locked = true;
                }
            });
            
            document.addEventListener('pointerlockchange', function() {
                self.controls.mouse.locked = document.pointerLockElement === document.body;
            });
            
            // Redimensionnement
            window.addEventListener('resize', function() {
                self.onWindowResize();
            });
            
            console.log("✅ Contrôles initialisés");
        },
        
        isMobile: function() {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        },
        
        // ============================================
        // AUDIO
        // ============================================
        initAudio: function() {
            console.log("🔊 Initialisation audio...");
            
            var self = this;
            this.systems.audio = {
                sounds: {},
                music: null,
                volume: this.config.audio.volume,
                muted: this.config.audio.muted,
                
                play: function(soundId) {
                    if (this.muted) return;
                    
                    // Simulation de son
                    console.log("🔊 Son joué:", soundId);
                    
                    // Vibration si mobile et activé
                    if (self.isMobile() && self.controls.vibration && navigator.vibrate) {
                        navigator.vibrate(50);
                    }
                },
                
                playMusic: function(musicId) {
                    if (this.muted) return;
                    
                    // Simulation de musique
                    console.log("🎵 Musique:", musicId);
                },
                
                setVolume: function(volume) {
                    this.volume = self.utils.clamp(volume, 0, 1);
                    this.muted = this.volume === 0;
                },
                
                mute: function() {
                    this.muted = true;
                },
                
                unmute: function() {
                    this.muted = false;
                }
            };
            
            console.log("✅ Audio initialisé");
        },
        
        playSound: function(soundId) {
            if (this.systems.audio) {
                this.systems.audio.play(soundId);
            }
        },
        
        // ============================================
        // SYSTÈMES DE JEU
        // ============================================
        initGameSystems: function() {
            console.log("🎲 Initialisation des systèmes de jeu...");
            
            // Système de quêtes
            this.initQuestSystem();
            
            // Système d'inventaire
            this.initInventorySystem();
            
            // Système de combat
            this.initCombatSystem();
            
            // Système de sauvegarde
            this.initSaveSystem();
            
            // Système de temps
            this.initTimeSystem();
            
            console.log("✅ Systèmes de jeu initialisés");
        },
        
        initQuestSystem: function() {
            var self = this;
            this.systems.quest = {
                activeQuests: [],
                completedQuests: [],
                failedQuests: [],
                questLog: [],
                
                startQuest: function(npcId, questData) {
                    var quest = {
                        id: self.utils.generateId(),
                        npcId: npcId,
                        title: questData.title,
                        description: questData.description,
                        objectives: questData.objectives,
                        rewards: questData.rewards,
                        startedAt: Date.now(),
                        completed: false,
                        failed: false,
                        progress: {}
                    };
                    
                    this.activeQuests.push(quest);
                    this.questLog.push({
                        type: "started",
                        quest: quest,
                        timestamp: Date.now()
                    });
                    
                    self.showNotification("📜 Nouvelle quête: " + quest.title, 3000);
                    return quest.id;
                },
                
                updateObjective: function(questId, objectiveId, progress) {
                    var quest = this.activeQuests.find(q => q.id === questId);
                    if (!quest) return;
                    
                    quest.progress[objectiveId] = progress;
                    
                    // Vérifier si tous les objectifs sont complétés
                    var allCompleted = true;
                    for (var objId in quest.objectives) {
                        if (quest.progress[objId] < quest.objectives[objId].target) {
                            allCompleted = false;
                            break;
                        }
                    }
                    
                    if (allCompleted) {
                        this.completeQuest(questId);
                    }
                },
                
                completeQuest: function(questId) {
                    var questIndex = this.activeQuests.findIndex(q => q.id === questId);
                    if (questIndex === -1) return;
                    
                    var quest = this.activeQuests[questIndex];
                    quest.completed = true;
                    quest.completedAt = Date.now();
                    
                    // Donner les récompenses
                    if (quest.rewards) {
                        if (quest.rewards.xp) {
                            self.addXP(quest.rewards.xp);
                        }
                        if (quest.rewards.money) {
                            self.state.money += quest.rewards.money;
                        }
                        if (quest.rewards.items) {
                            quest.rewards.items.forEach(function(item) {
                                self.addToInventory(item);
                            });
                        }
                    }
                    
                    // Déplacer vers les quêtes complétées
                    this.activeQuests.splice(questIndex, 1);
                    this.completedQuests.push(quest);
                    
                    this.questLog.push({
                        type: "completed",
                        quest: quest,
                        timestamp: Date.now()
                    });
                    
                    self.showNotification("✅ Quête complétée: " + quest.title, 3000);
                    self.updateHUD();
                },
                
                failQuest: function(questId, reason) {
                    var questIndex = this.activeQuests.findIndex(q => q.id === questId);
                    if (questIndex === -1) return;
                    
                    var quest = this.activeQuests[questIndex];
                    quest.failed = true;
                    quest.failedReason = reason;
                    quest.failedAt = Date.now();
                    
                    this.activeQuests.splice(questIndex, 1);
                    this.failedQuests.push(quest);
                    
                    this.questLog.push({
                        type: "failed",
                        quest: quest,
                        reason: reason,
                        timestamp: Date.now()
                    });
                    
                    self.showNotification("❌ Quête échouée: " + quest.title, 3000);
                },
                
                getActiveQuests: function() {
                    return this.activeQuests;
                },
                
                getQuestLog: function() {
                    return this.questLog;
                }
            };
        },
        
        initInventorySystem: function() {
            var self = this;
            this.systems.inventory = {
                items: [],
                maxSlots: 30,
                maxWeight: 100,
                
                addItem: function(itemData, quantity) {
                    quantity = quantity || 1;
                    
                    // Vérifier le poids
                    var itemWeight = (itemData.weight || 1) * quantity;
                    if (self.state.weight + itemWeight > self.state.maxWeight) {
                        self.showMessage("Trop lourd! Poids maximum: " + self.state.maxWeight + "kg", 2000);
                        return false;
                    }
                    
                    // Vérifier les emplacements
                    if (this.items.length >= this.maxSlots) {
                        self.showMessage("Inventaire plein!", 2000);
                        return false;
                    }
                    
                    // Ajouter l'objet
                    var existingItem = this.items.find(function(item) { 
                        return item.id === itemData.id && item.stackable;
                    });
                    
                    if (existingItem && existingItem.stackable) {
                        existingItem.quantity += quantity;
                    } else {
                        var newItem = Object.assign({}, itemData, { quantity: quantity });
                        this.items.push(newItem);
                    }
                    
                    // Mettre à jour le poids
                    self.state.weight += itemWeight;
                    
                    // Notification
                    self.showNotification("🎒 " + itemData.name + " x" + quantity + " ajouté", 2000);
                    self.playSound('sfx-collect');
                    
                    // Mettre à jour l'affichage
                    self.updateInventoryDisplay();
                    return true;
                },
                
                removeItem: function(itemId, quantity) {
                    quantity = quantity || 1;
                    
                    var itemIndex = this.items.findIndex(function(item) { return item.id === itemId; });
                    if (itemIndex === -1) return null;
                    
                    var item = this.items[itemIndex];
                    
                    if (item.quantity <= quantity) {
                        // Supprimer complètement l'objet
                        this.items.splice(itemIndex, 1);
                        self.state.weight -= (item.weight || 1) * item.quantity;
                    } else {
                        // Réduire la quantité
                        item.quantity -= quantity;
                        self.state.weight -= (item.weight || 1) * quantity;
                    }
                    
                    self.updateInventoryDisplay();
                    return item;
                },
                
                useItem: function(itemId) {
                    var item = this.items.find(function(item) { return item.id === itemId; });
                    if (!item) return;
                    
                    switch (item.type) {
                        case "health":
                            var healAmount = Math.min(
                                self.state.maxHealth - self.state.health,
                                item.value || 25
                            );
                            self.state.health += healAmount;
                            self.showMessage("❤️ Santé restaurée de " + healAmount, 1500);
                            this.removeItem(itemId, 1);
                            break;
                            
                        case "ammo":
                            var weapon = self.weapons[self.state.currentWeapon];
                            var ammoToAdd = Math.min(
                                weapon.maxAmmo - weapon.ammo,
                                item.value || 30
                            );
                            weapon.ammo += ammoToAdd;
                            self.showMessage("📦 Munitions +" + ammoToAdd, 1500);
                            this.removeItem(itemId, 1);
                            break;
                            
                        case "food":
                            var hungerToAdd = Math.min(
                                self.state.maxHunger - self.state.hunger,
                                item.value || 20
                            );
                            self.state.hunger += hungerToAdd;
                            self.showMessage("🍲 Faim restaurée de " + hungerToAdd, 1500);
                            this.removeItem(itemId, 1);
                            break;
                            
                        case "drink":
                            var thirstToAdd = Math.min(
                                self.state.maxThirst - self.state.thirst,
                                item.value || 30
                            );
                            self.state.thirst += thirstToAdd;
                            self.showMessage("💧 Soif restaurée de " + thirstToAdd, 1500);
                            this.removeItem(itemId, 1);
                            break;
                            
                        case "medical":
                            self.showMessage("💊 Médicament utilisé", 1500);
                            this.removeItem(itemId, 1);
                            break;
                    }
                    
                    self.updateHUD();
                },
                
                equipItem: function(itemId) {
                    var item = this.items.find(function(item) { return item.id === itemId; });
                    if (!item) return;
                    
                    // Logique d'équipement selon le type
                    if (item.equipmentSlot) {
                        // Déséquiper l'ancien item s'il y en a un
                        if (self.state.equipment[item.equipmentSlot]) {
                            this.addItem(self.state.equipment[item.equipmentSlot], 1);
                        }
                        
                        // Équiper le nouveau
                        self.state.equipment[item.equipmentSlot] = item;
                        this.removeItem(itemId, 1);
                        
                        self.showMessage(item.name + " équipé", 1500);
                        self.updateInventoryDisplay();
                    }
                },
                
                sortItems: function() {
                    this.items.sort(function(a, b) {
                        // Par type, puis par rareté, puis par nom
                        if (a.type !== b.type) return a.type.localeCompare(b.type);
                        if (a.rarity !== b.rarity) {
                            var rarityOrder = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };
                            return rarityOrder[b.rarity] - rarityOrder[a.rarity];
                        }
                        return a.name.localeCompare(b.name);
                    });
                    
                    self.showMessage("Inventaire trié", 1500);
                    self.updateInventoryDisplay();
                }
            };
        },
        
        initCombatSystem: function() {
            var self = this;
            this.systems.combat = {
                bullets: [],
                lastShot: 0,
                bulletSpeed: 25,
                bulletLifetime: 2000,
                recoilAmount: 0.05,
                maxRecoil: 0.3,
                currentRecoil: 0,
                isReloading: false,
                reloadTime: 2000,
                
                shoot: function() {
                    var now = Date.now();
                    var weapon = self.weapons[self.state.currentWeapon];
                    
                    // Vérifications
                    if (this.isReloading) return;
                    if (now - this.lastShot < weapon.fireRate) return;
                    if (weapon.ammo <= 0) {
                        self.showMessage("Plus de munitions! Appuyez sur R pour recharger", 1500);
                        return;
                    }
                    
                    // Consommer munition
                    weapon.ammo--;
                    this.lastShot = now;
                    
                    // Créer une balle
                    self.createBullet();
                    
                    // Son
                    self.playSound(weapon.sound);
                    
                    // Recul
                    this.applyRecoil();
                    
                    // Mettre à jour le HUD
                    self.updateHUD();
                    
                    // Statistiques
                    self.stats.shotsFired++;
                },
                
                applyRecoil: function() {
                    var weapon = self.weapons[self.state.currentWeapon];
                    var recoil = weapon.type === "shotgun" ? 0.2 : 0.05;
                    
                    this.currentRecoil += recoil;
                    this.currentRecoil = Math.min(
                        this.currentRecoil, 
                        this.maxRecoil
                    );
                },
                
                updateBullets: function() {
                    var now = Date.now();
                    
                    for (var i = self.world.projectiles.length - 1; i >= 0; i--) {
                        var bullet = self.world.projectiles[i];
                        if (!bullet) continue;
                        
                        // Vérifier la durée de vie
                        if (now - bullet.userData.spawnTime > this.bulletLifetime) {
                            self.three.scene.remove(bullet);
                            self.world.projectiles.splice(i, 1);
                            continue;
                        }
                        
                        // Déplacement
                        var moveDistance = bullet.userData.speed * 0.016;
                        bullet.position.add(
                            bullet.userData.direction.clone().multiplyScalar(moveDistance)
                        );
                        
                        // Vérifier les collisions
                        if (self.checkBulletCollision(bullet, i)) {
                            self.three.scene.remove(bullet);
                            self.world.projectiles.splice(i, 1);
                        }
                    }
                    
                    // Réduire le recul
                    if (this.currentRecoil > 0) {
                        this.currentRecoil *= 0.9;
                        if (this.currentRecoil < 0.01) {
                            this.currentRecoil = 0;
                        }
                    }
                },
                
                reloadWeapon: function() {
                    if (this.isReloading) return;
                    
                    var weapon = self.weapons[self.state.currentWeapon];
                    if (weapon.ammo === weapon.maxAmmo) return;
                    
                    this.isReloading = true;
                    self.showMessage("Rechargement...", 1500);
                    
                    // Animation de rechargement
                    setTimeout(function() {
                        weapon.ammo = weapon.maxAmmo;
                        this.isReloading = false;
                        self.showMessage("Arme rechargée", 1000);
                        self.updateHUD();
                        self.playSound('sfx-collect');
                    }.bind(this), this.reloadTime);
                }
            };
        },
        
        initSaveSystem: function() {
            var self = this;
            this.systems.save = {
                saveKey: "gabon_rpg_3d_save",
                
                save: function() {
                    try {
                        var saveData = {
                            version: self.VERSION,
                            timestamp: Date.now(),
                            gameState: self.state,
                            stats: self.stats,
                            position: self.world.player ? self.world.player.position : { x: 0, y: 0, z: 0 },
                            rotation: self.world.player ? self.world.player.rotation : { x: 0, y: 0, z: 0 },
                            inventory: self.systems.inventory.items,
                            equipment: self.state.equipment,
                            quests: {
                                active: self.systems.quest.activeQuests,
                                completed: self.systems.quest.completedQuests
                            },
                            location: {
                                city: self.state.currentCity,
                                district: self.state.currentDistrict
                            },
                            config: self.config
                        };
                        
                        localStorage.setItem(this.saveKey, JSON.stringify(saveData));
                        return true;
                    } catch (e) {
                        console.error("Erreur de sauvegarde:", e);
                        return false;
                    }
                },
                
                load: function() {
                    try {
                        var data = localStorage.getItem(this.saveKey);
                        if (!data) return false;
                        
                        var saveData = JSON.parse(data);
                        
                        // Charger l'état du jeu
                        Object.assign(self.state, saveData.gameState);
                        
                        // Charger les statistiques
                        Object.assign(self.stats, saveData.stats);
                        
                        // Charger l'inventaire
                        self.systems.inventory.items = saveData.inventory || [];
                        
                        // Charger l'équipement
                        Object.assign(self.state.equipment, saveData.equipment || {});
                        
                        // Charger les quêtes
                        self.systems.quest.activeQuests = saveData.quests?.active || [];
                        self.systems.quest.completedQuests = saveData.quests?.completed || [];
                        
                        // Charger la localisation
                        self.state.currentCity = saveData.location?.city || 0;
                        self.state.currentDistrict = saveData.location?.district || 0;
                        
                        // Charger la configuration
                        if (saveData.config) {
                            Object.assign(self.config, saveData.config);
                        }
                        
                        return true;
                    } catch (e) {
                        console.error("Erreur de chargement:", e);
                        return false;
                    }
                },
                
                delete: function() {
                    try {
                        localStorage.removeItem(this.saveKey);
                        return true;
                    } catch (e) {
                        console.error("Erreur de suppression:", e);
                        return false;
                    }
                }
            };
        },
        
        initTimeSystem: function() {
            var self = this;
            this.systems.time = {
                timeScale: 60, // 1 seconde réelle = 1 minute jeu
                currentTime: 8.0, // 8:00 AM
                isDay: true,
                dayLength: 24,
                
                update: function(deltaTime) {
                    // Avancer le temps
                    this.currentTime += deltaTime * this.timeScale / 3600;
                    
                    // Boucler à 24h
                    if (this.currentTime >= this.dayLength) {
                        this.currentTime -= this.dayLength;
                        self.state.day++;
                        
                        // Événements quotidiens
                        self.dailyEvents();
                    }
                    
                    // Déterminer si c'est le jour ou la nuit
                    this.isDay = (
                        this.currentTime >= 6 && 
                        this.currentTime < 18
                    );
                    
                    // Ajuster l'éclairage
                    self.updateLighting();
                },
                
                getTimeString: function() {
                    var hour = Math.floor(this.currentTime);
                    var minute = Math.floor((this.currentTime - hour) * 60);
                    var period = hour >= 12 ? "PM" : "AM";
                    
                    hour = hour % 12;
                    if (hour === 0) hour = 12;
                    
                    return hour.toString().padStart(2, '0') + ":" + 
                           minute.toString().padStart(2, '0') + " " + period;
                },
                
                dailyEvents: function() {
                    // Événements qui se produisent chaque jour
                    self.showMessage("Nouveau jour! Jour " + self.state.day, 3000);
                    
                    // Réinitialiser certaines statistiques
                    self.state.hunger = Math.max(0, self.state.hunger - 30);
                    self.state.thirst = Math.max(0, self.state.thirst - 40);
                    
                    // Chance d'événements aléatoires
                    if (Math.random() < 0.3) {
                        self.randomDailyEvent();
                    }
                }
            };
        },
        
        // ============================================
        // FONCTIONS DE JEU PRINCIPALES
        // ============================================
        startGame: function() {
            console.log("🚀 Démarrage du jeu...");
            
            // Cacher l'écran de démarrage
            this.ui.elements.startScreen.style.display = 'none';
            
            // Afficher le jeu
            this.ui.elements.gameContainer.style.display = 'block';
            
            // Créer le joueur
            this.createPlayer();
            
            // Créer les ennemis
            this.spawnEnemies();
            
            // Créer les PNJ
            this.spawnNPCs();
            
            // Mettre à jour l'état du jeu
            this.gameState.started = true;
            this.gameState.inGame = true;
            this.gameState.inMenu = false;
            
            // Pointer lock
            if (!this.isMobile()) {
                setTimeout(function() {
                    document.body.requestPointerLock();
                }, 1000);
            }
            
            // Message de bienvenue
            var city = this.cities[this.state.currentCity];
            var district = city.districts[this.state.currentDistrict];
            this.showMessage(
                "🇬🇦 BIENVENUE À " + city.name.toUpperCase() + "!\n" +
                "Quartier: " + district + "\n\n" +
                "Protégez les habitants et débarrassez la ville des bandits!",
                5000
            );
            
            // Démarrer la boucle de jeu
            this.startGameLoop();
            
            console.log("✅ Jeu démarré");
        },
        
        startNewGame: function() {
            // Réinitialiser l'état du jeu
            this.resetGameState();
            
            // Démarrer le jeu
            this.startGame();
        },
        
        resetGameState: function() {
            // Réinitialiser les statistiques
            this.state = {
                health: 100,
                maxHealth: 100,
                armor: 50,
                maxArmor: 50,
                xp: 0,
                xpToNext: 100,
                level: 1,
                score: 0,
                kills: 0,
                money: 1000,
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
                time: 8.0,
                weight: 0,
                maxWeight: 100,
                reputation: 50,
                stamina: 100,
                maxStamina: 100,
                hunger: 100,
                maxHunger: 100,
                thirst: 100,
                maxThirst: 100,
                temperature: 37,
                maxTemperature: 37,
                inventory: [],
                equipment: {
                    head: null,
                    chest: null,
                    legs: null,
                    feet: null,
                    hands: null,
                    accessory: null
                },
                skills: {
                    shooting: 1,
                    melee: 1,
                    stealth: 1,
                    charisma: 1,
                    crafting: 1,
                    survival: 1
                },
                currentCity: 0,
                currentDistrict: 0
            };
            
            // Réinitialiser les statistiques
            this.stats = {
                playTime: 0,
                totalKills: 0,
                totalDamage: 0,
                totalMoney: 0,
                totalXP: 0,
                itemsCollected: 0,
                questsCompleted: 0,
                buildingsBuilt: 0,
                itemsCrafted: 0,
                distanceTraveled: 0,
                deaths: 0,
                shotsFired: 0,
                accuracy: 0,
                challenges: {}
            };
            
            // Réinitialiser les systèmes
            if (this.systems.inventory) {
                this.systems.inventory.items = [];
            }
            
            if (this.systems.quest) {
                this.systems.quest.activeQuests = [];
                this.systems.quest.completedQuests = [];
                this.systems.quest.failedQuests = [];
                this.systems.quest.questLog = [];
            }
            
            // Réinitialiser le monde
            this.clearWorld();
        },
        
        clearWorld: function() {
            // Supprimer tous les objets du monde
            this.world.enemies.forEach(function(enemy) { this.three.scene.remove(enemy); }.bind(this));
            this.world.npcs.forEach(function(npc) { this.three.scene.remove(npc); }.bind(this));
            this.world.items.forEach(function(item) { this.three.scene.remove(item); }.bind(this));
            this.world.projectiles.forEach(function(projectile) { this.three.scene.remove(projectile); }.bind(this));
            
            this.world.enemies = [];
            this.world.npcs = [];
            this.world.items = [];
            this.world.projectiles = [];
            
            if (this.world.player) {
                this.three.scene.remove(this.world.player);
                this.world.player = null;
            }
        },
        
        createPlayer: function() {
            // Créer le modèle du joueur
            this.world.player = this.assets.models.player.clone();
            this.world.player.position.set(0, 5, 0);
            this.three.scene.add(this.world.player);
            
            // Données du joueur
            this.world.player.userData = {
                type: "player",
                health: this.state.health,
                maxHealth: this.state.maxHealth,
                speed: this.state.speed,
                isMoving: false,
                isJumping: false,
                isCrouching: false,
                isAiming: false,
                weapon: this.weapons[this.state.currentWeapon]
            };
        },
        
        spawnEnemies: function() {
            var count = this.state.enemiesRemaining;
            
            for (var i = 0; i < count; i++) {
                var enemyType = this.enemies[Math.floor(Math.random() * this.enemies.length)];
                var enemy = this.createEnemy(enemyType);
                
                var angle = (Math.PI * 2 * i) / count;
                var radius = 50 + Math.random() * 100;
                enemy.position.set(
                    Math.cos(angle) * radius,
                    0,
                    Math.sin(angle) * radius
                );
                
                this.three.scene.add(enemy);
                this.world.enemies.push(enemy);
            }
        },
        
        createEnemy: function(enemyData) {
            var enemy = this.assets.models.bandit.clone();
            
            // Données de l'ennemi
            enemy.userData = Object.assign({}, enemyData, {
                originalColor: enemyData.color,
                dead: false,
                lastAttack: 0,
                target: null,
                state: "patrol"
            });
            
            // Ajuster l'apparence selon le type
            enemy.scale.setScalar(enemyData.type === "Boss" ? 1.5 : 1);
            
            return enemy;
        },
        
        spawnNPCs: function() {
            var count = 5; // Nombre de PNJ de base
            
            for (var i = 0; i < count; i++) {
                var npcData = this.npcs[i % this.npcs.length];
                var npc = this.createNPC(npcData);
                
                var angle = (Math.PI * 2 * i) / count;
                var radius = 30 + Math.random() * 50;
                npc.position.set(
                    Math.cos(angle) * radius,
                    0,
                    Math.sin(angle) * radius
                );
                
                this.three.scene.add(npc);
                this.world.npcs.push(npc);
            }
        },
        
        createNPC: function(npcData) {
            var npc = this.assets.models.civilian.clone();
            
            // Personnaliser selon le type
            switch (npcData.type) {
                case "merchant":
                    npc.scale.setScalar(0.9);
                    break;
                case "soldier":
                    npc.scale.setScalar(1.1);
                    break;
                case "priest":
                    npc.scale.setScalar(1.0);
                    break;
            }
            
            // Données du PNJ
            npc.userData = Object.assign({}, npcData);
            
            return npc;
        },
        
        spawnAdditionalEnemies: function(count) {
            for (var i = 0; i < count; i++) {
                var enemyType = this.enemies[Math.floor(Math.random() * this.enemies.length)];
                var enemy = this.createEnemy(enemyType);
                
                enemy.position.set(
                    this.utils.randomRange(-200, 200),
                    0,
                    this.utils.randomRange(-200, 200)
                );
                
                this.three.scene.add(enemy);
                this.world.enemies.push(enemy);
            }
            
            this.state.enemiesRemaining += count;
        },
        
        spawnAdditionalNPCs: function(count) {
            for (var i = 0; i < count; i++) {
                var npcData = this.npcs[Math.floor(Math.random() * this.npcs.length)];
                var npc = this.createNPC(npcData);
                
                npc.position.set(
                    this.utils.randomRange(-150, 150),
                    0,
                    this.utils.randomRange(-150, 150)
                );
                
                this.three.scene.add(npc);
                this.world.npcs.push(npc);
            }
        },
        
        // ============================================
        // MÉCANIQUES DE JEU
        // ============================================
        playerJump: function() {
            if (!this.world.player || this.world.player.userData.isJumping) return;
            
            // Simulation de saut
            this.world.player.userData.isJumping = true;
            this.playSound('sfx-jump');
            
            // Animation
            var startY = this.world.player.position.y;
            var jumpHeight = 2;
            
            var jump = function(t) {
                if (!this.world.player) return;
                
                this.world.player.position.y = startY + Math.sin(t * Math.PI) * jumpHeight;
                
                if (t < 1) {
                    requestAnimationFrame(jump.bind(this, t + 0.05));
                } else {
                    this.world.player.position.y = startY;
                    this.world.player.userData.isJumping = false;
                }
            }.bind(this);
            
            requestAnimationFrame(jump.bind(this, 0));
        },
        
        playerShoot: function() {
            if (!this.gameState.inGame || this.gameState.paused) return;
            this.systems.combat.shoot();
        },
        
        playerInteract: function() {
            if (!this.gameState.inGame || this.gameState.paused) return;
            
            // Rechercher des objets interactifs proches
            var interactionRange = 5;
            var playerPos = this.world.player.position;
            
            // PNJ
            for (var i = 0; i < this.world.npcs.length; i++) {
                var npc = this.world.npcs[i];
                var distance = this.utils.distance3D(playerPos, npc.position);
                
                if (distance < interactionRange) {
                    this.interactWithNPC(npc);
                    return;
                }
            }
            
            // Objets
            for (var j = 0; j < this.world.items.length; j++) {
                var item = this.world.items[j];
                var distance = this.utils.distance3D(playerPos, item.position);
                
                if (distance < interactionRange) {
                    this.pickupItem(item);
                    return;
                }
            }
            
            // Si rien à proximité
            this.showMessage("Rien à interagir à proximité", 1500);
        },
        
        interactWithNPC: function(npc) {
            var npcData = npc.userData;
            
            if (npcData.dialogue && npcData.dialogue.length > 0) {
                var randomDialogue = npcData.dialogue[Math.floor(Math.random() * npcData.dialogue.length)];
                this.showMessage(npcData.name + ": " + randomDialogue, 4000);
                this.playSound('sfx-select');
                
                // Proposer une quête
                if (npcData.quest && Math.random() < 0.5) {
                    setTimeout(function() {
                        if (confirm(npcData.name + " vous propose une quête:\n\n" + 
                                   npcData.quest + "\n\n" +
                                   "Récompense: " + npcData.reward + "\n\n" +
                                   "Acceptez-vous?")) {
                            // Démarrer la quête
                            this.startQuest(npc);
                        }
                    }.bind(this), 100);
                }
            }
        },
        
        startQuest: function(npc) {
            var npcData = npc.userData;
            
            // Créer la quête
            var quest = {
                id: this.utils.generateId(),
                title: npcData.quest.split('\n')[0],
                description: npcData.quest,
                objectives: {
                    kill_bandits: {
                        description: "Éliminez 5 bandits",
                        target: 5,
                        current: 0
                    }
                },
                rewards: {
                    xp: 100,
                    money: 500,
                    items: [{ id: "gold_key", name: "Clé en or", type: "key" }]
                },
                npcId: npcData.name
            };
            
            // Démarrer la quête
            this.systems.quest.startQuest(npcData.name, quest);
            this.showNotification("📜 Quête acceptée: " + quest.title, 3000);
        },
        
        pickupItem: function(item) {
            var itemData = item.userData;
            if (!itemData) return;
            
            // Ajouter à l'inventaire
            var success = this.systems.inventory.addItem(itemData, 1);
            
            if (success) {
                // Supprimer du monde
                this.three.scene.remove(item);
                var index = this.world.items.indexOf(item);
                if (index > -1) {
                    this.world.items.splice(index, 1);
                }
                
                // Effet de ramassage
                this.createPickupEffect(item.position);
            }
        },
        
        addToInventory: function(itemData) {
            return this.systems.inventory.addItem(itemData, 1);
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
        },
        
        reloadWeapon: function() {
            this.systems.combat.reloadWeapon();
        },
        
        toggleAim: function() {
            if (!this.three.camera) return;
            
            this.world.player.userData.isAiming = !this.world.player.userData.isAiming;
            
            if (this.world.player.userData.isAiming) {
                // Zoom pour viser
                this.three.camera.fov = 30;
                this.showMessage("Viseur activé", 1000);
            } else {
                // Retour normal
                this.three.camera.fov = this.config.game.fov;
            }
            
            this.three.camera.updateProjectionMatrix();
        },
        
        toggleCrouch: function() {
            if (!this.world.player) return;
            
            this.world.player.userData.isCrouching = !this.world.player.userData.isCrouching;
            
            if (this.world.player.userData.isCrouching) {
                this.world.player.scale.y = 0.7;
                this.state.speed = 0.08;
                this.showMessage("Accroupi", 1000);
            } else {
                this.world.player.scale.y = 1;
                this.state.speed = 0.15;
            }
        },
        
        toggleFlashlight: function() {
            if (!this.world.flashlight) {
                // Créer la lampe torche
                this.world.flashlight = new THREE.SpotLight(0xffffff, 2, 50, Math.PI / 6, 0.5, 2);
                this.world.flashlight.position.set(0, 1.5, 0);
                this.world.player.add(this.world.flashlight);
            }
            
            this.world.flashlight.visible = !this.world.flashlight.visible;
            this.showMessage("🔦 Lampe torche " + (this.world.flashlight.visible ? "allumée" : "éteinte"), 1500);
            this.playSound('sfx-select');
        },
        
        toggleMap: function() {
            // Basculer l'affichage de la carte
            var mapElement = document.getElementById('map-overlay');
            if (!mapElement) {
                // Créer l'élément de carte
                mapElement = document.createElement('div');
                mapElement.id = 'map-overlay';
                mapElement.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.9);
                    z-index: 1000;
                    display: none;
                `;
                document.body.appendChild(mapElement);
            }
            
            mapElement.style.display = mapElement.style.display === 'none' ? 'block' : 'none';
            this.gameState.paused = mapElement.style.display === 'block';
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
            this.state.maxWeight += 10;
            
            // Récompense
            this.state.money += 1000;
            
            // Notification
            this.showNotification(
                "⭐ NIVEAU " + this.state.level + " ATTEINT!\n\n" +
                "+20 Santé max\n" +
                "+10 Armure max\n" +
                "+1000 FCFA\n" +
                "+10kg Capacité d'inventaire\n" +
                "Vitesse augmentée",
                5000
            );
            
            this.playSound('sfx-levelup');
            
            // Effet de niveau
            this.createLevelUpEffect();
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
            if (this.systems.quest) {
                this.systems.quest.activeQuests.forEach(function(quest) {
                    if (quest.objectives && quest.objectives.kill_bandits) {
                        this.systems.quest.updateObjective(
                            quest.id,
                            'kill_bandits',
                            (quest.progress.kill_bandits || 0) + 1
                        );
                    }
                }.bind(this));
            }
            
            // Ajouter XP
            this.addXP(enemy.userData.xp || 25);
            
            // Drop d'objets
            if (enemy.userData.drops) {
                enemy.userData.drops.forEach(function(dropType) {
                    this.createPickup(enemy.position, dropType);
                }.bind(this));
            }
            
            // Effet de mort
            this.createDeathEffect(enemy.position);
            
            // Son
            this.playSound('sfx-hit');
            
            // Message
            this.showMessage(
                "👹 " + enemy.userData.type + " éliminé!\n" +
                "+" + (enemy.userData.points || 100) + " points\n" +
                "+" + (enemy.userData.money || 50) + " FCFA",
                2000
            );
            
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
                "Tous les bandits ont été éliminés!",
                5000
            );
            
            this.state.score += 1000;
            this.state.money += 2000;
            this.addXP(200);
            
            // Musique de victoire
            this.playSound('sfx-levelup');
            
            // Effets visuels
            this.createVictoryEffect();
            
            // Débloquer le prochain niveau
            setTimeout(function() {
                this.nextLevel();
            }.bind(this), 3000);
        },
        
        nextLevel: function() {
            this.state.currentLevel++;
            this.state.currentDistrict = Math.min(this.state.currentDistrict + 1, 4);
            
            // Nouvelle vague d'ennemis
            this.state.enemiesRemaining = 5 + (this.state.currentLevel * 3);
            this.spawnEnemies();
            
            // Nouveau quartier
            var city = this.cities[this.state.currentCity];
            var district = city.districts[this.state.currentDistrict];
            
            this.showMessage(
                "Nouveau quartier: " + district + "\n" +
                "Niveau " + this.state.currentLevel + "\n\n" +
                "Éliminez " + this.state.enemiesRemaining + " bandits",
                5000
            );
        },
        
        // ============================================
        // EFFETS VISUELS
        // ============================================
        createHitEffect: function(position, damage) {
            // Particules de dégâts
            var particleCount = Math.min(damage, 20);
            
            for (var i = 0; i < particleCount; i++) {
                var geometry = new THREE.SphereGeometry(0.05, 4, 4);
                var material = new THREE.MeshBasicMaterial({
                    color: 0xff0000,
                    transparent: true,
                    opacity: 0.8
                });
                
                var particle = new THREE.Mesh(geometry, material);
                particle.position.copy(position);
                
                var velocity = this.utils.randomVector(0.5);
                particle.userData = {
                    velocity: velocity,
                    life: 1.0,
                    decay: 0.05
                };
                
                this.three.scene.add(particle);
                this.world.particles.push(particle);
            }
        },
        
        createDeathEffect: function(position) {
            // Effet d'explosion
            var particleCount = 30;
            
            for (var i = 0; i < particleCount; i++) {
                var geometry = new THREE.SphereGeometry(0.1, 6, 6);
                var material = new THREE.MeshBasicMaterial({
                    color: Math.random() > 0.5 ? 0xff0000 : 0x8B0000,
                    transparent: true,
                    opacity: 0.8
                });
                
                var particle = new THREE.Mesh(geometry, material);
                particle.position.copy(position);
                
                var velocity = this.utils.randomVector(1 + Math.random());
                particle.userData = {
                    velocity: velocity,
                    life: 1.0,
                    decay: 0.03 + Math.random() * 0.02
                };
                
                this.three.scene.add(particle);
                this.world.particles.push(particle);
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
            this.three.scene.add(ring);
            
            // Animation
            var startTime = Date.now();
            var animate = function() {
                var elapsed = Date.now() - startTime;
                if (elapsed < 1000) {
                    ring.scale.y = 1 + elapsed / 500;
                    ring.material.opacity = 0.7 * (1 - elapsed / 1000);
                    requestAnimationFrame(animate);
                } else {
                    this.three.scene.remove(ring);
                }
            }.bind(this);
            
            animate();
        },
        
        createXPEffect: function(amount) {
            // Effet visuel pour XP
            var text = "+" + amount + " XP";
            this.createFloatingText(this.world.player.position, text, 0x00ff00);
        },
        
        createDamageIndicator: function(position, damage) {
            // Texte flottant pour dégâts
            var text = "-" + damage;
            this.createFloatingText(position, text, 0xff0000);
        },
        
        createFloatingText: function(position, text, color) {
            // Créer un élément DOM pour le texte flottant
            var floatingText = document.createElement('div');
            floatingText.style.cssText = `
                position: absolute;
                color: #${color.toString(16).padStart(6, '0')};
                font-size: 24px;
                font-weight: bold;
                text-shadow: 0 0 5px black;
                white-space: nowrap;
                pointer-events: none;
                z-index: 1000;
            `;
            floatingText.textContent = text;
            document.body.appendChild(floatingText);
            
            // Animation
            var startTime = Date.now();
            var duration = 1500;
            var startY = position.y + 2;
            
            var animate = function() {
                var elapsed = Date.now() - startTime;
                if (elapsed < duration) {
                    var progress = elapsed / duration;
                    
                    // Position
                    var screenPos = this.worldToScreen(position.x, startY + progress * 3, position.z);
                    floatingText.style.left = (screenPos.x - 50) + 'px';
                    floatingText.style.top = (screenPos.y - 50) + 'px';
                    
                    // Opacité
                    floatingText.style.opacity = (1 - progress).toString();
                    
                    requestAnimationFrame(animate.bind(this));
                } else {
                    document.body.removeChild(floatingText);
                }
            }.bind(this);
            
            animate();
        },
        
        worldToScreen: function(x, y, z) {
            var vector = new THREE.Vector3(x, y, z);
            vector.project(this.three.camera);
            
            return {
                x: (vector.x + 1) * window.innerWidth / 2,
                y: (-vector.y + 1) * window.innerHeight / 2
            };
        },
        
        createLevelUpEffect: function() {
            // Effet de montée de niveau
            var rings = 3;
            
            for (var i = 0; i < rings; i++) {
                var ringGeometry = new THREE.RingGeometry(1, 3, 32);
                var ringMaterial = new THREE.MeshBasicMaterial({
                    color: 0x00FF00,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.7
                });
                
                var ring = new THREE.Mesh(ringGeometry, ringMaterial);
                ring.position.copy(this.world.player.position);
                ring.position.y = 0.1;
                ring.rotation.x = Math.PI / 2;
                this.three.scene.add(ring);
                
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
                            this.three.scene.remove(ring);
                        }
                    }.bind(this);
                    animate();
                }.bind(this, ring), i * 200);
            }
        },
        
        createVictoryEffect: function() {
            // Feux d'artifice
            var fireworks = 5;
            
            for (var i = 0; i < fireworks; i++) {
                setTimeout(function() {
                    var position = new THREE.Vector3(
                        Math.random() * 100 - 50,
                        Math.random() * 50 + 20,
                        Math.random() * 100 - 50
                    );
                    
                    this.createFirework(position);
                }.bind(this), i * 300);
            }
        },
        
        createFirework: function(position) {
            var particles = 30;
            var colors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF];
            
            for (var i = 0; i < particles; i++) {
                var geometry = new THREE.SphereGeometry(0.1, 6, 6);
                var material = new THREE.MeshBasicMaterial({
                    color: colors[Math.floor(Math.random() * colors.length)],
                    transparent: true,
                    opacity: 0.8
                });
                
                var particle = new THREE.Mesh(geometry, material);
                particle.position.copy(position);
                
                var velocity = this.utils.randomVector(2 + Math.random() * 2);
                particle.userData = {
                    velocity: velocity,
                    life: 1.0,
                    decay: 0.02 + Math.random() * 0.03
                };
                
                this.three.scene.add(particle);
                this.world.particles.push(particle);
            }
            
            this.playSound('sfx-select');
        },
        
        createPickup: function(position, type) {
            var itemData = this.items.find(function(item) { return item.type === type; });
            if (!itemData) return;
            
            var pickup = this.assets.models.item.clone();
            pickup.position.copy(position);
            pickup.position.y = 0.5;
            pickup.userData = itemData;
            
            this.three.scene.add(pickup);
            this.world.items.push(pickup);
            
            // Animation
            pickup.scale.set(0.1, 0.1, 0.1);
            this.animatePickupSpawn(pickup);
        },
        
        animatePickupSpawn: function(pickup) {
            var startScale = 0.1;
            var targetScale = 1;
            var duration = 500;
            var startTime = Date.now();
            
            var animate = function() {
                var elapsed = Date.now() - startTime;
                var progress = Math.min(elapsed / duration, 1);
                
                var scale = startScale + (targetScale - startScale) * progress;
                var bounce = Math.sin(progress * Math.PI) * 0.3;
                pickup.scale.setScalar(scale + bounce);
                
                pickup.rotation.y += 0.02;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    pickup.scale.setScalar(1);
                }
            };
            
            animate();
        },
        
        // ============================================
        // MISE À JOUR DU JEU
        // ============================================
        startGameLoop: function() {
            var self = this;
            var lastTime = 0;
            
            function gameLoop(currentTime) {
                requestAnimationFrame(gameLoop);
                
                var deltaTime = (currentTime - lastTime) / 1000;
                lastTime = currentTime;
                
                // Mettre à jour le temps de jeu
                if (self.gameState.inGame && !self.gameState.paused) {
                    self.stats.playTime += deltaTime;
                    self.systems.time.update(deltaTime);
                }
                
                // Mettre à jour le jeu
                if (self.gameState.inGame && !self.gameState.paused) {
                    self.updatePlayer(deltaTime);
                    self.updateEnemies(deltaTime);
                    self.updateNPCs(deltaTime);
                    self.systems.combat.updateBullets();
                    self.updateParticles(deltaTime);
                }
                
                // Rendu
                if (self.three.renderer && self.three.scene && self.three.camera) {
                    self.three.renderer.render(self.three.scene, self.three.camera);
                }
                
                // Mettre à jour l'interface
                self.updateHUD();
            }
            
            gameLoop(0);
        },
        
        updatePlayer: function(deltaTime) {
            if (!this.world.player) return;
            
            var direction = new THREE.Vector3(0, 0, 0);
            var speed = this.state.speed;
            
            // Contrôles clavier
            if (this.controls.keys['z'] || this.controls.keys['w']) direction.z -= 1;
            if (this.controls.keys['s']) direction.z += 1;
            if (this.controls.keys['q'] || this.controls.keys['a']) direction.x -= 1;
            if (this.controls.keys['d']) direction.x += 1;
            
            // Sprint
            if (this.controls.keys['shift']) {
                speed *= 1.5;
            }
            
            // Normaliser le vecteur
            if (direction.length() > 0) {
                direction.normalize();
                this.world.player.userData.isMoving = true;
                
                // Appliquer la rotation de la caméra
                if (this.three.camera) {
                    var angle = this.three.camera.rotation.y;
                    var cos = Math.cos(angle);
                    var sin = Math.sin(angle);
                    
                    var tempX = direction.x;
                    var tempZ = direction.z;
                    
                    direction.x = tempX * cos - tempZ * sin;
                    direction.z = tempX * sin + tempZ * cos;
                }
                
                // Déplacement
                this.world.player.position.x += direction.x * speed;
                this.world.player.position.z += direction.z * speed;
                
                // Statistiques
                this.stats.distanceTraveled += speed * deltaTime;
            } else {
                this.world.player.userData.isMoving = false;
            }
            
            // Limites de la carte
            var mapSize = 400;
            this.world.player.position.x = this.utils.clamp(this.world.player.position.x, -mapSize, mapSize);
            this.world.player.position.z = this.utils.clamp(this.world.player.position.z, -mapSize, mapSize);
            
            // Mettre à jour la caméra
            this.updateCamera();
        },
        
        updateCamera: function() {
            if (!this.world.player || !this.three.camera) return;
            
            // Position de la caméra derrière le joueur
            var cameraDistance = 8;
            var cameraHeight = 5;
            
            if (this.world.player.userData.isAiming) {
                cameraDistance = 2;
                cameraHeight = 1.5;
            } else if (this.world.player.userData.isCrouching) {
                cameraHeight = 3;
            }
            
            // Calculer la position de la caméra
            var cameraOffset = new THREE.Vector3(0, cameraHeight, cameraDistance);
            cameraOffset.applyQuaternion(this.world.player.quaternion);
            
            this.three.camera.position.copy(this.world.player.position).add(cameraOffset);
            
            // Regarder vers le joueur
            var lookAtTarget = this.world.player.position.clone();
            lookAtTarget.y += 1.5;
            this.three.camera.lookAt(lookAtTarget);
        },
        
        updateEnemies: function(deltaTime) {
            if (!this.world.player) return;
            
            for (var i = 0; i < this.world.enemies.length; i++) {
                var enemy = this.world.enemies[i];
                if (!enemy.userData || enemy.userData.dead) continue;
                
                var distance = this.utils.distance3D(this.world.player.position, enemy.position);
                
                // Comportement selon la distance
                if (distance < enemy.userData.detectionRange) {
                    // Poursuite
                    var direction = new THREE.Vector3()
                        .subVectors(this.world.player.position, enemy.position)
                        .normalize();
                    
                    var speed = enemy.userData.speed * 0.03;
                    direction.multiplyScalar(speed);
                    
                    enemy.position.add(direction);
                    
                    // Rotation vers le joueur
                    enemy.lookAt(this.world.player.position);
                    
                    // Attaque si assez proche
                    if (distance < enemy.userData.attackRange) {
                        var now = Date.now();
                        if (now - enemy.userData.lastAttack > 1000) {
                            this.takeDamage(enemy.userData.damage);
                            enemy.userData.lastAttack = now;
                        }
                    }
                }
                
                // Animation de respiration
                var breathe = Math.sin(Date.now() * 0.002 + i) * 0.02;
                enemy.position.y = 0.5 + breathe;
            }
        },
        
        updateNPCs: function(deltaTime) {
            // Animation simple des PNJ
            for (var i = 0; i < this.world.npcs.length; i++) {
                var npc = this.world.npcs[i];
                var breathe = Math.sin(Date.now() * 0.002 + i) * 0.01;
                npc.position.y = 0.5 + breathe;
                npc.rotation.y += 0.001;
            }
        },
        
        updateParticles: function(deltaTime) {
            for (var i = this.world.particles.length - 1; i >= 0; i--) {
                var particle = this.world.particles[i];
                if (!particle.userData) continue;
                
                // Mouvement
                if (particle.userData.velocity) {
                    particle.position.add(particle.userData.velocity);
                    
                    // Réduction de vie
                    particle.userData.life -= particle.userData.decay;
                    if (particle.material.opacity !== undefined) {
                        particle.material.opacity = particle.userData.life * 0.8;
                    }
                    
                    // Suppression
                    if (particle.userData.life <= 0) {
                        this.three.scene.remove(particle);
                        this.world.particles.splice(i, 1);
                    }
                }
            }
        },
        
        takeDamage: function(amount) {
            if (this.gameState.paused || !this.gameState.inGame) return;
            
            // Réduire d'abord l'armure
            var damageToArmor = Math.min(this.state.armor, amount * 0.5);
            var damageToHealth = amount - damageToArmor;
            
            this.state.armor -= damageToArmor;
            this.state.health -= damageToHealth;
            
            // Message
            this.showMessage(
                "💥 Vous avez été touché!\n" +
                (damageToArmor > 0 ? "Armure: -" + damageToArmor + "\n" : "") +
                (damageToHealth > 0 ? "Santé: -" + damageToHealth : ""),
                1500
            );
            
            // Son
            this.playSound('sfx-hurt');
            
            // Effet d'écran rouge
            this.createDamageScreenEffect();
            
            // Vérifier la mort
            if (this.state.health <= 0) {
                this.gameOver();
            }
            
            this.updateHUD();
        },
        
        createDamageScreenEffect: function() {
            // Effet d'écran rouge
            var overlay = document.createElement('div');
            overlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(255, 0, 0, 0.3);
                pointer-events: none;
                z-index: 999;
                transition: opacity 0.3s;
            `;
            document.body.appendChild(overlay);
            
            // Disparaître
            setTimeout(function() {
                overlay.style.opacity = '0';
                setTimeout(function() {
                    document.body.removeChild(overlay);
                }, 300);
            }, 100);
        },
        
        // ============================================
        // GESTION DE L'INTERFACE
        // ============================================
        updateHUD: function() {
            if (!this.gameState.inGame) return;
            
            // Mettre à jour les fonctions d'interface
            for (var key in this.ui.updateFunctions) {
                if (typeof this.ui.updateFunctions[key] === 'function') {
                    this.ui.updateFunctions[key]();
                }
            }
        },
        
        updateInventoryDisplay: function() {
            var container = this.ui.elements.inventoryItems;
            if (!container) return;
            
            container.innerHTML = '';
            
            // Afficher chaque objet
            this.systems.inventory.items.forEach(function(item, index) {
                var itemDiv = document.createElement('div');
                itemDiv.className = 'inventory-item';
                itemDiv.dataset.index = index;
                
                itemDiv.innerHTML = `
                    <div class="item-icon">${item.icon || '📦'}</div>
                    <div style="font-weight: bold; margin-bottom: 5px;">${item.name}</div>
                    <div style="font-size: 0.9rem; opacity: 0.8;">${item.description || ''}</div>
                    <div style="margin-top: 10px; font-size: 0.8rem;">
                        Quantité: ${item.quantity || 1}
                        ${item.weight ? ' | Poids: ' + item.weight + 'kg' : ''}
                    </div>
                    <div style="margin-top: 10px; display: flex; gap: 5px;">
                        <button onclick="Game.useInventoryItem(${index})" 
                                style="flex: 1; padding: 5px; background: #009e60; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            Utiliser
                        </button>
                        <button onclick="Game.dropInventoryItem(${index})" 
                                style="flex: 1; padding: 5px; background: #ff4444; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            Jeter
                        </button>
                    </div>
                `;
                
                container.appendChild(itemDiv);
            }.bind(this));
            
            // Mettre à jour les statistiques
            this.ui.elements.invLevel.textContent = this.state.level;
            this.ui.elements.invXp.textContent = this.state.xp + "/" + this.state.xpToNext;
            this.ui.elements.invHealth.textContent = Math.round(this.state.health) + "/" + this.state.maxHealth;
            this.ui.elements.invKills.textContent = this.state.kills;
            this.ui.elements.invScore.textContent = this.state.score;
            this.ui.elements.invMoney.textContent = this.utils.formatMoney(this.state.money);
            this.ui.elements.invTime.textContent = this.utils.formatTime(this.stats.playTime);
            this.ui.elements.invQuests.textContent = this.systems.quest.completedQuests.length;
            this.ui.elements.invQuestsTotal.textContent = this.npcs.length;
            this.ui.elements.invWeight.textContent = Math.round(this.state.weight);
            this.ui.elements.invMaxWeight.textContent = this.state.maxWeight;
        },
        
        showMessage: function(text, duration) {
            // Vérifier si messageBox existe
            if (!this.ui || !this.ui.elements || !this.ui.elements.messageBox) {
                console.warn("messageBox non disponible, affichage dans la console :", text);
                console.log("Message du jeu :", text);
                return;
            }
            
            var messageBox = this.ui.elements.messageBox;
            var messageText = document.getElementById('message-text');
            
            if (!messageText) {
                messageText = document.createElement('div');
                messageText.id = 'message-text';
                messageBox.appendChild(messageText);
            }
            
            messageText.textContent = text;
            messageBox.style.display = 'block';
            
            if (duration > 0) {
                setTimeout(function() {
                    if (messageBox.style.display === 'block') {
                        messageBox.style.display = 'none';
                    }
                }, duration);
            }
        },
        
        showNotification: function(text, duration) {
            var notification = this.ui.elements.notification;
            var notificationText = document.getElementById('notification-text');
            
            if (!notificationText) {
                notificationText = document.createElement('div');
                notificationText.id = 'notification-text';
                notification.appendChild(notificationText);
            }
            
            notificationText.textContent = text;
            notification.style.display = 'block';
            
            setTimeout(function() {
                notification.style.display = 'none';
            }, duration);
        },
        
        showErrorMessage: function(message) {
            this.showMessage("❌ ERREUR: " + message, 0);
        },
        
        toggleInventory: function() {
            var panel = this.ui.elements.inventoryPanel;
            
            if (panel.style.display === 'block') {
                panel.style.display = 'none';
                this.gameState.paused = false;
                this.gameState.inInventory = false;
                
                if (!this.isMobile()) {
                    document.body.requestPointerLock();
                }
            } else {
                panel.style.display = 'block';
                this.gameState.paused = true;
                this.gameState.inInventory = true;
                
                document.exitPointerLock();
                this.updateInventoryDisplay();
            }
            
            this.playSound('sfx-select');
        },
        
        togglePause: function() {
            this.gameState.paused = !this.gameState.paused;
            var pauseScreen = this.ui.elements.pauseScreen;
            
            if (this.gameState.paused) {
                pauseScreen.style.display = 'flex';
                document.exitPointerLock();
            } else {
                pauseScreen.style.display = 'none';
                if (this.gameState.inGame) {
                    document.body.requestPointerLock();
                }
            }
            
            this.playSound('sfx-click');
        },
        
        showSettings: function() {
            // Créer l'écran de paramètres s'il n'existe pas
            var settingsScreen = document.getElementById('settings-screen');
            if (!settingsScreen) {
                settingsScreen = this.createSettingsScreen();
            }
            
            settingsScreen.style.display = 'flex';
            this.gameState.paused = true;
            document.exitPointerLock();
        },
        
        createSettingsScreen: function() {
            var screen = document.createElement('div');
            screen.id = 'settings-screen';
            screen.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                display: none;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 1000;
                color: white;
                padding: 20px;
            `;
            
            screen.innerHTML = `
                <h2 style="color: #fcd116; margin-bottom: 30px;">PARAMÈTRES</h2>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; max-width: 800px; width: 100%;">
                    <div>
                        <h3>🔊 Audio</h3>
                        <div style="margin: 10px 0;">
                            <label>Volume général: <span id="volume-value">70%</span></label>
                            <input type="range" id="volume-slider" min="0" max="100" value="70" style="width: 100%;">
                        </div>
                        <div style="margin: 10px 0;">
                            <label>Volume musique: <span id="music-volume-value">60%</span></label>
                            <input type="range" id="music-volume-slider" min="0" max="100" value="60" style="width: 100%;">
                        </div>
                    </div>
                    
                    <div>
                        <h3>🎮 Contrôles</h3>
                        <div style="margin: 10px 0;">
                            <label>Sensibilité souris: <span id="sensitivity-value">5</span></label>
                            <input type="range" id="sensitivity-slider" min="1" max="10" value="5" style="width: 100%;">
                        </div>
                        <div style="margin: 10px 0;">
                            <label>
                                <input type="checkbox" id="invert-y-checkbox">
                                Inverser axe Y
                            </label>
                        </div>
                    </div>
                    
                    <div>
                        <h3>🎨 Graphismes</h3>
                        <div style="margin: 10px 0;">
                            <label>Qualité:</label>
                            <select id="graphics-quality" style="width: 100%; padding: 5px;">
                                <option value="low">Faible</option>
                                <option value="medium" selected>Moyenne</option>
                                <option value="high">Élevée</option>
                                <option value="ultra">Ultra</option>
                            </select>
                        </div>
                        <div style="margin: 10px 0;">
                            <label>
                                <input type="checkbox" id="shadows-checkbox" checked>
                                Ombres
                            </label>
                        </div>
                    </div>
                    
                    <div>
                        <h3>🎯 Jeu</h3>
                        <div style="margin: 10px 0;">
                            <label>Difficulté:</label>
                            <select id="difficulty-select" style="width: 100%; padding: 5px;">
                                <option value="easy">Facile</option>
                                <option value="normal" selected>Normal</option>
                                <option value="hard">Difficile</option>
                                <option value="expert">Expert</option>
                            </select>
                        </div>
                        <div style="margin: 10px 0;">
                            <label>
                                <input type="checkbox" id="subtitles-checkbox" checked>
                                Sous-titres
                            </label>
                        </div>
                    </div>
                </div>
                
                <div style="margin-top: 30px; display: flex; gap: 20px;">
                    <button id="settings-apply" style="padding: 12px 30px; background: #009e60; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Appliquer
                    </button>
                    <button id="settings-back" style="padding: 12px 30px; background: #3a75c4; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Retour
                    </button>
                </div>
            `;
            
            document.body.appendChild(screen);
            
            // Événements
            var self = this;
            
            document.getElementById('settings-apply').addEventListener('click', function() {
                self.applySettings();
                self.playSound('sfx-click');
            });
            
            document.getElementById('settings-back').addEventListener('click', function() {
                screen.style.display = 'none';
                if (self.gameState.inGame) {
                    self.gameState.paused = false;
                    document.body.requestPointerLock();
                }
                self.playSound('sfx-click');
            });
            
            // Sliders
            document.getElementById('volume-slider').addEventListener('input', function(e) {
                document.getElementById('volume-value').textContent = e.target.value + '%';
            });
            
            document.getElementById('music-volume-slider').addEventListener('input', function(e) {
                document.getElementById('music-volume-value').textContent = e.target.value + '%';
            });
            
            document.getElementById('sensitivity-slider').addEventListener('input', function(e) {
                document.getElementById('sensitivity-value').textContent = e.target.value;
            });
            
            return screen;
        },
        
        applySettings: function() {
            // Audio
            var volume = parseInt(document.getElementById('volume-slider').value) / 100;
            this.systems.audio.setVolume(volume);
            
            // Contrôles
            this.controls.sensitivity = parseInt(document.getElementById('sensitivity-slider').value);
            this.controls.invertedY = document.getElementById('invert-y-checkbox').checked;
            
            // Graphismes
            var quality = document.getElementById('graphics-quality').value;
            this.config.graphics.quality = quality;
            this.applyGraphicsQuality(quality);
            
            // Jeu
            this.config.game.difficulty = document.getElementById('difficulty-select').value;
            this.config.game.subtitles = document.getElementById('subtitles-checkbox').checked;
            
            this.showMessage("Paramètres appliqués", 1500);
            this.saveGame();
        },
        
        applyGraphicsQuality: function(quality) {
            if (!this.three.renderer) return;
            
            switch (quality) {
                case 'low':
                    this.three.renderer.setPixelRatio(1);
                    this.three.renderer.shadowMap.enabled = false;
                    this.three.renderer.antialias = false;
                    break;
                case 'medium':
                    this.three.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
                    this.three.renderer.shadowMap.enabled = true;
                    this.three.renderer.antialias = true;
                    break;
                case 'high':
                    this.three.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                    this.three.renderer.shadowMap.enabled = true;
                    this.three.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
                    this.three.renderer.antialias = true;
                    break;
                case 'ultra':
                    this.three.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 3));
                    this.three.renderer.shadowMap.enabled = true;
                    this.three.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
                    this.three.renderer.antialias = true;
                    this.three.renderer.toneMappingExposure = 1.2;
                    break;
            }
        },
        
        // ============================================
        // GESTION DES ÉVÉNEMENTS
        // ============================================
        onWindowResize: function() {
            if (!this.three.camera || !this.three.renderer) return;
            
            this.three.camera.aspect = window.innerWidth / window.innerHeight;
            this.three.camera.updateProjectionMatrix();
            this.three.renderer.setSize(window.innerWidth, window.innerHeight);
        },
        
        gameOver: function() {
            this.gameState.gameOver = true;
            this.gameState.inGame = false;
            
            var gameOverText = "💀 GAME OVER!\n\n";
            gameOverText += "Score final: " + this.state.score + "\n";
            gameOverText += "Niveau atteint: " + this.state.level + "\n";
            gameOverText += "Ennemis tués: " + this.state.kills + "\n";
            gameOverText += "Temps de jeu: " + this.utils.formatTime(this.stats.playTime) + "\n\n";
            gameOverText += "Merci d'avoir joué au RPG Gabonais 3D!";
            
            this.showMessage(gameOverText, 0);
            
            // Sauvegarder le score
            this.saveGame();
            
            // Effet de game over
            this.createGameOverEffect();
            
            // Retour au menu après délai
            setTimeout(function() {
                this.returnToMenu();
            }.bind(this), 10000);
        },
        
        createGameOverEffect: function() {
            // Assombrir l'écran
            var overlay = document.createElement('div');
            overlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                z-index: 998;
                pointer-events: none;
            `;
            document.body.appendChild(overlay);
            
            // Animation de disparition du joueur
            if (this.world.player) {
                var startTime = Date.now();
                var animate = function() {
                    var elapsed = Date.now() - startTime;
                    if (elapsed < 2000) {
                        var progress = elapsed / 2000;
                        this.world.player.material.opacity = 1 - progress;
                        this.world.player.position.y -= 0.02;
                        requestAnimationFrame(animate.bind(this));
                    } else {
                        this.world.player.visible = false;
                        document.body.removeChild(overlay);
                    }
                }.bind(this);
                animate();
            }
        },
        
        returnToMenu: function() {
            // Sauvegarder
            this.saveGame();
            
            // Réinitialiser l'état du jeu
            this.gameState.started = false;
            this.gameState.paused = false;
            this.gameState.inGame = false;
            this.gameState.inMenu = true;
            this.gameState.gameOver = false;
            
            // Cacher tous les écrans de jeu
            this.ui.elements.gameContainer.style.display = 'none';
            this.ui.elements.messageBox.style.display = 'none';
            this.ui.elements.pauseScreen.style.display = 'none';
            this.ui.elements.inventoryPanel.style.display = 'none';
            
            // Afficher l'écran de démarrage
            this.ui.elements.startScreen.style.display = 'flex';
            
            // Pointer unlock
            document.exitPointerLock();
        },
        
        // ============================================
        // FONCTIONS PUBLIQUES
        // ============================================
        saveGame: function() {
            return this.systems.save.save();
        },
        
        loadGame: function() {
            return this.systems.save.load();
        },
        
        useInventoryItem: function(index) {
            var item = this.systems.inventory.items[index];
            if (item) {
                this.systems.inventory.useItem(item.id);
            }
        },
        
        dropInventoryItem: function(index) {
            var item = this.systems.inventory.removeItem(this.systems.inventory.items[index].id, 1);
            if (item) {
                this.createPickup(this.world.player.position, item.type);
            }
        },
        
        // ============================================
        // FONCTIONS DE COMBAT (MANQUANTES)
        // ============================================
        createBullet: function() {
            var weapon = this.weapons[this.state.currentWeapon];
            
            // Géométrie de balle
            var geometry = new THREE.SphereGeometry(0.05, 8, 8);
            var material = new THREE.MeshBasicMaterial({
                color: 0xFCD116,
                emissive: 0xFCD116,
                emissiveIntensity: 0.5
            });
            
            var bullet = new THREE.Mesh(geometry, material);
            
            // Position de départ
            if (this.world.player) {
                bullet.position.copy(this.world.player.position);
                bullet.position.y += 1.7;
            }
            
            // Direction
            var direction = new THREE.Vector3(0, 0, -1);
            if (this.three.camera) {
                direction.applyQuaternion(this.three.camera.quaternion);
            }
            
            // Imprécision
            var accuracy = weapon.accuracy || 0.9;
            var spread = (1 - accuracy) * 0.1;
            direction.x += (Math.random() - 0.5) * spread;
            direction.y += (Math.random() - 0.5) * spread;
            direction.normalize();
            
            bullet.userData = {
                direction: direction,
                speed: this.systems.combat.bulletSpeed,
                damage: weapon.damage,
                spawnTime: Date.now(),
                owner: "player",
                weaponType: weapon.type
            };
            
            this.three.scene.add(bullet);
            this.world.projectiles.push(bullet);
        },
        
        checkBulletCollision: function(bullet, index) {
            // Ennemis
            for (var i = 0; i < this.world.enemies.length; i++) {
                var enemy = this.world.enemies[i];
                if (!enemy.userData || enemy.userData.dead) continue;
                
                var distance = bullet.position.distanceTo(enemy.position);
                if (distance < 1) {
                    this.damageEnemy(enemy, bullet.userData.damage, bullet);
                    return true;
                }
            }
            
            // Limite de distance
            if (this.world.player && 
                bullet.position.distanceTo(this.world.player.position) > 300) {
                return true;
            }
            
            return false;
        },
        
        damageEnemy: function(enemy, damage, bullet) {
            if (!enemy.userData) return;
            
            enemy.userData.health -= damage;
            
            // Effet de dégâts
            this.createHitEffect(enemy.position, damage);
            
            // Son
            this.playSound('sfx-hit');
            
            // Indicateur de dégâts
            this.createDamageIndicator(enemy.position, damage);
            
            // Effet visuel
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
        },
        
        updateLighting: function() {
            if (!this.world.sun) return;
            
            var hour = this.systems.time.currentTime;
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
            
            this.world.sun.intensity = intensity * 1.2;
            
            // Position du soleil
            var sunAngle = (hour / 24) * Math.PI * 2;
            this.world.sun.position.x = Math.cos(sunAngle) * 200;
            this.world.sun.position.y = Math.sin(sunAngle) * 100 + 50;
            this.world.sun.position.z = Math.sin(sunAngle) * 200;
            
            // Couleur du ciel
            if (this.world.skybox && this.world.skybox.material) {
                var skyColor;
                if (this.systems.time.isDay) {
                    skyColor = this.assets.colors.sky;
                } else {
                    var nightFactor = (hour < 6 ? hour / 6 : (24 - hour) / 6);
                    skyColor = this.utils.lerpColor(0x000033, this.assets.colors.sky, nightFactor);
                }
                this.world.skybox.material.color.setHex(skyColor);
            }
        },
        
        randomDailyEvent: function() {
            var events = [
                {
                    type: "weather",
                    message: "Il pleut aujourd'hui. La visibilité est réduite.",
                    effect: function() {
                        // Réduire la visibilité
                        this.three.scene.fog.near = 20;
                        this.three.scene.fog.far = 300;
                    }
                },
                {
                    type: "market",
                    message: "C'est jour de marché! Les prix sont réduits.",
                    effect: function() {
                        // Réduire les prix
                        // (À implémenter avec le système d'économie)
                    }
                },
                {
                    type: "bandits",
                    message: "Des bandits rôdent dans la région. Soyez prudent!",
                    effect: function() {
                        // Augmenter le nombre d'ennemis
                        this.spawnAdditionalEnemies(5);
                    }
                },
                {
                    type: "festival",
                    message: "C'est un jour de fête! La ville est animée.",
                    effect: function() {
                        // Augmenter le nombre de PNJ
                        this.spawnAdditionalNPCs(3);
                    }
                }
            ];
            
            var event = events[Math.floor(Math.random() * events.length)];
            this.showMessage(event.message, 4000);
            
            if (event.effect) {
                event.effect.call(this);
            }
        }
    };
    
    // Initialiser au chargement
    window.addEventListener('DOMContentLoaded', function() {
        console.log("🚀 Chargement du RPG Gabonais 3D...");
        
        // Attendre un peu pour s'assurer que tout est prêt
        setTimeout(function() {
            try {
                Game.init();
                console.log("🎮 RPG Gabonais 3D prêt! 🇬🇦");
            } catch (error) {
                console.error("Erreur d'initialisation:", error);
                // Afficher un message d'erreur simple
                var errorDiv = document.createElement('div');
                errorDiv.style.cssText = `
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: #8B0000;
                    color: white;
                    padding: 20px;
                    border-radius: 10px;
                    z-index: 10000;
                    text-align: center;
                    max-width: 80%;
                `;
                errorDiv.innerHTML = `
                    <h2>❌ Erreur d'initialisation du jeu</h2>
                    <p>${error.message}</p>
                    <p>Veuillez recharger la page ou vérifier la console pour plus de détails.</p>
                `;
                document.body.appendChild(errorDiv);
            }
        }, 100);
    });
    
})();