const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, Embed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('start')
		.setDescription('Command used to start a game, will return a link to the game'),
	async execute(interaction) {
        let embed = new EmbedBuilder().addFields({
            name: "Game Link",
            value: "Loading...",
        }).setColor('#c355f2').setImage('https://cdn.discordapp.com/attachments/1149384071563186258/1149703278020542464/botIcon.png');
        interaction.reply({embeds: [embed]}).then(() => {
            fetch('http://localhost:3000/creategame', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    creatorUsername: interaction.user.username
                })
            }).then(response => response.json()).then(data => {
                console.table(data);
                embed = new EmbedBuilder().addFields({
                    name: "Game Link",
                    value: 'type /join to recieve a join link!'
                }).setColor('#c355f2')
                .setImage('https://cdn.discordapp.com/attachments/1149384071563186258/1149703278020542464/botIcon.png')
                .setFooter({
                    text: "Bot created by @teunw",
                    iconURL: "https://cdn.discordapp.com/attachments/1149384071563186258/1149703278020542464/botIcon.png"
                });
                interaction.editReply({embeds: [embed]})
            })
        })
		// fetch /creategame with the user's username as post

	},
};