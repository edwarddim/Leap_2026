# Parsing Through CSV Files

Reading, transforming, and writing CSV files with the csv module and pandas.

## Table of Contents

1. [Reading with `csv.reader`](#1-reading-with-csvreader)
2. [Reading with `csv.DictReader` (Recommended)](#2-reading-with-csvdictreader-recommended)
3. [Common Parsing Tasks](#3-common-parsing-tasks)
4. [Writing CSV Files](#4-writing-csv-files)
5. [Handling Messy CSVs](#5-handling-messy-csvs)
6. [Processing Large CSV Files](#6-processing-large-csv-files)
7. [Using pandas (When Available)](#7-using-pandas-when-available)
8. [Putting It Together: A Small CSV Report Script](#8-putting-it-together-a-small-csv-report-script)

---

Example file used throughout this section (`employees.csv`):

```csv
id,name,department,salary,start_date
1,Alice,Engineering,95000,2020-03-15
2,Bob,Marketing,62000,2019-07-01
3,Carol,Engineering,105000,2018-11-20
4,Dan,Sales,58000,2021-01-10
5,Eve,Marketing,71000,2022-05-30
```

## 1. Reading with `csv.reader`

Each row comes back as a **list of strings**.

```python
import csv

with open("employees.csv", newline="", encoding="utf-8") as f:
    reader = csv.reader(f)
    header = next(reader)          # grab the header row
    for row in reader:
        emp_id, name, dept, salary, start = row
        print(name, int(salary))
```

> Always open CSV files with `newline=""`. The `csv` module handles line endings itself, and this prevents blank rows on Windows.

## 2. Reading with `csv.DictReader` (Recommended)

Each row is a **dict** keyed by the header, which makes code more readable and robust to column reordering.

```python
import csv

with open("employees.csv", newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(row["name"], row["department"], float(row["salary"]))
```

> All values are strings. Convert numbers and dates yourself.

## 3. Common Parsing Tasks

**Filter rows**

```python
with open("employees.csv", newline="", encoding="utf-8") as f:
    engineers = [r for r in csv.DictReader(f) if r["department"] == "Engineering"]
```

**Convert types while loading**

```python
from datetime import datetime

def parse_row(row):
    return {
        "id": int(row["id"]),
        "name": row["name"].strip(),
        "department": row["department"],
        "salary": float(row["salary"]),
        "start_date": datetime.strptime(row["start_date"], "%Y-%m-%d").date(),
    }

with open("employees.csv", newline="", encoding="utf-8") as f:
    employees = [parse_row(r) for r in csv.DictReader(f)]
```

**Aggregate (group by and average)**

```python
from collections import defaultdict

salaries_by_dept = defaultdict(list)
for emp in employees:
    salaries_by_dept[emp["department"]].append(emp["salary"])

for dept, salaries in salaries_by_dept.items():
    avg = sum(salaries) / len(salaries)
    print(f"{dept}: avg ${avg:,.2f} across {len(salaries)} employees")
```

**Sort**

```python
top_paid = sorted(employees, key=lambda e: e["salary"], reverse=True)[:3]
```

**Count occurrences**

```python
from collections import Counter
dept_counts = Counter(e["department"] for e in employees)
# Counter({'Engineering': 2, 'Marketing': 2, 'Sales': 1})
```

## 4. Writing CSV Files

**With `csv.writer`**

```python
import csv

rows = [
    ["name", "score"],
    ["Alice", 92],
    ["Bob", 85],
]

with open("scores.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerows(rows)     # or writer.writerow(row) one at a time
```

**With `csv.DictWriter`**

```python
fieldnames = ["name", "department", "salary"]

with open("engineering.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
    writer.writeheader()
    for emp in employees:
        if emp["department"] == "Engineering":
            writer.writerow(emp)   # extra keys ignored thanks to extrasaction
```

## 5. Handling Messy CSVs

**Different delimiters and quoting**

```python
# Tab-separated or semicolon-separated files
reader = csv.reader(f, delimiter="\t")
reader = csv.reader(f, delimiter=";")

# Fields containing commas are usually quoted: "Smith, John",42
# csv handles this automatically. Control output quoting with:
writer = csv.writer(f, quoting=csv.QUOTE_ALL)
```

**Auto-detect the format**

```python
with open("unknown.csv", newline="", encoding="utf-8") as f:
    sample = f.read(2048)
    f.seek(0)
    dialect = csv.Sniffer().sniff(sample)
    has_header = csv.Sniffer().has_header(sample)
    reader = csv.reader(f, dialect)
```

**Encoding issues**

```python
# Excel-exported files often include a BOM; utf-8-sig strips it
open("excel_export.csv", newline="", encoding="utf-8-sig")

# Legacy files may be latin-1 / cp1252
open("old.csv", newline="", encoding="latin-1")
```

**Missing or bad values**

```python
def safe_float(value, default=None):
    try:
        return float(value)
    except (ValueError, TypeError):
        return default

with open("employees.csv", newline="", encoding="utf-8") as f:
    for line_num, row in enumerate(csv.DictReader(f), start=2):
        salary = safe_float(row.get("salary"))
        if salary is None:
            print(f"Line {line_num}: invalid salary {row.get('salary')!r}")
            continue
```

## 6. Processing Large CSV Files

Reading row by row keeps memory use flat regardless of file size. Avoid loading everything into a list when you only need a running result.

```python
def iter_rows(path):
    with open(path, newline="", encoding="utf-8") as f:
        yield from csv.DictReader(f)

total = 0
count = 0
for row in iter_rows("huge.csv"):
    total += float(row["salary"])
    count += 1

print("Average:", total / count if count else 0)
```

## 7. Using pandas (When Available)

For analysis-heavy work, `pandas` is the standard tool. Install with `pip install pandas`.

```python
import pandas as pd

df = pd.read_csv("employees.csv", parse_dates=["start_date"])

df.head()                     # first 5 rows
df.info()                     # columns, types, nulls
df.describe()                 # summary stats

df[df["department"] == "Engineering"]                 # filter
df.groupby("department")["salary"].mean()             # group & aggregate
df.sort_values("salary", ascending=False)             # sort
df["salary_k"] = df["salary"] / 1000                  # new column
df.dropna(subset=["salary"])                          # drop missing

df.to_csv("output.csv", index=False)                  # write back out

# Large files: process in chunks
for chunk in pd.read_csv("huge.csv", chunksize=100_000):
    process(chunk)
```

**`csv` module vs pandas**

| Use the `csv` module when...                 | Use pandas when...                           |
|----------------------------------------------|----------------------------------------------|
| No third-party dependencies allowed          | Doing grouping, joins, pivots, statistics    |
| Streaming huge files row by row              | Data fits comfortably in memory              |
| Simple transforms or filtering               | Exploring or cleaning data interactively     |

## 8. Putting It Together: A Small CSV Report Script

```python
"""Summarize salaries by department from a CSV file."""
import argparse
import csv
from collections import defaultdict
from pathlib import Path


def load_salaries(path: Path) -> dict[str, list[float]]:
    by_dept = defaultdict(list)
    with path.open(newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            try:
                by_dept[row["department"]].append(float(row["salary"]))
            except (KeyError, ValueError):
                continue  # skip malformed rows
    return by_dept


def write_report(by_dept: dict[str, list[float]], out_path: Path) -> None:
    with out_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["department", "headcount", "avg_salary", "max_salary"])
        for dept, salaries in sorted(by_dept.items()):
            writer.writerow([
                dept,
                len(salaries),
                round(sum(salaries) / len(salaries), 2),
                max(salaries),
            ])


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("--output", type=Path, default=Path("report.csv"))
    args = parser.parse_args()

    if not args.input.is_file():
        raise SystemExit(f"Input file not found: {args.input}")

    data = load_salaries(args.input)
    write_report(data, args.output)
    print(f"Wrote {len(data)} departments to {args.output}")


if __name__ == "__main__":
    main()
```

Run it with: `python report.py employees.csv --output summary.csv`

---

## Practice Ideas

1. Read a CSV of transactions, total spending per category, and write the results to a new CSV.
2. Load `Student` records from a CSV (one row per grade) and compute each student's GPA.

## Related Guides

- [Python Basics / Intermediates](01_python_basics.md)
- [Python OS and I/O](02_python_os_and_io.md)
- [Writing Pythonic Code](04_writing_pythonic_code.md)
