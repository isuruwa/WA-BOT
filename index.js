const {
  WAConnection,
  MessageType,
  Presence,
  Mimetype,
  GroupSettingChange
} = require('@adiwajshing/baileys')
const { color, bgcolor } = require('./lib/color')
const { help } = require('./src/help')
const { wait, simih, getBuffer, h2k, generateMessageID, getGroupAdmins, getRandom, banner, start, info, success, close } = require('./lib/functions')
const { fetchJson } = require('./lib/fetcher')
const { recognize } = require('./lib/ocr')
const fs = require('fs')
const moment = require('moment-timezone')
const { exec } = require('child_process')
const kagApi = require('@kagchi/kag-api')
const fetch = require('node-fetch')
const tiktod = require('tiktok-scraper')
const ffmpeg = require('fluent-ffmpeg')
const { removeBackgroundFromImageFile } = require('remove.bg')
const lolis = require('lolis.life')
const loli = new lolis()
const welkom = JSON.parse(fs.readFileSync('./src/welkom.json'))
const nsfw = JSON.parse(fs.readFileSync('./src/nsfw.json'))
const samih = JSON.parse(fs.readFileSync('./src/simi.json'))
prefix = '!'
blocked = []

function kyun(seconds) {
  function pad(s) {
    return (s < 10 ? '0' : '') + s;
  }
  var hours = Math.floor(seconds / (60 * 60));
  var minutes = Math.floor(seconds % (60 * 60) / 60);
  var seconds = Math.floor(seconds % 60);

  //return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds)
  return `${pad(hours)} Hours ${pad(minutes)} Minutes ${pad(seconds)} Seconds`
}

