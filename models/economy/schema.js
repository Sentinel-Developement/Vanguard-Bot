const mongoose = require('mongoose');

// Hunting Vehicle Schema
const huntingVehicleSchema = new mongoose.Schema({
    vehicleId: String,
    name: String,
    type: {
        type: String,
        enum: ['atv', 'jeep', 'truck', 'helicopter', 'tank']
    },
    tier: { type: Number, min: 1, max: 5 },
    durability: { type: Number, min: 0, max: 100, default: 100 },
    maxDurability: { type: Number, default: 100 },
    fuelCapacity: { type: Number, default: 100 },
    currentFuel: { type: Number, default: 100 },
    capacity: { type: Number, default: 5 },
    jungleDepth: { type: Number, min: 1, max: 10 },
    purchasePrice: Number,
    maintenanceCost: { type: Number, default: 100 },
    dateAcquired: { type: Date, default: Date.now }
});

// Hunting Weapon Schema - ✅ SINGLE DECLARATION ONLY
const huntingWeaponSchema = new mongoose.Schema({
    weaponId: String,
    name: String,
    type: {
        type: String,
        enum: ['bow', 'crossbow', 'rifle', 'sniper', 'tranquilizer', 'net_gun'] // ✅ FIXED: net_gun
    },
    tier: { type: Number, min: 1, max: 5 },
    damage: { type: Number, min: 10, max: 500 },
    accuracy: { type: Number, min: 50, max: 100 },
    durability: { type: Number, min: 0, max: 100, default: 100 },
    maxDurability: { type: Number, default: 100 },
    ammoCapacity: { type: Number, default: 30 },
    currentAmmo: { type: Number, default: 30 },
    criticalChance: { type: Number, min: 5, max: 50, default: 10 },
    purchasePrice: Number,
    upgradeLevel: { type: Number, default: 0, max: 10 },
    dateAcquired: { type: Date, default: Date.now }
});

// Hunting Companion Schema
const huntingCompanionSchema = new mongoose.Schema({
    companionId: String,
    name: String,
    type: {
        type: String,
        enum: ['dog', 'falcon', 'tracker', 'medic', 'veteran_hunter'] // ✅ FIXED: veteran_hunter
    },
    tier: { type: Number, min: 1, max: 5 },
    health: { type: Number, min: 0, max: 100, default: 100 },
    maxHealth: { type: Number, default: 100 },
    stamina: { type: Number, min: 0, max: 100, default: 100 },
    skill: { type: Number, min: 1, max: 100, default: 50 },
    experience: { type: Number, default: 0 },
    level: { type: Number, default: 1, max: 20 },
    injured: { type: Boolean, default: false },
    injuryTime: Date,
    healingCost: { type: Number, default: 0 },
    specialAbility: String,
    purchasePrice: Number,
    dateAcquired: { type: Date, default: Date.now }
});

// Hunting Warehouse Schema
const huntingWarehouseSchema = new mongoose.Schema({
    warehouseId: String,
    name: String,
    type: {
        type: String,
        enum: ['basic_storage', 'cooled_storage', 'premium_vault', 'exotic_preserve', 'legendary_sanctuary'] // ✅ FIXED: All underscores
    },
    tier: { type: Number, min: 1, max: 5 },
    capacity: { type: Number, default: 20 },
    preservation: { type: Number, min: 1, max: 10, default: 5 },
    bonusMultiplier: { type: Number, default: 1.0 },
    currentItems: { type: Number, default: 0 },
    maintenanceCost: { type: Number, default: 500 },
    location: String,
    purchasePrice: Number,
    dateAcquired: { type: Date, default: Date.now }
});

