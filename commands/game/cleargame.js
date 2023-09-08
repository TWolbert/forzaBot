const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('cleargame')
		.setDescription('Used to clear all games from the database'),
	async execute(interaction) {
        fetch('http://localhost:25605/cleargame', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => response.json()).then(data => {
            console.table(data);
            interaction.reply("Cleared all games from the database")
        })
	},
};