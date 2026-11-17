// Inline parameter and return types
const add = (a: number, b: number): number => {
  return a + b;
};

// Shorthand implicit return with inline types
const multiply = (a: number, b: number): number => a * b;

interface Attempt {
  username: string;
  outcome: string;
}

const attempt: Attempt = { username: "alice", outcome: "success" };
console.log(attempt);

function describeOutcome(outcome: string): string {
  if (outcome === "success") {
    return "logged in successfully";
  } else {
    return 432;
  }
}
console.log(describeOutcome("success"));

function describeAttempt(attempt: Attempt): string {
  return `${attempt.username} ${describeOutcome(attempt.outcome)}`;
}
console.log(describeAttempt(attempt));

add("hello", "world")
multiply("hello", "world")

console.log("hello")