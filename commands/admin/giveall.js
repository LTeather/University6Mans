const commando = require('discord.js-commando');
const discord  = require('discord.js');

class GiveAll extends commando.Command {
    constructor(client) {
        super(client,  {
            name: 'giveall',
            group: 'admin',
            memberName: 'giveall',
            description: 'Gives all members the correct ping role'
        });
    }

    /**
     *  Called when a 'giveall' message is read.
     */
    async run(message, args) {        
        if (!message.member.hasPermission("ADMINISTRATOR")) {
            message.reply("Only admins can use this command! Nice try... :wink:");
            return;
        }
        else {            
            var EUPingRole = message.guild.roles.find(r => r.name == '6Mans Ping EU');
            var NAPingRole = message.guild.roles.find(r => r.name == '6Mans Ping NA');
            var RankSPingRole = message.guild.roles.find(r => r.name == 'Rank S Ping');
            var UKRole = message.guild.roles.find(r => r.name == 'UK Player');
            var EURole = message.guild.roles.find(r => r.name == 'EU Player');
            var NARole = message.guild.roles.find(r => r.name == 'NA Player');
            var RankSRole = message.guild.roles.find(r => r.name == 'Rank S');

            if (!EUPingRole || !NAPingRole || !RankSPingRole || !UKRole || !EURole || !NARole || !RankSRole) {
                await message.channel.send(`<@${message.author.id}>, a role was not found`);
                await message.channel.send(`EUPing: ${EUPingRole}, NAPing: ${NAPingRole}, RankSPing: ${RankSPingRole}, UKRole: ${UKRole}, EURole: ${EURole}, NARole: ${NARole}, RankSRole: ${RankSRole}`);
                return;
            }
            var reply = new discord.RichEmbed()
            .addField("**Giving 6Mans ping role to all players**", "Starting now...")
            .setColor(adminColor)
            .setFooter(footer, footerImage)    
            await message.channel.send(reply);

            var members = message.guild.members.filter(m => !m.user.bot).array();
            for (var i = 0; i < members.length; ++i) {                
                await new Promise(r => setTimeout(r, 1000));
                var member = members[i];
                console.log(`Checking ${member.user.tag}`)
                if (member.roles.has(UKRole.id) || member.roles.has(EURole.id)) {
                    await member.addRole(EUPingRole);
                    console.log(`Gave ${member.user.tag} EU Ping`);
                }
                if (member.roles.has(NARole.id)) {
                    await member.addRole(NAPingRole);
                    console.log(`Gave ${member.user.tag} NA Ping`);
                }
                if (member.roles.has(RankSRole.id)) {
                    await member.addRole(RankSPingRole);
                    console.log(`Gave ${member.user.tag} Rank S Ping`);
                }
            };

            reply = new discord.RichEmbed()
            .addField("**Giving 6Mans ping role to all players**", "All done.")
            .setColor(adminColor)
            .setFooter(footer, footerImage)    
            await message.channel.send(reply);  

            console.log('Given ping role to all members');
        }
    }
}
module.exports = GiveAll;