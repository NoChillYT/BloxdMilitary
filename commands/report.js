const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('report')
        .setDescription('Report a member for misconduct')
        .addUserOption(option =>
            option.setName('target')
            .setDescription('The member to report')
            .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
            .setDescription('Reason for the report')
            .setRequired(true)),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason');
        const REPORT_CHANNEL_ID = '1498477830240206848';
        const REPORT_ROLE_ID = '1308703927394635779';

        try {
            const reportsChannel = await interaction.guild.channels.fetch(REPORT_CHANNEL_ID);

            if (!reportsChannel) {
                return interaction.reply({ content: 'Reports channel not found!', ephemeral: true });
            }

            const reportMessage = `<@&${REPORT_ROLE_ID}>\n**Reported User:** ${target.tag}\n**Reported By:** ${interaction.user.tag}\n**Reason:** ${reason}`;
            await reportsChannel.send(reportMessage);
            await interaction.reply({ content: `Successfully reported ${target.tag}.`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to send report.', ephemeral: true });
        }
    },
};
