"use strict"
var inquirer = require("inquirer")
var mysql = require("mysql")

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "jaya",
    password: "p4ssword",
    database: "greatbay_db"
})

// connection.connect(function(err){
//     console.log("Connected as id: "+ connection.threadId);
//     start();
// })

var start = function() {
    inquirer.prompt({
        type: "list",
        name: "postOrBid",
        message: "Do you want to bid or post an item",
        choices: ["post ", "bid"]   
    }).then(function(response) {
        console.log(response);
        console.log(typeof response.action);
        if (response.postOrBid.toLowerCase() === "post") {
            postItem();
        } else if (response.postOrBid.toLowerCase() === "bid") {
            console.log("bid's if");
            bidItem();
        } else 
            console.log("Please enter either 'post' or 'bid' ");
        
    })
}
start();


function postItem() {
    console.log("postitem runs");
    inquirer.prompt([
        {
            name: "nameOfItem",
            type: "input",
            message: "What is the name of this item?"
        }, 
        {
            name: "category",
            type: "input",
            message: "What category would you like to place it in?"
        }, 
        {            
            name: "startingbid",
            type: "input",
            message: "Please enter starting bid for this item?",
            validate: function(value) {
                if(isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        }
    ]).then(function(response) {
                connection.connect(function(err) {
                    if (err) throw err
                    console.log(`connected as id ${connection.threadId}`);
                })  

        console.log(response);
        console.log(response.price);
        
        connection.query("INSERT INTO auction SET ?", {
            itemname: response.nameOfItem,
            category: response.category,
            startingbid: response.startingbid,
            highestbid: response.startingbid
        }), function(err, res){
                console.log("Your auction was created successfully!");
                start();
            }
    })
}

function bidItem() {
    console.log("bidItem runs");

    connection.query("SELECT * FROM auction", function(err, res){
       if (err) throw err;
       console.log(res); 

        inquirer.prompt([
        {
            name: "choice",
            type: "rawlist",
            choices: function(value) {
                var choiceArray = [];
                for(var i = 0; i<res.length; i++) {
                    choiceArray.push(res[i].itemname);
                } return choiceArray;

            },
            message: "What auction would you like to place a bid on?"
        },
        {
            name: "bid",
            type: "input",
            message: "How much would you like to bid?"
        }
        ]).then (function(answer){
            //get the information of the chosen item
            var chosenItem;
            for (var i=0; i < res.length; i++){
                if(res[i].itemname === answer.choice){
                    var chosenItem = res[i];
                }   
            }
                    
            if(chosenItem.highestbid < parseInt(answer.bid)){
                connection.query("UPDATE auction SET ? WHERE ?",
                    [
                        {
                            highestbid: answer.bid
                        },
                        {
                            id:chosenItem.id       

                        }
                    ], 
                    function(err) {
                        console.log("Bid successfully placed!");
                        start();
                        }
                );
            } 
            else {
                console.log("Your bid was too low. Try again...");
                start();
            }
        });
              
    });
}