// Hunting Inventory Item Schema
const huntingInventorySchema = new mongoose.Schema({
    itemId: String,
    name: String,
    type: {
        type: String,
        enum: ['animal', 'pelt', 'meat', 'trophy', 'rare_material', 'loot_box', 'artifact'] // ✅ FIXED: rare_material, loot_box
    },
    rarity: {
        type: String,
        enum: ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic']
    },
    baseValue: Number,
    currentValue: Number,
    weight: { type: Number, default: 1 },
    quantity: { type: Number, default: 1 },
    expiryDate: Date,
    location: String,
    huntDate: { type: Date, default: Date.now },
    description: String
});

// Business Schema
const businessSchema = new mongoose.Schema({
    businessId: String,
    name: String,
    type: {
        type: String,
        enum: ['restaurant', 'tech_startup', 'real_estate', 'car_dealership', 'security_company', 'casino'] // ✅ FIXED: All underscores
    },
    level: { type: Number, default: 1, max: 10 },
    employees: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    expenses: { type: Number, default: 0 },
    profit: { type: Number, default: 0 },
    reputation: { type: Number, default: 50, min: 0, max: 100 },
    location: String,
    purchasePrice: Number,
    upgradeCost: Number,
    dailyIncome: { type: Number, default: 0 },
    lastCollection: Date,
    efficiency: { type: Number, default: 1.0 },
    specialBonus: { type: Number, default: 0 },
    dateAcquired: { type: Date, default: Date.now }
});

// Heist Schema
const heistSchema = new mongoose.Schema({
    heistId: String,
    plannerUserId: String,
    targetType: {
        type: String,
        enum: ['central_bank', 'casino_vault', 'mansion_safe', 'jewelry_store', 'armored_truck'] // ✅ FIXED: All underscores
    },
    targetName: String,
    difficulty: { type: Number, min: 1, max: 5 },
    requiredMembers: { type: Number, min: 3, max: 6 },
    members: [{
        userId: String,
        username: String,
        role: {
            type: String,
            enum: ['mastermind', 'hacker', 'driver', 'muscle', 'lookout', 'safecracker']
        },
        confirmed: { type: Boolean, default: false },
        equipment: [String]
    }],
    plannedDate: Date,
    executionDate: Date,
    status: {
        type: String,
        enum: ['planning', 'recruiting', 'ready', 'in_progress', 'completed', 'failed', 'cancelled'], // ✅ FIXED: in_progress
        default: 'planning'
    },
    potential_payout: Number, // ✅ FIXED: potential_payout
    actual_payout: Number, // ✅ FIXED: actual_payout
    success_chance: { type: Number, default: 0 }, // ✅ FIXED: success_chance
    heat_level: { type: Number, default: 0 }, // ✅ FIXED: heat_level
    preparation_time: { type: Number, default: 0 }, // ✅ FIXED: preparation_time
    equipment_cost: { type: Number, default: 0 }, // ✅ FIXED: equipment_cost
    createdAt: { type: Date, default: Date.now }
});

const heistCollectionSchema = new mongoose.Schema({
    heistId: { type: String, required: true, unique: true },
    guildId: { type: String, required: true },
    ...heistSchema.obj
});

const transactionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['income', 'expense', 'transfer', 'investment', 'trade', 'racing', 'robbery', 'family_work', 'gambling', 'shop'], // ✅ FIXED: family_work
        required: true
    },
    amount: { type: Number, required: true },
    description: String,
    category: String,
    timestamp: { type: Date, default: Date.now }
});

const carSchema = new mongoose.Schema({
    carId: String,
    name: String,
    type: {
        type: String,
        enum: ['economy', 'sports', 'luxury', 'supercar', 'hypercar']
    },
    speed: { type: Number, min: 1, max: 100 },
    acceleration: { type: Number, min: 1, max: 100 },
    handling: { type: Number, min: 1, max: 100 },
    durability: { type: Number, min: 1, max: 100, default: 100 },
    purchasePrice: Number,
    currentValue: Number,
    maintenanceCost: Number,
    raceWins: { type: Number, default: 0 },
    raceLosses: { type: Number, default: 0 },
    totalDistance: { type: Number, default: 0 },
    dateAcquired: { type: Date, default: Date.now }
});

