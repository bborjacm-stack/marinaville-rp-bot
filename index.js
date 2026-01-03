import "dotenv/config";
import express from "express";
import {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  PermissionsBitField,
} from "discord.js";

// ---- Discord Client ----
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

function hasPermission(interaction) {
  // Roles permitidos (opcional): ALLOWED_ROLE_IDS="id1,id2,id3"
  const allowed = (process.env.ALLOWED_ROLE_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (allowed.length > 0) {
    const memberRoles = interaction.member?.roles;
    return allowed.some((rid) => memberRoles?.cache?.has(rid));
  }

  // Si no hay roles configurados, pedimos Manage Guild
  return interaction.memberPermissions?.has(
    PermissionsBitField.Flags.ManageGuild
  );
}

client.once("ready", () => {
  console.log(`🤖 Online como ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  try {
    if (!interaction.isChatInputCommand()) return;

    if (!hasPermission(interaction)) {
      // Si no ha sido "ack", respondemos normal
      if (!interaction.deferred && !interaction.replied) {
        return interaction.reply({
          content: "⛔ No tienes permisos para usar este comando.",
          ephemeral: true,
        });
      }
      return;
    }

    // /sesion abierta
    if (
      interaction.commandName === "sesion" &&
      interaction.options.getSubcommand() === "abierta"
    ) {
      await interaction.deferReply({ ephemeral: true });

      const host = interaction.options.getUser("usuario-host", true);
      const carriles = interaction.options.getString("carriles", true);
      const adelantamiento = interaction.options.getString("adelantamiento", true);
      const velocidad = interaction.options.getString("velocidad", true);
      const tipoRol = interaction.options.getString("tipo-de-rol", true);
      const linkSS = interaction.options.getString("link-ss", false);

      const embed = new EmbedBuilder()
        .setColor(0xe74c3c)
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
          ]
            .filter(Boolean)
            .join("\n")
        )
        .setFooter({ text: `Abierta por: ${interaction.user.tag}` });

      const channelId = process.env.CHANNEL_SESIONES;
      const channel = await interaction.guild.channels
        .fetch(channelId)
        .catch(() => null);

      if (!channel) {
        return interaction.editReply(
          "⚠ No encuentro el canal de sesiones. Revisa CHANNEL_SESIONES."
        );
      }

      await channel.send({ embeds: [embed] });
      return interaction.editReply("✅ Sesión publicada.");
    }

    // /votacion abierta
    if (
      interaction.commandName === "votacion" &&
      interaction.options.getSubcommand() === "abierta"
    ) {
      await interaction.deferReply({ ephemeral: true });

      const needed = interaction.options.getInteger("cantidad-de-votos", true);
      const tema = interaction.options.getString("tema", false) || "Votación";

      const embed = new EmbedBuilder()
        .setColor(0xe74c3c)
        .setTitle("📩-VOTACIÓN ABIERTA-📩")
        .setDescription(
          [
            "━━━━━━━━━━━━━━━━━━",
            `• **TEMA:** ${tema}`,
            `• **VOTOS NECESARIOS:** **${needed}**`,
            "",
            "Vota en la encuesta de abajo (sin reacciones).",
            "━━━━━━━━━━━━━━━━━━",
          ].join("\n")
        )
        .setFooter({ text: `Abierta por: ${interaction.user.tag}` });

      const channelId = process.env.CHANNEL_VOTACIONES;
      const channel = await interaction.guild.channels
        .fetch(channelId)
        .catch(() => null);

      if (!channel) {
        return interaction.editReply(
          "⚠ No encuentro el canal de votaciones. Revisa CHANNEL_VOTACIONES."
        );
      }

      // 1) mensaje bonito
      await channel.send({ embeds: [embed] });

      // 2) encuesta nativa de Discord
      await channel.send({
        poll: {
          question: { text: tema },
          answers: [{ text: "sí" }, { text: "no" }],
          duration: 24, // horas
          allowMultiselect: false,
        },
      });

      return interaction.editReply("✅ Votación publicada.");
    }

    // /sanciones
    if (interaction.commandName === "sanciones") {
      await interaction.deferReply({ ephemeral: true });

      const usuario = interaction.options.getUser("usuario-advertido", true);
      const razon = interaction.options.getString("razon", true);
      const advertidoPor =
        interaction.options.getUser("advertido-por", false) || interaction.user;
      const cantidad = interaction.options.getInteger("cantidad-adv", true);
      const evidencia = interaction.options.getAttachment("evidencia", false);

      const embed = new EmbedBuilder()
        .setColor(0xe74c3c)
        .setTitle("📣-ADVERTENCIA-📣")
        .setDescription(
          [
            "━━━━━━━━━━━━━━━━━━",
            `• **USUARIO ADVERTIDO:** ${usuario}`,
            `• **RAZÓN:** **${razon}**`,
            `• **ADVERTIDO POR:** ${advertidoPor}`,
            `• **CANTIDAD DE ADV:** **${cantidad}**`,
            evidencia
              ? `• **EVIDENCIAS:** *(adjunto abajo)*`
              : `• **EVIDENCIAS:** *(sin archivo)*`,
            "━━━━━━━━━━━━━━━━━━",
          ].join("\n")
        )
        .setFooter({ text: `Sancionado por: ${interaction.user.tag}` });

      const channelId = process.env.CHANNEL_SANCIONES;
      const channel = await interaction.guild.channels
        .fetch(channelId)
        .catch(() => null);

      if (!channel) {
        return interaction.editReply(
          "⚠ No encuentro el canal de sanciones. Revisa CHANNEL_SANCIONES."
        );
      }

      const payload = { embeds: [embed], files: [] };
      if (evidencia?.url) payload.files.push(evidencia.url);

      await channel.send(payload);
      return interaction.editReply("✅ Sanción publicada.");
    }
  } catch (err) {
    console.error("❌ Error en interactionCreate:", err);
    // Intentar responder sin romper
    if (interaction?.deferred && !interaction.replied) {
      try {
        await interaction.editReply("❌ Ocurrió un error ejecutando el comando.");
      } catch {}
    }
  }
});

// ---- Servidor HTTP mínimo para Render ----
const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", (_req, res) => {
  res.send("Bot MarinaVilleRP activo ✅");
});

app.listen(PORT, () => {
  console.log(`🌐 Servidor web escuchando en puerto ${PORT}`);
});
// -----------------------------------------

client.login(process.env.DISCORD_TOKEN);