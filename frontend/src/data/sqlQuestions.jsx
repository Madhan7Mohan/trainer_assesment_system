// Pre-defined tables (shown to user in SQL compiler)
export const SQL_SCHEMA = `
-- Available Tables:
-- employees(id, name, department, salary, hire_date, manager_id, city)
-- departments(id, name, budget, location)
-- orders(id, customer_id, product_id, quantity, amount, order_date, status)
-- customers(id, name, email, city, age, joined_date)
-- products(id, name, category, price, stock, supplier_id)
-- suppliers(id, name, country, contact_email)
-- students(id, name, course, marks, grade, year)
-- attendance(id, student_id, date, status)
`;

export const SQL_SEED_DATA = {
  employees: [
    {id:1,name:"Alice",department:"Engineering",salary:90000,hire_date:"2020-01-15",manager_id:null,city:"Mumbai"},
    {id:2,name:"Bob",department:"Engineering",salary:75000,hire_date:"2021-03-10",manager_id:1,city:"Delhi"},
    {id:3,name:"Carol",department:"HR",salary:60000,hire_date:"2019-06-01",manager_id:null,city:"Bangalore"},
    {id:4,name:"David",department:"Sales",salary:55000,hire_date:"2022-08-20",manager_id:3,city:"Mumbai"},
    {id:5,name:"Eve",department:"Engineering",salary:95000,hire_date:"2018-11-05",manager_id:1,city:"Hyderabad"},
    {id:6,name:"Frank",department:"HR",salary:62000,hire_date:"2020-04-12",manager_id:3,city:"Chennai"},
    {id:7,name:"Grace",department:"Sales",salary:58000,hire_date:"2021-09-01",manager_id:4,city:"Delhi"},
    {id:8,name:"Henry",department:"Engineering",salary:82000,hire_date:"2022-01-01",manager_id:1,city:"Mumbai"},
    {id:9,name:"Iris",department:"Marketing",salary:67000,hire_date:"2020-07-15",manager_id:null,city:"Pune"},
    {id:10,name:"Jack",department:"Marketing",salary:71000,hire_date:"2019-03-22",manager_id:9,city:"Bangalore"},
  ],
  departments: [
    {id:1,name:"Engineering",budget:5000000,location:"Mumbai"},
    {id:2,name:"HR",budget:1000000,location:"Delhi"},
    {id:3,name:"Sales",budget:2000000,location:"Mumbai"},
    {id:4,name:"Marketing",budget:1500000,location:"Bangalore"},
  ],
  customers: [
    {id:1,name:"Rahul",email:"rahul@email.com",city:"Mumbai",age:28,joined_date:"2021-01-10"},
    {id:2,name:"Priya",email:"priya@email.com",city:"Delhi",age:35,joined_date:"2020-06-15"},
    {id:3,name:"Amit",email:"amit@email.com",city:"Bangalore",age:22,joined_date:"2022-03-01"},
    {id:4,name:"Sneha",email:"sneha@email.com",city:"Mumbai",age:30,joined_date:"2021-11-20"},
    {id:5,name:"Karan",email:"karan@email.com",city:"Hyderabad",age:27,joined_date:"2019-08-05"},
  ],
  products: [
    {id:1,name:"Laptop",category:"Electronics",price:65000,stock:50,supplier_id:1},
    {id:2,name:"Phone",category:"Electronics",price:25000,stock:200,supplier_id:1},
    {id:3,name:"Desk",category:"Furniture",price:8000,stock:30,supplier_id:2},
    {id:4,name:"Chair",category:"Furniture",price:4500,stock:100,supplier_id:2},
    {id:5,name:"Notebook",category:"Stationery",price:50,stock:1000,supplier_id:3},
  ],
  orders: [
    {id:1,customer_id:1,product_id:1,quantity:1,amount:65000,order_date:"2023-01-15",status:"delivered"},
    {id:2,customer_id:2,product_id:2,quantity:2,amount:50000,order_date:"2023-02-20",status:"delivered"},
    {id:3,customer_id:3,product_id:3,quantity:1,amount:8000,order_date:"2023-03-10",status:"pending"},
    {id:4,customer_id:1,product_id:5,quantity:10,amount:500,order_date:"2023-04-05",status:"delivered"},
    {id:5,customer_id:4,product_id:2,quantity:1,amount:25000,order_date:"2023-04-15",status:"cancelled"},
    {id:6,customer_id:5,product_id:4,quantity:2,amount:9000,order_date:"2023-05-01",status:"delivered"},
  ],
  students: [
    {id:1,name:"Ravi",course:"Java",marks:85,grade:"A",year:2023},
    {id:2,name:"Deepa",course:"Python",marks:92,grade:"A+",year:2023},
    {id:3,name:"Suresh",course:"Java",marks:60,grade:"B",year:2022},
    {id:4,name:"Anita",course:"Frontend",marks:78,grade:"B+",year:2023},
    {id:5,name:"Mohan",course:"Python",marks:45,grade:"C",year:2022},
    {id:6,name:"Lakshmi",course:"Java",marks:91,grade:"A+",year:2023},
  ],
};

