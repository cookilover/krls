const Discord = require('discord.js');
const config = require("../../config");
const MySQL = require('mysql');

module.exports = async (client, oldChannel, newChannel) => {
 try {
  const sql = MySQL.createPool({
   host: process.env.MYSQL_HOST,
   user: process.env.MYSQL_USER,
   password: process.env.MYSQL_PASSWORD,
   database: process.env.MYSQL_DATABASE,
   charset: 'utf8mb4',
   port: "3306"
  });
  const sqlquery = 'SELECT channelid AS res FROM logs WHERE guildid = ' + newChannel.guild.id;
  sql.query(sqlquery, function (error, results, fields) {
   if(error) console.log(error);
   if (!results || results.length == 0) {
    sql.end();
    return;
   }
   const logsetup = results[0].res;
   sql.end();
   (async () => {
    const log = await newChannel.guild.channels.cache.find(c => c.id == logsetup && c.type == "text");
    if (!oldChannel.guild) return;
    if (!newChannel.guild.member(client.user).hasPermission("EMBED_LINKS", "VIEW_CHANNEL", "READ_MESSAGE_HISTORY", "VIEW_AUDIT_LOG", "SEND_MESSAGES")) return;
    if(!log) return;
    if (!log.guild.member(client.user).hasPermission("EMBED_LINKS", "VIEW_CHANNEL", "READ_MESSAGE_HISTORY", "VIEW_AUDIT_LOG", "SEND_MESSAGES")) return;
    if (oldChannel.type === "text") {
     type = "Text";
    } else if (oldChannel.type === "voice") {
     type = "Voice";
    } else if (oldChannel.type === "category") {
     type = "Category";
    } else if (oldChannel.type === "news") {
     type = "News Feed";
    } else if (oldChannel.type === "store") {
     type = "Store channel";
    } else if (!oldChannel.type) {
     type = "?";
    }
    const newcategory = newChannel.parent;
    if (!newcategory) {
     const newcategory = "None";
    }
    const oldcategory = oldChannel.parent;
    if (!oldcategory) {
     const oldcategory = "None";
    }
    if (oldcategory === newcategory) {
     const newcategory = "Not changed"
    }
    oldChannel.guild.fetchAuditLogs().then(logs => {
     const userid = logs.entries.first().executor.id;
     const uavatar = logs.entries.first().executor.avatarURL();
     const guildsChannel = newChannel.guild;
     if(oldChannel.parent !== newChannel.parent) {
      const channelname = new Discord.MessageEmbed()
       .setTitle("Channel Name changed")
       .setThumbnail(uavatar)
       .addField("Channel type", `${type}`)
       .addField("Old Channel category (parent)", `${oldcategory} (ID: ${newChannel.parentID})`)
       .addField("New Channel category (parent)", `${newcategory} (ID: ${newChannel.parentID})`)
       .addField("Changed by", `<@${userid}> (ID: ${userid})`)
       .addField("Created at", `${oldChannel.createdAt}`)
       .setColor("RANDOM")
       .setTimestamp()
       .setFooter(oldChannel.guild.name, oldChannel.guild.iconURL());
      log.send(channelname);
     }
     if(oldChannel.name !== newChannel.name) {
      const channelname = new Discord.MessageEmbed()
        .setTitle("Channel Name changed")
       .setThumbnail(uavatar)
       .addField("Old Channel name", `\`\`\`${oldChannel.name} \`\`\` `)
       .addField("New Channel name", `<#${newChannel.name}>`)
       .addField("Channel id", `${oldChannel.id}`)
       .addField("Channel type", `${type}`)
       .addField("Changed by", `<@${userid}> (ID: ${userid})`)
       .addField("Created at", `${oldChannel.createdAt}`)
       .setColor("RANDOM")
       .setTimestamp()
       .setFooter(oldChannel.guild.name, oldChannel.guild.iconURL());
      log.send(channelname);
     }
     if(oldChannel.topic !== newChannel.topic) {
      const newtopic = new Discord.MessageEmbed()
       .setTitle("Channel Description changed")
       .setThumbnail(uavatar)
       .addField("Old Channel description", `\`\`\`\ ${oldChannel.topic || "(Not set)"} \`\`\` `)
       .addField("New Channel description", `\`\`\`\ ${newChannel.topic || "(Not set)"} \`\`\` `)
       .addField("Channel id", `${newChannel.id}`)
       .addField("Channel type", `${type}`)
       .addField("Changed by", `<@${userid}> (ID: ${userid})`)
       .addField("Created at", `${oldChannel.createdAt}`)
       .setColor("RANDOM")
       .setTimestamp()
       .setFooter(oldChannel.guild.name, oldChannel.guild.iconURL())
      log.send(newtopic);
     }
    })
   })();
  });
 } catch (err) {
  console.log(err);
 }
}
