const courseName: string = "Leap 2026";
const sprint: number = 5; // integers and decimals are both `number`
const isActive: boolean = true;
const bigCount: bigint = 9007199254740993n;
const uniqueId: symbol = Symbol("id");
const nothing: null = null;
const notAssigned: undefined = undefined;

const name: any = "Edward Im";

function test(word: string):string{
    return "hello world";
}

console.log("hello world")


interface Student{
    id: number,
    name: string,
    email: string,
    age?: number,
    greeting():void
}

const me: Student = {
    id:1,
    name:"Edward Im",
    email:"eim@fidelity.com",
    age:22,
    greeting:function(){
        console.log("Hello!")
    }
}