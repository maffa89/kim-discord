import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder } from 'discord.js';

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1550179525806264400';
const IMAGE_BASE = 'https://maffa89.github.io/kim-discord/images';

if (!TOKEN) {
  console.error('Missing DISCORD_TOKEN environment variable.');
  process.exit(1);
}

const command = new SlashCommandBuilder()
  .setName('kim')
  .setDescription('Vis KIM sin status akkurat nå');

function osloParts() {
  const parts = new Intl.DateTimeFormat('nb-NO', {
    timeZone: 'Europe/Oslo',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(new Date());
  return Object.fromEntries(parts.filter(p => p.type !== 'literal').map(p => [p.type, p.value]));
}

function minutesInWindow(h, m) {
  let n = h * 60 + m;
  if (n < 120) n += 1440;
  return n;
}

function bacAt(min) {
  if (min < 720 || min > 1530) return null;
  if (min <= 1080) return .2 + ((min - 720) / 360) * .6;
  return .8 + ((min - 1080) / 450) * 2.0;
}

function dataFor(bac, min) {
  if (min >= 1350) return { img: 5, label: 'Søvnig', desc: 'Tydelig sløv og fare for å sovne.', aim: 18, state: 'Fare for å sovne' };
  if (bac >= 2.0) return { img: 4, label: 'Irritert / sløv', desc: 'Mindre smil og tydelig redusert reaksjon.', aim: 30, state: 'Tydelig påvirket' };
  if (bac >= 1.4) return { img: 3, label: 'Humøret snur', desc: 'Smilet blir gradvis mindre og uttrykket mer irritert.', aim: 46, state: 'Påvirket' };
  if (bac >= .8) return { img: 2, label: 'Godt humør', desc: 'Mer smil og sosialt uttrykk frem mot ca. 1,4 ‰.', aim: 66, state: 'Sosial' };
  return { img: 1, label: 'Rolig', desc: 'Rolig smil og relativt opplagt uttrykk.', aim: 90, state: 'Opplagt' };
}

function makeEmbed() {
  const p = osloParts();
  const min = minutesInWindow(Number(p.hour), Number(p.minute));
  const bac = bacAt(min);

  if (bac === null) {
    return new EmbedBuilder()
      .setTitle('KIM — LIVE')
      .setDescription('Visningen er aktiv fra 12:00 til 01:30.')
      .addFields({ name: 'Norsk tid', value: `${p.hour}:${p.minute}`, inline: true });
  }

  const d = dataFor(bac, min);
  return new EmbedBuilder()
    .setTitle('KIM — LIVE 🟢')
    .setDescription(`**${bac.toFixed(2).replace('.', ',')} ‰**\n**${d.label}**\n${d.desc}`)
    .addFields(
      { name: '🎯 Aim Accuracy', value: `${d.aim}%`, inline: true },
      { name: 'Tilstand', value: d.state, inline: true },
      { name: '🕒 Norsk tid', value: `${p.hour}:${p.minute}`, inline: true }
    )
    .setImage(`${IMAGE_BASE}/kim-state-${d.img}.png`);
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

// Create/update only /kim. Do not bulk-overwrite global commands because this
// application also has an Activity Entry Point command managed by Discord.
const existingCommands = await rest.get(Routes.applicationCommands(CLIENT_ID));
const existingKim = existingCommands.find(c => c.type === 1 && c.name === 'kim');

if (existingKim) {
  await rest.patch(Routes.applicationCommand(CLIENT_ID, existingKim.id), {
    body: command.toJSON()
  });
  console.log('/kim updated without touching the Activity entry point.');
} else {
  await rest.post(Routes.applicationCommands(CLIENT_ID), {
    body: command.toJSON()
  });
  console.log('/kim created without touching the Activity entry point.');
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.once('ready', () => console.log(`KIM online as ${client.user.tag}`));
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand() || interaction.commandName !== 'kim') return;
  await interaction.reply({ embeds: [makeEmbed()] });
});

client.login(TOKEN);
