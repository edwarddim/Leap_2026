// SOLUTIONS for intro-to-maps-filter.js
// Run with: node intro-to-maps-filter-solutions.js
// Most problems can be solved more than one way. These are just one way to do each.

const pokemons = Object.freeze([
    { "id": 1, "name": "Bulbasaur", "types": ["poison", "grass"] },
    { "id": 5, "name": "Charmeleon", "types": ["fire"] },
    { "id": 9, "name": "Blastoise", "types": ["water"] },
    { "id": 12, "name": "Butterfree", "types": ["bug", "flying"] },
    { "id": 16, "name": "Pidgey", "types": ["normal", "flying"] },
    { "id": 23, "name": "Ekans", "types": ["poison"] },
    { "id": 24, "name": "Arbok", "types": ["poison"] },
    { "id": 25, "name": "Pikachu", "types": ["electric"] },
    { "id": 37, "name": "Vulpix", "types": ["fire"] },
    { "id": 52, "name": "Meowth", "types": ["normal"] },
    { "id": 63, "name": "Abra", "types": ["psychic"] },
    { "id": 67, "name": "Machamp", "types": ["fighting"] },
    { "id": 72, "name": "Tentacool", "types": ["water", "poison"] },
    { "id": 74, "name": "Geodude", "types": ["rock", "ground"] },
    { "id": 87, "name": "Dewgong", "types": ["water", "ice"] },
    { "id": 98, "name": "Krabby", "types": ["water"] },
    { "id": 115, "name": "Kangaskhan", "types": ["normal"] },
    { "id": 122, "name": "Mr. Mime", "types": ["psychic"] },
    { "id": 133, "name": "Eevee", "types": ["normal"] },
    { "id": 144, "name": "Articuno", "types": ["ice", "flying"] },
    { "id": 145, "name": "Zapdos", "types": ["electric", "flying"] },
    { "id": 146, "name": "Moltres", "types": ["fire", "flying"] },
    { "id": 148, "name": "Dragonair", "types": ["dragon"] }
]);


// =====================================================================================
// LEVEL 1: EASY
// =====================================================================================

console.log("\n--- 1. Log every name ---");
pokemons.forEach(pokemon => console.log(pokemon.name));

console.log("\n--- 2. Log '#<id> - <name>' ---");
pokemons.forEach(pokemon => console.log(`#${pokemon.id} - ${pokemon.name}`));

console.log("\n--- 3. Total number of types (forEach + counter) ---");
let totalTypes = 0;
pokemons.forEach(pokemon => {
    totalTypes += pokemon.types.length;
});
console.log(totalTypes); // 32

console.log("\n--- 4. Names ---");
const names = pokemons.map(pokemon => pokemon.name);
console.log(names);

console.log("\n--- 5. Ids ---");
const ids = pokemons.map(pokemon => pokemon.id);
console.log(ids);

console.log("\n--- 6. Uppercase names ---");
const upperNames = pokemons.map(pokemon => pokemon.name.toUpperCase());
console.log(upperNames);

console.log("\n--- 7. Id divisible by 3 ---");
const divisibleBy3 = pokemons.filter(pokemon => pokemon.id % 3 === 0);
console.log(divisibleBy3);

console.log("\n--- 8. Fire type ---");
const fireTypes = pokemons.filter(pokemon => pokemon.types.includes("fire"));
console.log(fireTypes);

console.log("\n--- 9. More than one type ---");
const multiType = pokemons.filter(pokemon => pokemon.types.length > 1);
console.log(multiType.length, multiType); // 9

console.log("\n--- 10. Exactly one type ---");
const oneType = pokemons.filter(pokemon => pokemon.types.length === 1);
console.log(oneType.length, oneType); // 14


// =====================================================================================
// LEVEL 2: INTERMEDIATE
// =====================================================================================

console.log("\n--- 11. Names with id > 99 ---");
const bigIdNames = pokemons
    .filter(pokemon => pokemon.id > 99)
    .map(pokemon => pokemon.name);
console.log(bigIdNames);

console.log("\n--- 12. Names whose only type is poison ---");
const onlyPoison = pokemons
    .filter(pokemon => pokemon.types.length === 1 && pokemon.types[0] === "poison")
    .map(pokemon => pokemon.name);
console.log(onlyPoison);

