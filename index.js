<<<<<<< HEAD
import express from "express";
import "dotenv/config";
import {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  PermissionsBitField,
} from "discord.js";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessageReactions],
});

const VOTES_TRACK = new Map(); // messageId -> { needed, yesCount }

function hasPermission(interaction) {
  // Si defines ALLOWED_ROLE_IDS, exigimos esos roles
  const allowed = (process.env.ALLOWED_ROLE_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (allowed.length > 0) {
    const memberRoles = interaction.member?.roles;
    return allowed.some((rid) => memberRoles?.cache?.has(rid));
  }

  // Si no hay roles configurados, pedimos Manage Guild (Administrar servidor)
  return interaction.memberPermissions?.has(PermissionsBitField.Flags.ManageGuild);
}

client.once("ready", () => {
  console.log(`🤖 Online como ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (!hasPermission(interaction)) {
    return interaction.reply({
      content: "⛔ No tienes permisos para usar este comando.",
      ephemeral: true,
    });
  }

  // /sesion abierta
  if (interaction.commandName === "sesion" && interaction.options.getSubcommand() === "abierta") {
   
   await interaction.deferReply({ ephemeral: true });

    const host = interaction.options.getUser("usuario-host", true);
    const carriles = interaction.options.getString("carriles", true);
    const adelantamiento = interaction.options.getString("adelantamiento", true);
    const velocidad = interaction.options.getString("velocidad", true);
    const tipoRol = interaction.options.getString("tipo-de-rol", true);
    const linkSS = interaction.options.getString("link-ss", false);

    const embed = new EmbedBuilder()
      .setColor(0xE74C3C) // rojo tipo “borde”
      .setTitle("🟩-SESIÓN ABIERTA-🟩")
      .setDescription(
        [
          "━━━━━━━━━━━━━━━━━━",
          `• **USUARIO-HOST:** ${host}`,
          `• **CARRILES:** ${carriles}`,
          `• **ADELANTAMIENTO:** ${adelantamiento}`,
          `• **VELOCIDAD:** ${velocidad}`,
          `• **TIPO DE ROL:** ${tipoRol}`,
          linkSS ? `• **LINK SS:** ${linkSS}` : null,
          "━━━━━━━━━━━━━━━━━━",
        ].filter(Boolean).join("\n")
      )
      .setFooter({ text: `Abierta por: ${interaction.user.tag}` });

    const channelId = process.env.CHANNEL_SESIONES;
    const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);
    if (!channel) {
       return interaction.editReply("⚠ No encuentro el canal de sesiones. Revisa CHANNEL_SESIONES.");
    }

    await channel.send({ embeds: [embed] });

    return interaction.editReply({ content: "✅ Sesión publicada.");
  }

  // /votacion abierta
  if (interaction.commandName === "votacion" && interaction.options.getSubcommand() === "abierta") {
   await interaction.deferReply({ ephemeral: true });
    const needed = interaction.options.getInteger("cantidad-de-votos", true);
    const tema = interaction.options.getString("tema", false) || "Votación";

    const embed = new EmbedBuilder()
      .setColor(0xE74C3C)
      .setTitle("📩-VOTACIÓN ABIERTA-📩")
      .setDescription(
        [
          "━━━━━━━━━━━━━━━━━━",
          `• **TEMA:** ${tema}`,
          `• **CANTIDAD DE VOTOS (✅) NECESARIOS:** **${needed}**`,
          "",
          "Vota en la encuesta de abajo (sin reacciones).",
          "La encuesta se cerrará automáticamente cuando termine el tiempo.",
          "━━━━━━━━━━━━━━━━━━",
        ].join("\n")
      )
      .setFooter({ text: `Abierta por: ${interaction.user.tag}` });

    const channelId = process.env.CHANNEL_VOTACIONES;
    const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);

    if (!channel) {
      return interaction.editReply({ content: "⚠️ No encuentro el canal de votaciones. Revisa CHANNEL_VOTACIONES.");
    }

    await channel.send({ embeds: [embed] });
    await channel.send({
  poll: {
    question: { text: tema },
    answers: [{ text: "se" }, { text: "nah" }],
    duration: 24, // horas
    allowMultiselect: false,
  },
});

return interaction.editReply({ content: "✅ Votación publicada.");

  
  }

  // /sanciones
  if (interaction.commandName === "sanciones") {
    await interaction.deferReply({ ephemeral: true });
    const usuario = interaction.options.getUser("usuario-advertido", true);
    const razon = interaction.options.getString("razon", true);
    const advertidoPor = interaction.options.getUser("advertido-por", false) || interaction.user;
    const cantidad = interaction.options.getInteger("cantidad-adv", true);
    const evidencia = interaction.options.getAttachment("evidencia", false);

    const embed = new EmbedBuilder()
      .setColor(0xE74C3C)
      .setTitle("📣-ADVERTENCIA-📣")
      .setDescription(
        [
          "━━━━━━━━━━━━━━━━━━",
          `• **USUARIO ADVERTIDO:** ${usuario}`,
          `• **RAZÓN:** **${razon}**`,
          `• **ADVERTIDO POR:** ${advertidoPor}`,
          `• **CANTIDAD DE ADV:** **${cantidad}**`,
          evidencia ? `• **EVIDENCIAS:** *(adjunto abajo)*` : `• **EVIDENCIAS:** *(sin archivo)*`,
          "━━━━━━━━━━━━━━━━━━",
        ].join("\n")
      );

    const channelId = process.env.CHANNEL_SANCIONES;
    const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);

    if (!channel) {
      return interaction.editReply({ content: "⚠️ No encuentro el canal de sanciones. Revisa CHANNEL_SANCIONES.");
    }

    const payload = { embeds: [embed], files: [] };
    if (evidencia?.url) payload.files.push(evidencia.url);

    await channel.send(payload);

    return interaction.editReply({ content: "✅ Sanción publicada.");
  }

// Cierre automático de votación por reacciones ✅
client.on("messageReactionAdd", async (reaction, user) => {
  if (user.bot) return;

  // Evitar problemas con partials (discord.js a veces)
  try {
    if (reaction.partial) await reaction.fetch();
    if (reaction.message.partial) await reaction.message.fetch();
  } catch {
    return;
  }

  const track = VOTES_TRACK.get(reaction.message.id);
  if (!track || track.closed) return;

  if (reaction.emoji.name === "✅") {
    track.yesCount += 1;

    if (track.yesCount >= track.needed) {
      track.closed = true;

      const closedEmbed = EmbedBuilder.from(reaction.message.embeds[0])
        .setTitle("✅-VOTACIÓN CERRADA-✅")
        .setDescription(
          [
            "━━━━━━━━━━━━━━━━━━",
            "La votación llegó a los ✅ necesarios.",
            `✅ **Sí:** ${track.yesCount}`,
            "━━━━━━━━━━━━━━━━━━",
          ].join("\n")
        );

      await reaction.message.reply({ embeds: [closedEmbed] }).catch(() => null);
      VOTES_TRACK.delete(reaction.message.id);
    }
  }
});
// --- Servidor HTTP mínimo para Render ---
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Bot MarinaVilleRP activo ✅");
});

app.listen(PORT, () => {
  console.log(`🌐 Servidor web escuchando en puerto ${PORT}`);
});
// ---------------------------------------

=======
import express from "express";
import "dotenv/config";
import {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  PermissionsBitField,
} from "discord.js";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessageReactions],
});

const VOTES_TRACK = new Map(); // messageId -> { needed, yesCount }

function hasPermission(interaction) {
  // Si defines ALLOWED_ROLE_IDS, exigimos esos roles
  const allowed = (process.env.ALLOWED_ROLE_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (allowed.length > 0) {
    const memberRoles = interaction.member?.roles;
    return allowed.some((rid) => memberRoles?.cache?.has(rid));
  }

  // Si no hay roles configurados, pedimos Manage Guild (Administrar servidor)
  return interaction.memberPermissions?.has(PermissionsBitField.Flags.ManageGuild);
}

client.once("ready", () => {
  console.log(`🤖 Online como ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (!hasPermission(interaction)) {
    return interaction.reply({
      content: "⛔ No tienes permisos para usar este comando.",
      ephemeral: true,
    });
  }

  // /sesion abierta
  if (interaction.commandName === "sesion" && interaction.options.getSubcommand() === "abierta") {
    const host = interaction.options.getUser("usuario-host", true);
    const carriles = interaction.options.getString("carriles", true);
    const adelantamiento = interaction.options.getString("adelantamiento", true);
    const velocidad = interaction.options.getString("velocidad", true);
    const tipoRol = interaction.options.getString("tipo-de-rol", true);
    const linkSS = interaction.options.getString("link-ss", false);

    const embed = new EmbedBuilder()
      .setColor(0xE74C3C) // rojo tipo “borde”
      .setTitle("🟩-SESIÓN ABIERTA-🟩")
      .setDescription(
        [
          "━━━━━━━━━━━━━━━━━━",
          `• **USUARIO-HOST:** ${host}`,
          `• **CARRILES:** ${carriles}`,
          `• **ADELANTAMIENTO:** ${adelantamiento}`,
          `• **VELOCIDAD:** ${velocidad}`,
          `• **TIPO DE ROL:** ${tipoRol}`,
          linkSS ? `• **LINK SS:** ${linkSS}` : null,
          "━━━━━━━━━━━━━━━━━━",
        ].filter(Boolean).join("\n")
      )
      .setFooter({ text: `Abierta por: ${interaction.user.tag}` });

    const channelId = process.env.CHANNEL_SESIONES;
    const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);

    if (!channel) {
      return interaction.reply({ content: "⚠️ No encuentro el canal de sesiones. Revisa CHANNEL_SESIONES.", ephemeral: true });
    }

    await channel.send({ embeds: [embed] });

    return interaction.reply({ content: "✅ Sesión publicada.", ephemeral: true });
  }

  // /votacion abierta
  if (interaction.commandName === "votacion" && interaction.options.getSubcommand() === "abierta") {
    const needed = interaction.options.getInteger("cantidad-de-votos", true);
    const tema = interaction.options.getString("tema", false) || "Votación";

    const embed = new EmbedBuilder()
      .setColor(0xE74C3C)
      .setTitle("📩-VOTACIÓN ABIERTA-📩")
      .setDescription(
        [
          "━━━━━━━━━━━━━━━━━━",
          `• **TEMA:** ${tema}`,
          `• **CANTIDAD DE VOTOS (✅) NECESARIOS:** **${needed}**`,
          "",
          "Vota en la encuesta de abajo (sin reacciones).",
          "La encuesta se cerrará automáticamente cuando termine el tiempo.",
          "━━━━━━━━━━━━━━━━━━",
        ].join("\n")
      )
      .setFooter({ text: `Abierta por: ${interaction.user.tag}` });

    const channelId = process.env.CHANNEL_VOTACIONES;
    const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);

    if (!channel) {
      return interaction.reply({ content: "⚠️ No encuentro el canal de votaciones. Revisa CHANNEL_VOTACIONES.", ephemeral: true });
    }

    await channel.send({ embeds: [embed] });
    await channel.send({
  poll: {
    question: { text: tema },
    answers: [{ text: "se" }, { text: "no" }],
    duration: 24, // horas
    allowMultiselect: false,
  },
});

return interaction.reply({ content: "✅ Votación publicada.", ephemeral: true });

  
  }

  // /sanciones
  if (interaction.commandName === "sanciones") {
    const usuario = interaction.options.getUser("usuario-advertido", true);
    const razon = interaction.options.getString("razon", true);
    const advertidoPor = interaction.options.getUser("advertido-por", false) || interaction.user;
    const cantidad = interaction.options.getInteger("cantidad-adv", true);
    const evidencia = interaction.options.getAttachment("evidencia", false);

    const embed = new EmbedBuilder()
      .setColor(0xE74C3C)
      .setTitle("📣-ADVERTENCIA-📣")
      .setDescription(
        [
          "━━━━━━━━━━━━━━━━━━",
          `• **USUARIO ADVERTIDO:** ${usuario}`,
          `• **RAZÓN:** **${razon}**`,
          `• **ADVERTIDO POR:** ${advertidoPor}`,
          `• **CANTIDAD DE ADV:** **${cantidad}**`,
          evidencia ? `• **EVIDENCIAS:** *(adjunto abajo)*` : `• **EVIDENCIAS:** *(sin archivo)*`,
          "━━━━━━━━━━━━━━━━━━",
        ].join("\n")
      );

    const channelId = process.env.CHANNEL_SANCIONES;
    const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);

    if (!channel) {
      return interaction.reply({ content: "⚠️ No encuentro el canal de sanciones. Revisa CHANNEL_SANCIONES.", ephemeral: true });
    }

    const payload = { embeds: [embed], files: [] };
    if (evidencia?.url) payload.files.push(evidencia.url);

    await channel.send(payload);

    return interaction.reply({ content: "✅ Sanción publicada.", ephemeral: true });
  }
});