const petSchema = new mongoose.Schema({
    petId: String,
    name: String,
    type: {
        type: String,
        enum: ['dog', 'cat', 'bird', 'security_dog', 'guard_cat'] // ✅ FIXED: security_dog, guard_cat
    },
    breed: String,
    securityLevel: { type: Number, min: 1, max: 100 },
    happiness: { type: Number, min: 0, max: 100, default: 50 },
    health: { type: Number, min: 0, max: 100, default: 100 },
    hunger: { type: Number, min: 0, max: 100, default: 50 },
    cleanliness: { type: Number, min: 0, max: 100, default: 50 },
    lastFed: Date,
    lastGroomed: Date,
    lastPlayed: Date,
    purchasePrice: Number,
    dateAdopted: { type: Date, default: Date.now }
});

const familyMemberSchema = new mongoose.Schema({
    memberId: String,
    name: String,
    relationship: {
        type: String,
        enum: ['spouse', 'child', 'parent', 'sibling', 'grandparent']
    },
    age: Number,
    profession: String,
    salary: Number,
    bond: { type: Number, min: 0, max: 100, default: 50 },
    workEfficiency: { type: Number, min: 0.5, max: 2.0, default: 1.0 },
    lastTrip: Date,
    totalTrips: { type: Number, default: 0 }
});

const propertySchema = new mongoose.Schema({
    propertyId: String,
    name: String,
    type: {
        type: String,
        enum: ['studio', 'apartment', 'house', 'mansion', 'penthouse', 'estate']
    },
    purchasePrice: Number,
    currentValue: Number,
    monthlyRent: Number,
    utilities: Number,
    securityLevel: { type: Number, min: 1, max: 10, default: 1 },
    maxFamilyMembers: Number,
    hasGarage: { type: Boolean, default: false },
    garageCapacity: { type: Number, default: 0 },
    vaultCapacity: { type: Number, default: 0 },
    condition: {
        type: String,
        enum: ['poor', 'fair', 'good', 'excellent'],
        default: 'good'
    },
    dateAcquired: Date
});

const roleSchema = new mongoose.Schema({
    roleId: String,
    roleName: String,
    price: Number,
    benefits: {
        workMultiplier: { type: Number, default: 1.0 },
        racingBonus: { type: Number, default: 0 },
        robberyProtection: { type: Number, default: 0 },
        familyBonus: { type: Number, default: 0 }
    },
    datePurchased: { type: Date, default: Date.now },
    expiryDate: Date
});

// Active effects system
const activeEffectSchema = new mongoose.Schema({
    effectId: String,
    name: String,
    type: { 
        type: String, 
        enum: ['gambling_luck', 'work_boost', 'robbery_protection', 'vault_boost', 'bank_boost'] // ✅ FIXED: All underscores
    },
    multiplier: { type: Number, default: 1 },
    stacks: { type: Number, default: 1, max: 5 },
    startTime: { type: Date, default: Date.now },
    expiryTime: Date,
    description: String
});

