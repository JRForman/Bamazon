use bamazon;

ALTER TABLE products
ADD product_sales decimal(6,2) not null;

create table departments(
	department_ID int(2) zerofill not null auto_increment primary key,
    department_name varchar(25),
    over_head_costs decimal(6,2)
);

insert into departments(department_name, over_head_costs)
values
("Consumer Electronics", 6000),
("Pet Care", 2000),
("Computer Parts", 4000),
("Pharmacy", 3000),
("Clothing", 5000),
("Household", 3000);