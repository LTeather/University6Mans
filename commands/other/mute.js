const commando = require('discord.js-commando');
const discord  = require('discord.js');

class Mute extends commando.Command {
    constructor(client) {
        super(client,  {
            name: 'mute',
            group: 'other',
            memberName: 'mute',
            description: 'Mute the 6Mans Ping'
        });
    }

    async run(message, args) {
        var roles = args.split(" ").map(a => { return a.toUpperCase(); });
        if (roles.includes("EU") || roles.includes("NA") || roles.includes("S")) {            
            var EUPingRole = message.guild.roles.find(r => r.name == '6Mans Ping EU');
            var NAPingRole = message.guild.roles.find(r => r.name == '6Mans Ping NA');
            var RankSPingRole = message.guild.roles.find(r => r.name == 'Rank S Ping');
            var msg = "";
            if (roles.includes("EU")) {
                await message.member.removeRole(EUPingRole);
                console.log(`Removed ${message.member.user.tag} EU Ping`);
                msg += "Removed your 6Mans Ping EU role\n";
            }
            if (roles.includes("NA")) {
                await message.member.removeRole(NAPingRole);
                console.log(`Removed ${message.member.user.tag} NA Ping`);
                msg += "Removed your 6Mans Ping NA role\n";
            }
            if (roles.includes("S")) {
                await message.member.removeRole(RankSPingRole);
                console.log(`Removed ${message.member.user.tag} Rank S Ping`);
                msg += "Removed your Rank S Ping role\n";
            }
            var reply = await message.channel.send(msg);
        }
        else {
            var reply = await message.channel.send("Incorrect role. Options are: `EU`, `NA`, `S`");
        }
        await message.delete();
        await new Promise(r => setTimeout(r, 3000));
        await reply.delete();
    }
}

module.exports = Mute;