console.log("\n--- 13. First type of pokémon whose second type is flying ---");
const firstTypesOfFlyers = pokemons
    .filter(pokemon => pokemon.types[1] === "flying")
    .map(pokemon => pokemon.types[0]);
console.log(firstTypesOfFlyers);

console.log("\n--- 14. Count of normal type ---");
const normalCount = pokemons.filter(pokemon => pokemon.types.includes("normal")).length;
console.log(normalCount); // 4

console.log("\n--- 15. '<name> (<types>)' strings ---");
const labels = pokemons.map(pokemon => `${pokemon.name} (${pokemon.types.join("/")})`);
console.log(labels);

console.log("\n--- 16. Water type with a second type ---");
const dualWater = pokemons
    .filter(pokemon => pokemon.types.includes("water") && pokemon.types.length > 1)
    .map(pokemon => pokemon.name);
console.log(dualWater);

console.log("\n--- 17. Names starting with a vowel ---");
const vowelNames = pokemons
    .filter(pokemon => "AEIOU".includes(pokemon.name[0]))
    .map(pokemon => pokemon.name);
console.log(vowelNames);

console.log("\n--- 18. Even ids, doubled ---");
const doubledEvenIds = pokemons
    .filter(pokemon => pokemon.id % 2 === 0)
    .map(pokemon => pokemon.id * 2);
console.log(doubledEvenIds);

console.log("\n--- 19. Split into singleType / dualType ---");
const singleType = [];
const dualType = [];
pokemons.forEach(pokemon => {
    if (pokemon.types.length === 1) {
        singleType.push(pokemon.name);
    } else {
        dualType.push(pokemon.name);
    }
});
console.log(singleType.length, singleType); // 14
console.log(dualType.length, dualType);     // 9

console.log("\n--- 20. id -> name lookup ---");
const lookup = {};
pokemons.forEach(pokemon => {
    lookup[pokemon.id] = pokemon.name;
});
console.log(lookup);
console.log(lookup[25]); // "Pikachu"

console.log("\n--- 21. New { name, typeCount } objects ---");
const nameAndTypeCount = pokemons.map(pokemon => ({
    name: pokemon.name,
    typeCount: pokemon.types.length
}));
console.log(nameAndTypeCount);

console.log("\n--- 22. forEach returns undefined ---");
// forEach always returns undefined, no matter what the callback returns,
// so `const names = pokemons.forEach(p => p.name)` logs undefined.
// Fix: use map, which returns a new array built from the callback's return values.
const brokenNames = pokemons.forEach(p => p.name);
console.log(brokenNames); // undefined
const fixedNames = pokemons.map(p => p.name);
console.log(fixedNames);


// =====================================================================================
// LEVEL 3: HARD
// =====================================================================================

console.log("\n--- 23. Count of pokémon per type ---");
const typeCounts = {};
pokemons.forEach(pokemon => {
    pokemon.types.forEach(type => {
        if (typeCounts[type] === undefined) {
            typeCounts[type] = 0;
        }
        typeCounts[type]++;
    });
});
console.log(typeCounts);

console.log("\n--- 24. Unique types, sorted (no Set) ---");
const uniqueTypes = [];
pokemons.forEach(pokemon => {
    pokemon.types.forEach(type => {
        if (!uniqueTypes.includes(type)) {
            uniqueTypes.push(type);
        }
    });
});
uniqueTypes.sort(); // fine here: uniqueTypes is our own array, not the frozen one
console.log(uniqueTypes);

console.log("\n--- 25. Names grouped by type ---");
const namesByType = {};
pokemons.forEach(pokemon => {
    pokemon.types.forEach(type => {
        if (namesByType[type] === undefined) {
            namesByType[type] = [];
        }
        namesByType[type].push(pokemon.name);
    });
});
console.log(namesByType);

console.log("\n--- 26. Most common type(s) ---");
const highestCount = Math.max(...Object.values(typeCounts));
const mostCommonTypes = Object.keys(typeCounts).filter(type => typeCounts[type] === highestCount);
console.log(mostCommonTypes); // ["flying"]

