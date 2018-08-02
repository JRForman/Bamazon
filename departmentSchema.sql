use bamazon;

ALTER TABLE products
ADD product_sales float;

create table departments(
	department_ID int(2) zerofill not null auto_increment primary key,
    deparment_name varchar(25),
    over_head_costs decimal(6,2)
);