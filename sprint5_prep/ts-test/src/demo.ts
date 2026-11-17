// =============================================================
// TypeScript Basics Demo
// Run with:  npx tsx src/demo.ts
// =============================================================
// TypeScript is JavaScript + a type system. Types are checked at
// compile time and then erased, so the output is plain JavaScript.

const section = (title: string): void => {
  console.log(`\n=== ${title} ===`);
};

// -------------------------------------------------------------
// 1. Primitive types
// -------------------------------------------------------------
section("1. Primitive Types");

const courseName: string = "Leap 2026";
const sprint: number = 5; // integers and decimals are both `number`
const isActive: boolean = true;
const bigCount: bigint = 9007199254740993n;
const uniqueId: symbol = Symbol("id");
const nothing: null = null;
const notAssigned: undefined = undefined;

console.log(courseName, sprint, isActive, bigCount, uniqueId.toString(), nothing, notAssigned);

// Type inference: TS figures out the type from the value.
let score = 100; // inferred as number
score = 95; // ok
// score = "ninety-five"; // Error: Type 'string' is not assignable to type 'number'

// -------------------------------------------------------------
// 2. Arrays and tuples
// -------------------------------------------------------------
section("2. Arrays & Tuples");

const scores: number[] = [90, 85, 77];
const names: Array<string> = ["Ana", "Ben", "Cy"]; // generic syntax, same thing

// A tuple is an array with a fixed length and a type per position.
const point: [number, number] = [10, 20];
const entry: [string, number] = ["Ana", 90];

console.log(scores, names, point, entry);

// Because "noUncheckedIndexedAccess" is on, indexing may be undefined:
const firstScore = scores[0]; // number | undefined
console.log("First score:", firstScore ?? "none");

// -------------------------------------------------------------
// 3. Special types: any, unknown, void, never
// -------------------------------------------------------------
section("3. any / unknown / void / never");

let anything: any = 4;
anything = "turns off type checking"; // allowed, but avoid `any`

let mystery: unknown = "hello";
// mystery.toUpperCase(); // Error: 'mystery' is of type 'unknown'
if (typeof mystery === "string") {
  // Narrowing: inside this block TS knows it's a string
  console.log("unknown narrowed to string:", mystery.toUpperCase());
}

function logMessage(msg: string): void {
  console.log("void function says:", msg); // returns nothing
}
logMessage("hi");

function fail(message: string): never {
  throw new Error(message); // never returns normally
}

console.log("any value:", anything);

// -------------------------------------------------------------
// 4. Union and literal types
// -------------------------------------------------------------
section("4. Union & Literal Types");

let id: string | number = "abc-123";
id = 42; // both allowed

type Status = "pending" | "success" | "error"; // only these exact strings

function printStatus(status: Status): string {
  switch (status) {
    case "pending":
      return "⏳ Waiting...";
    case "success":
      return "✅ Done!";
    case "error":
      return "❌ Something went wrong";
    default:
      // If a new Status is added and not handled, this line errors.
      return fail(`Unknown status: ${status satisfies never}`);
  }
}

console.log("id:", id);
console.log(printStatus("success"));
// printStatus("done"); // Error: '"done"' is not assignable to type 'Status'

// -------------------------------------------------------------
// 5. Functions
// -------------------------------------------------------------
section("5. Functions");

// Typed parameters + return type
function add(a: number, b: number): number {
  return a + b;
}

// Optional parameter (?) and default parameter
function greet(name: string, greeting: string = "Hello", punctuation?: string): string {
  return `${greeting}, ${name}${punctuation ?? "."}`;
}

// Arrow function with a function type
const multiply: (x: number, y: number) => number = (x, y) => x * y;

// Rest parameters
const sumAll = (...nums: number[]): number => nums.reduce((total, n) => total + n, 0);

console.log(add(2, 3));
console.log(greet("Eddie"));
console.log(greet("Eddie", "Welcome", "!"));
console.log(multiply(4, 5));
console.log(sumAll(1, 2, 3, 4));
// add("2", 3); // Error: Argument of type 'string' is not assignable to 'number'

// -------------------------------------------------------------
// 6. Interfaces
// -------------------------------------------------------------
section("6. Interfaces");

