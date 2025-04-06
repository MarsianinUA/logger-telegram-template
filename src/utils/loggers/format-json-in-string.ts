export function formatJsonInString(str: string) {
  let result = '';
  let currentJson = '';
  let braceCount = 0;
  let inJson = false;
  let i = 0;

  while (i < str.length) {
    const char = str[i];

    if (char === '{' && !inJson) {
      inJson = true;
      currentJson = char;
      braceCount = 1;
    } else if (inJson) {
      currentJson += char;

      if (char === '{') {
        braceCount++;
      } else if (char === '}') {
        braceCount--;

        if (braceCount === 0) {
          inJson = false;
          try {
            const parsed = JSON.parse(currentJson);
            result += JSON.stringify(parsed, null, 2);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (error) {
            result += currentJson;
          }
          currentJson = '';
        }
      }
    } else {
      result += char;
    }

    i++;
  }

  result += currentJson;
  return result;
}
