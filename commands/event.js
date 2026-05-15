const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const ROLE_ID = '1501267952605859951';
const CHANNEL_ID = '1501237067139780688';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('event')
        .setDescription('Announce a new event')

        .addStringOption(option =>
            option.setName('description')
                .setDescription('What is the event?')
                .setRequired(true)
        )

        .addStringOption(option =>
            option.setName('party_code')
                .setDescription('Party code (optional)')
                .setRequired(false)
        )

        .addStringOption(option =>
            option.setName('link')
                .setDescription('Join link (optional)')
                .setRequired(false)
        )

        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        const description = interaction.options.getString('description');
        const partyCode = interaction.options.getString('party_code');
        const link = interaction.options.getString('link');

        try {
            const channel = await interaction.guild.channels.fetch(CHANNEL_ID);

            if (!channel) {
                return interaction.reply({
                    content: '❌ Event channel not found.',
                    ephemeral: true
                });
            }

            let message = `<@&${ROLE_ID}>\n\n`;
            message += `🚨 **THERE IS NOW AN EVENT HAPPENING!** 🚨\n\n`;
            message += `📢 **Event Info:**\n${description}\n\n`;

            if (partyCode) {
                message += `🎮 **Party Code:** ${partyCode}\n`;
            }

            if (link) {
                message += `🔗 **Join Link:** ${link}\n`;
            }

            message += `\n⚡ Hosted by: ${interaction.member.displayName}`;

            await channel.send({ content: message });

            await interaction.reply({
                content: '✅ Event announced successfully.',
                ephemeral: true
            });

        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: '❌ Failed to send event.',
                ephemeral: true
            });
        }
    }
};