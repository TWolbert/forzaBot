const { SlashCommandBuilder, createComponentBuilder, EmbedBuilder } = require('discord.js');

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
            if (data.error) {
                interaction.reply(data.error, ephemeral = true)
                setTimeout(() => {
                    interaction.deleteReply();
                }, 2000);
                return;
            }
            console.table(data.result);
            let car = data.result;
            if (!car) return interaction.reply("Car not found")

            let carString = `**${car.name}**\n`
            carString += `**Price:** CR${car.price}\n`
            carString += `**Class:** ${car.classletter}${car.classnumber}\n`
            carString += `**Wikia link:** ${car.wikialink}\n`
            let embed = new EmbedBuilder()
                .setTitle(car.name)
                .setDescription(carString)
                .setImage(data.imagelink)
                .setColor('#c355f2')
                .setThumbnail("https://static.wikia.nocookie.net/forzamotorsport/images/4/4a/Site-favicon.ico/revision/latest?cb=20211017210455")
                .setFooter({
                    text: "Bot created by @teunw",
                    iconURL: "https://cdn.discordapp.com/attachments/1149384071563186258/1149703278020542464/botIcon.png"
                });
            interaction.reply({ embeds: [embed] })
        })
	},
};