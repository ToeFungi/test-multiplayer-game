const client = io('https://test-multiplayer-server.herokuapp.com:3001')

let isTyping = false

const ctx = document.getElementById('ctx')
  .getContext('2d')
const latencyHandle = document.getElementById('latency')

const handleSendMessage = () => {
  const messageBox = document.getElementById('message')
  const message = messageBox.value
  messageBox.value = ''

  if (!message) {
    return
  }

  client.emit('create-message', { message })
}

const handleIncomingMessages = ({ message, username }) => {
  const messageBox = document.getElementById('text-area')
  messageBox.innerHTML += `<p><strong>${username}:</strong> ${message}</p>`
}

const updateLoop = data => {
  ctx.clearRect(0, 0, 500, 500)

  data.updatePacket.player.forEach(player => {
    ctx.fillText(player.name.toString(), player.x, player.y)
  })

  data.updatePacket.bullet.forEach(bullet => {
    ctx.fillRect(bullet.x, bullet.y, 5, 5)
  })
}

const handleLatency = data => {
  const latency = new Date().getTime() - data.time
  latencyHandle.innerText = `Ping: ${latency}ms`
}

const ping = setInterval(() => {
  client.emit('custom-ping', { time: new Date().getTime() })
}, 1000)

client.on('connect', (data) => console.log('Connected to server', data))

client.on('loop-update', updateLoop)

client.on('custom-ping', handleLatency)

client.on('player-details', data => {
  document.getElementById('player-name').innerText = `Player Name: ${data.name}`
})

client.on('message-update', handleIncomingMessages)

client.on('disconnect', () => console.log('Disconnected from server'))

document.getElementById('send-button').onclick = handleSendMessage
document.getElementById('message').onblur = () => isTyping = false
document.getElementById('message').onfocus = () => isTyping = true

document.onkeydown = event => {
  if (!isTyping) {
    if (event.keyCode === 68) client.emit('key-press', { input: 'right', state: true }) // D
    if (event.keyCode === 83) client.emit('key-press', { input: 'down', state: true }) // S
    if (event.keyCode === 65) client.emit('key-press', { input: 'left', state: true }) // A
    if (event.keyCode === 87) client.emit('key-press', { input: 'up', state: true }) // W
  }
}

document.onkeyup = event => {
  if (event.keyCode === 68) client.emit('key-press', { input: 'right', state: false }) // D
  if (event.keyCode === 83) client.emit('key-press', { input: 'down', state: false }) // S
  if (event.keyCode === 65) client.emit('key-press', { input: 'left', state: false }) // A
  if (event.keyCode === 87) client.emit('key-press', { input: 'up', state: false }) // W
}