console.log("\n--- 27. Share a type with Pikachu ---");
const pikachu = pokemons.filter(pokemon => pokemon.name === "Pikachu")[0];
const pikachuBuddies = pokemons
    .filter(pokemon => pokemon !== pikachu)
    .filter(pokemon => pokemon.types.some(type => pikachu.types.includes(type)))
    .map(pokemon => pokemon.name);
console.log(pikachuBuddies); // ["Zapdos"]

console.log("\n--- 28. Has a type no other pokémon has ---");
const hasRareType = pokemons
    .filter(pokemon => pokemon.types.some(type => typeCounts[type] === 1))
    .map(pokemon => pokemon.name);
console.log(hasRareType);

console.log("\n--- 29. Flying pokémon by id, highest first ---");
const flyersDescending = pokemons
    .filter(pokemon => pokemon.types.includes("flying")) // filter returns a new (unfrozen) array...
    .sort((a, b) => b.id - a.id)                          // ...so sorting it is safe
    .map(pokemon => `#${pokemon.id} ${pokemon.name}`);
console.log(flyersDescending);

console.log("\n--- 30. Groups with the exact same types ---");
const groupsByTypeSet = {};
pokemons.forEach(pokemon => {
    // Copy before sorting, so ["poison","grass"] and ["grass","poison"] give the same key
    const key = [...pokemon.types].sort().join("/");
    if (groupsByTypeSet[key] === undefined) {
        groupsByTypeSet[key] = [];
    }
    groupsByTypeSet[key].push(pokemon.name);
});
const sameTypeGroups = Object.values(groupsByTypeSet).filter(group => group.length > 1);
console.log(sameTypeGroups);

console.log("\n--- 31. myMap and myFilter using forEach ---");
function myMap(arr, fn) {
    const result = [];
    arr.forEach((element, index, array) => {
        result.push(fn(element, index, array));
    });
    return result;
}

function myFilter(arr, fn) {
    const result = [];
    arr.forEach((element, index, array) => {
        if (fn(element, index, array)) {
            result.push(element);
        }
    });
    return result;
}
console.log(JSON.stringify(myMap(pokemons, p => p.name)) === JSON.stringify(pokemons.map(p => p.name))); // true
console.log(myFilter(pokemons, p => p.id > 100).length); // 7

console.log("\n--- 32. myForEach using a for loop ---");
function myForEach(arr, fn) {
    for (let i = 0; i < arr.length; i++) {
        fn(arr[i], i, arr);
    }
    // no return statement, so it returns undefined, just like forEach
}
myForEach(pokemons, (pokemon, index) => console.log(`${index}: ${pokemon.name}`));


// =====================================================================================
// LEVEL 4: REDUCE
// =====================================================================================

// ---------- Easy ----------

console.log("\n--- 33. Sum of all ids ---");
const idSum = pokemons.reduce((sum, pokemon) => sum + pokemon.id, 0);
console.log(idSum); // 1618

console.log("\n--- 34. Total number of types ---");
const totalTypesReduce = pokemons.reduce((total, pokemon) => total + pokemon.types.length, 0);
console.log(totalTypesReduce); // 32

console.log("\n--- 35. Count of fire type ---");
const fireCount = pokemons.reduce(
    (count, pokemon) => (pokemon.types.includes("fire") ? count + 1 : count),
    0
);
console.log(fireCount); // 3

console.log("\n--- 36. Largest id ---");
const maxId = pokemons.reduce((max, pokemon) => (pokemon.id > max ? pokemon.id : max), 0);
console.log(maxId); // 148

// ---------- Intermediate ----------

console.log("\n--- 37. All names in one comma-separated string ---");
const nameString = pokemons.reduce(
    (str, pokemon, index) => (index === 0 ? pokemon.name : `${str}, ${pokemon.name}`),
    ""
);
console.log(nameString);

console.log("\n--- 38. id -> name lookup with reduce ---");
const lookupReduce = pokemons.reduce((obj, pokemon) => {
    obj[pokemon.id] = pokemon.name;
    return obj; // always return the accumulator!
}, {});
console.log(lookupReduce[25]); // "Pikachu"

console.log("\n--- 39. Pokémon with the longest name ---");
// No initial value: the first element becomes the starting accumulator.
// Using > (not >=) keeps the first one on a tie.
const longestName = pokemons.reduce((best, pokemon) =>
    pokemon.name.length > best.name.length ? pokemon : best
);
console.log(longestName); // { id: 5, name: "Charmeleon", ... }

