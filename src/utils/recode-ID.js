const ORIGINAL_LEX = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz";
const LEX_ARRAY = ORIGINAL_LEX.split("").sort();
const LEX_DICTIONARY = LEX_ARRAY.reduce((obj, char, i) => {
  return {
    ...obj,
    [char]: i
  }
}, {});

module.exports = {
  encodeToString: function(num = 0n) {
    let encodedString = "";
    
    while (num > 0) {
      const bigIndex = num % 64n;
      const index = Number(bigIndex.toString());
      const character = LEX_ARRAY[index];
      
      encodedString += character;
      num /= 64n;
    }
    
    return encodedString;
  },
  decodeToBigInt: function(str = "") {
    let decodedBigInt = 0n;
    let factor64 = 1n;
    
    str.split("").forEach((character) => {
      const num = BigInt(LEX_DICTIONARY[character]);
      decodedBigInt += (num * factor64);
      factor64 *= 64n;
    })
    
    return decodedBigInt;
  }
}