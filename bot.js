require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
} = require("discord.js");
const oneLinerJoke = require("one-liner-joke");

// Initialize the client
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("ready", () => {
  client.user.setPresence({
    activities: [{ name: "Vincent The Developer", type: 2 }],
    status: "online",
  });
});

// Register the slash commands
const commands = [
  new SlashCommandBuilder()
    .setName("hi")
    .setDescription("Says Hello")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Select a user to say hi to him/her")
        .setRequired(false)
    ),
  new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Displays the avatar of the mentioned user or yourself")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Select a user to view their avatar")
        .setRequired(false)
    ),
  new SlashCommandBuilder()
    .setName("joke")
    .setDescription("Replies with a random joke"),
  new SlashCommandBuilder()
    .setName("joke10")
    .setDescription("Replies with 10 random jokes"),
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),
  new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("Displays information about this server"),
  new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Displays information about you"),
  new SlashCommandBuilder()
    .setName("help")
    .setDescription("Lists all commands and their descriptions"),
  new SlashCommandBuilder()
    .setName("8ball")
    .setDescription("Ask the magic 8-ball a yes/no question")
    .addStringOption((option) =>
      option
        .setName("question")
        .setDescription("Your Yes/No question")
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("meme")
    .setDescription("Sends a random meme"),
  new SlashCommandBuilder()
    .setName("quote")
    .setDescription("Get a random inspirational quote"),
  new SlashCommandBuilder()
    .setName("remind")
    .setDescription("Set a reminder (e.g., 10s, 1m)")
    .addStringOption((option) =>
      option.setName("time").setDescription("e.g., 10s, 1m").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("Reminder text")
        .setRequired(true)
    ),
];

// Register the commands with Discord’s API
const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands.map((command) => command.toJSON()),
    });

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();

// Notify all users and servers when the bot goes online
client.once("ready", async () => {
  console.log(`${client.user.tag} is online!`);
  client.user.setPresence({
    activities: [{ name: "type /help for fun", type: 2 }],
    status: "Vincent is OP",
  });
}); // Correctly close the client.once block

// Command handling
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const user = interaction.options.getUser("user") || interaction.user; // Ensure 'user' is defined

  if (interaction.commandName === "avatar") {
    await interaction.reply(
      `${user.username}'s avatar: ${user.displayAvatarURL({
        dynamic: true,
        size: 512,
      })}`
    );
  } else if (interaction.commandName === "joke") {
    const joke = oneLinerJoke.getRandomJoke().body; // Get a random joke
    await interaction.reply(joke);
  } else if (interaction.commandName === "joke10") {
    const jokes = [];
    for (let i = 0; i < 10; i++) {
      const joke = oneLinerJoke.getRandomJoke().body; // Get a random joke
      jokes.push(joke);
    }
    await interaction.reply(jokes.join("\n\n")); // Send all jokes in a single message
  } else if (interaction.commandName === "hi") {
    await interaction.reply(`Hello! ${user.username}`);
  } else if (interaction.commandName === "ping") {
    await interaction.reply("Pong!");
  } else if (interaction.commandName === "serverinfo") {
    const { name, memberCount, ownerId } = interaction.guild;
    await interaction.reply(
      `**Server Name**: ${name}\n**Member Count**: ${memberCount}\n**Owner ID**: ${ownerId}`
    );
  } else if (interaction.commandName === "userinfo") {
    const { username, id, createdAt } = interaction.user;
    await interaction.reply(
      `**Username**: ${username}\n**User ID**: ${id}\n**Account Created**: ${createdAt.toDateString()}`
    );
  } else if (interaction.commandName === "8ball") {
    const responses = [
      "Yes, definitely.",
      "It is decidedly so.",
      "Reply hazy, try again.",
      "Cannot predict now.",
      "Don't count on it.",
      "Very doubtful.",
      "Absolutely not.",
      "Without a doubt.",
    ];
    const reply = responses[Math.floor(Math.random() * responses.length)];
    await interaction.reply(`🎱 ${reply}`);
  } else if (interaction.commandName === "help") {
    const commandList = commands
      .map((cmd) => `/${cmd.name} - ${cmd.description}`)
      .join("\n");
    await interaction.reply(`**Available Commands:**\n${commandList}`);
  } else if (interaction.commandName === "meme") {
    try {
        // Acknowledge interaction immediately to avoid timeout
        await interaction.deferReply();

        // Fetch meme data from the API
        const res = await fetch("https://meme-api.com/gimme");
        const data = await res.json();

        // Send the meme as an edited reply
        await interaction.editReply({
            content: `**${data.title}**\n👍 ${data.ups} | 🧑‍💻 u/${data.author} | 🔗 [Source](${data.postLink})`,
            files: [data.url]
        });

    } catch (err) {
        console.error("Error fetching meme:", err);
        await interaction.editReply({
            content: "❌ Failed to fetch a meme. Try again later."
        });
    }
} else if (interaction.commandName === "quote") {
    const quotes = [
      "“The best time to plant a tree was 20 years ago. The second best time is now.” – Chinese Proverb",
      "“Everything you can imagine is real.” – Pablo Picasso",
      "“Do or do not. There is no try.” – Yoda",
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    await interaction.reply(randomQuote);
    } else if (interaction.commandName === "remind") {
    const time = interaction.options.getString("time");
    const message = interaction.options.getString("message");

    const timeRegex = /^(\d+)(s|m|h)$/;
    const match = time.match(timeRegex);

    if (!match) {
      await interaction.reply("Invalid time format! Use formats like `10s`, `1m`, or `2h`.");
      return;
    }

    const value = parseInt(match[1]);
    const unit = match[2];
    let milliseconds;

    switch (unit) {
      case "s":
        milliseconds = value * 1000;
        break;
      case "m":
        milliseconds = value * 60 * 1000;
        break;
      case "h":
        milliseconds = value * 60 * 60 * 1000;
        break;
      default:
        milliseconds = 0;
    }

    await interaction.reply(`⏰ Reminder set for ${time}. I'll remind you soon!`);

    setTimeout(() => {
      interaction.user.send(`🔔 Reminder: ${message}`).catch(console.error);
    }, milliseconds);
  }
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN);
