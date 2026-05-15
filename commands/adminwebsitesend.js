const { SlashCommandBuilder } = require('@discordjs/builders');

const accounts = {
  d3coyalt: "4821",
  st4rsz: "1937",
  abc_logout: "5604",
  n0250: "7749",
  itz_sean0202: "3186",
  doctortrainman: "9052",
  creamkimi: "1468",
  idkwhy__: "6720",
  nochillyt: "8391",
  billionfatcatdc: "2507",
  z_simple_z: "6184",
  "i.love.mrp": "4309",
  leopardstarx_or_cyleo_or_cyan: "7925",
  samps013263: "1058",
  elektronomia_fanyt: "8840",
  broblox33: "2673",
  _3dlon: "9516",
  nocaryn: "6402",
  lu2812: "3785",
  _zainab_bloxd__72262: "7091",
  nnn123_45698: "5120",
  ichor: "8467",
  warfig55: "2306",
  summerzizhere: "9953",
  ___n___250: "1649"
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('adminwebsitesend')
    .setDescription('Send login info to all matching server members'),

  async execute(interaction) {

    const guild = interaction.guild;
    await guild.members.fetch(); // load all members

    let sent = 0;
    let failed = 0;

    for (const username in accounts) {

      const password = accounts[username];

      // find member by username OR nickname
      const member = guild.members.cache.find(m =>
        m.user.username.toLowerCase() === username.toLowerCase() ||
        (m.nickname && m.nickname.toLowerCase() === username.toLowerCase())
      );

      if (!member) {
        failed++;
        continue;
      }

      try {
        await member.send({
          content:
`Hello!

Your Military RP Website Username is "${username}"
Your password is "${password}"

Please visit:
https://nochillyt.github.io/bloxd.millitary.rp/admin.html`
        });

        sent++;

      } catch (err) {
        failed++;
      }
    }

    await interaction.reply({
      content: `✅ Finished.\nSent: ${sent}\nFailed: ${failed}`,
      ephemeral: true
    });
  }
};