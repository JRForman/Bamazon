drop database if exists bamazon;

create database bamazon;

use bamazon;

create table products(
	item_id int(4) zerofill primary key not null auto_increment,
    product_name varchar(25) not null,
    department_name varchar(25),
    price decimal(6,2) not null,
    stock integer not null
    );

insert into products(product_name, department_name, price, stock)
values
("IPod", "Consumer Electronics", 200.15, 57),
("Cat Litter", "Pet Care", 15.98, 23),
("65 in TV", "Consumer Electronics", 1299.95, 12),
("Motherboard", "Computer Parts", 139.00, 28),
("SSD 2 TB", "Computer Parts", 259.99, 127),
("ATX Case", "Computer Parts", 95.99, 8),
("Catnip", "Pet Care", 12.38, 5),
("CPU", "Computer Parts", 359.99, 12),
("GPU", "Computer Parts", 559.00, 34),
("Dog Food", "Pet Care", 27.00, 10)