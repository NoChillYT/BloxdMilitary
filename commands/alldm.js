const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('alldm')
        .setDescription('Send a DM to everyone in the server')
        .addStringOption(option =>
            option.setName('message')
            .setDescription('The message to send to everyone')
            .setRequired(true)),
    async execute(interaction) {
        // Check if user is server owner or has admin permissions
        if (!interaction.member.permissions.has('ADMINISTRATOR') && interaction.guild.ownerId !== interaction.user.id) {
            await interaction.reply('You need Administrator permissions or be the server owner to use this command.');
            return;
        }

        const message = interaction.options.getString('message');

        // Reply immediately
        await interaction.reply('Starting to send messages to all members...');

        try {
            console.log(`[alldm] Fetching members for guild ${interaction.guild.id}`);
            const members = await interaction.guild.members.fetch();
            console.log(`[alldm] Fetched ${members.size} members`);
            
            const dmPromises = [];
            let userCount = 0;

            for (const member of members.values()) {
                if (!member.user.bot) {
                    userCount++;
                    dmPromises.push(
                        interaction.client.sendDMWithLogging(member.user, message, `Bulk DM campaign by ${interaction.user.tag}`)
                            .then(() => ({ status: 'success', user: member.user.tag }))
                            .catch(error => ({ status: 'failed', user: member.user.tag, reason: error.code }))
                    );
                }
            }

            console.log(`[alldm] Sending DMs to ${userCount} non-bot members`);

            // Send all DMs with rate limiting (batches of 5)
            const batchSize = 5;
            let successCount = 0;
            let failCount = 0;
            const results = [];

            for (let i = 0; i < dmPromises.length; i += batchSize) {
                const batch = dmPromises.slice(i, i + batchSize);
                const batchResults = await Promise.all(batch);
                results.push(...batchResults);
                successCount += batchResults.filter(r => r.status === 'success').length;
                failCount += batchResults.filter(r => r.status === 'failed').length;
                
                // Small delay between batches to avoid rate limiting
                if (i + batchSize < dmPromises.length) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }

            console.log(`[alldm] Completed: ${successCount} sent, ${failCount} failed`);

            await interaction.followUp(
                `✅ Message sent successfully!\n` +
                `📨 Sent to: **${successCount}** members\n` +
                `❌ Failed: **${failCount}** members (likely DMs disabled)`
            );
        } catch (error) {
            console.error('[alldm] Error:', error);
            await interaction.followUp(
                `❌ An error occurred: ${error.message}\n` +
                `Make sure the bot has permission to send DMs and access member lists.`
            );
        }
    },
};
