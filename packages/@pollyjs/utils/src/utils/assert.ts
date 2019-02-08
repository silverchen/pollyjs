export default function(msg: string, condition?: unknown) {
  if (!condition) {
    throw new Error(`[Polly] ${msg}`);
  }
}
