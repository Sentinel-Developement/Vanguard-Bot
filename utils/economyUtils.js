const { Economy } = require('../models/economy/economy');

class EconomyUtils {
    static async decayPetStats() {
        const profiles = await Economy.find({});
        
        for (const profile of profiles) {
            let needsUpdate = false;
            
            profile.pets.forEach(pet => {
                const now = new Date();
                const hoursSinceLastFed = pet.lastFed ? 
                    (now - pet.lastFed) / (1000 * 60 * 60) : 24;
                const hoursSinceLastGroomed = pet.lastGroomed ? 
                    (now - pet.lastGroomed) / (1000 * 60 * 60) : 24;
                const hoursSinceLastPlayed = pet.lastPlayed ? 
                    (now - pet.lastPlayed) / (1000 * 60 * 60) : 24;
                
          
                if (hoursSinceLastFed > 12) {
                    pet.hunger = Math.max(0, pet.hunger - 5);
                    pet.health = Math.max(0, pet.health - 2);
                    needsUpdate = true;
                }
                
                if (hoursSinceLastGroomed > 24) {
                    pet.cleanliness = Math.max(0, pet.cleanliness - 3);
                    needsUpdate = true;
                }
                
                if (hoursSinceLastPlayed > 18) {
                    pet.happiness = Math.max(0, pet.happiness - 4);
                    needsUpdate = true;
                }
            });
            
            if (needsUpdate) {
                await profile.save();
            }
        }
    }
    
    static async handleMonthlyBills() {
        const profiles = await Economy.find({});
        
        for (const profile of profiles) {
            const primaryProperty = profile.properties.find(p => p.propertyId === profile.primaryResidence);
            if (!primaryProperty) continue;
            
            const totalBills = primaryProperty.monthlyRent + primaryProperty.utilities;
            
         
            if (profile.wallet >= totalBills) {
                profile.wallet -= totalBills;
            } else if (profile.wallet + profile.familyVault >= totalBills) {
                const remaining = totalBills - profile.wallet;
                profile.wallet = 0;
                profile.familyVault -= remaining;
            } else {
              
                const unpaid = totalBills - profile.wallet - profile.familyVault;
                profile.wallet = 0;
                profile.familyVault = 0;
                
            }
            
            await profile.save();
        }
    }
}

module.exports = EconomyUtils;
