const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('template')
		.setDescription('Unused template command'),
	async execute(interaction) {
		console.log(interaction)
		// interaction.guild is the object representing the Guild in which the command was run
		await interaction.reply("This serves as a template command")
	},
};