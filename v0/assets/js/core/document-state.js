export function enableJavaScriptState(currentDocument) {
  const root = currentDocument.documentElement;

  root.classList.remove("no-js");
  root.classList.add("js");
}
