import React, { useState, useEffect, useRef } from "react";

/* ── SQL/Java/Python structured learning content ── */
const LEARN_CONTENT = {
  sql: {
    label: "SQL", icon: "🗄️", color: "#f97316",
    topics: [
      {
        title: "SELECT & WHERE",
        theory: "SELECT retrieves data from a table. WHERE filters rows based on conditions. Always specify only the columns you need — avoid SELECT * in production.",
        code: `-- Get all employees earning over 50000
SELECT name, department, salary
FROM employees
WHERE salary > 50000
  AND department = 'Engineering';

-- Pattern matching with LIKE
SELECT * FROM customers
WHERE name LIKE 'Ra%';   -- starts with Ra`,
        tip: "Use column aliases (AS) to make output readable: SELECT name AS employee_name"
      },
      {
        title: "JOINs Explained",
        theory: "JOINs combine rows from two or more tables based on a related column. INNER JOIN returns only matching rows. LEFT JOIN returns all left table rows even if no match.",
        code: `-- INNER JOIN: only matched rows
SELECT e.name, d.name AS dept
FROM employees e
INNER JOIN departments d ON e.dept_id = d.id;

-- LEFT JOIN: all employees, even without a dept
SELECT e.name, d.name AS dept
FROM employees e
LEFT JOIN departments d ON e.dept_id = d.id;`,
        tip: "Always alias tables when joining — it prevents ambiguity and saves typing."
      },
      {
        title: "GROUP BY & HAVING",
        theory: "GROUP BY groups rows with the same value. Aggregate functions (COUNT, SUM, AVG, MAX, MIN) are applied per group. HAVING filters groups — WHERE filters rows BEFORE grouping.",
        code: `-- Average salary per department
SELECT department, 
       COUNT(*) AS headcount,
       AVG(salary) AS avg_salary
FROM employees
GROUP BY department
HAVING AVG(salary) > 60000   -- filter groups
ORDER BY avg_salary DESC;`,
        tip: "Rule: WHERE → before grouping, HAVING → after grouping."
      },
      {
        title: "Subqueries",
        theory: "A subquery is a query nested inside another. Can be used in SELECT, FROM, or WHERE. Correlated subqueries reference the outer query and run once per row.",
        code: `-- Find employees earning above average
SELECT name, salary
FROM employees
WHERE salary > (
  SELECT AVG(salary) FROM employees
);

-- Subquery in FROM (derived table)
SELECT dept, max_sal
FROM (
  SELECT department AS dept, MAX(salary) AS max_sal
  FROM employees
  GROUP BY department
) AS dept_stats
WHERE max_sal > 80000;`,
        tip: "If performance is critical, consider CTEs (WITH clause) over deeply nested subqueries."
      },
      {
        title: "Aggregate Functions",
        theory: "Aggregates compute a single result from a set of values. COUNT(*) counts all rows. COUNT(col) skips NULLs. DISTINCT can be combined: COUNT(DISTINCT col).",
        code: `SELECT
  COUNT(*)                AS total_rows,
  COUNT(phone)            AS with_phone,    -- skips NULL
  COUNT(DISTINCT city)    AS unique_cities,
  SUM(salary)             AS total_payroll,
  AVG(salary)             AS avg_salary,
  MAX(salary)             AS highest,
  MIN(salary)             AS lowest
FROM employees;`,
        tip: "Always test aggregate queries with small datasets first to verify grouping logic."
      },
      {
        title: "Indexes & Performance",
        theory: "Indexes speed up SELECT but slow down INSERT/UPDATE. A primary key index is created automatically. Create indexes on columns used in WHERE, JOIN, and ORDER BY.",
        code: `-- Create an index
CREATE INDEX idx_emp_dept
ON employees(department);

-- Check query performance (MySQL)
EXPLAIN SELECT * FROM employees
WHERE department = 'Engineering';

-- Composite index (order matters!)
CREATE INDEX idx_dept_salary
ON employees(department, salary);`,
        tip: "Don't over-index. Each index takes storage and slows writes. Index what you query most."
      },
    ]
  },

  java: {
    label: "Java", icon: "☕", color: "#f59e0b",
    topics: [
      {
        title: "Variables & Data Types",
        theory: "Java is statically typed — every variable must have a declared type. Primitive types (int, double, boolean, char) store values directly. Reference types (String, arrays, objects) store memory addresses.",
        code: `public class DataTypes {
    public static void main(String[] args) {
        // Primitives
        int age        = 25;
        double salary  = 75000.50;
        boolean active = true;
        char grade     = 'A';

        // Reference types
        String name    = "Ravi Kumar";
        int[]  scores  = {90, 85, 92, 88};

        // Type casting
        int    x  = (int) 9.7;   // → 9  (truncates)
        double y  = (double) 5;  // → 5.0

        System.out.println(name + " scored: " + scores[0]);
    }
}`,
        tip: "Use 'var' (Java 10+) for local variable type inference: var list = new ArrayList<String>();"
      },
      {
        title: "OOP: Classes & Objects",
        theory: "A class is a blueprint. An object is an instance. Encapsulation means hiding fields (private) and exposing behavior through methods. Constructors initialise objects.",
        code: `public class Employee {
    // Fields (encapsulated)
    private String name;
    private double salary;

    // Constructor
    public Employee(String name, double salary) {
        this.name   = name;
        this.salary = salary;
    }

    // Getter / Setter
    public String getName()          { return name; }
    public void   setSalary(double s){ salary = s;  }

    // Behaviour
    public void applyRaise(double pct) {
        salary *= (1 + pct / 100);
    }

    @Override
    public String toString() {
        return name + " — ₹" + salary;
    }
}

// Usage
Employee e = new Employee("Ravi", 60000);
e.applyRaise(10);
System.out.println(e);  // Ravi — ₹66000.0`,
        tip: "Always override toString() for meaningful object printing during debugging."
      },
      {
        title: "Inheritance & Polymorphism",
        theory: "Inheritance lets a child class reuse parent code. Polymorphism lets you treat child objects as parent type — the correct method is called at runtime (dynamic dispatch).",
        code: `// Parent class
class Animal {
    String name;
    Animal(String name) { this.name = name; }
    void speak() { System.out.println(name + " makes a sound"); }
}

// Child classes
class Dog extends Animal {
    Dog(String name) { super(name); }
    @Override
    void speak() { System.out.println(name + " barks!"); }
}

class Cat extends Animal {
    Cat(String name) { super(name); }
    @Override
    void speak() { System.out.println(name + " meows!"); }
}

// Polymorphism in action
Animal[] animals = { new Dog("Bruno"), new Cat("Mimi") };
for (Animal a : animals) {
    a.speak();   // Calls the correct speak() at runtime
}`,
        tip: "Use 'instanceof' to check type before casting: if (a instanceof Dog d) { d.fetch(); }"
      },
      {
        title: "Collections Framework",
        theory: "Java Collections provide ready-made data structures. ArrayList for dynamic arrays, HashMap for key-value pairs, HashSet for unique elements, LinkedList for queue operations.",
        code: `import java.util.*;

// ArrayList
List<String> names = new ArrayList<>();
names.add("Alice"); names.add("Bob");
names.sort(Comparator.naturalOrder());

// HashMap
Map<String, Integer> scores = new HashMap<>();
scores.put("Alice", 95);
scores.put("Bob",   87);
scores.getOrDefault("Carol", 0);  // returns 0 if missing

// HashSet (unique elements)
Set<Integer> seen = new HashSet<>();
seen.add(1); seen.add(2); seen.add(1);
System.out.println(seen.size());  // 2

// Stream API (Java 8+)
names.stream()
     .filter(n -> n.startsWith("A"))
     .map(String::toUpperCase)
     .forEach(System.out::println);`,
        tip: "Prefer List/Map/Set interfaces over concrete types — makes it easy to swap implementations."
      },
      {
        title: "Exception Handling",
        theory: "Exceptions separate error handling from business logic. Checked exceptions must be handled (try-catch or throws). Unchecked (RuntimeException) can be left unhandled but indicate bugs.",
        code: `public class ExceptionDemo {

    // Checked exception — must declare or handle
    public static String readFile(String path) throws IOException {
        return Files.readString(Path.of(path));
    }

    public static int divide(int a, int b) {
        if (b == 0) throw new ArithmeticException("Division by zero!");
        return a / b;
    }

    public static void main(String[] args) {
        // Try-catch-finally
        try {
            int result = divide(10, 0);
        } catch (ArithmeticException e) {
            System.out.println("Caught: " + e.getMessage());
        } finally {
            System.out.println("Always runs");
        }

        // Try-with-resources (auto-closes)
        try (var br = new BufferedReader(new FileReader("file.txt"))) {
            System.out.println(br.readLine());
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}`,
        tip: "Catch specific exceptions before general ones. Never catch Exception or Throwable unless you have a very good reason."
      },
      {
        title: "Generics & Lambdas",
        theory: "Generics provide type safety at compile time — no casting needed. Lambdas (Java 8+) are anonymous functions that implement functional interfaces, enabling cleaner functional-style code.",
        code: `// Generic method
public static <T extends Comparable<T>> T findMax(List<T> list) {
    return list.stream().max(Comparator.naturalOrder()).orElseThrow();
}

// Lambda expressions
List<Integer> nums = Arrays.asList(5, 2, 8, 1, 9);

// Sort with lambda
nums.sort((a, b) -> a - b);

// Filter + map + collect
List<Integer> result = nums.stream()
    .filter(n -> n > 3)
    .map(n -> n * n)
    .collect(Collectors.toList());

// Method reference
nums.forEach(System.out::println);

// Functional interface
Predicate<String> isLong = s -> s.length() > 5;
System.out.println(isLong.test("Hello"));   // false
System.out.println(isLong.test("Hello World")); // true`,
        tip: "Learn Predicate, Function, Consumer, Supplier — these 4 functional interfaces cover 90% of use cases."
      },
    ]
  },

  python: {
    label: "Python", icon: "🐍", color: "#22c55e",
    topics: [
      {
        title: "Variables & Data Types",
        theory: "Python is dynamically typed — no need to declare types. Everything is an object. Python has four main built-in types: int, float, str, bool. Type is determined at runtime.",
        code: `# Basic types — no declaration needed
name    = "Ravi Kumar"     # str
age     = 25               # int
salary  = 75000.50         # float
active  = True             # bool

# Type checking and conversion
print(type(name))          # <class 'str'>
print(int("42"))           # 42
print(float(10))           # 10.0
print(str(100))            # '100'

# Multiple assignment
x, y, z = 1, 2, 3
a = b = c = 0              # all set to 0

# f-strings (Python 3.6+) — preferred
print(f"{name} is {age} years old and earns ₹{salary:,.2f}")`,
        tip: "Use f-strings over .format() or % — they're faster and more readable."
      },
      {
        title: "Lists, Tuples & Dicts",
        theory: "Lists are mutable ordered sequences. Tuples are immutable (use for fixed data). Dictionaries map keys to values and are ordered since Python 3.7. Sets store unique elements.",
        code: `# List — mutable, ordered
fruits = ["apple", "banana", "mango"]
fruits.append("grape")
fruits.sort()
print(fruits[0])           # apple (index)
print(fruits[-1])          # grape (last)
print(fruits[1:3])         # ['banana', 'mango'] (slice)

# List comprehension
squares = [x**2 for x in range(1, 6)]  # [1,4,9,16,25]

# Tuple — immutable
coords = (10.5, 20.3)

# Dictionary
person = {"name": "Ravi", "age": 25, "city": "Chennai"}
person["email"] = "ravi@example.com"    # add
person.get("phone", "N/A")             # safe get
for key, val in person.items():
    print(f"{key}: {val}")

# Set — unique values only
tags = {"python", "sql", "python"}     # {'python', 'sql'}`,
        tip: "Use dict.get(key, default) instead of dict[key] to avoid KeyError crashes."
      },
      {
        title: "Functions & Lambdas",
        theory: "Functions are first-class in Python — they can be passed as arguments, returned, and stored in variables. *args collects extra positional args, **kwargs collects keyword args.",
        code: `# Basic function with default args
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

print(greet("Ravi"))           # Hello, Ravi!
print(greet("Ravi", "Hi"))    # Hi, Ravi!

# *args and **kwargs
def describe(*args, **kwargs):
    print("Args:", args)
    print("Kwargs:", kwargs)

describe(1, 2, 3, city="Chennai", lang="Python")

# Lambda (anonymous function)
square = lambda x: x ** 2
double = lambda x: x * 2

# Higher-order functions
nums = [3, 1, 4, 1, 5, 9, 2, 6]
print(sorted(nums))                              # sort
print(list(filter(lambda x: x > 3, nums)))      # filter
print(list(map(lambda x: x * 2, nums)))         # map
print(sum(x**2 for x in nums if x > 3))         # generator`,
        tip: "Prefer list comprehensions over map/filter for readability. Use lambdas only for short one-liners."
      },
      {
        title: "OOP in Python",
        theory: "Python OOP uses class keyword. __init__ is the constructor. self refers to the current instance. Python supports multiple inheritance. Dunder methods (__str__, __len__) customise built-in behaviour.",
        code: `class BankAccount:
    bank_name = "ThopsTech Bank"   # class variable (shared)

    def __init__(self, owner, balance=0):
        self.owner   = owner       # instance variable
        self.__balance = balance   # private (name mangling)

    def deposit(self, amount):
        if amount > 0:
            self.__balance += amount
        return self

    def withdraw(self, amount):
        if amount > self.__balance:
            raise ValueError("Insufficient funds")
        self.__balance -= amount
        return self

    @property
    def balance(self):             # getter property
        return self.__balance

    def __str__(self):
        return f"{self.owner}: ₹{self.__balance:,}"

# Usage
acc = BankAccount("Ravi", 5000)
acc.deposit(1000).withdraw(500)    # method chaining
print(acc)                         # Ravi: ₹5,500
print(acc.balance)                 # 5500`,
        tip: "Use @property instead of getBalance() style methods — it's more Pythonic and readable."
      },
      {
        title: "File I/O & Error Handling",
        theory: "Python uses try/except for error handling. 'with' statement auto-closes files. Exception hierarchy: BaseException → Exception → specific types. Always catch specific exceptions.",
        code: `# File reading — always use 'with'
with open("data.txt", "r", encoding="utf-8") as f:
    content = f.read()             # entire file
    # or: for line in f: process line

# File writing
with open("output.txt", "w") as f:
    f.write("Hello, World!\\n")
    f.writelines(["Line 1\\n", "Line 2\\n"])

# Exception handling
try:
    result = 10 / 0
except ZeroDivisionError as e:
    print(f"Math error: {e}")
except (ValueError, TypeError) as e:
    print(f"Value/Type error: {e}")
except Exception as e:
    print(f"Unexpected: {e}")
else:
    print("No error occurred")     # runs if no exception
finally:
    print("Always runs")           # cleanup code here

# Custom exception
class InsufficientFundsError(Exception):
    def __init__(self, amount):
        super().__init__(f"Need ₹{amount} more")`,
        tip: "The 'else' block in try/except runs only if NO exception occurred — use it for code that should only run on success."
      },
      {
        title: "Libraries: NumPy & Pandas",
        theory: "NumPy provides fast array operations (vectorised — no loops needed). Pandas provides DataFrame for tabular data analysis. Both are essential for data science in Python.",
        code: `import numpy as np
import pandas as pd

# NumPy arrays
arr = np.array([1, 2, 3, 4, 5])
print(arr * 2)             # [2 4 6 8 10] — no loop needed!
print(arr.mean())          # 3.0
print(arr[arr > 2])        # [3 4 5] — boolean indexing

matrix = np.zeros((3, 3))  # 3x3 zero matrix
eye    = np.eye(3)          # 3x3 identity matrix

# Pandas DataFrame
data = {
    "name":   ["Alice", "Bob", "Carol"],
    "score":  [85,      92,    78    ],
    "grade":  ["B",     "A",   "C"   ],
}
df = pd.DataFrame(data)

print(df[df["score"] > 80])    # filter rows
print(df.groupby("grade").mean(numeric_only=True))  # group
df["passed"] = df["score"] >= 80   # new column
df.sort_values("score", ascending=False, inplace=True)`,
        tip: "NumPy operations are 100x faster than Python loops for arrays. Always prefer vectorised operations."
      },
    ]
  }
};