console.log("\n--- 40. Average id ---");
const averageId = pokemons.reduce((sum, pokemon) => sum + pokemon.id, 0) / pokemons.length;
console.log(averageId.toFixed(2)); // "70.35"

console.log("\n--- 41. { singleType, dualType } with reduce ---");
const splitByTypeCount = pokemons.reduce(
    (acc, pokemon) => {
        if (pokemon.types.length === 1) {
            acc.singleType.push(pokemon.name);
        } else {
            acc.dualType.push(pokemon.name);
        }
        return acc;
    },
    { singleType: [], dualType: [] }
);
console.log(splitByTypeCount.singleType.length, splitByTypeCount.dualType.length); // 14 9

// ---------- Hard ----------

console.log("\n--- 42. Count per type with reduce ---");
const typeCountsReduce = pokemons.reduce((counts, pokemon) => {
    pokemon.types.forEach(type => {
        counts[type] = (counts[type] || 0) + 1;
    });
    return counts;
}, {});
console.log(typeCountsReduce);

console.log("\n--- 43. Names grouped by type with reduce ---");
const namesByTypeReduce = pokemons.reduce((groups, pokemon) => {
    pokemon.types.forEach(type => {
        if (!groups[type]) {
            groups[type] = [];
        }
        groups[type].push(pokemon.name);
    });
    return groups;
}, {});
console.log(namesByTypeReduce);

console.log("\n--- 44. Flatten all types, then unique + sorted ---");
const allTypes = pokemons.reduce((arr, pokemon) => arr.concat(pokemon.types), []);
console.log(allTypes.length); // 32
const uniqueSortedTypes = allTypes
    .reduce((unique, type) => (unique.includes(type) ? unique : [...unique, type]), [])
    .sort();
console.log(uniqueSortedTypes);

console.log("\n--- 45. Most common type with reduce ---");
const [topType, topCount] = Object.entries(typeCountsReduce).reduce((best, entry) =>
    entry[1] > best[1] ? entry : best
);
console.log(topType, topCount); // flying 5

console.log("\n--- 46. Stats in a single reduce ---");
const stats = pokemons.reduce(
    (acc, pokemon) => ({
        count: acc.count + 1,
        totalTypes: acc.totalTypes + pokemon.types.length,
        maxId: Math.max(acc.maxId, pokemon.id),
        flyingNames: pokemon.types.includes("flying")
            ? [...acc.flyingNames, pokemon.name]
            : acc.flyingNames
    }),
    { count: 0, totalTypes: 0, maxId: 0, flyingNames: [] }
);
console.log(stats);
// { count: 23, totalTypes: 32, maxId: 148,
//   flyingNames: ["Butterfree", "Pidgey", "Articuno", "Zapdos", "Moltres"] }

console.log("\n--- 47. map and filter rebuilt with reduce ---");
function reduceMap(arr, fn) {
    return arr.reduce((result, element, index, array) => {
        result.push(fn(element, index, array));
        return result;
    }, []);
}

function reduceFilter(arr, fn) {
    return arr.reduce((result, element, index, array) => {
        if (fn(element, index, array)) {
            result.push(element);
        }
        return result;
    }, []);
}
console.log(reduceMap(pokemons, p => p.id).slice(0, 5));              // [1, 5, 9, 12, 16]
console.log(reduceFilter(pokemons, p => p.types.includes("water")).length); // 4

console.log("\n--- 48. myReduce using forEach ---");
function myReduce(arr, fn, initialValue) {
    const hasInitial = arguments.length >= 3;
    if (!hasInitial && arr.length === 0) {
        throw new TypeError("Reduce of empty array with no initial value");
    }

    let acc = hasInitial ? initialValue : arr[0];
    arr.forEach((element, index, array) => {
        if (!hasInitial && index === 0) return; // arr[0] is already the accumulator
        acc = fn(acc, element, index, array);
    });
    return acc;
}
console.log(myReduce(pokemons, (sum, p) => sum + p.id, 0));                      // 1618
console.log(myReduce([3, 7, 2], (max, n) => (n > max ? n : max)));               // 7
try {
    myReduce([], (a, b) => a + b);
} catch (err) {
    console.log(err.message); // "Reduce of empty array with no initial value"
}
