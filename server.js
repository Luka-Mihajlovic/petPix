const app = require('./index')
const port = 8090

try {
  app.listen(port, () => {
    console.log('Beep boop @ port ' + port)
  })
} catch (err) {
  console.warn(err)
}
