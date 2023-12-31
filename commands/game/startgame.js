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
            fetch('http://localhost:25605/creategame', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    creatorUsername: interaction.user.username
                })
            }).then(response => response.json()).then(data => {
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

                setInterval(() => {
                    fetch('http://localhost:25605/botgamestatus', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }).then(response => response.json()).then(data => {
                        // If data.gameStarted is true, then the game has started
                        if (data.gameStarted) {
                            let res = data.result[0]
                            let price = res.price;
                            let class_ = res.class;
                            let race = res.race;
                            let not_upgradeable = res.not_upgradeable;
                            let type = res.cartype;
                            let playersString = "";
                            playersString = res.players.replace("[", "").replace("]", "").replace(/'/g, "").replace(/,/g, ", ");
                            let gameDetails = `Price: ${price}
                            Class: ${class_}
                            Race: ${race}
                            Not Upgradeable: ${not_upgradeable}
                            Type: ${type}
                            Players: ${playersString}`
                            clearInterval(this);
                            // update reply to contain game details
                            embed = new EmbedBuilder().addFields({
                                name: "Game Started!",
                                value: `This game has started, the details are \n${gameDetails}`
                            }).setColor('#c355f2')
                            .setImage('https://cdn.discordapp.com/attachments/1149384071563186258/1149703278020542464/botIcon.png')
                            .setFooter({
                                text: "Bot created by @teunw",
                                iconURL: "https://cdn.discordapp.com/attachments/1149384071563186258/1149703278020542464/botIcon.png"
                            });
                            interaction.editReply({embeds: [embed]})
                        }
                    })
                }, 5000);
            })
        })
		// fetch /creategame with the user's username as post

	},
};