var mysql = require("mysql");
var inquirer = require("inquirer");
var chalk = require('chalk');
var inventory = [];

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;

});

createInventoryArray();

function createInventoryArray() {
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;
        inventory = [];
        for (x in results) {
            var r = results[x];
            var newItem = { ID: r.item_id, Product: r.product_name, Department: r.department_name, Price: r.price, In_Stock: r.stock }
            inventory.push(newItem);
        }
        promptUser();
    });
}


function promptUser() {
    console.log(chalk.blue("\n============================="));
    inquirer.prompt([
        {
            type: "list",
            name: "action",
            message: "Please select an action.",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Quit"]
        }

    ]).then(function (res) {
        switch (res.action) {
            case "View Products for Sale":
                listAllProducts();
                break;
            case "View Low Inventory":
                viewLowInventory();
                break;
            case "Add to Inventory":
                addToInventory();
                break;
            case "Add New Product":
                addNewProduct();
                break;
            default:
                console.log("Leaving manager console, please wait...")
                connection.end();
                process.exit();
        }
    });

}

function listAllProducts() {
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;
        console.log(chalk.yellow.bold("\nAll Items\n============================="));

        var inventory = [];
        for (x in results) {
            var r = results[x];
            var newItem = { ID: r.item_id, Product: r.product_name, Department: r.department_name, Price: r.price, In_Stock: r.stock }
            inventory.push(newItem);
        }
        console.table(inventory);
        promptUser();
    });
}

function viewLowInventory() {
    connection.query("SELECT * FROM products where stock<5", function (err, results) {
        if (err) throw err;
        if (results.length < 1) {
            console.log(chalk.yellow("\nStock for all items is above minimum stock allowed"));
            promptUser();
        } else {
            console.log(chalk.red.bold("\nLow inventory\n============================="));

            var lowInventory = [];
            for (x in results) {
                var r = results[x];
                var newItem = { ID: r.item_id, Product: r.product_name, Department: r.department_name, Price: r.price, In_Stock: r.stock }
                lowInventory.push(newItem);
            }
            console.table(lowInventory);
            promptUser();
        }
    });
}

function addToInventory() {
    inquirer.prompt([
        {
            type: "input",
            name: "ID",
            message: "Please enter the ID of the item you wish to add iventory to: ",
            validate: function (value) {
                if (inventory.findIndex(i => i.ID === value) !== -1) {
                    return true;
                }
                return false;
            }
        },
        {
            name: "qty",
            message: "Please enter the quanitity you wish to add to inventory",
            validate: function (value) {
                if (isNaN(value) === true) {
                    return false;
                } else { return true; }
            }
        }
    ]).then(function (res) {
        connection.query("SELECT * FROM products where item_id = ?", res.ID, function (err, results) {
            if (err) throw err;

            var updatedStock = parseInt(results[0].stock) + parseInt(res.qty);
            var message = "Are you sure you wish to add " + res.qty + " to " + results[0].product_name + " (ID: " + res.ID + ")?"

            inquirer.prompt([
                {
                    type: "confirm",
                    name: "sure",
                    message: message,
                    default: true
                }
            ]).then(function (confirm) {
                if (confirm.sure) {

                    connection.query("UPDATE products SET stock = ? where item_id = ?", [updatedStock, res.ID], function (err, res2) {
                        if (err) throw err;
                        console.log(chalk.yellow("Stock updated"));
                        console.log(chalk.yellow("Currently " + updatedStock + " " + results[0].product_name + "(s) in stock."))
                        promptUser();
                    });

                } else {
                    console.log(chalk.red("\nCancelling stock update"));
                    promptUser();
                }
            })
        });
    });
}

function addNewProduct() {
    console.log(chalk.red("\n Adding new product"));

    inquirer.prompt([
        {
            type: "input",
            name: "product_name",
            message: "Please enter the item name: "
        },
        {
            type: "input",
            name: "department_name",
            message: "In which department does this item belong: "
        },
        {
            type: "input",
            name: "price",
            message: "How much does it cost: ",
            validate: function (value) {
                if (parseFloat(value)) {
                    return true;
                } else { return false; }
            }
        },
        {
            type: "input",
            name: "stock",
            message: "Please enter the starting stock quanitity: ",
            validate: function (value) {
                if (parseInt(value)) {
                    return true;
                } else { return false; }
            }
        },
        {
            type: "confirm",
            name: "confirm",
            message: "Are you sure: ",
            default: true
        }
    ]).then(function (res) {

        if (res.confirm) {
            connection.query("INSERT INTO products (product_name, department_name, price, stock) VALUES(?,?,?,?)", [res.product_name, res.department_name, res.price, res.stock], function (err, response) {
                if (err) throw err;
                console.log(chalk.red("\nProduct added"));
                listAllProducts();
            });
        } else {
            console.log(chalk.red("\nAborting product addition"));
            promptUser();
        }

    });



}

