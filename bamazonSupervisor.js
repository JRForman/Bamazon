var mysql = require("mysql");
var inquirer = require("inquirer");
var chalk = require('chalk');
var inventory = [];

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
    promptUser();
});

function promptUser() {
    console.log(chalk.blue("\n============================="));
    inquirer.prompt([
        {
            type: "list",
            name: "action",
            message: "Please select an action.",
            choices: ["View Product Sales by Department", "Create New Department", "Quit"]
        }

    ]).then(function (res) {
        switch (res.action) {
            case "View Product Sales by Department":
                viewSalesByDepartment();
                break;
            case "Create New Department":
                createNewDepartment();
                break;
            default:
                console.log("Leaving supervisor console, please wait...")
                connection.end();
                process.exit();
        }
    });

}

function viewSalesByDepartment() {
    //department_id | department_name | over_head_costs | product_sales | total_profit
    console.log("Viewing sales by department");
    var salesList = [];
    connection.query(
        `select departments.department_ID, departments.department_name, sum(products.product_sales) as total_sales, departments.over_head_costs
        from departments
        join products ON products.department_name = departments.department_name
        group by department_name
        order by departments.department_ID;`, function (err, results) {
            if (err) throw err;
            for (x in results) {
                var total_profit = parseFloat(results[x].total_sales) - parseFloat(results[x].over_head_costs)
                var newDepartment = { Department_ID: results[x].department_ID, Department_Name: results[x].department_name, Over_Head_Costs: results[x].over_head_costs, Total_Sales: results[x].total_sales, Total_Profit: total_profit }
                salesList.push(newDepartment)
            }
            console.table(salesList);
            promptUser();
        });
}

function createNewDepartment() {
    console.log(chalk.red("\n Adding new department"));

    inquirer.prompt([
        {
            type: "input",
            name: "department_name",
            message: "Please enter the department name: "
        },
        {
            type: "input",
            name: "over_head_costs",
            message: "How much does it cost to run this department: ",
            validate: function (value) {
                if (isNaN(value) === true) {
                    return false;
                } else { return true; }
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
            connection.query("INSERT INTO departments (department_name, over_head_costs) VALUES(?,?)", [res.department_name, res.over_head_costs], function (err, response) {
                if (err) throw err;
                console.log(chalk.red("\n" + res.department_name + " Department added"));
                promptUser()
            });
        } else {
            console.log(chalk.red("\nAborting department addition"));
            promptUser();
        }

    });




}