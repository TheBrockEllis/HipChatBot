var config = require('./config');
var wobot = require('wobot');

var bot = new wobot.Bot({
  debug: true,
  jid: config.jid,
  password: config.password
});

bot.loadPlugin('standup', require('./plugins/standup'));
bot.connect();
