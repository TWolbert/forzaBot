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
            console.table(data.result);
            let car = data.result[0];
            if (!car) return interaction.reply("Car not found")

            let carString = `**${car.name}**\n`
            carString += `**Price:** CR${car.price}\n`
            carString += `**Class:** ${car.class}${car.classnumber}\n`
            carString += `**Wikia link:** ${car.wikialink}\n`
            let embed = new EmbedBuilder()
                .setTitle(car.name)
                .setDescription(carString)
            interaction.reply({ embeds: [embed] })
        })
	},
};