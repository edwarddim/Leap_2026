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

// =====================================================================================
// LEVEL 1: EASY
// =====================================================================================


// 2. (forEach) Log every pokémon in the format "#<id> - <name>".
//    Expected: "#1 - Bulbasaur", "#5 - Charmeleon", ...
const x = pokemons.forEach((p)=>console.log("#"+p.id+" - "+p.name))

// 4. (map) An array with the names of the pokémon and their id.
//    Expected: ["1 - Bulbasaur", "5 - Charmeleon", "9 - Blastoise", ...] (length 23)
const pokemonNames = pokemons.map((f)=>f.id +" - " + f.name)
console.log(pokemonNames)

// =====================================================================================
// LEVEL 2: INTERMEDIATE
// =====================================================================================


// 11. (filter + map) An array with just the names of pokémon with an id greater than 99.
//     Expected: ["Kangaskhan", "Mr. Mime", "Eevee", "Articuno", "Zapdos", "Moltres", "Dragonair"]
const greaterThan99 = pokemons.filter((f)=>f.id > 99).map((f) => f.name)
console.log(greaterThan99)


// 12. (filter + map) An array with just the names of the pokémon whose only type is poison.
//     Expected: ["Ekans", "Arbok"]cions
const poison = pokemons.filter(f => f.types.length === 1 && f.types[0] === "poison").map(f => f.name)
console.log(poison)
// 13. (filter + map) An array containing just the first type of all the pokémon whose
//     second type is "flying".
//     Expected: ["bug", "normal", "ice", "electric", "fire"]
const flying = pokemons.filter(u => u.types[1] === "flying").map(u => u.types[0])
console.log(flying)

// 14. (filter) A count of the number of pokémon that are "normal" type.
//     Expected: 4
const normasslCount = pokemons.filter(u => u.types.includes("normal")).length
console.log(normasslCount)
// 18. (filter + map) Take only the pokémon with an even id, then return their ids doubled.
//     Expected: [24, 32, 48, 104, 144, 148, 196, 244, 288, 292, 296]
const even = pokemons.filter(u => u.id % 2 === 0).map(u => u.id * 2)
console.log(even)

// 19. (forEach) Start with two empty arrays, `singleType` and `dualType`. Use ONE forEach
//     to push each pokémon's name into the correct array.
//     Expected: singleType has 14 names, dualType has 9 names
const singleType = []
const dualType = []
pokemons.forEach((f) => {
    if (f.types.length === 1) { singleType.push(f.name)}
    else if (f.types.length === 2) { dualType.push(f.name)}
})
console.log(singleType, dualType)

// =====================================================================================
// LEVEL 3: HARD
// =====================================================================================

const typeCounts = {};
// 23. (forEach, nested) Build an object that counts how many pokémon have each type.
//     Expected: { poison: 4, grass: 1, fire: 3, water: 4, bug: 1, flying: 5, normal: 4,
//                 electric: 2, psychic: 2, fighting: 1, rock: 1, ground: 1, ice: 2, dragon: 1 }
pokemons.forEach((f) => 
    //typeCounts[] = (pokemons[f])
    f.types.forEach(t => typeCounts[t] = (typeCounts[t] || 0) + 1)
);
console.log(typeCounts);

// 29. (filter + sort + map) All "flying" pokémon, sorted by id from highest to lowest,
//     formatted as "#<id> <name>". Remember: pokemons is frozen, so sort a copy.
//     Expected: ["#146 Moltres", "#145 Zapdos", "#144 Articuno", "#16 Pidgey", "#12 Butterfree"]
// const pokemonsCopy = [... pokemons]; // REDUNDANT
console.log("FINAL---------------------------")
console.log(pokemons.filter( a => a.types.includes("flying")).sort((a,b) => b.id - a.id).map(c => "#" + c.id + " " + c.name))