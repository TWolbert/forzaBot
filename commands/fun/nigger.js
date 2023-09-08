const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('nigger')
		.setDescription(':3').addUserOption(option => option.setName('user').setDescription('The user to mention').setRequired(true)),
	async execute(interaction) {
        let embed = new EmbedBuilder().addFields({
            name: "Mention",
            value: `<@${interaction.options.getUser('user').id}>`,
        }).setColor('#c355f2').setImage('https://media.discordapp.net/attachments/967725042127491085/1098325398351253634/1681166747302.gif');
        interaction.reply({embeds: [embed]})
	},
};