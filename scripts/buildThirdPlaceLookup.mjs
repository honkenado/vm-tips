const groups = ["A","B","C","D","E","F","G","H","I","J","K","L"];

function combinations(arr, k) {
  const result = [];

  function helper(start, combo) {
    if (combo.length === k) {
      result.push([...combo]);
      return;
    }

    for (let i = start; i < arr.length; i++) {
      combo.push(arr[i]);
      helper(i + 1, combo);
      combo.pop();
    }
  }

  helper(0, []);
  return result;
}

// FIFA fasta slots (du använder redan dessa)
const SLOT_ORDER = ["1A","1B","1D","1E","1G","1I","1K","1L"];

// 🔥 Här bygger vi "pseudo-FIFA"
// (vi kommer uppgradera till exakt mapping sen)
function createMapping(combo) {
  // Viktigt: sortera
  const sorted = [...combo].sort();

  // För nu: bara rotera så det inte blir statiskt
  return [
    sorted[7],
    sorted[6],
    sorted[1],
    sorted[2],
    sorted[0],
    sorted[5],
    sorted[3],
    sorted[4],
  ];
}

const combos = combinations(groups, 8);

const lookup = {};

combos.forEach(c => {
  const key = [...c].sort().join("");
  lookup[key] = createMapping(c);
});

console.log("export const THIRD_PLACE_LOOKUP = {");
Object.entries(lookup).forEach(([k, v]) => {
  console.log(`  ${k}: [${v.map(x => `"${x}"`).join(", ")}],`);
});
console.log("};");

console.log(`\n✅ KLAR: ${combos.length} kombinationer`);