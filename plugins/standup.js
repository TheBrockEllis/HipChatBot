var schedule = require('node-schedule');
var fs = require('fs');

module.exports.load = function(bot){

  //set up event to happen every M-F morning at 10am
  //set up message to every individual and ask them what they're doing
  //receive message from individuals 
  //write contents to .json file
  //1 hour after question is asked, send message to water cooler with contents of the json file

  //when connecting, get roster
  var team;
  bot.onConnect(function(){
    //console.log("Bot connected");
    
    bot.getRoster(function(err, roster, stanza){
      //console.log(err);
      //console.log(roster);
      //console.log(stanza);
      //console.log("Loaded roster. Total of " + roster.length + " employees");
      team = roster
    });
  

  });

  //when being spoken to, write it to file
  bot.onPrivateMessage(function(from, message){
    
    for(var i=0; i < team.length; i++){
      //console.log("looping");
      if(team[i].jid == from){
        //console.log("Found it!");
        var author = team[i].name;
        break;
      }
    }

    var update = { 
      "name": author,
      "status": message
    }

    fs.readFile("./plugins/standup.json", 'utf8', function(error, data){
      if(error) throw error;
   
      var standup = JSON.parse(data); 
      //console.log("parsed json: " + standup);      

      standup[from] = update;
      //console.log(standup);

      fs.writeFile("./plugins/standup.json", JSON.stringify(standup, null, 2), function(error) {
        if (error) throw error;
        //console.log('complete');
      });
      
    }); //end read/write
  
  });
  
  var standup_question = schedule.scheduleJob("* * * * *", function(){
    team.forEach(function(person){
      //console.log(person.mention_name);
      if(person.mention_name === "brock"){
        bot.message(person.jid, "Good morning, sir! What are you working on?");
      }
    });
  });





}; //end module.exports.load
