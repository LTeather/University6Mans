const commando = require('discord.js-commando');
const discord  = require('discord.js');

class RandomVote extends commando.Command {
    constructor(client) {
        super(client,  {
            name: 'r',
            group: 'vote',
            memberName: 'random',
            description: 'Voting: Vote for entirely random teams.'
        });
    }

    async run(message, args) {
        var instance = sixMansService.GetInstanceFromId(message.channel.id);
        
        if(message.channel.id == instance.channels.queue) {
            var [success, error] = await instance.ProcessNewVote(message, "r");
            if(!success) {
                message.reply(error)
            }
        }
    }
}

module.exports = RandomVote;