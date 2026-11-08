/**
 * Plugin de JSDoc: simplifica tipos con sintaxis de TypeScript (que usa `npm run typecheck`)
 * para que el analizador clásico de JSDoc pueda generar la documentación HTML.
 * No modifica los archivos fuente: solo el texto que JSDoc analiza.
 *   import('x').Tipo  → Tipo
 *   (a: A) => B       → function
 *   [A, B] (tuplas)   → Array     ·  A & B, { a?: x } → Object  ·  keyof … → string  ·  asserts x → void
 */
function simplify(type) {
  let t = type.replace(/import\(['"][^'"]+['"]\)\.?([\w.]*)/g, (_, name) => name || '*');
  if (/=>/.test(t)) return 'function';
  if (/^asserts\b/.test(t.trim())) return 'void';
  if (/\bkeyof\b/.test(t)) return 'string';
  if (/&/.test(t) || /\?:/.test(t)) return 'Object';
  t = t.replace(/Array<\[[^\]]+\]>/g, 'Array').replace(/\[[^\]\s][^\]]*\]/g, 'Array');
  t = t.replace(/(Record<[^>]*>|\{[^{}]*\})\[\]/g, 'Array.<Object>');
  t = t.replace(/\btypeof\s+[\w.]+/g, '*');
  return t;
}

function rewriteComment(comment) {
  let out = '';
  let i = 0;
  while (i < comment.length) {
    const tag = comment.slice(i).match(/^@(param|returns?|type|typedef|property|prop|template)\s*\{/);
    if (tag) {
      const start = i + tag[0].length;
      let depth = 1;
      let j = start;
      while (j < comment.length && depth > 0) {
        if (comment[j] === '{') depth += 1;
        else if (comment[j] === '}') depth -= 1;
        j += 1;
      }
      out += tag[0] + simplify(comment.slice(start, j - 1)) + '}';
      i = j;
    } else {
      out += comment[i];
      i += 1;
    }
  }
  return out;
}

exports.handlers = {
  beforeParse(e) {
    e.source = e.source.replace(/\/\*\*[\s\S]*?\*\//g, rewriteComment);
  },
};
