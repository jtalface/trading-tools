export function sanitizeTicker(input: string): string {
  const ticker = input.trim().toUpperCase();
  if (!/^[A-Z0-9.-]{1,12}$/.test(ticker)) {
    throw new Error("Invalid ticker symbol");
  }
  return ticker;
}
