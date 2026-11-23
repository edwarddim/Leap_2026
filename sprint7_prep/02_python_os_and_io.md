# Python OS and I/O

Working with files, paths, the operating system, standard input/output, command-line arguments, subprocesses, and JSON.

## Table of Contents

1. [Reading and Writing Files](#1-reading-and-writing-files)
2. [Working with Paths: `pathlib` (Recommended)](#2-working-with-paths-pathlib-recommended)
3. [The `os` Module](#3-the-os-module)
4. [`os` vs `pathlib` Quick Reference](#4-os-vs-pathlib-quick-reference)
5. [Copying, Moving, and Deleting with `shutil`](#5-copying-moving-and-deleting-with-shutil)
6. [Standard Input/Output and Command-Line Arguments](#6-standard-inputoutput-and-command-line-arguments)
7. [Running Shell Commands with `subprocess`](#7-running-shell-commands-with-subprocess)
8. [JSON I/O](#8-json-io)
9. [Handling File Errors](#9-handling-file-errors)

---

## 1. Reading and Writing Files

Always use a `with` block (context manager). It closes the file automatically, even if an error occurs.

```python
# Write (creates or overwrites)
with open("notes.txt", "w", encoding="utf-8") as f:
    f.write("First line\n")
    f.write("Second line\n")

# Append
with open("notes.txt", "a", encoding="utf-8") as f:
    f.write("Appended line\n")

# Read the whole file
with open("notes.txt", "r", encoding="utf-8") as f:
    content = f.read()

# Read line by line (memory-efficient for large files)
with open("notes.txt", "r", encoding="utf-8") as f:
    for line in f:
        print(line.rstrip("\n"))

# Read all lines into a list
with open("notes.txt", encoding="utf-8") as f:
    lines = f.readlines()
```

**File modes**

| Mode | Meaning                                      |
|------|----------------------------------------------|
| `r`  | Read (default); error if file doesn't exist  |
| `w`  | Write; truncates existing file               |
| `a`  | Append to end                                |
| `x`  | Create; error if file already exists         |
| `b`  | Binary mode (e.g. `rb`, `wb`)                |
| `+`  | Read and write (e.g. `r+`)                   |

**Binary files**

```python
with open("image.png", "rb") as src, open("copy.png", "wb") as dst:
    dst.write(src.read())
```

## 2. Working with Paths: `pathlib` (Recommended)

`pathlib` is the modern, object-oriented way to handle file paths across operating systems.

```python
from pathlib import Path

p = Path("data") / "reports" / "q1.txt"   # joins paths with /

p.name        # "q1.txt"
p.stem        # "q1"
p.suffix      # ".txt"
p.parent      # Path("data/reports")
p.exists()
p.is_file()
p.is_dir()
p.resolve()   # absolute path

# Create directories
Path("output/logs").mkdir(parents=True, exist_ok=True)

# Quick read/write
Path("hello.txt").write_text("Hi there", encoding="utf-8")
text = Path("hello.txt").read_text(encoding="utf-8")

# List and search
for item in Path(".").iterdir():
    print(item)

for py_file in Path(".").rglob("*.py"):   # recursive search
    print(py_file)

Path.home()   # user's home directory
Path.cwd()    # current working directory
```

## 3. The `os` Module

`os` gives lower-level access to the operating system. You'll see it often in older code.

```python
import os

os.getcwd()                      # current directory
os.chdir("/tmp")                 # change directory
os.listdir(".")                  # list entries
os.makedirs("a/b/c", exist_ok=True)
os.rename("old.txt", "new.txt")
os.remove("file.txt")            # delete a file
os.rmdir("empty_dir")            # delete an empty directory

os.path.join("data", "file.csv")
os.path.exists("file.csv")
os.path.isfile("file.csv")
os.path.getsize("file.csv")      # bytes
os.path.splitext("report.csv")   # ("report", ".csv")
os.path.basename("/a/b/c.txt")   # "c.txt"
os.path.dirname("/a/b/c.txt")    # "/a/b"
```

**Walking a directory tree**

```python
for root, dirs, files in os.walk("project"):
    for filename in files:
        full_path = os.path.join(root, filename)
        print(full_path)
```

**Environment variables**

```python
api_key = os.environ.get("API_KEY", "default-value")
os.environ["MODE"] = "debug"
```

## 4. `os` vs `pathlib` Quick Reference

| Task                | `os` / `os.path`            | `pathlib`                 |
|---------------------|-----------------------------|---------------------------|
| Join paths          | `os.path.join(a, b)`        | `Path(a) / b`             |
| Current dir         | `os.getcwd()`               | `Path.cwd()`              |
| Exists?             | `os.path.exists(p)`         | `Path(p).exists()`        |
| Make dirs           | `os.makedirs(p, exist_ok=True)` | `Path(p).mkdir(parents=True, exist_ok=True)` |
| List dir            | `os.listdir(p)`             | `Path(p).iterdir()`       |
| Find files by glob  | `glob.glob("*.txt")`        | `Path(".").glob("*.txt")` |
| Delete file         | `os.remove(p)`              | `Path(p).unlink()`        |
| File extension      | `os.path.splitext(p)[1]`    | `Path(p).suffix`          |

## 5. Copying, Moving, and Deleting with `shutil`

```python
import shutil

shutil.copy("a.txt", "backup/a.txt")        # copy file
shutil.copy2("a.txt", "backup/a.txt")       # copy file + metadata
shutil.copytree("src_dir", "dst_dir")       # copy whole directory
shutil.move("a.txt", "archive/a.txt")       # move or rename
shutil.rmtree("old_dir")                    # delete directory and contents (careful!)
```

## 6. Standard Input/Output and Command-Line Arguments

```python
# Console input (always returns a string)
name = input("Enter your name: ")
age = int(input("Enter your age: "))

# Printing options
print("a", "b", "c", sep="-")     # a-b-c
print("no newline", end="")

import sys
print("Error!", file=sys.stderr)  # write to standard error
```

**Command-line arguments with `argparse`**

```python
import argparse

parser = argparse.ArgumentParser(description="Process a file")
parser.add_argument("filename", help="Path to input file")
parser.add_argument("--verbose", action="store_true")
parser.add_argument("--limit", type=int, default=10)
args = parser.parse_args()

print(args.filename, args.verbose, args.limit)
```

Run it with: `python script.py data.txt --verbose --limit 5`

## 7. Running Shell Commands with `subprocess`

```python
import subprocess

result = subprocess.run(
    ["ls", "-l"],
    capture_output=True,
    text=True,
    check=True,      # raises CalledProcessError on failure
)
print(result.stdout)
```

> Pass commands as a list and avoid `shell=True` with untrusted input, which can lead to command injection.

## 8. JSON I/O

JSON pairs naturally with file I/O and is the most common format for configs and APIs.

```python
import json

data = {"name": "Alice", "skills": ["python", "sql"]}

with open("data.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)

with open("data.json", encoding="utf-8") as f:
    loaded = json.load(f)

json_string = json.dumps(data)      # dict -> string
parsed = json.loads(json_string)    # string -> dict
```

## 9. Handling File Errors

```python
from pathlib import Path

try:
    text = Path("missing.txt").read_text(encoding="utf-8")
except FileNotFoundError:
    print("File not found")
except PermissionError:
    print("No permission to read file")
except UnicodeDecodeError:
    print("File isn't valid UTF-8")
```

---

## Practice Ideas

1. Write a function that counts word frequencies in a text file and prints the top 10.
2. Walk a folder and list every file larger than 1 MB, sorted by size.
3. Rename every `.jpeg` file in a folder to `.jpg` using `pathlib`.

## Related Guides

- [Python Basics / Intermediates](01_python_basics.md)
- [Parsing Through CSV Files](03_parsing_csv_files.md)
- [Writing Pythonic Code](04_writing_pythonic_code.md)