// Cierre automático de votación por reacciones ✅
client.on("messageReactionAdd", async (reaction, user) => {
  if (user.bot) return;

  // Evitar problemas con partials (discord.js a veces)
  try {
    if (reaction.partial) await reaction.fetch();
    if (reaction.message.partial) await reaction.message.fetch();
  } catch {
    return;
  }

  const track = VOTES_TRACK.get(reaction.message.id);
  if (!track || track.closed) return;

  if (reaction.emoji.name === "✅") {
    track.yesCount += 1;

    if (track.yesCount >= track.needed) {
      track.closed = true;

      const closedEmbed = EmbedBuilder.from(reaction.message.embeds[0])
        .setTitle("✅-VOTACIÓN CERRADA-✅")
        .setDescription(
          [
            "━━━━━━━━━━━━━━━━━━",
            "La votación llegó a los ✅ necesarios.",
            `✅ **Sí:** ${track.yesCount}`,
            "━━━━━━━━━━━━━━━━━━",
          ].join("\n")
        );

      await reaction.message.reply({ embeds: [closedEmbed] }).catch(() => null);
      VOTES_TRACK.delete(reaction.message.id);
    }
  }
});
// --- Servidor HTTP mínimo para Render ---
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Bot MarinaVilleRP activo ✅");
});

app.listen(PORT, () => {
  console.log(`🌐 Servidor web escuchando en puerto ${PORT}`);
});
// ---------------------------------------

>>>>>>> 4340f8448d225ff4afe096f4ccef669eafe05288
client.login(process.env.DISCORD_TOKEN);