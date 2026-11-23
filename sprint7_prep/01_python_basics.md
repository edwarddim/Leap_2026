# Python Basics / Intermediates

Basic and intermediate Python: data types, collections, control flow, functions, error handling, classes, modules, and intermediate tools.

## Table of Contents

1. [Variables and Data Types](#1-variables-and-data-types)
2. [Strings](#2-strings)
3. [Core Collections](#3-core-collections)
4. [Control Flow](#4-control-flow)
5. [Functions](#5-functions)
6. [Comprehensions](#6-comprehensions)
7. [Error Handling](#7-error-handling)
8. [Classes and Objects](#8-classes-and-objects)
9. [Modules and Imports](#9-modules-and-imports)
10. [Intermediate Tools Worth Knowing](#10-intermediate-tools-worth-knowing)

---

## 1. Variables and Data Types

Python is dynamically typed, so you don't declare types. Each value still has a type.

```python
name = "Alice"        # str
age = 30              # int
height = 5.6          # float
is_active = True      # bool
nothing = None        # NoneType

print(type(age))      # <class 'int'>
```

Type conversion:

```python
int("42")       # 42
float("3.14")   # 3.14
str(100)        # "100"
bool(0)         # False (0, "", [], {}, None are all "falsy")
```

## 2. Strings

```python
s = "Hello, World"

s.lower()              # "hello, world"
s.upper()              # "HELLO, WORLD"
s.split(", ")          # ["Hello", "World"]
s.replace("World", "Python")
s.strip()              # removes leading/trailing whitespace
s.startswith("Hello")  # True
len(s)                 # 12

# Slicing: s[start:stop:step]
s[0:5]      # "Hello"
s[-5:]      # "World"
s[::-1]     # "dlroW ,olleH" (reversed)

# f-strings (preferred formatting)
price = 19.5
print(f"{name} is {age} years old")
print(f"Total: ${price:.2f}")   # Total: $19.50
```

## 3. Core Collections

| Type    | Syntax            | Ordered | Mutable | Duplicates |
|---------|-------------------|---------|---------|------------|
| list    | `[1, 2, 3]`       | Yes     | Yes     | Yes        |
| tuple   | `(1, 2, 3)`       | Yes     | No      | Yes        |
| set     | `{1, 2, 3}`       | No      | Yes     | No         |
| dict    | `{"a": 1}`        | Yes*    | Yes     | Keys: No   |

\* Dicts keep insertion order as of Python 3.7.

**Lists**

```python
nums = [3, 1, 4, 1, 5]
nums.append(9)        # add to end
nums.insert(0, 2)     # insert at index
nums.remove(1)        # remove first matching value
last = nums.pop()     # remove and return last item
nums.sort()           # sort in place
sorted_copy = sorted(nums, reverse=True)
```

**Dictionaries**

```python
user = {"name": "Alice", "age": 30}

user["email"] = "alice@example.com"   # add / update
user.get("phone", "N/A")             # safe lookup with default

for key, value in user.items():
    print(key, value)

"name" in user   # True
```

**Sets**

```python
a = {1, 2, 3}
b = {3, 4, 5}
a | b   # union        {1, 2, 3, 4, 5}
a & b   # intersection {3}
a - b   # difference   {1, 2}
```

## 4. Control Flow

```python
score = 85

if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
else:
    grade = "C"

# Ternary expression
status = "pass" if score >= 60 else "fail"
```

**Loops**

```python
for i in range(5):            # 0..4
    print(i)

for index, item in enumerate(["a", "b", "c"]):
    print(index, item)

for name, age in zip(["Al", "Bo"], [30, 25]):
    print(name, age)

count = 0
while count < 3:
    count += 1

# break exits the loop, continue skips to the next iteration
for n in range(10):
    if n == 5:
        break
    if n % 2 == 0:
        continue
    print(n)   # 1, 3
```

## 5. Functions

```python
def greet(name, greeting="Hello"):
    """Return a greeting string."""
    return f"{greeting}, {name}!"

greet("Alice")                 # "Hello, Alice!"
greet("Bob", greeting="Hi")    # keyword argument
```

**`*args` and `**kwargs`**

```python
def summarize(*args, **kwargs):
    print(args)     # tuple of positional args
    print(kwargs)   # dict of keyword args

summarize(1, 2, mode="fast")
# (1, 2)
# {'mode': 'fast'}
```

**Type hints** (optional, but good for readability and tooling)

```python
def add(a: int, b: int) -> int:
    return a + b
```

**Lambda functions**

```python
square = lambda x: x ** 2
people = [("Al", 30), ("Bo", 25)]
people.sort(key=lambda p: p[1])   # sort by age
```

> **Gotcha:** Never use a mutable default argument like `def f(items=[])`. The list is shared across calls. Use `items=None` and create the list inside the function.

## 6. Comprehensions

```python
squares = [x ** 2 for x in range(10)]
evens = [x for x in range(20) if x % 2 == 0]
lookup = {name: len(name) for name in ["Al", "Bob"]}
unique_lengths = {len(w) for w in ["hi", "yo", "hey"]}

# Generator expression: lazy, memory efficient
total = sum(x ** 2 for x in range(1_000_000))
```

## 7. Error Handling

```python
try:
    result = 10 / int(user_input)
except ValueError:
    print("Not a number")
except ZeroDivisionError:
    print("Can't divide by zero")
else:
    print("Success:", result)   # runs only if no exception
finally:
    print("Always runs")        # cleanup
```

Raising your own exceptions:

```python
def withdraw(balance, amount):
    if amount > balance:
        raise ValueError("Insufficient funds")
    return balance - amount
```

## 8. Classes and Objects

```python
class Account:
    bank_name = "PyBank"   # class attribute (shared)

    def __init__(self, owner, balance=0):
        self.owner = owner      # instance attributes
        self.balance = balance

    def deposit(self, amount):
        self.balance += amount
        return self.balance

    def __repr__(self):
        return f"Account({self.owner!r}, {self.balance})"


class SavingsAccount(Account):   # inheritance
    def __init__(self, owner, balance=0, rate=0.02):
        super().__init__(owner, balance)
        self.rate = rate

    def add_interest(self):
        self.balance *= (1 + self.rate)


acct = SavingsAccount("Alice", 1000)
acct.deposit(500)
acct.add_interest()
print(acct)   # Account('Alice', 1530.0)
```

**Dataclasses** reduce boilerplate for data-holding classes:

```python
from dataclasses import dataclass

@dataclass
class Point:
    x: float
    y: float

p = Point(1.0, 2.0)
print(p)   # Point(x=1.0, y=2.0)
```

## 9. Modules and Imports

```python
import math
from collections import Counter, defaultdict
from datetime import datetime as dt

math.sqrt(16)                      # 4.0
Counter("banana")                  # Counter({'a': 3, 'n': 2, 'b': 1})
dt.now().strftime("%Y-%m-%d")
```

Run code only when a file is executed directly (not imported):

```python
def main():
    print("Running")

if __name__ == "__main__":
    main()
```

## 10. Intermediate Tools Worth Knowing

**Generators** produce values lazily with `yield`:

```python
def countdown(n):
    while n > 0:
        yield n
        n -= 1

for x in countdown(3):
    print(x)   # 3, 2, 1
```

**Decorators** wrap a function to add behavior:

```python
import time
from functools import wraps

def timer(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        print(f"{func.__name__} took {time.perf_counter() - start:.4f}s")
        return result
    return wrapper

@timer
def slow_add(a, b):
    time.sleep(0.5)
    return a + b
```

**Useful `collections`**

```python
from collections import defaultdict, Counter, deque

groups = defaultdict(list)
groups["fruit"].append("apple")   # no KeyError

Counter(["a", "b", "a"]).most_common(1)   # [('a', 2)]

q = deque([1, 2, 3])
q.appendleft(0)
q.pop()
```

---

## Practice Ideas

1. Build a `Student` class that stores a name and a list of grades, with a method that computes a GPA.

## Related Guides

- [Python OS and I/O](02_python_os_and_io.md)
- [Parsing Through CSV Files](03_parsing_csv_files.md)
- [Writing Pythonic Code](04_writing_pythonic_code.md)
