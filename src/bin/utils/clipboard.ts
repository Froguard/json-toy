/**
 * 复制文本内容到剪切板
 * @param {string} txt
 * @returns {Promise<any>}
 */
export async function copyTxtToClipboard(txt: string) {
  const clipboardy = await import('clipboardy'); //
  const clip = clipboardy.default;
  return await clip.write(txt);
}