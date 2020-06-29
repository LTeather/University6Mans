const Commando = require('discord.js-commando');
const Discord  = require('discord.js');

class JoinGame extends Commando.Command {
    constructor(client) {
        super(client,  {
            name: 'q',
            aliases: ['queue', 'join', 'j'],
            group: 'game',
            memberName: 'queue',
            description: 'Joins the queue to play a game.'
        });
    }

    /**
     *  Called when a 'queue' message is read.
     */
    async run(message, args) {
        var services = sixMansService.GetAllServicesForInstance(message.channel.id);
        if(services == null)
        {
            return;
        }
        var [databaseService, gameService, queue, channels] = services;

        if(message.channel.id == channels.queue) {
            // Try add user to the queue
            var[success, error] = queue.TryAddToQueue(message.author, message.channel);
            if(!success) {
                message.reply(error);
                return;
            }

            // Add user to the database if they are not already there.
            var user = await databaseService.GetUser(message.author.id);
            if(user == null) {
                await databaseService.AddNewUser(message.author.id, message.author.username)
            }

            var queueString = queue.toDiscordString();

            var queueReply = new Discord.RichEmbed()
                .addField("Player joined the queue", message.author + " has joined the queue.")
                .addField("Players in queue: " + queue.length, queueString)
                .setColor(embedColor2)
                .setFooter(footer, footerImage)

            await message.channel.send(queueReply);

            if (queue.length == 6) {
                queue.BeginVoting();
                await message.channel.send("**THE QUEUE IS FULL! VOTING STARTING!**\n\nPlayers: " + queueString + "\n\nUse **!r** to pick random teams\nUse **!b** to pick balanced teams\nUse **!c** to pick captains");
            }
        }
    }
}

module.exports = JoinGame;