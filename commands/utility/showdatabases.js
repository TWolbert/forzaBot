const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('showdbs')
		.setDescription('Shows all databases in the MySQL server'),
	async execute(interaction) {
		fetch('http://localhost:25605/showDBs').then(response => response.json()).then(data => {
            let response = "The current useable databases are: \n"
            for (let i = 0; i < data.databases.length; i++) {
                response += data.databases[i].Database + "\n"
            }
            interaction.reply(response)
        })
	},
};