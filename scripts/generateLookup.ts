const groups = ["A","B","C","D","E","F","G","H","I","J","K","L"];

// Generera alla kombinationer (n choose k)
function combinations(arr: string[], k: number): string[][] {
  const result: string[][] = [];

  function helper(start: number, combo: string[]) {
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

const combos = combinations(groups, 8);

// 🔴 TEMP – vi fyller inte FIFA-mapping här än
// bara struktur så du ser allt funkar

const lookup: Record<string, string[]> = {};

combos.forEach(c => {
  const key = c.join("");
  lookup[key] = c; // placeholder
});

// Skriv ut som TypeScript
console.log("export const THIRD_PLACE_LOOKUP = {");
Object.entries(lookup).forEach(([k, v]) => {
  console.log(`  ${k}: [${v.map(x => `"${x}"`).join(", ")}],`);
});
console.log("};");