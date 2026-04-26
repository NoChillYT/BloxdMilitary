const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('training')
        .setDescription('Send a training session notification')
        .addStringOption(option =>
            option.setName('who')
                .setDescription('Who is training')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('what_pad')
                .setDescription('What pad')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('what_type')
                .setDescription('What type of training')
                .setRequired(true)),
    async execute(interaction) {
        const who = interaction.options.getString('who');
        const whatPad = interaction.options.getString('what_pad');
        const whatType = interaction.options.getString('what_type');
        const trainingChannel = interaction.guild.channels.cache.find(channel => channel.name === 'training');

        // Create training embed
        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('🏋️ Training Session')
            .addFields(
                { name: 'Who', value: who, inline: true },
                { name: 'What Pad', value: whatPad, inline: true },
                { name: 'What Type', value: whatType, inline: true }
            )
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp()
            .setFooter({ text: 'BloxdRanks Training System' });

        // Send to training channel if it exists, otherwise send to current channel
        const targetChannel = trainingChannel || interaction.channel;

        try {
            await targetChannel.send({ embeds: [embed] });
            await interaction.reply({ 
                content: `✅ Training session posted to ${targetChannel}!`, 
                ephemeral: true 
            });
        } catch (error) {
            console.error('Error sending training notification:', error);
            await interaction.reply({ 
                content: '❌ An error occurred while sending the training notification.', 
                ephemeral: true 
            });
        }
    },
};
