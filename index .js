const discord = require('discord.js')
const dotenv = require('dotenv')
const fetch = require('node-fetch')
const fs = require('fs');
const express = require('express')
const cors = require('cors')
const app = express()
const {
  readFileSync,
  writeFileSync
} = require('fs');

const port = 3000

// Hello
const TOKEN = "MTA1ODA1ODkzMDAyNDEwODA0Mg.GbH-1-.s3DGtobmEXu5UYKVCJQHN3L2u7ZwbQvpn7zp10"
const GUILD_ID = "750314761337438228"
const ROLE_ID = "1058059242692681838"

const GoogleSheets = 'https://script.google.com/macros/s/AKfycbyJT5hRlYuTnSOCSQ9neEHW1g_Om6rPeBWWykyQILH8ZAWtf3pdKjph6nH061ByRinveA/exec'
app.use(cors());


// 🌔 Express Routes
app.get("/", async function (req, res) {
  res.send("hi");
});


app.listen(port, (err) => {
  if (err) {
    console.log("❌Server crashed❌");
    console.log("--------------------");
    console.log(err)
  } else {
    console.log(`✅Server started successfully✅`);
    console.log(`http://localhost:${port}`);
  }
})


const guildID = '750314761337438228'

dotenv.config()

const client = new discord.Client({
  intents: 515
})

const activities_list = [
  "/cords",
  "whitelisted user files",
  "Minecraft Database",
  "trazhub.me"
];

client.on('ready', () => {

  console.log(`[🤖] ${client.user.username}#${client.user.discriminator} ONLINE!`)

  const guild = client.guilds.cache.get(guildID)

  if (!guild) {
    console.log(`Error! Main server not found! Please add this bot to the server and restart the bot.`)
  }

  let commands = guild.commands

  commands.create({
    name: 'cords-save',
    description: `Store your cords here good and fine!`,
    options: [{
      type: discord.Constants.ApplicationCommandOptionTypes.STRING,
      name: 'yourcords',
      description: 'Insert your cords here',
      required: true
    }]
  }).then(() => {
    console.log(`[🧭] SAVE CORDS COMMAND LOADED`)
  })

  commands.create({
    name: 'find-place',
    description: `find cords to your place`,
    options: [{
      type: discord.Constants.ApplicationCommandOptionTypes.STRING,
      name: 'yourplacename',
      description: 'Insert your cords here',
      required: true
    }]
  }).then(() => {
    console.log(`[🧭] FIND CORDS COMMAND LOADED`)
  })

  commands.create({
    name: 'cord-book',
    description: `find all cords to your places`,
    options: [{
      type: discord.Constants.ApplicationCommandOptionTypes.STRING,
      name: 'typefind',
      description: 'Insert your cords here',
      required: true
    }]
  }).then(() => {
    console.log(`[🧭] FIND ALL CORDS COMMAND LOADED`)
  })

  commands.create({
    name: 'status',
    description: `Tells Minecraft Server Status`,
    options: [{
      type: discord.Constants.ApplicationCommandOptionTypes.STRING,
      name: 'server-ip',
      description: 'Insert your server ip',
      required: true
    }]
  }).then(() => {
    console.log(`[📟] STATUS COMMAND LOADED`)
  })

  setInterval(() => {
    const index = Math.floor(Math.random() * (activities_list.length - 1) + 1); // generates a random number between 1 and the length of the activities array list (in this case 5).
    client.user.setActivity(activities_list[index], {
      type: 'WATCHING'
    }); // sets bot's activities to one of the phrases in the arraylist.
  }, 2000); // Runs this every 10 seconds.

})