/* ── Quiz questions for popup ── */
const POPUP_QUESTIONS = [
  { q:"What does SQL stand for?", opts:["Structured Query Language","Simple Query Logic","Standard Query List","System Query Language"], ans:0 },
  { q:"Which Python method adds an item to the end of a list?", opts:["add()","insert()","append()","push()"], ans:2 },
  { q:"In Java, which access modifier makes a field accessible only within its class?", opts:["public","protected","default","private"], ans:3 },
  { q:"What does GROUP BY do in SQL?", opts:["Sorts rows","Filters rows","Groups rows by column value","Joins tables"], ans:2 },
  { q:"Which of these is NOT a Python data type?", opts:["dict","tuple","array","list"], ans:2 },
  { q:"In OOP, what is inheritance?", opts:["Hiding data","Child class reusing parent class properties","Creating objects","Multiple functions"], ans:1 },
  { q:"What does SELECT DISTINCT do?", opts:["Returns only duplicate rows","Returns unique rows","Orders results","Filters NULLs"], ans:1 },
  { q:"What is a Python lambda?", opts:["A class method","A loop","An anonymous one-line function","A file reader"], ans:2 },
  { q:"What is the time complexity of searching a HashSet?", opts:["O(n)","O(log n)","O(1) average","O(n²)"], ans:2 },
  { q:"Which SQL clause filters groups?", opts:["WHERE","HAVING","FILTER","GROUP"], ans:1 },
  { q:"What is 'self' in Python?", opts:["A keyword","Reference to the current instance","A built-in function","A module"], ans:1 },
  { q:"In Java, what is method overriding?", opts:["Same name, different class","Child class redefines parent method","Two methods, same params","None"], ans:1 },
  { q:"What does an INDEX do in SQL?", opts:["Encrypts data","Speeds up SELECT queries","Renames columns","Deletes rows"], ans:1 },
  { q:"Which Python keyword is used for exception handling?", opts:["catch","error","except","handle"], ans:2 },
  { q:"What is encapsulation in OOP?", opts:["Inheriting methods","Hiding internal state via access control","Multiple classes","Method overloading"], ans:1 },
];

