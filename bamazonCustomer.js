var mysql = require("mysql");
var inq = require("inquirer");
var chalk = require('chalk');

var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "root",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;

});

function listAllProducts(callback) {
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;
        console.log(chalk.yellow.bold("\nItems for sale\n============================="));

        var inventory = [];
        for (x in results) {
            var r = results[x];
            var newItem = { ID: r.item_id, Product: r.product_name, Department: r.department_name, Price: r.price, In_Stock: r.stock }
            inventory.push(newItem);
        }
        console.table(inventory);
        callback(inventory);

    });
}

function promptUser(inventory) {
    inq.prompt([
        {
            name: "buy",
            type: "input",
            message: "Please enter the ID of item you would like to buy. Enter (Q) to quit",
            validate: function (value) {
                if (value === ("Q"||"q")){
                    console.log("\nLeaving Bamazon, please wait.....");
                    connection.end();
                    process.exit(-1);
                }
                if (inventory.findIndex(i => i.ID === value) !== -1) {
                    return true;
                }
                return false;
            }
        },
        {
            name: "qty",
            type: "input",
            message: "How many would you like to buy?",
            validate: function (value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        }

    ]).then(function (res) {
        console.log("Checking inventory...");
        connection.query("SELECT * FROM products where item_id = ?", res.buy, function (err, results) {
            if (err) throw err;
            if (results[0].stock > res.qty) {
                console.log("Inventory in stock, completing purchase");
                var newInStock = parseInt(results[0].stock) - parseInt(res.qty);
                var totalCost = results[0].price * res.qty;
                console.log("\nYour total cost will be $" + chalk.red(totalCost.toFixed(2)));
                connection.query("UPDATE products SET stock = ? where item_id = ?", [newInStock, res.buy], function (err, results) {
                    if (err) throw err;
                    listAllProducts(promptUser);
                });

            } else {
                console.log("\nWe're sorry, there is insufficient number in stock.");
                console.log("You asked for: " + chalk.red(res.qty) + " " + chalk.cyanBright(results[0].product_name) + "(s). There are only : " + chalk.green(results[0].stock) + " in stock");
                listAllProducts(promptUser);
            }

        });
    });

}

function start() {
    listAllProducts(promptUser);
}

start();
// connection.end();