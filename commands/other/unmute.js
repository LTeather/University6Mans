const commando = require('discord.js-commando');
const discord  = require('discord.js');

class Unmute extends commando.Command {
    constructor(client) {
        super(client,  {
            name: 'unmute',
            group: 'other',
            memberName: 'unmute',
            description: 'Unmute the 6Mans Ping'
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
                await message.member.addRole(EUPingRole);
                console.log(`Gave ${message.member.user.tag} EU Ping`);
                msg += "Given you the 6Mans Ping EU role\n";
            }
            if (roles.includes("NA")) {
                await message.member.addRole(NAPingRole);
                console.log(`Gave ${message.member.user.tag} NA Ping`);
                msg += "Given you the 6Mans Ping NA role\n";
            }
            if (roles.includes("S")) {
                await message.member.addRole(RankSPingRole);
                console.log(`Gave ${message.member.user.tag} Rank S Ping`);
                msg += "Given you the Rank S Ping role\n";
            }
            var reply = await message.channel.send(msg);
        }
        else {
            var reply = await message.channel.send("Incorrect role. Options are: `EU`, `NA`, `S`");
        }
        await new Promise(r => setTimeout(r, 3000));
        await message.delete();
        await reply.delete();
    }
}

module.exports = Unmute;