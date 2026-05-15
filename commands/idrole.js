const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('idrole')
    .setDescription('Show all members in a role with usernames and IDs')
    .addStringOption(option =>
      option.setName('roleid')
        .setDescription('The role ID')
        .setRequired(true)
    ),

  async execute(interaction) {

    const roleId = interaction.options.getString('roleid');
    const guild = interaction.guild;

    const role = guild.roles.cache.get(roleId);

    if (!role) {
      return interaction.reply({
        content: "❌ Role not found. Check the role ID.",
        ephemeral: true
      });
    }

    // IMPORTANT: ensure members are loaded
    await guild.members.fetch();

    const members = role.members;

    if (!members.size) {
      return interaction.reply({
        content: "⚠️ No members found in this role.",
        ephemeral: true
      });
    }

    // Build output safely (Discord message limit handling)
    let output = `📋 Members in **${role.name}** (${members.size})\n\n`;

    members.forEach(member => {
      output += `👤 ${member.user.username} — \`${member.id}\`\n`;
    });

    // Discord message limit protection (2000 chars)
    if (output.length > 1900) {
      output = output.slice(0, 1900) + "\n\n⚠️ Output truncated due to length.";
    }

    return interaction.reply({
      content: output,
      ephemeral: true
    });
  }
};