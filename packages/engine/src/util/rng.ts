// Generate a random 32-bit number
function random32(): number {
  return Math.floor(Math.random() * Math.pow(2, 32));
}

// Generate a 64-bit pseudo-legal number
export function random64(): bigint {
  // Define 4 random numbers
  let n1, n2, n3, n4;

  // Init random numbers slicing 16 bits from most significant 1 bit side
  n1 = BigInt(random32()) & 0xffffn;
  n2 = BigInt(random32()) & 0xffffn;
  n3 = BigInt(random32()) & 0xffffn;
  n4 = BigInt(random32()) & 0xffffn;

  // Return random number
  return n1 | (n2 << 16n) | (n3 << 32n) | (n4 << 48n);
}
