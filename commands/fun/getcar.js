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
            let embed = new EmbedBuilder()
                .setTitle(car.name)
                .setDescription("CR" + car.price)
                .addField("Class", car.class + car.classnumber)
                .addField("Wikia", car.wikialink)   
            interaction.reply({ embeds: [embed] })
        })
	},
};