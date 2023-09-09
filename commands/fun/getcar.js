const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('getcar')
		.setDescription('Get a Forza car').addStringOption(option => option.setName('car').setDescription('The car you want to get').setRequired(true)),
	async execute(interaction) {
		// fetch /getcar/:carname
        fetch('http://localhost:25605/getcar/' + interaction.options.getString('car'), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => response.json()).then(data => {
            console.table(data.result);
            interaction.reply("Here's your car! " + data, ephemeral = true)
        })
	},
};