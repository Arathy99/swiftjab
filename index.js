'use strict';
const { Client, RichEmbed } = require('discord.js')
const discord = require('discord.js')
const client = new Client()
require('dotenv').config()
const PREFIX = "$jab ";
const axios = require('axios')
client.command = new discord.Collection();
const {Deta} = require('deta')
const deta = Deta(process.env.DETA)
const FuzzySet = require('fuzzyset')
const fs = require('fs')
const schedule = require('node-schedule')

const db_users = deta.Base('bot_users')
const db_dist = deta.Base('districts')
//const db_state = deta.Base('states')
const db_h = deta.Base('bot_h')
const db_hh = deta.Base('bot_hh')

async function fetchDistId(district){
	const item = await db_dist.get(district)
	return item.id
} 
function readDist(path) {
    const fileContent = fs.readFileSync(path);
    const array = JSON.parse(fileContent);
    return array;
}

function isValidPin(num){
	return !isNaN(num)
}

function getTodaysDate() {
	var d = new Date();
	var curr_date = d.getDate();
	var curr_month = d.getMonth()+1;
	var curr_year = d.getFullYear();
	return (curr_date + "-" + curr_month + "-" + curr_year);
}

client.login(process.env.TOKEN)

		// bot on join server message

client.on('guildCreate', (guild) => {
	let channelToSendTo;
	guild.channels.cache.forEach((channel) => {
		if (
			channel.type === 'text' &&
			!channelToSendTo &&
			channel.permissionsFor(guild.me).has('SEND_MESSAGES')
		)
			channelToSendTo = channel;
	});

	if (!channelToSendTo) return;

	const newEmbed = new discord.MessageEmbed()
		.setTitle('Helloo there')
	channelToSendTo.send(newEmbed)

})

		// bot login successfull

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`)
	console.log(`${client.user.username} has logged in`);
})

		// help embed

client.on('message', message => {
    let args = message.content.substring(PREFIX.length).split(" ");
    
    switch (args[0]) { 
        case 'help':
            const Embed = new discord.MessageEmbed()
            .setTitle("Helper Embed")
            .setColor(0xFF0000)
            .setDescription("Make sure to use the !help to get access to the commands");
 
            message.author.send(Embed).catch(err => { console.log(err) })
        break;
    }
 
 
});

		// Welcome message	

client.on('message', msg => {
	let msglo = msg.content.toLowerCase()
	if (msglo === 'hi' || msglo === 'hello' || msglo === 'hey' ){

		const intro = new discord.MessageEmbed()
			.setDescription(`**Hello there ✌!!!**
		
		You can interact with me through this channel or send me a DM 💬	`)
			.setThumbnail('https://image.flaticon.com/icons/png/512/2785/2785819.png')
			.setColor('ORANGE')
		msg.channel.send(intro)
		const helpEmbed = new discord.MessageEmbed()
			.setAuthor('Hi, thanks for using swiftJAB!', 'https://image.flaticon.com/icons/png/512/2913/2913584.png')
			.setDescription(`This bot helps you in registering for the vaccine and also notifies you about the available slots!!! <[Add me to another server](https://discord.com/api/oauth2/authorize?client_id=843522924442288138&permissions=8&scope=bot)>
			ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ`)	
			.setColor('RED')
			.addFields(
				{
					name: '   How to use me   :interrobang:',
					value: '**\:syringe: You can register using : **\nㅤㅤ`$jab register <your-age> <your-pincode/District>`\n\n**\:syringe: You can recieve notifications using : **\nㅤㅤ`$jab notify`\n\n**\:syringe: To know the availability of slots use : **\nㅤㅤ`$jab slots <picode/District>`\n\n\n\n'
				}
		)
			.setImage('https://cdn.discordapp.com/attachments/792638606829289486/846991360866648104/SquarePic_20210524_23412897.jpg')
			
		msg.author.send(helpEmbed)
	}
});

schedule.scheduleJob('*/15 * * * * *', () => {
	async function schJob() {
		const item = await db_h.fetch().next()
		return item
	}
	schJob().then(item => {
		item.value.forEach(id => {
			async function getPinFromDb() {
				const item = await db_users.get(id.key)
				return item
			}
			getPinFromDb().then(item => {
				return item.pin
			}).then((pin) => {
				axios.get(`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin`, {
					headers: {
						'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:89.0) Gecko/20100101 Firefox/89.0'
					},
					params: {
						pincode: pin,
						date: getTodaysDate()
					}
				})
					.then((resp) => {
						if (resp.data.centers[0]) {

							resp.data.centers.forEach(center => {
								if (center.sessions) {
									center.sessions.forEach(element => {
						
										//console.log(element.center_id);
										var ary = [];
										ary.push(element.center_id);
										ary.forEach((i) => {
											
											const exampleEmbed1 = new discord.MessageEmbed()
												.setColor('#0099ff')
												.addFields(
													{ name: 'Centreㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ', value: center.name, inline: true },
													{ name: 'Dosesㅤ', value: element.available_capacity, inline: true },
													{ name: 'Vaccine', value: element.vaccine, inline: true },
												)
											// message.author.send(exampleEmbed1);
											async function notify() {
												let member = await client.users.fetch(id.key)
												return member
											}
											notify().then(member => {
												member.send(exampleEmbed1)
											})
										})
									})
								}
					
							})
						}
						else {
							async function notify() {
								let member = await client.user.fetch(id)
								return member
							}
							notify().then(member => {
								member.send('Slots are not currently available')
							})
	
						}
					})
			})
		}
		)
	})
})


client.on('message', (message) => {
	if (message.author.bot) return;
	console.log(`[${message.author.tag}]: ${message.content}`);
	if (message.content === 'bye') {
		message.reply('Seeya!\:wave:');
	}
	if (message.content.startsWith(PREFIX)) {
		const [CMD_NAME, ...args] = message.content
			.trim()
			.substring(PREFIX.length)
			.split(/\s+/);

		// Commands the bot accepts
		
		if (CMD_NAME === 'register') {
			var age = args[0]

			if (args[1] === '-p') {
				if (isValidPin(args[2])) {
					if (args[3] === '-dose') {
						var dose = args[4]
						var vax = args[5]
						async function IfItemInDb() {
							const item = await db_users.get(message.author.id)
							return item
						}
						IfItemInDb().then(item => {
							if (item) {
								message.reply('User already registered')
							}
							else {
								async function putToDbpin() {
									db_users.put({
										key: message.author.id,
										age: age,
										pin: args[2],
										dose: dose,
										vax: vax
									})
								}
								putToDbpin().then(() => {
									message.reply(`${message.author} __**You have successfully registered**__ ✅`)
									message.author.send('**Your details are as follows:**')
									message.author.send(`\:small_blue_diamond:Age: ${age}`)
									message.author.send(`\:small_blue_diamond:Pincode: ${args[2]}`)
									message.author.send(`\:small_blue_diamond:Dose: ${dose}`)
									message.author.send(`\:small_blue_diamond:Vaccine: ${vax}`)
								})
							}
						})
					}
					
				}
				
			}
			if (args[1] === '-d') {
				if (args[3] === '-dose') {
					var dose = args[4]
					var vax = args[5]
					async function IfItemInDb() {
						const item = await db_users.get(message.author.id)
						return item
					}
					IfItemInDb().then(item => {
						if (item) {
							message.reply('User already registered')
						}
						else {
							async function putToDbdist() {
								db_users.put({
									key: message.author.id,
									age: age,
									district: args[2],
									dose: dose,
									vax: vax
								})
							}
							putToDbdist().then(() => {
								message.reply(`${message.author} __**You have successfully registered**__ ✅`)
								message.author.send('**Your details are as follows:**')
								message.author.send(`\:small_blue_diamond:Age: ${age}`)
								message.author.send(`\:small_blue_diamond:District: ${args[2]}`)
								message.author.send(`\:small_blue_diamond:Dose: ${dose}`)
								message.author.send(`\:small_blue_diamond:Vaccine: ${vax}`)
							})
						}

					})
				}
				
			}
		}
		else if (CMD_NAME === 'slots') {
			if (args[0] === '-p') {
				const pinCode = Number(args[1])
				const date = args[2]
				console.log(pinCode)
				console.log(date)
				axios.get(`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByPin`, {
					headers: {
						'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:89.0) Gecko/20100101 Firefox/89.0'
					},
					params: {
						pincode: pinCode,
						date: date
					}
				})
					.then(resp => {
						resp.data.sessions.forEach(element => {
						
							//console.log(element.center_id);
							var ary = [];
							ary.push(element.center_id);
							ary.forEach((i) => {
								console.log(i);
								const exampleEmbed1 = new discord.MessageEmbed()
									.setColor('#0099ff')
									.addFields(
										{ name: 'Centreㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ', value: element.name, inline: true },
										{ name: 'Dosesㅤ', value: element.available_capacity, inline: true },
										{ name: 'Vaccine', value: element.vaccine, inline: true },
									)
								message.author.send(exampleEmbed1);
							})
						})
					})
					.catch(err => { console.log(err) })
				
			}

			else if (args[0] === '-d') {
				const distInp = args[1]
				const date = args[2]
				var distarr = readDist('./distarr.txt')
				const fzSet = FuzzySet(distarr)
				const rsSet = fzSet.get(distInp)
				fetchDistId(rsSet[0][1]).then(distId => {
					axios.get(`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByDistrict`, {
						headers: {
							'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:89.0) Gecko/20100101 Firefox/89.0'
						},
						params: {
							district_id: distId,
							date: date
						}
					})
						.then(resp => {
							resp.data.sessions.forEach(element => {
							
								//console.log(element.center_id);
								var ary = [];
								ary.push(element.center_id);
								ary.forEach((i) => {
									console.log(i);
									const exampleEmbed1 = new discord.MessageEmbed()
										.setColor('#0099ff')
										.addFields(
											{ name: 'Centreㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ', value: element.name, inline: true },
											{ name: 'Dosesㅤ', value: element.available_capacity, inline: true },
											{ name: 'Vaccine', value: element.vaccine, inline: true },
										)
									message.author.send(exampleEmbed1);
								})
							})
						})
						.catch(err => { console.log(err) })
				})
			}
		}
		else if (CMD_NAME === 'notify') {

			if (args[0] === 'h') {
				async function checkInDb() {
					const item = await db_h.get(message.author.id)
					return item
				}
				checkInDb().then(item => {
					if (item) {
						message.reply("Notifications already enabled")
					}
					else {
						async function putInDb() {
							db_h.put({key: message.author.id})
						}
						putInDb().then(() => {
							console.log('successfully set')
						})
					}
				})
			}
			else if (args[0] === 'hh') {
				async function checkInDb2() {
					const item = await db_hh.get(message.author.id)
					return item
				}
				checkInDb2().then(item => {
					if (item) {
						message.reply("Notifications already enabled")
					}
					else {
						async function putInDb2() {
							db_hh.put({key: message.author.id})
						}
						putInDb2().then(() => {
							console.log('successfully set')
						})
					}
				})
			} 
		}
		else if (CMD_NAME === 'modify') {
			if (args[0] === '-age') {
				db_users.update({age: args[1]}, message.author.id)
			}
			else if (args[0] === '-pin') {
				db_users.update({pin: args[1]}, message.author.id)
			}
			else if (args[0] === '-dis') {
				db_users.update({district: args[1]}, message.author.id)
			}
			else if (args[0] === '-dose') {
				db_users.update({dose: args[1]}, message.author.id)
			}
			else if (args[0] === '-vax') {
				db_users.update({vax: args[1]}, message.author.id)
			}

			// message.reply(`${message.author} __**You have been successfully modified**__ ✅`)
			// message.author.send('**Your details are as follows:**')
			// message.author.send(`\:small_blue_diamond:Age: ${age}`)
			// message.author.send(`\:small_blue_diamond:Pincode: ${args[2]}`)
			// message.author.send(`\:small_blue_diamond:Dose: ${dose}`)
			// message.author.send(`\:small_blue_diamond:Vaccine: ${vax}`)
		}
	}
})