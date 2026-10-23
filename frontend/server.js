// Plesk Node.js (Passenger) başlangıç dosyası: `next start` komutunu argümansız
// çalıştırılabilen tek bir dosyaya çevirir. Önce `npm run build` gerekir.
const { createServer } = require('node:http')
const next = require('next')

const port = Number(process.env.PORT) || 3000
const app = next({ dev: false, dir: __dirname })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => {
    console.log(`MSO storefront hazır: ${port}`)
  })
})