export const sqlQuestions = [
  // ── Basic SELECT ──────────────────────────────────────────────────────────
  { id:"s1", type:"sql", marks:2, difficulty:"Easy", question:"Select all columns from the employees table.", expectedCols:["id","name","department","salary","hire_date","manager_id","city"], hint:"Use SELECT * FROM table", answer:"SELECT * FROM employees" },
  { id:"s2", type:"sql", marks:2, difficulty:"Easy", question:"Select only name and salary from employees.", expectedCols:["name","salary"], hint:"List specific columns", answer:"SELECT name, salary FROM employees" },
  { id:"s3", type:"sql", marks:2, difficulty:"Easy", question:"Select all employees in the 'Engineering' department.", expectedCols:["id","name","department","salary","hire_date","manager_id","city"], hint:"Use WHERE clause", answer:"SELECT * FROM employees WHERE department = 'Engineering'" },
  { id:"s4", type:"sql", marks:2, difficulty:"Easy", question:"Select employees with salary greater than 80000.", expectedCols:["id","name","department","salary","hire_date","manager_id","city"], hint:"Use > operator", answer:"SELECT * FROM employees WHERE salary > 80000" },
  { id:"s5", type:"sql", marks:2, difficulty:"Easy", question:"Select distinct departments from employees.", expectedCols:["department"], hint:"Use DISTINCT keyword", answer:"SELECT DISTINCT department FROM employees" },
  { id:"s6", type:"sql", marks:2, difficulty:"Easy", question:"Select all employees ordered by salary descending.", expectedCols:["id","name","department","salary","hire_date","manager_id","city"], hint:"Use ORDER BY ... DESC", answer:"SELECT * FROM employees ORDER BY salary DESC" },
  { id:"s7", type:"sql", marks:2, difficulty:"Easy", question:"Select top 3 highest paid employees (name and salary).", expectedCols:["name","salary"], hint:"Use LIMIT", answer:"SELECT name, salary FROM employees ORDER BY salary DESC LIMIT 3" },
  { id:"s8", type:"sql", marks:2, difficulty:"Easy", question:"Count the total number of employees.", expectedCols:["count"], hint:"Use COUNT(*)", answer:"SELECT COUNT(*) as count FROM employees" },
  { id:"s9", type:"sql", marks:2, difficulty:"Easy", question:"Find the maximum salary in employees.", expectedCols:["max_salary"], hint:"Use MAX()", answer:"SELECT MAX(salary) as max_salary FROM employees" },
  { id:"s10", type:"sql", marks:2, difficulty:"Easy", question:"Find the minimum salary in employees.", expectedCols:["min_salary"], hint:"Use MIN()", answer:"SELECT MIN(salary) as min_salary FROM employees" },
  // ── WHERE & Conditions ────────────────────────────────────────────────────
  { id:"s11", type:"sql", marks:3, difficulty:"Easy", question:"Select employees from Mumbai with salary > 70000.", expectedCols:["name","city","salary"], hint:"Use AND in WHERE", answer:"SELECT name, city, salary FROM employees WHERE city = 'Mumbai' AND salary > 70000" },
  { id:"s12", type:"sql", marks:3, difficulty:"Easy", question:"Select employees from Mumbai or Delhi.", expectedCols:["name","city"], hint:"Use OR or IN", answer:"SELECT name, city FROM employees WHERE city IN ('Mumbai', 'Delhi')" },
  { id:"s13", type:"sql", marks:3, difficulty:"Easy", question:"Select employees whose name starts with 'A'.", expectedCols:["name"], hint:"Use LIKE 'A%'", answer:"SELECT name FROM employees WHERE name LIKE 'A%'" },
  { id:"s14", type:"sql", marks:3, difficulty:"Easy", question:"Select employees hired between 2020 and 2022.", expectedCols:["name","hire_date"], hint:"Use BETWEEN", answer:"SELECT name, hire_date FROM employees WHERE hire_date BETWEEN '2020-01-01' AND '2022-12-31'" },
  { id:"s15", type:"sql", marks:3, difficulty:"Easy", question:"Select employees with no manager (manager_id is NULL).", expectedCols:["name","manager_id"], hint:"Use IS NULL", answer:"SELECT name, manager_id FROM employees WHERE manager_id IS NULL" },
  // ── Aggregation & GROUP BY ────────────────────────────────────────────────
  { id:"s16", type:"sql", marks:3, difficulty:"Medium", question:"Find average salary per department.", expectedCols:["department","avg_salary"], hint:"Use GROUP BY with AVG()", answer:"SELECT department, AVG(salary) as avg_salary FROM employees GROUP BY department" },
  { id:"s17", type:"sql", marks:3, difficulty:"Medium", question:"Count employees per department.", expectedCols:["department","employee_count"], hint:"Use GROUP BY with COUNT()", answer:"SELECT department, COUNT(*) as employee_count FROM employees GROUP BY department" },
  { id:"s18", type:"sql", marks:3, difficulty:"Medium", question:"Find departments where average salary > 70000.", expectedCols:["department","avg_salary"], hint:"Use HAVING after GROUP BY", answer:"SELECT department, AVG(salary) as avg_salary FROM employees GROUP BY department HAVING AVG(salary) > 70000" },
  { id:"s19", type:"sql", marks:3, difficulty:"Medium", question:"Find the total salary paid per department.", expectedCols:["department","total_salary"], hint:"Use SUM() with GROUP BY", answer:"SELECT department, SUM(salary) as total_salary FROM employees GROUP BY department" },
  { id:"s20", type:"sql", marks:3, difficulty:"Medium", question:"Find departments with more than 2 employees.", expectedCols:["department","employee_count"], hint:"Use HAVING COUNT(*) > 2", answer:"SELECT department, COUNT(*) as employee_count FROM employees GROUP BY department HAVING COUNT(*) > 2" },
  // ── JOINs ─────────────────────────────────────────────────────────────────
  { id:"s21", type:"sql", marks:4, difficulty:"Medium", question:"Join employees with departments to show employee name and department location.", expectedCols:["name","location"], hint:"Use INNER JOIN on department name", answer:"SELECT e.name, d.location FROM employees e INNER JOIN departments d ON e.department = d.name" },
  { id:"s22", type:"sql", marks:4, difficulty:"Medium", question:"Show all customers and their orders (include customers with no orders).", expectedCols:["name","id"], hint:"Use LEFT JOIN", answer:"SELECT c.name, o.id FROM customers c LEFT JOIN orders o ON c.id = o.customer_id" },
  { id:"s23", type:"sql", marks:4, difficulty:"Medium", question:"Show product name and order quantity for all delivered orders.", expectedCols:["name","quantity"], hint:"JOIN orders with products WHERE status = 'delivered'", answer:"SELECT p.name, o.quantity FROM orders o INNER JOIN products p ON o.product_id = p.id WHERE o.status = 'delivered'" },
  { id:"s24", type:"sql", marks:4, difficulty:"Medium", question:"Find customers who have placed at least one order.", expectedCols:["name"], hint:"JOIN customers and orders, use DISTINCT", answer:"SELECT DISTINCT c.name FROM customers c INNER JOIN orders o ON c.id = o.customer_id" },
  { id:"s25", type:"sql", marks:4, difficulty:"Medium", question:"Show employee name and their manager name.", expectedCols:["employee","manager"], hint:"Self-join on manager_id = id", answer:"SELECT e.name as employee, m.name as manager FROM employees e LEFT JOIN employees m ON e.manager_id = m.id" },
  // ── Subqueries ────────────────────────────────────────────────────────────
  { id:"s26", type:"sql", marks:4, difficulty:"Medium", question:"Find employees earning more than the average salary.", expectedCols:["name","salary"], hint:"Use subquery with AVG()", answer:"SELECT name, salary FROM employees WHERE salary > (SELECT AVG(salary) FROM employees)" },
  { id:"s27", type:"sql", marks:4, difficulty:"Medium", question:"Find the department with the highest average salary.", expectedCols:["department","avg_salary"], hint:"Use subquery in HAVING or ORDER BY LIMIT 1", answer:"SELECT department, AVG(salary) as avg_salary FROM employees GROUP BY department ORDER BY avg_salary DESC LIMIT 1" },
  { id:"s28", type:"sql", marks:4, difficulty:"Hard", question:"Find customers who have never placed an order.", expectedCols:["name"], hint:"Use NOT IN or LEFT JOIN with NULL check", answer:"SELECT name FROM customers WHERE id NOT IN (SELECT DISTINCT customer_id FROM orders)" },
  { id:"s29", type:"sql", marks:4, difficulty:"Hard", question:"Find the second highest salary in employees.", expectedCols:["salary"], hint:"Use subquery or LIMIT OFFSET", answer:"SELECT MAX(salary) as salary FROM employees WHERE salary < (SELECT MAX(salary) FROM employees)" },
  { id:"s30", type:"sql", marks:4, difficulty:"Hard", question:"Find products never ordered.", expectedCols:["name"], hint:"Use NOT IN with subquery on orders", answer:"SELECT name FROM products WHERE id NOT IN (SELECT DISTINCT product_id FROM orders)" },
  // ── String & Date Functions ────────────────────────────────────────────────
  { id:"s31", type:"sql", marks:3, difficulty:"Medium", question:"Show employee names in uppercase.", expectedCols:["upper_name"], hint:"Use UPPER()", answer:"SELECT UPPER(name) as upper_name FROM employees" },
  { id:"s32", type:"sql", marks:3, difficulty:"Medium", question:"Show employee names and the length of their name.", expectedCols:["name","name_length"], hint:"Use LENGTH()", answer:"SELECT name, LENGTH(name) as name_length FROM employees" },
  { id:"s33", type:"sql", marks:3, difficulty:"Medium", question:"Extract the year from employee hire_date.", expectedCols:["name","hire_year"], hint:"Use strftime('%Y', hire_date) for SQLite", answer:"SELECT name, strftime('%Y', hire_date) as hire_year FROM employees" },
  { id:"s34", type:"sql", marks:3, difficulty:"Medium", question:"Concatenate employee name and city as 'name (city)'.", expectedCols:["info"], hint:"Use || for concatenation in SQLite", answer:"SELECT name || ' (' || city || ')' as info FROM employees" },
  { id:"s35", type:"sql", marks:3, difficulty:"Medium", question:"Show employees hired in year 2020.", expectedCols:["name","hire_date"], hint:"Use strftime or LIKE '2020%'", answer:"SELECT name, hire_date FROM employees WHERE hire_date LIKE '2020%'" },
  // ── Advanced Queries ──────────────────────────────────────────────────────
  { id:"s36", type:"sql", marks:5, difficulty:"Hard", question:"Rank employees by salary within each department (use row_number or order).", expectedCols:["name","department","salary"], hint:"ORDER BY department, salary DESC", answer:"SELECT name, department, salary FROM employees ORDER BY department, salary DESC" },
  { id:"s37", type:"sql", marks:5, difficulty:"Hard", question:"Find the top earner in each department.", expectedCols:["department","name","salary"], hint:"Use subquery with MAX per department", answer:"SELECT e.department, e.name, e.salary FROM employees e WHERE e.salary = (SELECT MAX(salary) FROM employees WHERE department = e.department)" },
  { id:"s38", type:"sql", marks:5, difficulty:"Hard", question:"Calculate the total revenue from delivered orders.", expectedCols:["total_revenue"], hint:"SUM(amount) WHERE status = 'delivered'", answer:"SELECT SUM(amount) as total_revenue FROM orders WHERE status = 'delivered'" },
  { id:"s39", type:"sql", marks:5, difficulty:"Hard", question:"Show each student's name and whether they passed (marks >= 50).", expectedCols:["name","result"], hint:"Use CASE WHEN", answer:"SELECT name, CASE WHEN marks >= 50 THEN 'Pass' ELSE 'Fail' END as result FROM students" },
  { id:"s40", type:"sql", marks:5, difficulty:"Hard", question:"Find average marks per course for courses with average > 70.", expectedCols:["course","avg_marks"], hint:"GROUP BY course HAVING AVG(marks) > 70", answer:"SELECT course, AVG(marks) as avg_marks FROM students GROUP BY course HAVING AVG(marks) > 70" },
  // ── UPDATE / INSERT / DELETE (conceptual — shown as MCQ) ─────────────────
  { id:"s41", type:"sql", marks:3, difficulty:"Medium", question:"Which SQL statement adds new records to a table?", expectedCols:["answer"], hint:"Think about DML statements", answer:"SELECT 'INSERT' as answer" },
  { id:"s42", type:"sql", marks:3, difficulty:"Medium", question:"Write a query to find employees with salary between 60000 and 80000.", expectedCols:["name","salary"], hint:"Use BETWEEN", answer:"SELECT name, salary FROM employees WHERE salary BETWEEN 60000 AND 80000" },
  { id:"s43", type:"sql", marks:3, difficulty:"Medium", question:"Show number of orders per status.", expectedCols:["status","order_count"], hint:"GROUP BY status", answer:"SELECT status, COUNT(*) as order_count FROM orders GROUP BY status" },
  { id:"s44", type:"sql", marks:3, difficulty:"Medium", question:"Find average age of customers per city.", expectedCols:["city","avg_age"], hint:"GROUP BY city, AVG(age)", answer:"SELECT city, AVG(age) as avg_age FROM customers GROUP BY city" },
  { id:"s45", type:"sql", marks:4, difficulty:"Hard", question:"Find products with stock less than 100 and price greater than 1000.", expectedCols:["name","stock","price"], hint:"Use AND in WHERE", answer:"SELECT name, stock, price FROM products WHERE stock < 100 AND price > 1000" },
  { id:"s46", type:"sql", marks:4, difficulty:"Hard", question:"Show total amount spent by each customer.", expectedCols:["customer_id","total_spent"], hint:"SUM(amount) GROUP BY customer_id", answer:"SELECT customer_id, SUM(amount) as total_spent FROM orders GROUP BY customer_id" },
  { id:"s47", type:"sql", marks:4, difficulty:"Hard", question:"Find the most expensive product in each category.", expectedCols:["category","name","price"], hint:"Subquery with MAX per category", answer:"SELECT p.category, p.name, p.price FROM products p WHERE p.price = (SELECT MAX(price) FROM products WHERE category = p.category)" },
  { id:"s48", type:"sql", marks:5, difficulty:"Hard", question:"Find students who scored above the average marks of their course.", expectedCols:["name","course","marks"], hint:"Correlated subquery with AVG per course", answer:"SELECT name, course, marks FROM students s WHERE marks > (SELECT AVG(marks) FROM students WHERE course = s.course)" },
  { id:"s49", type:"sql", marks:5, difficulty:"Hard", question:"Show department name and number of employees, including departments with 0 employees.", expectedCols:["name","employee_count"], hint:"LEFT JOIN departments with employees, COUNT", answer:"SELECT d.name, COUNT(e.id) as employee_count FROM departments d LEFT JOIN employees e ON d.name = e.department GROUP BY d.name" },
  { id:"s50", type:"sql", marks:5, difficulty:"Hard", question:"Find the customer who spent the most money total across all orders.", expectedCols:["name","total_spent"], hint:"JOIN customers and orders, SUM, ORDER BY DESC LIMIT 1", answer:"SELECT c.name, SUM(o.amount) as total_spent FROM customers c JOIN orders o ON c.id = o.customer_id GROUP BY c.name ORDER BY total_spent DESC LIMIT 1" },
];