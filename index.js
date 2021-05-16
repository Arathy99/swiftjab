const express = require('express')
const app = express()
const discord = require('discord.js')
const client = new discord.Client()
require('dotenv').config()

const port = 3000

app.get('/', (req, res) => res.send('Welcome to SwiftJAB Server v0.1'))

app.listen(port, () => console.log(`Server listening at port ${port}`))

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`)
})

client.on('message', msg => {
	if(msg.content === 'hi') {
		msg.reply('hello')
	}
});

client.login(process.env.TOKEN)