const LETTERS = ["A","B","C","D"];
const POPUP_INTERVAL = 30 * 60 * 1000; // 30 minutes

/* ── Styles ── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  body { background:#060a14; }

  .sd-root { min-height:100vh; background:#060a14; font-family:'DM Mono',monospace; }
  .sd-grid  { position:fixed; inset:0; background-image:linear-gradient(rgba(0,172,193,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,172,193,.03) 1px,transparent 1px); background-size:40px 40px; pointer-events:none; z-index:0; }

  /* Nav */
  .sd-nav { position:sticky; top:0; z-index:100; display:flex; align-items:center; justify-content:space-between; padding:14px 32px; background:rgba(6,10,20,.95); border-bottom:1px solid rgba(0,172,193,.1); backdrop-filter:blur(10px); flex-wrap:wrap; gap:10px; }
  .sd-brand { display:flex; align-items:center; gap:10px; }
  .sd-dot   { width:8px; height:8px; border-radius:50%; background:#22c55e; box-shadow:0 0 10px #22c55e; animation:pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1);}50%{opacity:.5;transform:scale(.8);} }
  .sd-brand-text { font-family:'Syne',sans-serif; font-size:14px; font-weight:700; color:#22c55e; letter-spacing:1px; }
  .sd-nav-right  { display:flex; align-items:center; gap:16px; }
  .sd-greeting   { font-size:11px; color:#64748b; }
  .sd-greeting span { color:#22c55e; }
  .sd-time { font-size:11px; color:#334155; display:flex; align-items:center; gap:5px; }
  .sd-time-dot { width:5px; height:5px; border-radius:50%; background:#22c55e; animation:pulse 1.5s infinite; }
  .sd-logout { padding:6px 14px; background:transparent; border:1px solid rgba(239,68,68,.3); border-radius:8px; font-family:'DM Mono',monospace; font-size:11px; color:#ef4444; cursor:pointer; transition:all .2s; }
  .sd-logout:hover { background:rgba(239,68,68,.08); }

  /* Body */
  .sd-body { position:relative; z-index:1; max-width:1100px; margin:0 auto; padding:36px 24px 80px; }

  /* Profile strip */
  .sd-profile { background:rgba(15,23,42,.8); border:1px solid rgba(34,197,94,.12); border-radius:16px; padding:18px 22px; margin-bottom:32px; display:flex; align-items:center; gap:16px; flex-wrap:wrap; }
  .sd-avatar  { width:46px; height:46px; border-radius:50%; background:linear-gradient(135deg,#22c55e,#16a34a); display:flex; align-items:center; justify-content:center; font-family:'Syne',sans-serif; font-size:18px; font-weight:800; color:#fff; flex-shrink:0; }
  .sd-pname   { font-family:'Syne',sans-serif; font-size:15px; font-weight:700; color:#f1f5f9; margin-bottom:3px; }
  .sd-pmeta   { font-size:11px; color:#64748b; }
  .sd-ptags   { display:flex; gap:8px; margin-left:auto; flex-wrap:wrap; }
  .sd-ptag    { padding:3px 11px; border-radius:20px; font-size:11px; }
  .t-stream   { background:rgba(34,197,94,.1); border:1px solid rgba(34,197,94,.25); color:#22c55e; }
  .t-college  { background:rgba(0,172,193,.1);  border:1px solid rgba(0,172,193,.25);  color:#00ACC1; }

  /* Section title */
  .sd-section { font-family:'Syne',sans-serif; font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#475569; margin-bottom:18px; display:flex; align-items:center; gap:10px; }
  .sd-section::after { content:''; flex:1; height:1px; background:rgba(148,163,184,.08); }

  /* Assessment cards */
  .sd-cards { display:grid; grid-template-columns:1fr 1fr; gap:18px; margin-bottom:44px; }
  @media(max-width:580px){.sd-cards{grid-template-columns:1fr;}}
  .sd-card { background:rgba(15,23,42,.8); border:1.5px solid rgba(148,163,184,.1); border-radius:20px; padding:28px 24px; cursor:pointer; transition:all .25s; }
  .sd-card.practice:hover { border-color:rgba(34,197,94,.4); box-shadow:0 12px 40px rgba(34,197,94,.1); transform:translateY(-3px); }
  .sd-card.test:hover     { border-color:rgba(0,172,193,.4);  box-shadow:0 12px 40px rgba(0,172,193,.1);  transform:translateY(-3px); }
  .sd-card-icon  { font-size:36px; margin-bottom:14px; }
  .sd-card-title { font-family:'Syne',sans-serif; font-size:20px; font-weight:800; color:#f1f5f9; margin-bottom:8px; }
  .sd-card-desc  { font-size:12px; color:#64748b; line-height:1.7; margin-bottom:18px; }
  .sd-pills { display:flex; flex-wrap:wrap; gap:7px; margin-bottom:20px; }
  .pill { padding:3px 10px; border-radius:20px; font-size:10px; font-weight:600; }
  .p-green  { background:rgba(34,197,94,.1); border:1px solid rgba(34,197,94,.25); color:#22c55e; }
  .p-cyan   { background:rgba(0,172,193,.1); border:1px solid rgba(0,172,193,.25); color:#00ACC1; }
  .p-orange { background:rgba(249,115,22,.1);border:1px solid rgba(249,115,22,.25);color:#f97316; }
  .sd-card-btn { width:100%; padding:11px; border:none; border-radius:10px; font-family:'Syne',sans-serif; font-size:13px; font-weight:700; color:#fff; cursor:pointer; }
  .btn-p { background:linear-gradient(135deg,#22c55e,#16a34a); }
  .btn-t { background:linear-gradient(135deg,#00ACC1,#0891b2); }

  /* Learn cards */
  .learn-cards { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:44px; }
  @media(max-width:700px){.learn-cards{grid-template-columns:1fr;}}
  .learn-card { border-radius:16px; padding:24px; cursor:pointer; transition:all .25s; border:1.5px solid; }
  .learn-card:hover { transform:translateY(-3px); box-shadow:0 12px 40px rgba(0,0,0,.3); }
  .learn-card-icon  { font-size:32px; margin-bottom:12px; }
  .learn-card-title { font-family:'Syne',sans-serif; font-size:18px; font-weight:800; color:#f1f5f9; margin-bottom:6px; }
  .learn-card-desc  { font-size:12px; color:#94a3b8; line-height:1.6; margin-bottom:16px; }
  .learn-card-count { font-size:11px; font-weight:600; }
  .learn-card-btn   { width:100%; padding:10px; border:none; border-radius:10px; font-family:'Syne',sans-serif; font-size:12px; font-weight:700; color:#fff; cursor:pointer; }

  /* ── Learn Hub ── */
  .hub-wrap { animation:fadeIn .3s ease; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)} }
  .hub-back { padding:8px 18px; background:transparent; border:1px solid rgba(148,163,184,.2); border-radius:8px; font-family:'DM Mono',monospace; font-size:11px; color:#94a3b8; cursor:pointer; margin-bottom:24px; transition:all .2s; }
  .hub-back:hover { border-color:rgba(148,163,184,.4); color:#e2e8f0; }
  .hub-layout { display:grid; grid-template-columns:220px 1fr; gap:24px; }
  @media(max-width:700px){.hub-layout{grid-template-columns:1fr;}}
  .hub-sidebar { background:rgba(15,23,42,.8); border:1px solid rgba(148,163,184,.08); border-radius:14px; padding:16px; height:fit-content; }
  .hub-sidebar-title { font-size:10px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#475569; margin-bottom:14px; padding-bottom:10px; border-bottom:1px solid rgba(148,163,184,.08); }
  .hub-topic { padding:10px 12px; border-radius:9px; cursor:pointer; font-size:12px; color:#94a3b8; transition:all .2s; margin-bottom:4px; }
  .hub-topic:hover { background:rgba(148,163,184,.06); color:#e2e8f0; }
  .hub-topic.active { color:#fff; font-weight:600; }
  .hub-content { background:rgba(15,23,42,.8); border:1px solid rgba(148,163,184,.08); border-radius:14px; padding:28px; }
  .hub-content-title { font-family:'Syne',sans-serif; font-size:20px; font-weight:800; color:#f1f5f9; margin-bottom:14px; }
  .hub-theory { font-size:13px; color:#94a3b8; line-height:1.8; margin-bottom:20px; padding:16px; background:rgba(6,10,20,.5); border-radius:10px; border-left:3px solid; }
  .hub-code-label { font-size:10px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#475569; margin-bottom:8px; }
  .hub-code { background:#0a0f1a; border-radius:10px; padding:18px; font-family:'DM Mono',monospace; font-size:12px; line-height:1.7; white-space:pre; overflow-x:auto; margin-bottom:16px; border:1px solid rgba(148,163,184,.06); }
  .hub-tip { display:flex; align-items:flex-start; gap:10px; padding:12px 16px; background:rgba(250,204,21,.06); border:1px solid rgba(250,204,21,.2); border-radius:10px; font-size:12px; color:#fbbf24; line-height:1.6; }
  .hub-nav { display:flex; justify-content:space-between; margin-top:24px; }
  .hub-nav-btn { padding:9px 18px; border-radius:9px; font-family:'DM Mono',monospace; font-size:12px; font-weight:600; cursor:pointer; transition:all .2s; border:1px solid rgba(148,163,184,.15); background:transparent; color:#94a3b8; }
  .hub-nav-btn:hover:not(:disabled) { border-color:rgba(148,163,184,.4); color:#e2e8f0; }
  .hub-nav-btn:disabled { opacity:.3; cursor:default; }
  .hub-progress { font-size:11px; color:#475569; align-self:center; }

  /* ── 30-min Quiz Popup ── */
  .popup-overlay { position:fixed; inset:0; background:rgba(3,7,15,.85); z-index:9999; display:flex; align-items:center; justify-content:center; padding:20px; backdrop-filter:blur(4px); animation:fadeIn .25s ease; }
  .popup-card { background:#0f172a; border:1px solid rgba(0,172,193,.25); border-radius:20px; padding:32px; width:100%; max-width:500px; box-shadow:0 0 80px rgba(0,172,193,.1); animation:popIn .4s cubic-bezier(.16,1,.3,1); }
  @keyframes popIn { from{opacity:0;transform:scale(.9)} to{opacity:1;transform:scale(1)} }
  .popup-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; }
  .popup-badge { padding:4px 12px; background:rgba(0,172,193,.15); border:1px solid rgba(0,172,193,.3); border-radius:20px; font-size:10px; color:#00ACC1; font-weight:700; letter-spacing:1px; }
  .popup-title { font-family:'Syne',sans-serif; font-size:18px; font-weight:800; color:#f1f5f9; margin-bottom:16px; }
  .popup-q { font-size:14px; color:#cbd5e1; line-height:1.7; margin-bottom:20px; padding:16px; background:rgba(0,172,193,.05); border:1px solid rgba(0,172,193,.1); border-radius:10px; }
  .popup-opts { display:flex; flex-direction:column; gap:10px; margin-bottom:16px; }
  .popup-opt { padding:11px 15px; background:rgba(15,23,42,.9); border:1.5px solid rgba(148,163,184,.12); border-radius:10px; font-size:13px; color:#cbd5e1; cursor:pointer; transition:all .2s; display:flex; align-items:center; gap:10px; }
  .popup-opt:hover:not(.locked) { border-color:rgba(0,172,193,.4); }
  .popup-opt.selected { border-color:#00ACC1; background:rgba(0,172,193,.1); color:#fff; }
  .popup-opt.correct  { border-color:#22c55e; background:rgba(34,197,94,.1); color:#86efac; }
  .popup-opt.wrong    { border-color:#ef4444; background:rgba(239,68,68,.08); color:#fca5a5; }
  .popup-opt.locked   { cursor:default; }
  .popup-opt-letter { width:24px; height:24px; border-radius:50%; background:rgba(0,172,193,.15); color:#00ACC1; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; flex-shrink:0; }
  .popup-result { padding:12px 16px; border-radius:10px; font-size:13px; margin-bottom:16px; }
  .popup-result.correct { background:rgba(34,197,94,.1);  border:1px solid rgba(34,197,94,.25);  color:#86efac; }
  .popup-result.wrong   { background:rgba(239,68,68,.08); border:1px solid rgba(239,68,68,.25); color:#fca5a5; }
  .popup-dismiss { width:100%; padding:12px; background:linear-gradient(135deg,#00ACC1,#0891b2); border:none; border-radius:10px; font-family:'Syne',sans-serif; font-size:14px; font-weight:700; color:#fff; cursor:pointer; }
`;

function LiveTime() {
  const [t, setT] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setT(new Date()), 1000); return () => clearInterval(id); }, []);
  return (
    <span className="sd-time">
      <span className="sd-time-dot" />
      {t.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", second:"2-digit" })}
    </span>
  );
}

/* ── 30-min Quiz Popup ── */
function QuizPopup({ onDismiss }) {
  const q = POPUP_QUESTIONS[Math.floor(Math.random() * POPUP_QUESTIONS.length)];
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);

  const handleSelect = (i) => {
    if (answered) return;
    setSelected(i);
    setAnswered(true);
  };

  const optClass = (i) => {
    let c = "popup-opt";
    if (!answered) return c;
    c += " locked";
    if (i === q.ans) return c + " correct";
    if (i === selected) return c + " wrong";
    return c;
  };

  return (
    <div className="popup-overlay">
      <div className="popup-card">
        <div className="popup-header">
          <span className="popup-badge">⏰ 30-MIN QUIZ</span>
        </div>
        <div className="popup-title">Quick Question!</div>
        <div className="popup-q">{q.q}</div>
        <div className="popup-opts">
          {q.opts.map((opt, i) => (
            <div key={i} className={optClass(i)} onClick={() => handleSelect(i)}>
              <span className="popup-opt-letter">{LETTERS[i]}</span>
              {opt}
            </div>
          ))}
        </div>
        {answered && (
          <div className={`popup-result ${selected === q.ans ? "correct" : "wrong"}`}>
            {selected === q.ans
              ? "✅ Correct! Great job!"
              : `❌ Wrong — correct answer: ${q.opts[q.ans]}`}
          </div>
        )}
        {answered && (
          <button className="popup-dismiss" onClick={onDismiss}>Got it! Continue →</button>
        )}
      </div>
    </div>
  );
}

/* ── Learn Hub ── */
function LearnHub({ lang, onBack }) {
  const content = LEARN_CONTENT[lang];
  const [topicIdx, setTopicIdx] = useState(0);
  const topic = content.topics[topicIdx];

  return (
    <div className="hub-wrap">
      <button className="hub-back" onClick={onBack}>← Back to Dashboard</button>
      <div className="sd-section">{content.icon} Learn {content.label}</div>
      <div className="hub-layout">
        {/* Sidebar */}
        <div className="hub-sidebar">
          <div className="hub-sidebar-title">Topics</div>
          {content.topics.map((t, i) => (
            <div key={i}
              className={`hub-topic${topicIdx === i ? " active" : ""}`}
              style={ topicIdx === i ? { background:`rgba(${lang==="sql"?"249,115,22":lang==="java"?"245,158,11":"34,197,94"},.12)`, color:content.color } : {}}
              onClick={() => setTopicIdx(i)}>
              {i + 1}. {t.title}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="hub-content">
          <div className="hub-content-title">{topic.title}</div>
          <div className="hub-theory" style={{ borderColor: content.color }}>
            {topic.theory}
          </div>
          <div className="hub-code-label">Code Example</div>
          <pre className="hub-code" style={{ color: content.color }}>{topic.code}</pre>
          <div className="hub-tip">💡 <span>{topic.tip}</span></div>
          <div className="hub-nav">
            <button className="hub-nav-btn" onClick={() => setTopicIdx(i => i-1)} disabled={topicIdx===0}>← Previous</button>
            <span className="hub-progress">{topicIdx+1} / {content.topics.length}</span>
            <button className="hub-nav-btn" onClick={() => setTopicIdx(i => i+1)} disabled={topicIdx===content.topics.length-1}>Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main StudentDashboard ── */
export default function StudentDashboard({ profile, onModeSelect, onSignOut }) {
  const [view,         setView]         = useState("home");  // 'home' | 'sql' | 'java' | 'python'
  const [showQuizPop,  setShowQuizPop]  = useState(false);
  const popupTimer = useRef(null);

  const firstName = profile?.name?.split(" ")[0] || "Student";
  const initial   = firstName.charAt(0).toUpperCase();
  const greeting  = (() => { const h=new Date().getHours(); return h<12?"Good morning":h<17?"Good afternoon":"Good evening"; })();

  /* 30-min quiz popup timer */
  useEffect(() => {
    popupTimer.current = setInterval(() => {
      setShowQuizPop(true);
    }, POPUP_INTERVAL);
    return () => clearInterval(popupTimer.current);
  }, []);

  const handleQuizDismiss = () => {
    setShowQuizPop(false);
    // Reset timer after dismissal
    clearInterval(popupTimer.current);
    popupTimer.current = setInterval(() => setShowQuizPop(true), POPUP_INTERVAL);
  };

  const LEARN_CARDS = [
    { key:"sql",    icon:"🗄️", color:"#f97316", border:"rgba(249,115,22,.3)", bg:"rgba(249,115,22,.05)", btnColor:"#f97316",
      title:"SQL",    desc:"Master SELECT, JOINs, GROUP BY, subqueries, indexes and query optimisation." },
    { key:"java",   icon:"☕", color:"#f59e0b", border:"rgba(245,158,11,.3)", bg:"rgba(245,158,11,.05)", btnColor:"#d97706",
      title:"Java",   desc:"Learn OOP, collections, exceptions, generics and Java 8+ features." },
    { key:"python", icon:"🐍", color:"#22c55e", border:"rgba(34,197,94,.3)",  bg:"rgba(34,197,94,.05)",  btnColor:"#16a34a",
      title:"Python", desc:"Cover data types, functions, OOP, file I/O, NumPy and Pandas basics." },
  ];

  if (view !== "home") {
    return (
      <>
        <style>{css}</style>
        <div className="sd-root">
          <div className="sd-grid" />
          <nav className="sd-nav">
            <div className="sd-brand"><div className="sd-dot" /><span className="sd-brand-text">ThopsTech · Student Portal</span></div>
            <div className="sd-nav-right">
              <LiveTime />
              <span className="sd-greeting">{greeting}, <span>{firstName}</span></span>
              <button className="sd-logout" onClick={onSignOut}>Sign Out</button>
            </div>
          </nav>
          <div className="sd-body">
            <LearnHub lang={view} onBack={() => setView("home")} />
          </div>
          {showQuizPop && <QuizPopup onDismiss={handleQuizDismiss} />}
        </div>
      </>
    );
  }

  return (
    <>
      <style>{css}</style>
      <div className="sd-root">
        <div className="sd-grid" />

        {/* 30-min Quiz Popup */}
        {showQuizPop && <QuizPopup onDismiss={handleQuizDismiss} />}

        {/* Nav */}
        <nav className="sd-nav">
          <div className="sd-brand">
            <div className="sd-dot" />
            <span className="sd-brand-text">ThopsTech · Student Portal</span>
          </div>
          <div className="sd-nav-right">
            <LiveTime />
            <span className="sd-greeting">{greeting}, <span>{firstName}</span></span>
            <button className="sd-logout" onClick={onSignOut}>Sign Out</button>
          </div>
        </nav>

        <div className="sd-body">

          {/* Profile strip */}
          <div className="sd-profile">
            <div className="sd-avatar">{initial}</div>
            <div>
              <div className="sd-pname">{profile?.name}</div>
              <div className="sd-pmeta">{profile?.email}{profile?.phone && ` · ${profile.phone}`}</div>
            </div>
            <div className="sd-ptags">
              {profile?.stream  && <span className="sd-ptag t-stream">📚 {profile.stream}</span>}
              {profile?.college && <span className="sd-ptag t-college">🏫 {profile.college}</span>}
            </div>
          </div>

          {/* Assessment */}
          <div className="sd-section">Assessment Modes</div>
          <div className="sd-cards">
            <div className="sd-card practice" onClick={() => onModeSelect("practice")}>
              <div className="sd-card-icon">📚</div>
              <div className="sd-card-title">Practice</div>
              <div className="sd-card-desc">All questions, no timer. Code freely, run tests, and learn at your own pace.</div>
              <div className="sd-pills">
                <span className="pill p-green">All Questions</span>
                <span className="pill p-green">No Timer</span>
                <span className="pill p-green">Unlimited</span>
              </div>
              <button className="sd-card-btn btn-p">Start Practice →</button>
            </div>
            <div className="sd-card test" onClick={() => onModeSelect("test")}>
              <div className="sd-card-icon">🎯</div>
              <div className="sd-card-title">Take Test</div>
              <div className="sd-card-desc">5 coding + 10 aptitude + 5 SQL. 75 minutes. Score recorded to your profile.</div>
              <div className="sd-pills">
                <span className="pill p-cyan">10+20+10 Qs</span>
                <span className="pill p-orange">⏱ 80 Minutes</span>
                <span className="pill p-cyan">Score Saved</span>
              </div>
              <button className="sd-card-btn btn-t">Start Test →</button>
            </div>
          </div>

          {/* Learn */}
          <div className="sd-section">Learn · Structured Materials</div>
          <div className="learn-cards">
            {LEARN_CARDS.map(c => (
              <div key={c.key} className="learn-card"
                style={{ background:c.bg, borderColor:c.border }}
                onClick={() => setView(c.key)}>
                <div className="learn-card-icon">{c.icon}</div>
                <div className="learn-card-title" style={{ color:c.color }}>{c.title}</div>
                <div className="learn-card-desc">{c.desc}</div>
                <div className="learn-card-count" style={{ color:c.color, marginBottom:14 }}>
                  {LEARN_CONTENT[c.key].topics.length} Topics
                </div>
                <button className="learn-card-btn" style={{ background:c.btnColor }}>
                  Start Learning →
                </button>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}