// ✅ MAIN ECONOMY SCHEMA
const economySchema = new mongoose.Schema({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    
    // Basic Economy
    wallet: { type: Number, default: 1000, min: 0 },
    bank: { type: Number, default: 0, min: 0 },
    bankLimit: { type: Number, default: 10000 },
    
    // Family System
    familyVault: { type: Number, default: 0, min: 0 },
    familyMembers: [familyMemberSchema],
    familyBond: { type: Number, min: 0, max: 100, default: 0 },
    
    // Vehicle System
    cars: [carSchema],
    activeCar: String,
    
    // Pet System
    pets: [petSchema],
    maxPets: { type: Number, default: 1 },
    
    // Property System
    properties: [propertySchema],
    primaryResidence: String,
    
    // Business System
    businesses: [businessSchema],
    maxBusinesses: { type: Number, default: 1 },
    businessSkill: { type: Number, default: 0, max: 100 },
    
    // Heist System
    activeHeists: [String],
    completedHeists: { type: Number, default: 0 },
    failedHeists: { type: Number, default: 0 },
    heistSkill: { type: Number, default: 0, max: 100 },
    heatLevel: { type: Number, default: 0, max: 100 },
    jailTime: Date,
    
    // ✅ HUNTING SYSTEM
    huntingVehicles: [huntingVehicleSchema],
    activeVehicle: String,
    huntingWeapons: [huntingWeaponSchema],
    activeWeapon: String,
    huntingCompanions: [huntingCompanionSchema],
    activeCompanions: [String],
    maxCompanions: { type: Number, default: 2 },
    huntingWarehouses: [huntingWarehouseSchema],
    huntingInventory: [huntingInventorySchema],

    // Hunting Stats
    huntingStats: {
        totalHunts: { type: Number, default: 0 },
        successfulHunts: { type: Number, default: 0 },
        failedHunts: { type: Number, default: 0 },
        animalsKilled: { type: Number, default: 0 },
        totalDamageDealt: { type: Number, default: 0 },
        totalDamageTaken: { type: Number, default: 0 },
        deepestJungleLevel: { type: Number, default: 1 },
        rareAnimalsFound: { type: Number, default: 0 },
        lootBoxesFound: { type: Number, default: 0 },
        totalEarnings: { type: Number, default: 0 },
        huntingSkill: { type: Number, default: 0, max: 100 },
        survivalSkill: { type: Number, default: 0, max: 100 }
    },

    // Hunting Profile
    huntingProfile: {
        hunterLevel: { type: Number, default: 1 },
        hunterExperience: { type: Number, default: 0 },
        reputation: { type: Number, default: 0, min: -100, max: 100 },
        currentHealth: { type: Number, default: 100, min: 0, max: 100 },
        maxHealth: { type: Number, default: 100 },
        stamina: { type: Number, default: 100, min: 0, max: 100 },
        lastHunt: Date,
        expeditionCount: { type: Number, default: 0 },
        currentLocation: { type: String, default: 'base_camp' }, // ✅ FIXED: base_camp
        licenses: [String],
        achievements: [String]
    },
    
    // Role System
    purchasedRoles: [roleSchema],
    
    // Active Effects System
    activeEffects: [activeEffectSchema],
    
    // Stats and Progress
    level: { type: Number, default: 1 },
    experience: { type: Number, default: 0 },
    reputation: { type: Number, default: 0 },
    
    // Racing Stats
    racingStats: {
        totalRaces: { type: Number, default: 0 },
        wins: { type: Number, default: 0 },
        losses: { type: Number, default: 0 },
        earnings: { type: Number, default: 0 },
        winStreak: { type: Number, default: 0 }
    },
    
    // Security & Robbery
    lastRobbed: Date,
    robberyAttempts: { type: Number, default: 0 },
    successfulRobberies: { type: Number, default: 0 },
    
    // Enhanced Cooldowns
    cooldowns: {
        daily: Date,
        weekly: Date,
        work: Date,
        race: Date,
        trip: Date,
        petCare: Date,
        robbery: Date,
        beg: Date,
        gambling: Date,
        shop: Date,
        business: Date,
        heist: Date,
        hunt: Date // ✅ ADDED hunt cooldown
    },
    
    dailyStreak: { type: Number, default: 0 },
    transactions: [transactionSchema],
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// ✅ CRITICAL FIX: Add compound unique index
economySchema.index({ userId: 1, guildId: 1 }, { unique: true });

// Pre-save middleware to update timestamp and clean expired effects
economySchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    
    // Clean expired effects
    this.activeEffects = this.activeEffects.filter(effect => 
        new Date(effect.expiryTime) > new Date()
    );
    
    next();
});

module.exports = {
    Economy: mongoose.model('Economy', economySchema),
    Heist: mongoose.model('Heist', heistCollectionSchema)
};
