const Autorole = require('../models/autorole/autorole'); 

module.exports = (client) => {
    client.on('guildMemberAdd', async member => {
        try {
            const guildId = member.guild.id;
            const settings = await Autorole.findOne({ serverId: guildId });

         
            if (!settings || settings.status !== true) {
                return;
            }

         
            const role = member.guild.roles.cache.get(settings.roleId);

            if (!role) {
                console.error(`Autorole: Role with ID ${settings.roleId} not found in guild ${member.guild.name} (${guildId})`);
                return;
            }

          
            if (role.position >= member.guild.members.me.roles.highest.position) {
                console.error(`Autorole: Cannot assign role ${role.name} in guild ${member.guild.name} - role hierarchy issue`);
                return;
            }

            
            if (!role.editable) {
                console.error(`Autorole: Role ${role.name} in guild ${member.guild.name} is not editable by the bot`);
                return;
            }

 
            await member.roles.add(role, 'Auto-role assignment');
            //console.log(`Autorole: Successfully assigned role ${role.name} to ${member.user.tag} in ${member.guild.name}`);

        } catch (error) {
            //console.error(`Autorole: Failed to assign role to user ${member.user.tag} in guild ${member.guild.name}:`, error);
        }
    });
};