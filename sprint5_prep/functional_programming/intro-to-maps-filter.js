const pokemons = Object.freeze([
    { 
        "id": 1, 
        "name": "Bulbasaur", 
        "types": ["poison", "grass"]
    },
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

/*
 * PRACTICE: forEach, map, filter, and reduce
 *
 * Quick refresher:
 *   - forEach(fn) runs fn once per element and returns undefined. Use it for side effects
 *     (logging, pushing into another array, updating a counter or object).
 *   - map(fn)     returns a NEW array of the same length, built from fn's return values.
 *   - filter(fn)  returns a NEW array containing only the elements where fn returns true.
 *   - reduce(fn, initialValue) boils the array down to ONE value (a number, string, object,
 *     or even another array). fn receives (accumulator, element) and must RETURN the new
 *     accumulator. If you leave out initialValue, the first element is used as the start.
 *  
 *
 * `pokemons` is frozen, so you can't push to it or sort it in place. Make a copy first if needed.
 * The "Expected:" lines let you check your answer with console.log.
 */


// =====================================================================================
// LEVEL 1: EASY. One method per problem.
// =====================================================================================

// 1. (forEach) Log the name of every pokémon, one per line.
//    Expected: Bulbasaur, Charmeleon, Blastoise, ... (23 lines)

// 2. (forEach) Log every pokémon in the format "#<id> - <name>".
//    Expected: "#1 - Bulbasaur", "#5 - Charmeleon", ...

// 3. (forEach) Use forEach and a counter variable to find the total number of types
//    across all pokémon (a dual-type pokémon counts as 2).
//    Expected: 32

// 4. (map) An array with just the names of the pokémon.
//    Expected: ["Bulbasaur", "Charmeleon", "Blastoise", ...] (length 23)

// 5. (map) An array with just the ids of the pokémon.
//    Expected: [1, 5, 9, 12, 16, 23, ...]

// 6. (map) An array of all the pokémon names in UPPERCASE.
//    Expected: ["BULBASAUR", "CHARMELEON", "BLASTOISE", ...]

// 7. (filter) An array of pokémon objects where the id is evenly divisible by 3.
//    Expected: 7 objects (Blastoise, Butterfree, Arbok, Abra, Tentacool, Dewgong, Articuno)

// 8. (filter) An array of pokémon objects that are "fire" type.
//    Expected: 3 objects (Charmeleon, Vulpix, Moltres)

// 9. (filter) An array of pokémon objects that have more than one type.
//    Expected: 9 objects

// 10. (filter) An array of pokémon objects that have exactly one type.
//     Expected: 14 objects


// =====================================================================================
// LEVEL 2: INTERMEDIATE. Chain methods, or use forEach to build something new.
// =====================================================================================

// 11. (filter + map) An array with just the names of pokémon with an id greater than 99.
//     Expected: ["Kangaskhan", "Mr. Mime", "Eevee", "Articuno", "Zapdos", "Moltres", "Dragonair"]

// 12. (filter + map) An array with just the names of the pokémon whose only type is poison.
//     Expected: ["Ekans", "Arbok"]

// 13. (filter + map) An array containing just the first type of all the pokémon whose
//     second type is "flying".
//     Expected: ["bug", "normal", "ice", "electric", "fire"]

// 14. (filter) A count of the number of pokémon that are "normal" type.
//     Expected: 4

// 15. (map) An array of strings formatted as "<name> (<type1>/<type2>)".
//     Hint: arrays have a .join() method.
//     Expected: ["Bulbasaur (poison/grass)", "Charmeleon (fire)", ...]

// 16. (filter + map) The names of pokémon that are "water" type AND have a second type.
//     Expected: ["Tentacool", "Dewgong"]

// 17. (filter + map) The names of pokémon whose name starts with a vowel (A, E, I, O, U).
//     Expected: ["Ekans", "Arbok", "Abra", "Eevee", "Articuno"]

// 18. (filter + map) Take only the pokémon with an even id, then return their ids doubled.
//     Expected: [24, 32, 48, 104, 144, 148, 196, 244, 288, 292, 296]

// 19. (forEach) Start with two empty arrays, `singleType` and `dualType`. Use ONE forEach
//     to push each pokémon's name into the correct array.
//     Expected: singleType has 14 names, dualType has 9 names

// 20. (forEach) Build a lookup object where each key is an id and each value is a name.
//     Expected: { 1: "Bulbasaur", 5: "Charmeleon", 9: "Blastoise", ... }
//     Then use it: what is lookup[25]?  Expected: "Pikachu"

// 21. (map) An array of NEW objects shaped like { name, typeCount }. Don't modify the originals.
//     Expected: [{ name: "Bulbasaur", typeCount: 2 }, { name: "Charmeleon", typeCount: 1 }, ...]

// 22. (concept) What does the code below log, and why? Fix it so `names` holds the names.
//     const names = pokemons.forEach(p => p.name);
//     console.log(names);


// =====================================================================================
// LEVEL 3: HARD. Nested iteration, building data structures, combining all three.
// =====================================================================================

// 23. (forEach, nested) Build an object that counts how many pokémon have each type.
//     Expected: { poison: 4, grass: 1, fire: 3, water: 4, bug: 1, flying: 5, normal: 4,
//                 electric: 2, psychic: 2, fighting: 1, rock: 1, ground: 1, ice: 2, dragon: 1 }

// 24. (forEach) An array of every unique type, sorted alphabetically. Don't use a Set.
//     Expected: ["bug", "dragon", "electric", "fighting", "fire", "flying", "grass",
//                "ground", "ice", "normal", "poison", "psychic", "rock", "water"]

// 25. (forEach) Group pokémon NAMES by type. A dual-type pokémon appears in both groups.
//     Expected: { poison: ["Bulbasaur", "Ekans", "Arbok", "Tentacool"],
//                 fire: ["Charmeleon", "Vulpix", "Moltres"], ... }

// 26. (filter, using your answer to #23) An array of the type(s) that appear most often.
//     Hint: Object.keys() / Object.values() turn an object into arrays.
//     Expected: ["flying"]

// 27. (filter + map) The names of every pokémon that shares at least one type with Pikachu,
//     not including Pikachu. Don't hard-code "electric". Look up Pikachu's types first.
//     Expected: ["Zapdos"]

// 28. (filter + map) The names of pokémon that have at least one type NO other pokémon has.
//     Hint: your answer to #23 helps here.
//     Expected: ["Bulbasaur", "Butterfree", "Machamp", "Geodude", "Dragonair"]

// 29. (filter + sort + map) All "flying" pokémon, sorted by id from highest to lowest,
//     formatted as "#<id> <name>". Remember: pokemons is frozen, so sort a copy.
//     Expected: ["#146 Moltres", "#145 Zapdos", "#144 Articuno", "#16 Pidgey", "#12 Butterfree"]

// 30. Find groups of pokémon that have the exact same set of types (in any order).
//     Return an array of name-groups, keeping only groups with 2+ members.
//     Expected: [["Charmeleon", "Vulpix"], ["Blastoise", "Krabby"], ["Ekans", "Arbok"],
//                ["Meowth", "Kangaskhan", "Eevee"], ["Abra", "Mr. Mime"]]

// 31. (build your own) Write `myMap(arr, fn)` and `myFilter(arr, fn)` using only forEach.
//     They should behave like the built-in versions. Test them:
//     myMap(pokemons, p => p.name) should equal pokemons.map(p => p.name)
//     myFilter(pokemons, p => p.id > 100).length should be 7

// 32. (build your own) Write `myForEach(arr, fn)` using a plain for loop. Like the real
//     forEach, call fn with (element, index, array). Use it to log "<index>: <name>".
//     Expected: "0: Bulbasaur", "1: Charmeleon", ...


// =====================================================================================
// LEVEL 4: REDUCE. Combine an entire array into a single value.
// =====================================================================================

// ---------- Easy ----------

// 33. (reduce) The sum of all the pokémon ids.
//     Expected: 1618

// 34. (reduce) The total number of types across all pokémon (same as #3, but with reduce).
//     Expected: 32

// 35. (reduce) A count of the pokémon that are "fire" type. Don't use filter.
//     Expected: 3

// 36. (reduce) The largest id. Don't use Math.max on the whole array.
//     Expected: 148

// ---------- Intermediate ----------

// 37. (reduce) One string of every name, separated by ", ". Don't use .join(), and don't
//     leave a trailing comma. Hint: the callback's third argument is the index.
//     Expected: "Bulbasaur, Charmeleon, Blastoise, Butterfree, ..."

// 38. (reduce) Build the id -> name lookup object from #20, this time with reduce.
//     Expected: lookup[25] is "Pikachu"

// 39. (reduce) The pokémon OBJECT with the longest name. On a tie, keep the first one found.
//     Try this one WITHOUT an initial value.
//     Expected: { id: 5, name: "Charmeleon", types: ["fire"] }

// 40. (reduce) The average id, rounded to 2 decimal places.
//     Expected: "70.35"

// 41. (reduce) Rebuild #19 with a single reduce. The starting value should be
//     { singleType: [], dualType: [] }.
//     Expected: singleType has 14 names, dualType has 9 names

// ---------- Hard ----------

// 42. (reduce, nested) Rebuild the type count object from #23 using reduce.
//     Expected: { poison: 4, grass: 1, fire: 3, water: 4, bug: 1, flying: 5, ... }

// 43. (reduce, nested) Rebuild the names-grouped-by-type object from #25 using reduce.
//     Expected: { poison: ["Bulbasaur", "Ekans", "Arbok", "Tentacool"], ... }

// 44. (reduce) Flatten every pokémon's types into one array (don't use .flat()).
//     Then use another reduce to remove duplicates, and sort the result.
//     Expected: flattened length is 32; unique sorted list matches #24

// 45. (reduce) Using your type count object from #42, find the most common type and its count.
//     Hint: Object.entries() gives you [key, value] pairs.
//     Expected: ["flying", 5]

// 46. (reduce) In ONE reduce, build a stats object shaped like:
//     { count, totalTypes, maxId, flyingNames }
//     Expected: { count: 23, totalTypes: 32, maxId: 148,
//                 flyingNames: ["Butterfree", "Pidgey", "Articuno", "Zapdos", "Moltres"] }

// 47. (build your own) Write `reduceMap(arr, fn)` and `reduceFilter(arr, fn)` using only reduce.
//     Expected: reduceMap(pokemons, p => p.id) starts with [1, 5, 9, 12, 16]
//               reduceFilter(pokemons, p => p.types.includes("water")).length is 4

// 48. (build your own) Write `myReduce(arr, fn, initialValue)` using forEach. It should:
//       - use initialValue as the starting accumulator if one is passed
//       - otherwise start with arr[0] and begin looping from index 1
//       - throw a TypeError if the array is empty and no initialValue is passed
//     Expected: myReduce(pokemons, (sum, p) => sum + p.id, 0) is 1618
//               myReduce([3, 7, 2], (max, n) => n > max ? n : max) is 7