async function starts() {
  const client = new WAConnection()
  client.logger.level = 'warn'
  console.log(banner.string)
  client.on('qr', () => {
    console.log(color('[', 'white'), color('!', 'red'), color(']', 'white'), color(' Scan the qr code above'))
  })

  fs.existsSync('./BarBar.json') && client.loadAuthInfo('./BarBar.json')
  client.on('connecting', () => {
    start('2', 'Connecting...')
  })
  client.on('open', () => {
    success('2', 'Connected')
  })
  await client.connect({ timeoutMs: 30 * 1000 })
  fs.writeFileSync('./BarBar.json', JSON.stringify(client.base64EncodedAuthInfo(), null, '\t'))

  client.on('group-participants-update', async (anu) => {
    if (!welkom.includes(anu.jid)) return
    try {
      const mdata = await client.groupMetadata(anu.jid)
      console.log(anu)
      if (anu.action == 'add') {
        num = anu.participants[0]
        try {
          ppimg = await client.getProfilePicture(`${anu.participants[0].split('@')[0]}@c.us`)
        } catch {
          ppimg = 'https://i.ibb.co/Gp4H47k/7dba54f7e250.jpg'
        }
        teks = `Hello @${num.split('@')[0]}\nWelcome to the Group *${mdata.subject}*`
        let buff = await getBuffer(ppimg)
        client.sendMessage(mdata.id, buff, MessageType.image, { caption: teks, contextInfo: { "mentionedJid": [num] } })
      } else if (anu.action == 'remove') {
        num = anu.participants[0]
        try {
          ppimg = await client.getProfilePicture(`${num.split('@')[0]}@c.us`)
        } catch {
          ppimg = 'https://i.ibb.co/Gp4H47k/7dba54f7e250.jpg'
        }
        teks = `Sayonara @${num.split('@')[0]}👋`
        let buff = await getBuffer(ppimg)
        client.sendMessage(mdata.id, buff, MessageType.image, { caption: teks, contextInfo: { "mentionedJid": [num] } })
      }
    } catch (e) {
      console.log('Error : %s', color(e, 'red'))
    }
  })

  client.on('CB:Blocklist', json => {
    if (blocked.length > 2) return
    for (let i of json[1].blocklist) {
      blocked.push(i.replace('c.us', 's.whatsapp.net'))
    }
  })

  client.on('chat-update', async (mek) => {
    try {
      if (!mek.hasNewMessage) return
      mek = JSON.parse(JSON.stringify(mek)).messages[0]
      if (!mek.message) return
      if (mek.key && mek.key.remoteJid == 'status@broadcast') return
      if (mek.key.fromMe) return
      global.prefix
      global.blocked
      const content = JSON.stringify(mek.message)
      const from = mek.key.remoteJid
      const type = Object.keys(mek.message)[0]
      const apiKey = 'Your-Api-Key'
      const { text, extendedText, contact, location, liveLocation, image, video, sticker, document, audio, product } = MessageType
      const time = moment.tz('Asia/Colombo').format('DD/MM HH:mm:ss')
      body = (type === 'conversation' && mek.message.conversation.startsWith(prefix)) ? mek.message.conversation : (type == 'imageMessage') && mek.message.imageMessage.caption.startsWith(prefix) ? mek.message.imageMessage.caption : (type == 'videoMessage') && mek.message.videoMessage.caption.startsWith(prefix) ? mek.message.videoMessage.caption : (type == 'extendedTextMessage') && mek.message.extendedTextMessage.text.startsWith(prefix) ? mek.message.extendedTextMessage.text : ''
      budy = (type === 'conversation') ? mek.message.conversation : (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text : ''
      const command = body.slice(1).trim().split(/ +/).shift().toLowerCase()
      const args = body.trim().split(/ +/).slice(1)
      const isCmd = body.startsWith(prefix)

      mess = {
        wait: ' In Process ',
        success: '✔️ Success ✔️',
        error: {
          stick: '❌ Failed, an error occurred while converting the image to a sticker ❌',
          Iv: '❌ Invalid Link ❌'
        },
        only: {
          group: '❌ This command can only be used within groups ❌',
          ownerG: '❌ This command can only be used by the group owner ❌',
          ownerB: '❌ This command can only be used by the bot owner ❌',
          admin: '❌ This command can only be used by group admins ❌',
          Badmin: '❌ You have to make me admin ❌',
          aboutbot: 'BOT REDEVELOPED BY DEVIL MASTER - https://gtihub.com/isuruwa/WA-BOT'
        }
      }

      const botNumber = client.user.jid
      const ownerNumber = ["447441467464@s.whatsapp.net"] // replace this with your number
      const isGroup = from.endsWith('@g.us')
      const sender = isGroup ? mek.participant : mek.key.remoteJid
      const groupMetadata = isGroup ? await client.groupMetadata(from) : ''
      const groupName = isGroup ? groupMetadata.subject : ''
      const groupId = isGroup ? groupMetadata.jid : ''
      const groupMembers = isGroup ? groupMetadata.participants : ''
      const groupAdmins = isGroup ? getGroupAdmins(groupMembers) : ''
      const isBotGroupAdmins = groupAdmins.includes(botNumber) || false
      const isGroupAdmins = groupAdmins.includes(sender) || false
      const isWelkom = isGroup ? welkom.includes(from) : false
      const isNsfw = isGroup ? nsfw.includes(from) : false
      const isSimi = isGroup ? samih.includes(from) : false
      const isOwner = ownerNumber.includes(sender)
      const isUrl = (url) => {
        return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))
      }
      const reply = (teks) => {
        client.sendMessage(from, teks, text, { quoted: mek })
      }
      const sendMess = (hehe, teks) => {
        client.sendMessage(hehe, teks, text)
      }
      const mentions = (teks, memberr, id) => {
        (id == null || id == undefined || id == false) ? client.sendMessage(from, teks.trim(), extendedText, { contextInfo: { "mentionedJid": memberr } }) : client.sendMessage(from, teks.trim(), extendedText, { quoted: mek, contextInfo: { "mentionedJid": memberr } })
      }

      colors = ['red', 'white', 'black', 'blue', 'yellow', 'green']
      const isMedia = (type === 'imageMessage' || type === 'videoMessage')
      const isQuotedImage = type === 'extendedTextMessage' && content.includes('imageMessage')
      const isQuotedVideo = type === 'extendedTextMessage' && content.includes('videoMessage')
      const isQuotedSticker = type === 'extendedTextMessage' && content.includes('stickerMessage')
      if (!isGroup && isCmd) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;32mEXEC\x1b[1;37m]', time, color(command), 'from', color(sender.split('@')[0]), 'args :', color(args.length))
      if (!isGroup && !isCmd) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;31mRECV\x1b[1;37m]', time, color('Message'), 'from', color(sender.split('@')[0]), 'args :', color(args.length))
      if (isCmd && isGroup) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;32mEXEC\x1b[1;37m]', time, color(command), 'from', color(sender.split('@')[0]), 'in', color(groupName), 'args :', color(args.length))
      if (!isCmd && isGroup) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;31mRECV\x1b[1;37m]', time, color('Message'), 'from', color(sender.split('@')[0]), 'in', color(groupName), 'args :', color(args.length))
      switch (command) {
        case 'help':
        case 'menu':
          client.sendMessage(from, help(prefix), text)
          break
        //\n*Total Block Contact* : ${blocked.length}
        case 'info':
          me = client.user
          uptime = process.uptime()
          teks = `*Bot Name* : ${me.name}\n*Bot Number* : @${me.jid.split('@')[0]}\n*Prefix* : ${prefix}\n*The bot is active on* : ${kyun(uptime)}`
          buffer = await getBuffer(me.imgUrl)
          client.sendMessage(from, buffer, image, { caption: teks, contextInfo: { mentionedJid: [me.jid] } })
          break
        case 'blocklist':
          if (!isOwner) return reply(Only.For.BotOwner)
          teks = 'This is list of blocked number :\n'
          for (let block of blocked) {
            teks += `~> @${block.split('@')[0]}\n`
          }
          teks += `Total : ${blocked.length}`
          client.sendMessage(from, teks.trim(), extendedText, { quoted: mek, contextInfo: { "mentionedJid": blocked } })
          break
        case 'closegc':
          anker.updatePresence(from, Presence.composing)
          if (!isGroup) return reply(mess.only.group)
          if (!isGroupAdmins) return reply(mess.only.admin)
          if (!isBotGroupAdmins) return reply(mess.only.Badmin)
          var nomor = mek.participant
          const close = {
            text: `Group closed admin @${nomor.split("@s.whatsapp.net")[0]}\now *only admin* can send messages`,
            contextInfo: { mentionedJid: [nomor] }
          }
          anker.groupSettingChange(from, GroupSettingChange.messageSend, true);
          reply(close)
          break
        case 'opengc':
          anker.updatePresence(from, Presence.composing)
          if (!isGroup) return reply(mess.only.group)
          if (!isGroupAdmins) return reply(mess.only.admin)
          if (!isBotGroupAdmins) return reply(mess.only.Badmin)
          open = {
            text: `Group opened By admin @${sender.split("@")[0]}\now *all participants* can send messages`,
            contextInfo: { mentionedJid: [sender] }
          }
          anker.groupSettingChange(from, GroupSettingChange.messageSend, false)
          anker.sendMessage(from, open, text, { quoted: mek })
          break
        case 'ocr':
          if ((isMedia && !mek.message.videoMessage || isQuotedImage) && args.length == 0) {
            const encmedia = isQuotedImage ? JSON.parse(JSON.stringify(mek).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : mek
            const media = await client.downloadAndSaveMediaMessage(encmedia)
            reply(mess.wait)
            await recognize(media, { lang: 'eng+ind', oem: 1, psm: 3 })
              .then(teks => {
                reply(teks.trim())
                fs.unlinkSync(media)
              })
              .catch(err => {
                reply(err.message)
                fs.unlinkSync(media)
              })
          } else {
            reply('Only photos')
          }
          break
        case 'tomp3':
          client.updatePresence(from, Presence.composing)
          if (!isQuotedVideo) return reply('❌ reply to target video ❌')
          reply(mess.wait)
          encmedia = JSON.parse(JSON.stringify(mek).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo
          media = await client.downloadAndSaveMediaMessage(encmedia)
          ran = getRandom('.mp4')
          exec(`ffmpeg -i ${media} ${ran}`, (err) => {
            fs.unlinkSync(media)
            if (err) return reply('❌ Failed to convert video to mp3 ❌')
            buffer = fs.readFileSync(ran)
            client.sendMessage(from, buffer, audio, { mimetype: 'audio/mp4', quoted: mek })
            fs.unlinkSync(ran)
          })
          break
        case 'stiker':
        case 'sticker':
        case 'stickergif':
        case 'stikergif':
          if ((isMedia && !mek.message.videoMessage || isQuotedImage) && args.length == 0) {
            const encmedia = isQuotedImage ? JSON.parse(JSON.stringify(mek).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : mek
            const media = await client.downloadAndSaveMediaMessage(encmedia)
            ran = getRandom('.webp')
            await ffmpeg(`./${media}`)
              .input(media)
              .on('start', function (cmd) {
                console.log(`Started : ${cmd}`)
              })
              .on('error', function (err) {
                console.log(`Error : ${err}`)
                fs.unlinkSync(media)
                reply(mess.error.stick)
              })
              .on('end', function () {
                console.log('Finish')
                client.sendMessage(from, fs.readFileSync(ran), sticker, { quoted: mek })
                fs.unlinkSync(media)
                fs.unlinkSync(ran)
              })
              .addOutputOptions([`-vcodec`, `libwebp`, `-vf`, `scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`])
              .toFormat('webp')
              .save(ran)
          } else if ((isMedia && mek.message.videoMessage.seconds < 11 || isQuotedVideo && mek.message.extendedTextMessage.contextInfo.quotedMessage.videoMessage.seconds < 11) && args.length == 0) {
            const encmedia = isQuotedVideo ? JSON.parse(JSON.stringify(mek).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : mek
            const media = await client.downloadAndSaveMediaMessage(encmedia)
            ran = getRandom('.webp')
            reply(mess.wait)
            await ffmpeg(`./${media}`)
              .inputFormat(media.split('.')[1])
              .on('start', function (cmd) {
                console.log(`Started : ${cmd}`)
              })
              .on('error', function (err) {
                console.log(`Error : ${err}`)
                fs.unlinkSync(media)
                tipe = media.endsWith('.mp4') ? 'video' : 'gif'
                reply(`❌Failed Converting  ${tipe} to sticker`)
              })
              .on('end', function () {
                console.log('Finish')
                buff = fs.readFileSync(ran)
                client.sendMessage(from, buff, sticker)
                fs.unlinkSync(media)
                fs.unlinkSync(ran)
              })
              .addOutputOptions([`-vcodec`, `libwebp`, `-vf`, `scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`])
              .toFormat('webp')
              .save(ran)
          }
          break
        case 'tts':
          if (args.length < 1) return client.sendMessage(from, 'Which language code is it', text, { quoted: mek })
          const gtts = require('./lib/gtts')(args[0])
          if (args.length < 2) return client.sendMessage(from, 'Where\'s the text', text, { quoted: mek })
          dtt = body.slice(9)
          ranm = getRandom('.mp3')
          dtt.length > 600
            ? reply('Most of the text is ')
            : gtts.save(ranm, dtt, function () {
              client.sendMessage(from, fs.readFileSync(ranm), audio, { quoted: mek, mimetype: 'audio/mp4', ptt: true })
              fs.unlinkSync(ranm)
            })
          break
        case 'setprefix':
          if (args.length < 1) return
          if (!isOwner) return reply(mess.only.ownerB)
          prefix = args[0]
          reply(`The prefix has been successfully changed to : ${prefix}`)
          break
        case 'tagall':
          if (!isGroup) return reply(mess.only.group)
          if (!isGroupAdmins) return reply(mess.only.admin)
          members_id = []
          teks = (args.length > 1) ? body.slice(8).trim() : ''
          teks += '\n\n'
          for (let mem of groupMembers) {
            teks += `*#* @${mem.jid.split('@')[0]}\n`
            members_id.push(mem.jid)
          }
          mentions(teks, members_id, true)
          break
        case 'tagall2':
          members_id = []
          teks = (args.length > 1) ? body.slice(8).trim() : ''
          teks += '\n\n'
          for (let mem of groupMembers) {
            teks += `╠➥ @${mem.jid.split('@')[0]}\n`
            members_id.push(mem.jid)
          }
          reply(teks)
          break
        case 'tagall3':
          members_id = []
          teks = (args.length > 1) ? body.slice(8).trim() : ''
          teks += '\n\n'
          for (let mem of groupMembers) {
            teks += `╠➥ https://wa.me/${mem.jid.split('@')[0]}\n`
            members_id.push(mem.jid)
          }
          client.sendMessage(from, teks, text, { detectLinks: false, quoted: mek })
          break
        case 'clearall':
          if (!isOwner) return reply('Who are you?')
          anu = await client.chats.all()
          client.setMaxListeners(25)
          for (let _ of anu) {
            client.deleteChat(_.jid)
          }
          reply('Successfully deleted all chat :)')
          break
        case 'bc':
          if (!isOwner) return reply('Hello Guys !')
          if (args.length < 1) return reply('.......')
          anu = await client.chats.all()
          if (isMedia && !mek.message.videoMessage || isQuotedImage) {
            const encmedia = isQuotedImage ? JSON.parse(JSON.stringify(mek).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : mek
            buff = await client.downloadMediaMessage(encmedia)
            for (let _ of anu) {
              client.sendMessage(_.jid, buff, image, { caption: `[ This is Broadcast ]\n\n${body.slice(4)}` })
            }
            reply('Broadcast was successful')
          } else {
            for (let _ of anu) {
              sendMess(_.jid, `[ This is Broadcast ]\n\n${body.slice(4)}`)
            }
            reply('Broadcast was successful')
          }
          break
        case 'gm':
          if (!isOwner) return reply('Good Morning Guys !')
          if (args.length < 1) return reply('.......')
          anu = await client.chats.all()
          if (isMedia && !mek.message.videoMessage || isQuotedImage) {
            const encmedia = isQuotedImage ? JSON.parse(JSON.stringify(mek).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : mek
            buff = await client.downloadMediaMessage(encmedia)
            for (let _ of anu) {
              client.sendMessage(_.jid, buff, image, { caption: `[ This is Broadcast ]\n\n${body.slice(4)}` })
            }
            reply('Broadcast was successful')
          } else {
            for (let _ of anu) {
              sendMess(_.jid, `[ This is Broadcast ]\n\n${body.slice(4)}`)
            }
            reply('Broadcast was successful')
          }
          break
        case 'gn':
          if (!isOwner) return reply('Good Night Guys !')
          if (args.length < 1) return reply('.......')
          anu = await client.chats.all()
          if (isMedia && !mek.message.videoMessage || isQuotedImage) {
            const encmedia = isQuotedImage ? JSON.parse(JSON.stringify(mek).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : mek
            buff = await client.downloadMediaMessage(encmedia)
            for (let _ of anu) {
              client.sendMessage(_.jid, buff, image, { caption: `[ This is Broadcast ]\n\n${body.slice(4)}` })
            }
            reply('Broadcast was successful')
          } else {
            for (let _ of anu) {
              sendMess(_.jid, `[ This is Broadcast ]\n\n${body.slice(4)}`)
            }
            reply('Broadcast was successful')
          }
          break
        case 'promote':
          if (!isGroup) return reply(mess.only.group)
          if (!isGroupAdmins) return reply(mess.only.admin)
          if (!isBotGroupAdmins) return reply(mess.only.Badmin)
          if (mek.message.extendedTextMessage === undefined || mek.message.extendedTextMessage === null) return
          mentioned = mek.message.extendedTextMessage.contextInfo.mentionedJid
          if (mentioned.length > 1) {
            teks = 'Successfully promoted\n'
            for (let _ of mentioned) {
              teks += `@${_.split('@')[0]}\n`
            }
            mentions(from, mentioned, true)
            client.groupRemove(from, mentioned)
          } else {
            mentions(`Successfully promoted @${mentioned[0].split('@')[0]} as a group admin!`, mentioned, true)
            client.groupMakeAdmin(from, mentioned)
          }
          break
        case 'demote':
          if (!isGroup) return reply(mess.only.group)
          if (!isGroupAdmins) return reply(mess.only.admin)
          if (!isBotGroupAdmins) return reply(mess.only.Badmin)
          if (mek.message.extendedTextMessage === undefined || mek.message.extendedTextMessage === null) return
          mentioned = mek.message.extendedTextMessage.contextInfo.mentionedJid
          if (mentioned.length > 1) {
            teks = 'Successfully demoted\n'
            for (let _ of mentioned) {
              teks += `@${_.split('@')[0]}\n`
            }
            mentions(teks, mentioned, true)
            client.groupRemove(from, mentioned)
          } else {
            mentions(`Successfully demoted @${mentioned[0].split('@')[0]} as a Member of the Group!`, mentioned, true)
            client.groupDemoteAdmin(from, mentioned)
          }
          break
        case 'add':
          if (!isGroup) return reply(mess.only.group)
          if (!isGroupAdmins) return reply(mess.only.admin)
          if (!isBotGroupAdmins) return reply(mess.only.Badmin)
          if (args.length < 1) return reply('Do you want to add a number?')
          if (args[0].startsWith('08')) return reply('Use the country code')
          try {
            num = `${args[0].replace(/ /g, '')}@s.whatsapp.net`
            client.groupAdd(from, [num])
          } catch (e) {
            console.log('Error :', e)
            reply('Failed to add target, maybe because it\'s private')
          }
          break
        case 'kick':
          if (!isGroup) return reply(mess.only.group)
          if (!isGroupAdmins) return reply(mess.only.admin)
          if (!isBotGroupAdmins) return reply(mess.only.Badmin)
          if (mek.message.extendedTextMessage === undefined || mek.message.extendedTextMessage === null) return reply('The target tag you want to kick!')
          mentioned = mek.message.extendedTextMessage.contextInfo.mentionedJid
          if (mentioned.length > 1) {
            teks = 'Orders received, issued :\n'
            for (let _ of mentioned) {
              teks += `@${_.split('@')[0]}\n`
            }
            mentions(teks, mentioned, true)
            client.groupRemove(from, mentioned)
          } else {
            mentions(`Orders received, issued : @${mentioned[0].split('@')[0]}`, mentioned, true)
            client.groupRemove(from, mentioned)
          }
          break
        case 'listadmins':
          if (!isGroup) return reply(mess.only.group)
          teks = `List admin of group *${groupMetadata.subject}*\nTotal : ${groupAdmins.length}\n\n`
          no = 0
          for (let admon of groupAdmins) {
            no += 1
            teks += `[${no.toString()}] @${admon.split('@')[0]}\n`
          }
          mentions(teks, groupAdmins, true)
          break
        case 'linkgroup':
          if (!isGroup) return reply(mess.only.group)
          if (!isGroupAdmins) return reply(mess.only.admin)
          if (!isBotGroupAdmins) return reply(mess.only.Badmin)
          linkgc = await client.groupInviteCode(from)
          reply('https://chat.whatsapp.com/' + linkgc)
          break
        case 'info':
          reply(mess.only.aboutbot)
          break
        case 'toimg':
          if (!isQuotedSticker) return reply('❌ Reply a sticker ❌')
          reply(mess.wait)
          encmedia = JSON.parse(JSON.stringify(mek).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo
          media = await client.downloadAndSaveMediaMessage(encmedia)
          ran = getRandom('.png')
          exec(`ffmpeg -i ${media} ${ran}`, (err) => {
            fs.unlinkSync(media)
            if (err) return reply('❌ Failed, while converting stickers to images ❌')
            buffer = fs.readFileSync(ran)
            client.sendMessage(from, buffer, image, { quoted: mek, caption: '>//<' })
            fs.unlinkSync(ran)
          })
          break
        case 'welcome':
          if (!isGroup) return reply(mess.only.group)
          if (!isGroupAdmins) return reply(mess.only.admin)
          if (args.length < 1) return reply('WELCOME GUYS')
          if (Number(args[0]) === 1) {
            if (isWelkom) return reply('Already active')
            welkom.push(from)
            fs.writeFileSync('./src/welkom.json', JSON.stringify(welkom))
            reply('Successfully activated the welcome feature in this group ✔️')
          } else if (Number(args[0]) === 0) {
            welkom.splice(from, 1)
            fs.writeFileSync('./src/welkom.json', JSON.stringify(welkom))
            reply('Successfully deactivated the welcome feature in this group ✔️')
          } else {
            reply('1 to activate, 0 to deactivate')
          }
          break
        case 'clone':
          if (!isGroup) return reply(mess.only.group)
          if (!isGroupAdmins) return reply(mess.only.admin)
          if (args.length < 1) return reply('Tag the target you want to clone profile pic of ? ')
          if (mek.message.extendedTextMessage === undefined || mek.message.extendedTextMessage === null) return reply('Tag cvk')
          mentioned = mek.message.extendedTextMessage.contextInfo.mentionedJid[0]
          let { jid, id, notify } = groupMembers.find(x => x.jid === mentioned)
          try {
            pp = await client.getProfilePicture(id)
            buffer = await getBuffer(pp)
            client.updateProfilePicture(botNumber, buffer)
            mentions(`Profile photo successfully updated using @${id.split('@')[0]}(Our Victim's) Profile pic...`, [jid], true)
          } catch (e) {
            reply('Failed')
          }
          break
        default:
          if (isGroup && isSimi && budy != undefined) {
            console.log(budy)
            muehe = await simih(budy)
            console.log(muehe)
            reply(muehe)
          } else {
            return //console.log(color('[WARN]','red'), 'Unregistered Command from', color(sender.split('@')[0]))
          }
      }
    } catch (e) {
      console.log('Error : %s', color(e, 'red'))
    }
  })
}
starts()