client.on('interactionCreate', async (interaction) => {

  if (!interaction.isCommand()) return

  const {
    commandName,
    options
  } = interaction

  const guild = client.guilds.cache.get(guildID)

  const user = guild.members.cache.get(interaction.user.id)



  if (commandName === 'status') {

    await interaction.deferReply({
      ephemeral: true,
    })

    let serverip = options.getString('server-ip')
    fetch(`https://api.mcsrvstat.us/2/${serverip}`)
      .then(response => {
        if (!response.ok) {
          throw Error("ERROR");
        }
        return response.json();
      })
      .then(data => {
        // console.log(data);
        if (!data.online) {
          // SERVER NOT ONLINE
          const offlineServer = new discord.MessageEmbed({
            title: `❌ SERVER IS OFFLINE`,
            description: `${guild.members.cache.get(interaction.user.id)} | **${serverip}** is offline`,
            color: 'RANDOM'
          })
          interaction.editReply({
            embeds: [offlineServer],
          })
        } else {
          //ONLINE EMBED
          const onlineServer = new discord.MessageEmbed({
            title: `✅ SERVER IS ONLINE`,
            description: `${guild.members.cache.get(interaction.user.id)} | **${serverip}** is online \n\n` +
              "**HostName: **`" + data.hostname + "`\n" +
              "**Players:  **`" + data.players.online + "/" + data.players.max + "`\n" +
              "**Version:  **`" + data.version + "`\n\n" +
              "```" + data.motd.clean + "```",
            color: 'RANDOM'
          })
          onlineServer.setThumbnail(`https://api.mcsrvstat.us/icon/${serverip}`)
          onlineServer.setFooter(`©️Copyrights : mcserv.us api`)
          onlineServer.setTimestamp()
          interaction.editReply({
            embeds: [onlineServer],
          })
        }
      })

  }



  if (commandName === 'cords-save') {

    await interaction.deferReply({
      ephemeral: true,
    })


    const corderror1 = new discord.MessageEmbed({
      title: `❌ TYPE ERROR`,
      description: `${guild.members.cache.get(interaction.user.id)} You made a typing error\n` +
        "Correct command example `x:010 y:10 z:40 ||{nospace}PlaceName`",
      color: 'RANDOM'
    })
    let name = options.getString('yourcords')
    let cords = name.split("||")[0]
    let placename = name.split("||")[1]
    if (name.includes("||") && !name.includes("|| ")) {
      success();
    }
     else {
      interaction.editReply({
        embeds: [corderror1],
      })
    }


    function sendSuc() {
      const verifySuccess = new discord.MessageEmbed({
        title: `✅ Cords saved!`,
        description: `${guild.members.cache.get(interaction.user.id)} Your cord has been saved And We Have Added <@&${ROLE_ID}> role! To Your Account\n` +
          "> cords: `" + cords + "`\n" +
          "> place: `" + placename + "`",
        color: 'RANDOM'
      })
      interaction.editReply({
        embeds: [verifySuccess],
      })

    }

    function senderror() {
      const corderror = new discord.MessageEmbed({
        title: `❌ PLACE NAME ALLREADY EXIST`,
        description: `${guild.members.cache.get(interaction.user.id)} Allready in database please save with diffrent name\n` +
          "> place: `" + placename + "`",
        color: 'RANDOM'
      })
      interaction.editReply({
        embeds: [corderror],
      })
    }

    function success() {
      fetch(`${GoogleSheets}`)
        .then(response => {
          if (!response.ok) {
            throw Error("ERROR");
          }
          return response.json();
        })
        .then(datas => {
          let findcords = datas.find(elem => elem.cords === cords);
          let findplace = datas.find(elem => elem.place === placename);
          if (!findplace) {
            var data1 = {
              "cords": cords,
              "userid": user.id,
              "place": placename,
            }
            fetch(`${GoogleSheets}?action=addUser`, {
              method: 'POST',
              body: JSON.stringify(data1)
            }).then(res => sendSuc());
          } else {
            senderror();
          }

        })
    }
  }

  if (commandName === 'find-place') {

    await interaction.deferReply({
      ephemeral: true,
    })

    let placename1 = options.getString('yourplacename')
    const finderror = new discord.MessageEmbed({
      title: `❌ PLACE NOT AVAIALBLE`,
      description: `${guild.members.cache.get(interaction.user.id)} there is on such place in database\n` +
        `${placename1}`,
      color: 'RANDOM'
    })
    
    findplace();

    function findplace() {
      fetch(`${GoogleSheets}`)
        .then(response => {
          if (!response.ok) {
            throw Error("ERROR");
          }
          return response.json();
        })
        .then(datas => {
          let findplace = datas.find(elem => elem.place === placename1);
          if (!findplace) {
            interaction.editReply({
              embeds: [finderror],
            })
          } else {
            let flag = 10; 
            for(var i=0 ; i<datas.length;i++){
              if(datas[i].userid==user.id && datas[i].place == placename1){
                  flag=11;
                  const findsuccess = new discord.MessageEmbed({
                    title: `✅ FOUND YOUR PLACE`,
                    description: `${guild.members.cache.get(interaction.user.id)} We found your place in out database\n` +
                    "> cords: `" + datas[i].cords  + "`\n" +
                    "> place: `" + placename1 + "`",
                    color: 'RANDOM'
                  })
                  interaction.editReply({
                    embeds: [findsuccess],
                  })
              }
            }
            if(flag==10){
              for(var i=0 ; i<datas.length;i++){
                if(datas[i].place == placename1){
                  const findsuccessex = new discord.MessageEmbed({
                    title: `✅ FOUND YOUR PLACE BUT SAVED BY OTHER PLAYER`,
                    description: `${guild.members.cache.get(interaction.user.id)} We found your place in out database but claimed by\n` +
                    `<@${datas[i].userid}> ask them for cords`,
                    color: 'RANDOM'
                  })
                  interaction.editReply({
                    embeds: [findsuccessex],
                  })
                }
              } 
            }
          }

        })
    }
  }

  if (commandName === 'cord-book') {

    await interaction.deferReply({
      ephemeral: true,
    })

    let placename1 = options.getString('yourplacename')
    const findallerror = new discord.MessageEmbed({
      title: `❌ YOU DONT HAVE ANY PLACES SAVED`,
      description: `${guild.members.cache.get(interaction.user.id)} there is no such cords with you id in database\n`,
      color: 'RANDOM'
    })
    
    findplaceall();

    function findplaceall() {
      fetch(`${GoogleSheets}`)
        .then(response => {
          if (!response.ok) {
            throw Error("ERROR");
          }
          return response.json();
        })
        .then(datas => {
          let finduserid = datas.find(elem => elem.userid === user.id);
          if (!finduserid) {
            interaction.editReply({
              embeds: [findallerror],
            })
          } else {
            let loactions ="";
            for(var i=0 ; i<datas.length;i++){
              if(datas[i].userid==user.id){
                // console.log(datas[i].place +":"+ datas[i].cords)
                loactions = loactions + ">> `"+datas[i].place +": "+ datas[i].cords + "` \n\n"
              }
            }
            // console.log("healer");
            // console.log(loactions);
                  const findallsuccess = new discord.MessageEmbed({
                    title: `✅ FOUND ALL YOUR PLACES`,
                    description: `${guild.members.cache.get(interaction.user.id)} All your saved locations\n\n`+
                    `${loactions}` ,
                    color: 'RANDOM'
                  })
                  interaction.editReply({
                    embeds: [findallsuccess],
                  })
          }

        })
    }
  }


})


client.login(TOKEN)