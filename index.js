const Commando             = require('discord.js-commando');
const discord              = require('discord.js');
const express              = require('express');
const mysql                = require('mysql2/promise');
const path                 = require('path');
const VoiceChannelSettings = require('./Model/VoiceChannelSettings');
const Queue                = require('./Model/Queue');
const DiscordService       = require('./Services/DiscordService');
const GameService          = require('./Services/GameService');
const DatabaseService      = require('./Services/DatabaseService');
const SixMansService       = require('./Services/SixMansService');
const SixMansInstance      = require('./Model/SixMansInstance');

const app = express();

if (process.env.NODE_ENVIRONMENT == "Development") {
    global.Environment = "Development";
} else {
    global.Environment = "Release";
}

// Load config
if (Environment == "Development") {
    config = require('./appsettings.development.json');
}
else if (Environment == "Release") {
    config = require('./appsettings.release.json');
}

Main(config)

async function Main(config) {
    // Create and configure the discord bot.
    var bot = new Commando.Client();

    var instancesConfiguration = config.Instances;
    var sixMansInstances = [];
    // Create all SixMansInstances.
    for (var i = 0; i < instancesConfiguration.length; i++) {
        var newInstance = await CreateSixMansInstance(instancesConfiguration[i], bot, config.Server.ServerId);
        sixMansInstances.push(newInstance);
    }
    // Create global service.
    global.sixMansService = new SixMansService(sixMansInstances);
    // Configure the bot.
    ConfigureBot(bot, config, sixMansInstances);
    // Configure the app.
    ConfigureApp(sixMansInstances, bot);

    // Some global colours
    global.embedColor  = 0xFF1577;
    global.embedColor2 = 0xFFC800;
    global.embedColor3 = 0x00BFE9;
    global.adminColor  = 0xFF0000;
    global.footer      = "6Mans bot created by Doppla, maintained by Joel";
    global.footerImage = "https://i.imgur.com/M1maY8U.png";

    var server = app.listen(process.env.PORT || 1337, function () { });
}

process.on('SIGTERM', async () => {
    console.log('Received SIGTERM.');
    await global.sixMansService.saveQueues();
    process.exit(0);
});

/**
 * Creates an instance of a SixMansInstance from configuration
 */
async function CreateSixMansInstance(config, bot, serverId) {
    // Setup Voice channel settings
    var voiceChannelSettings = new VoiceChannelSettings(config.CategoryId);
    // Create Discord service
    var discordService = new DiscordService(bot, voiceChannelSettings, serverId);
    // Create Database Service
    var pool = await mysql.createPool(config.Database);
    var databaseService = new DatabaseService(pool);
    // Create Game Service
    var minGameID = await databaseService.GetMaxId() + 1;
    var games = await loadAllGamesFromDatabase(databaseService);
    var gameService = new GameService(minGameID, games, databaseService, discordService, bot);
    // Create queue
    var queue = new Queue();

    return new SixMansInstance(config.Name, databaseService, gameService, discordService, queue, config.Channels);
}

/**
 * Load every game into the in memory database.
 */
async function loadAllGamesFromDatabase(databaseService) {
    games = [];
    var activeGames = await databaseService.GetAllActiveGames();
    for (var i = 0; i < activeGames.length; i++) {
        games.push(activeGames[i].id);
    }
    return games;
}

/**
 * Configures the discord Bot.
 */
async function ConfigureBot(bot, config, sixMansInstances) {
    bot.registry.registerGroup('admin', 'Admin');
    bot.registry.registerGroup('game', 'Game');
    bot.registry.registerGroup('vote', 'Vote');
    bot.registry.registerGroup('other', 'Other');
    bot.registry.registerDefaults();
    bot.registry.registerCommandsIn(__dirname + '/commands');

    bot.on('ready', async function () {
        console.log('UK University 6Mans Discord Bot');
        console.log('Made by: Doppla');
        console.log('Maintained by: Joel');

        let myGuild = bot.guilds.get(config.Server.ServerId);
        let memberCount = myGuild.memberCount;

        bot.user.setActivity(memberCount + ' Players from Universities Worldwide!');
    });

    bot.login(config.Discord.Token);

    // Apply settings based on channels as opposed to commands.
    bot.on('message', async function (message) {
        if(message.channel.id == '672145903343370250' || message.channel.id == '672133504145948717') {
            //if the message contains the link
            if(message.content.includes('https://rocketleague.tracker.network/profile/')) {
                bot.channels.get('672100901447663617').send("__**New Rank S Request!**__\n" + message.author + "\n" + message.content);
                message.delete();
                message.author.sendMessage("__**YOUR RANK S HAS BEEN SENT!**__\n\nThank you for applying for Rank S. We will give you a response on our decision within 24 hours!");
                console.log('[Rank S Request] Successful request by user: ' + message.author.tag + " (" + message.author.id + ")");
            }
            else {
                message.delete();
                message.author.sendMessage("__**YOUR RANK S REQUEST DID NOT SEND!**__\n\nPlease make sure that you've included your Rocket League tracker link in the message (<https://rocketleague.tracker.network/profile/>)");
                console.log('[Rank S Request] Failed request by user: ' + message.author.tag + " (" + message.author.id + ")");
            }            
        }

        if(message.channel.id == '664229350316703744') {
            if (!message.author.bot) {
                if (!(message.content.includes('!mute') || message.content.includes('!unmute'))) {
                    await message.delete();
                    var reply = await message.channel.send("Incorrect usage.");
                    await new Promise(r => setTimeout(r, 2000));
                    await reply.delete();
                }        
            }    
        }

        for (var i = 0; i < sixMansInstances.length; i++){
            var instance = sixMansInstances[i];
            if (message.channel.id == instance.channels.report) {
                if (!message.content.includes('!report')) {
                    if (message.member.hasPermission('MANAGE_CHANNELS') == false && message.member.hasPermission('ADMINISTRATOR') == false) {
                        message.delete();
                        break;
                    }
                }
            }            
        }
    });

    //Updates player count in status every 5 minutes.
    setInterval(function () {
        let myGuild = bot.guilds.get(config.Server.ServerId);
        let memberCount = myGuild.memberCount;

        bot.user.setActivity(memberCount + ' Players from Universities Worldwide!');

    }, 300000); // every 5 minutes (300000)

    return bot;
}

