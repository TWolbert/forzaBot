const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('getcar')
		.setDescription('Get a Forza car'),
	async execute(interaction) {
		console.log(interaction)
		// fetch /getcar/:carname
        fetch('http://localhost:25605/getcar/' + interaction.options.getString('car'), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => response.json()).then(data => {
            console.table(data);
            interaction.reply("Here's your car! " + data, ephemeral = true)
        })
	},
};