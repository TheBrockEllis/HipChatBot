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
   
    bot.join("84790_code_monkeys@conf.hipchat.com", 0);
 
    bot.getRoster(function(err, roster, stanza){
      //console.log(err);
      //console.log(roster);
      //console.log(stanza);
      //console.log("Loaded roster. Total of " + roster.length + " employees");
      team = roster
    });
  
    //set up the recurring question
    var standup_question = schedule.scheduleJob("* * * * *", function(){
      team.forEach(function(person){
        //console.log(person.mention_name);
        if(person.mention_name == "brock"){
          bot.message(person.jid, "Good morning, sir! What are you working on? [respond with \"!standup ____\"]");
        }
      });
    });
  
    //set up the recurring answers
    var standup_answers = schedule.scheduleJob("* * * * *", function(){
      fs.readFile("./plugins/standup.json", 'utf8', function(error, data){
        if(error) throw error;

        var standup = JSON.parse(data);
        //console.log("parsed json: " + standup);      

        var update = "";

        for(var person in standup){
          var object = standup[person];
	  //console.log("Name: " + object.name);  
	  //console.log("Status: " + object.status);  
	  var line = object.name + ": " + object.status + "\n";
	  update += line;
        };

        bot.message("84790_code_monkeys@conf.hipchat.com", update);

      }); //end answer      

    });

  }); //end connect

  //when being spoken to, write it to file
  bot.onPrivateMessage(/^\!standup.*$/, function(from, message){
    console.log("I'm being talked to!");   

    //trim off command
    message = message.substr(message.indexOf(' ')+1);
 
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
  





}; //end module.exports.load