/**
 * Configure and Register all the pages for the app.
 */
async function ConfigureApp(sixMansInstances, bot) {
    app.set('view engine', 'ejs');
    app.set('views', __dirname + '/views');

    // Add stylesheets
    app.use(express.static(path.join(__dirname, 'public')));

    app.get('/', function (req, res) {
        let myGuild = bot.guilds.get(config.Server.ServerId);
        let playerCount = myGuild.memberCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");;
        res.render('index', { playerCount: playerCount });
    });

    var user = {};
    app.get('/leaderboards/:location', async function (req, res) {
        // TODO Improve this logic a bit to 
        // a) use database service methods (maybe as a callback?)
        // b) improve the logic to use the names as an id rather than index.
        if (req.params.location.toUpperCase() == "EU") {
            var pool = sixMansInstances[0].databaseService.pool;

            var [rows, _] = await pool.query('SELECT * FROM 6mans WHERE gp > 0 ORDER BY mmr DESC');
            user = { user: rows, leaderboard: req.params.location };
            res.render('leaderboards', user);
        }

        if (req.params.location.toUpperCase() == "NA") {
            var pool = sixMansInstances[1].databaseService.pool;

            var [rows, _] = await pool.query('SELECT * FROM 6mans WHERE gp > 0 ORDER BY mmr DESC')
            user = { user: rows, leaderboard: req.params.location };
            res.render('leaderboards', user);
        }

        if (req.params.location.toUpperCase() == "RANKS") {
            var pool = sixMansInstances[2].databaseService.pool;

            var [rows, _] = await pool.query('SELECT * FROM 6mans WHERE gp > 0 ORDER BY mmr DESC');
            user = { user: rows, leaderboard: req.params.location };
            res.render('leaderboards', user);
        }

        if (req.params.location.toUpperCase() == "OCE") {
            var pool = sixMansInstances[3].databaseService.pool;

            var [rows, _] = await pool.query('SELECT * FROM 6mans WHERE gp > 0 ORDER BY mmr DESC');
            user = { user: rows, leaderboard: req.params.location };
            res.render('leaderboards', user);
        }
    });

    app.get('/leaderboards', function (req, res) {
        res.redirect('/');
    });

    app.get('/profile', function (req, res) {
        res.redirect('/');
    });

    app.get('/profile/:location', function (req, res) {
        res.redirect('/');
    });

    app.get('/profile/:location/:id', async function (req, res) {
        var numbers = /^[0-9]+$/;
        if (req.params.id.match(numbers)) {
            // TODO Improve this logic a bit to 
            // a) use database service methods (maybe as a callback?)
            // b) improve the logic to use the names as an id rather than index.
            if (req.params.location.toUpperCase() == "EU") {
                var pool = sixMansInstances[0].databaseService.pool;

                var [rows, _] = await pool.query('SELECT * FROM 6mans WHERE discordID = ' + req.params.id);
                user = { user: rows };
                res.render('profile', user);
            }

            if (req.params.location.toUpperCase() == "NA") {
                var pool = sixMansInstances[1].databaseService.pool;

                var [rows, _] = await pool.query('SELECT * FROM 6mans WHERE discordID = ' + req.params.id)
                user = { user: rows };
                res.render('profile', user);
            }

            if (req.params.location.toUpperCase() == "RANKS") {
                var pool = sixMansInstances[2].databaseService.pool;

                var [rows, _] = await pool.query('SELECT * FROM 6mans WHERE discordID = ' + req.params.id);
                user = { user: rows };
                res.render('profile', user);
            }

            if (req.params.location.toUpperCase() == "OCE") {
                var pool = sixMansInstances[3].databaseService.pool;

                var [rows, _] = await pool.query('SELECT * FROM 6mans WHERE discordID = ' + req.params.id);
                user = { user: rows };
                res.render('profile', user);
            }
        }
    });

    app.get('/supporters', async function (req, res) {
        // We just use the EU leaderboard for supporters
        var supporters = { user: await sixMansInstances[0].databaseService.GetHasDonated() };
        res.render('supporters', supporters);
    });

    app.get('/play', function (req, res) {
        res.render('play');
    });

    app.get('/contact', function (req, res) {
        res.render('contact');
    });

    app.get('/thanks', function (req, res) {
        res.render('thanks');
    });

    app.use('/api/discord', require('./api/discord'));

    app.use((err, req, res, next) => {
        switch (err.message) {
            case 'NoCodeProvided':
                return res.status(400).send({
                    status: 'ERROR',
                    error: err.message,
                });
            default:
                return res.status(500).send({
                    status: 'ERROR',
                    error: err.message,
                });
        }
    });
}