// An interface describes the *shape* of an object.
interface Student {
  readonly id: number; // cannot be changed after creation
  name: string;
  email: string;
  age?: number; // optional property
}

const student: Student = {
  id: 1,
  name: "Ana",
  email: "ana@example.com",
};

student.name = "Ana Lopez"; // ok
// student.id = 2; // Error: Cannot assign to 'id' because it is read-only
// const bad: Student = { id: 2, name: "Ben" }; // Error: 'email' is missing

console.log(student);
console.log("Age:", student.age ?? "not provided");

// Interfaces can describe methods too
interface Course {
  title: string;
  students: Student[];
  addStudent(s: Student): void;
  count(): number;
}

const tsCourse: Course = {
  title: "TypeScript 101",
  students: [],
  addStudent(s) {
    this.students.push(s);
  },
  count() {
    return this.students.length;
  },
};

tsCourse.addStudent(student);
tsCourse.addStudent({ id: 2, name: "Ben", email: "ben@example.com", age: 24 });
console.log(`${tsCourse.title} has ${tsCourse.count()} students`);

// Extending interfaces (inheritance)
interface Person {
  name: string;
}

interface Instructor extends Person {
  subject: string;
  yearsExperience: number;
}

const instructor: Instructor = {
  name: "Dr. Smith",
  subject: "TypeScript",
  yearsExperience: 10,
};
console.log(instructor);

// Index signatures: objects with unknown keys but known value types
interface GradeBook {
  [studentName: string]: number;
}

const grades: GradeBook = { Ana: 95, Ben: 88 };
grades["Cy"] = 72;
console.log(grades);

// -------------------------------------------------------------
// 7. Type aliases vs. interfaces
// -------------------------------------------------------------
section("7. Type Aliases vs Interfaces");

// `type` can name any type: primitives, unions, tuples, objects...
type ID = string | number;
type Coordinates = { x: number; y: number };

// Intersection (&) combines types, similar to `extends`
type Timestamped = { createdAt: Date };
type Post = { title: string; authorId: ID } & Timestamped;

const post: Post = { title: "Learning TS", authorId: 1, createdAt: new Date() };
const origin: Coordinates = { x: 0, y: 0 };

console.log(post.title, "by author", post.authorId);
console.log("origin:", origin);
// Rule of thumb: use `interface` for object shapes, `type` for unions & everything else.

// -------------------------------------------------------------
// 8. Classes implementing interfaces
// -------------------------------------------------------------
section("8. Classes + Interfaces");

interface Shape {
  name: string;
  area(): number;
}

class Circle implements Shape {
  name = "Circle";
  constructor(private radius: number) {} // shorthand: declares & assigns
  area(): number {
    return Math.PI * this.radius ** 2;
  }
}

class Rectangle implements Shape {
  name = "Rectangle";
  constructor(
    public width: number,
    public height: number,
  ) {}
  area(): number {
    return this.width * this.height;
  }
}

const shapes: Shape[] = [new Circle(2), new Rectangle(3, 4)];
shapes.forEach((s) => console.log(`${s.name} area: ${s.area().toFixed(2)}`));

// -------------------------------------------------------------
// 9. Generics (a quick taste)
// -------------------------------------------------------------
section("9. Generics");

// <T> is a type parameter: the function works with any type, safely.
function firstItem<T>(items: T[]): T | undefined {
  return items[0];
}

const firstName = firstItem(["Ana", "Ben"]); // string | undefined
const firstNum = firstItem([10, 20]); // number | undefined

interface ApiResponse<T> {
  data: T;
  status: Status;
}

const response: ApiResponse<Student[]> = {
  data: tsCourse.students,
  status: "success",
};

console.log(firstName, firstNum);
console.log(`Response (${response.status}):`, response.data.map((s) => s.name));

// -------------------------------------------------------------
// 10. Enums
// -------------------------------------------------------------
section("10. Enums");

enum Role {
  Student = "STUDENT",
  Instructor = "INSTRUCTOR",
  Admin = "ADMIN",
}

const myRole: Role = Role.Instructor;
console.log("My role:", myRole);

console.log("\nDone! Try uncommenting the lines marked 'Error' to see TypeScript catch them.");
