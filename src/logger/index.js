const Winston = require('winston')
const path = require('path')

const logger = Winston.createLogger({
  format: Winston.format.errors({ stack: true }),
  transports: [
    new Winston.transports.Console({
      format: Winston.format.combine(
        Winston.format.errors({ stack: true }),
        Winston.format.colorize(),
        Winston.format.splat(),
        Winston.format.timestamp({
          format: 'MM-DD-YYYY HH:mm:ss [[' + global.process.pid + ']]'
        }),
        Winston.format.align(),
        Winston.format.printf(info => {
          if (info.stack) {
            return `${info.timestamp} ${info.level}: ${info.message} - ${info.stack}`
          }

          return `${info.timestamp} ${info.level}: ${info.message}`
        })
      ),
      level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info'
    }),
    new Winston.transports.File({
      filename: path.join(__dirname, '../../logs/app.log'),
      format: Winston.format.combine(
        Winston.format.errors({ stack: true }),
        Winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        Winston.format.printf(info => {
          if (info.stack) {
            return `${info.timestamp} ${info.level}: ${info.message} - ${info.stack}`
          }

          return `${info.timestamp} ${info.level}: ${info.message}`
        })
      ),
      level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info'
    })
  ]
})

module.exports = logger
