/**
 * @param {(...args: any[]) => any} f 
 * @param {boolean} suppressLogging 
 * @returns {(...args: any[]) => any}
 */
export const ignoreErrorWrap = (f, suppressLogging = false) => {
  const wrapStack = new Error("ignoreErrorWrap").stack;
  return function() {
    try{
      return f.apply(this, arguments);
    } catch (e) {
      if(!suppressLogging) {
        console.warn("ignore error wrap", e, wrapStack);
      }
    }
  }
}