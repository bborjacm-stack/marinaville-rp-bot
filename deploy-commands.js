<<<<<<< HEAD
import "dotenv/config";
import { REST, Routes, SlashCommandBuilder } from "discord.js";

const commands = [
  new SlashCommandBuilder()
    .setName("sesion")
    .setDescription("Comandos de sesión")
    .addSubcommand((sc) =>
      sc
        .setName("abierta")
        .setDescription("Publica sesión abierta (formato RP)")
        .addUserOption((o) =>
          o.setName("usuario-host").setDescription("Host de la sesión").setRequired(true)
        )
        .addStringOption((o) =>
          o.setName("carriles").setDescription("Ej: 2 / 3 / Libre").setRequired(true)
        )
        .addStringOption((o) =>
          o.setName("adelantamiento").setDescription("Ej: Sí / No / Condicionado").setRequired(true)
        )
        .addStringOption((o) =>
          o.setName("velocidad").setDescription("Ej: 80 / 100 / Libre").setRequired(true)
        )
        .addStringOption((o) =>
          o.setName("tipo-de-rol").setDescription("Ej: FRP / SRP / Realista").setRequired(true)
        )
        .addStringOption((o) =>
          o.setName("link-ss").setDescription("Link de SS / Prueba").setRequired(false)
        )
    ),

  new SlashCommandBuilder()
    .setName("votacion")
    .setDescription("Comandos de votación")
    .addSubcommand((sc) =>
      sc
        .setName("abierta")
        .setDescription("Abre una votación que se cierra al llegar a X votos ✅")
        .addIntegerOption((o) =>
          o.setName("cantidad-de-votos").setDescription("Votos ✅ necesarios").setRequired(true).setMinValue(1)
        )
        .addStringOption((o) =>
          o.setName("tema").setDescription("Qué se está votando").setRequired(false)
        )
    ),
new SlashCommandBuilder()
  .setName("sanciones")
  .setDescription("Sistema de sanciones")
  .addUserOption((o) =>
    o.setName("usuario-advertido").setDescription("Usuario a sancionar").setRequired(true)
  )
  .addStringOption((o) =>
    o.setName("razon").setDescription("Razón (ej: FRP)").setRequired(true)
  )
  .addIntegerOption((o) =>
    o.setName("cantidad-adv").setDescription("Cantidad de advertencias").setRequired(true).setMinValue(1)
  )
  .addUserOption((o) =>
    o.setName("advertido-por").setDescription("Staff que advierte").setRequired(false)
  )
  .addAttachmentOption((o) =>
    o.setName("evidencia").setDescription("Adjunta evidencia (imagen/archivo)").setRequired(false)
  ),
].map((c) => c.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

await rest.put(
  Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
  { body: commands }
);

console.log("✅ Slash commands registrados en el servidor.");
=======
import "dotenv/config";
import { REST, Routes, SlashCommandBuilder } from "discord.js";

const commands = [
  new SlashCommandBuilder()
    .setName("sesion")
    .setDescription("Comandos de sesión")
    .addSubcommand((sc) =>
      sc
        .setName("abierta")
        .setDescription("Publica sesión abierta (formato RP)")
        .addUserOption((o) =>
          o.setName("usuario-host").setDescription("Host de la sesión").setRequired(true)
        )
        .addStringOption((o) =>
          o.setName("carriles").setDescription("Ej: 2 / 3 / Libre").setRequired(true)
        )
        .addStringOption((o) =>
          o.setName("adelantamiento").setDescription("Ej: Sí / No / Condicionado").setRequired(true)
        )
        .addStringOption((o) =>
          o.setName("velocidad").setDescription("Ej: 80 / 100 / Libre").setRequired(true)
        )
        .addStringOption((o) =>
          o.setName("tipo-de-rol").setDescription("Ej: FRP / SRP / Realista").setRequired(true)
        )
        .addStringOption((o) =>
          o.setName("link-ss").setDescription("Link de SS / Prueba").setRequired(false)
        )
    ),

  new SlashCommandBuilder()
    .setName("votacion")
    .setDescription("Comandos de votación")
    .addSubcommand((sc) =>
      sc
        .setName("abierta")
        .setDescription("Abre una votación que se cierra al llegar a X votos ✅")
        .addIntegerOption((o) =>
          o.setName("cantidad-de-votos").setDescription("Votos ✅ necesarios").setRequired(true).setMinValue(1)
        )
        .addStringOption((o) =>
          o.setName("tema").setDescription("Qué se está votando").setRequired(false)
        )
    ),
new SlashCommandBuilder()
  .setName("sanciones")
  .setDescription("Sistema de sanciones")
  .addUserOption((o) =>
    o.setName("usuario-advertido").setDescription("Usuario a sancionar").setRequired(true)
  )
  .addStringOption((o) =>
    o.setName("razon").setDescription("Razón (ej: FRP)").setRequired(true)
  )
  .addIntegerOption((o) =>
    o.setName("cantidad-adv").setDescription("Cantidad de advertencias").setRequired(true).setMinValue(1)
  )
  .addUserOption((o) =>
    o.setName("advertido-por").setDescription("Staff que advierte").setRequired(false)
  )
  .addAttachmentOption((o) =>
    o.setName("evidencia").setDescription("Adjunta evidencia (imagen/archivo)").setRequired(false)
  ),
].map((c) => c.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

await rest.put(
  Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
  { body: commands }
);

console.log("✅ Slash commands registrados en el servidor.");
>>>>>>> 4340f8448d225ff4afe096f4ccef669eafe05288
