const commando = require('discord.js-commando');
const discord  = require('discord.js');

class BalancedVote extends commando.Command {
    constructor(client) {
        super(client,  {
            name: 'b',
            group: 'vote',
            memberName: 'balanced',
            description: 'Voting: Vote for teams to be balanced by MMR.'
        });
    }

    async run(message, args) {
        var instance = sixMansService.GetInstanceFromId(message.channel.id);
        
        if(message.channel.id == instance.channels.queue) {
            var [success, error] = await instance.ProcessNewVote(message, "b");
            if(!success) {
                message.reply(error)
            }
        }
    }
}

module.exports = BalancedVote;