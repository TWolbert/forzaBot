const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('join')
		.setDescription('Used to join an active game'),
	async execute(interaction) {
        fetch('http://localhost:25605/joingame', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: interaction.user.username
            })
        }).then(response => response.json()).then(data => {
            if (data.error) {
                interaction.reply(data.error, ephemeral = true)
                setTimeout(() => {
                    interaction.deleteReply();
                }, 2000);
                return;
            }
            console.table(data);
            // Send dm to user with join link
            interaction.user.send(`Hey ${interaction.user.username}! Click this link to join the game: ${data.link}`)
            interaction.reply('Check your dms!', ephemeral = true)
        })
	},
};