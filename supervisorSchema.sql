use bamazon;

select departments.department_ID, departments.department_name, sum(products.product_sales) as total_sales, departments.over_head_costs
from departments
join products ON products.department_name = departments.department_name
group by department_name
order by departments.department_ID;