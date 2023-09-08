const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, DMChannel, ActivityType } = require('discord.js');
const dotenv = require('dotenv').config();
const token = process.env.DISCORD_TOKEN;

// Start service worker on express.js
const { Worker } = require('worker_threads');

const runService = (WorkerData) => {

    return new Promise((resolve, reject) => {
        const worker = new Worker('./express.js', { WorkerData });
        worker.on('message', resolve);
        worker.on('error', reject);

        worker.on('exit', (code) => {
            if (code !== 0)
                reject(new Error(`stopped with  ${code} exit code`));
        })

    })

}

const run = async () => {
    const result = await runService('hello node.js')
    console.log(result);
}

run().catch(err => console.error(err))

// Create a new client instance
const client = new Client({ intents: [
	GatewayIntentBits.Guilds, 
	GatewayIntentBits.DirectMessages,
	GatewayIntentBits.DirectMessageTyping,
	GatewayIntentBits.GuildMembers,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.GuildMessageReactions,
	GatewayIntentBits.GuildMessageTyping,
	GatewayIntentBits.DirectMessageReactions,
] });

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	// // Clear all commands from the client
	// c.application.commands.set([]);
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on(Events.ClientReady, c => {
	client.user.setActivity("Forza Horizon 5", {
		type: ActivityType.Playing,
	  });
})

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

client.on(Events.MessageCreate, msg => {
	// Check if sender isnt a bot
	if (msg.author.bot) return;
	// Generate number 1 through 10
	const random = Math.floor(Math.random() * 100) + 1;

	if (random === 1) {
		msg.author.send('haha loser ff je bek dicht houden')
	}
});

// Check for DMs



// Log in to Discord with your client's token
client.login(token);