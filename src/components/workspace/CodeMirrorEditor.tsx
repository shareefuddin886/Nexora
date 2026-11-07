import { useMemo, useRef } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { HighlightStyle, indentUnit, syntaxHighlighting } from "@codemirror/language";
import { EditorView, keymap } from "@codemirror/view";
import { Prec } from "@codemirror/state";
import { tags as t } from "@lezer/highlight";
import type { RunnableLanguage } from "@/lib/code-runner";

// Dark navy editor theme that matches Nexora, with gold accents.
const theme = EditorView.theme(
  {
    "&": { backgroundColor: "#0b0f19", color: "#d6deeb", height: "100%", fontSize: "13.5px" },
    ".cm-scroller": { fontFamily: "var(--font-mono), ui-monospace, monospace", lineHeight: "1.65" },
    ".cm-content": { caretColor: "#f2b544", padding: "10px 0" },
    ".cm-cursor, .cm-dropCursor": { borderLeftColor: "#f2b544", borderLeftWidth: "2px" },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection": {
      backgroundColor: "#2a3a5e !important",
    },
    ".cm-gutters": {
      backgroundColor: "#0b0f19",
      color: "#4b5675",
      border: "none",
      paddingLeft: "6px",
    },
    ".cm-activeLineGutter": { backgroundColor: "transparent", color: "#c9d1e6" },
    ".cm-activeLine": { backgroundColor: "#ffffff08" },
    ".cm-matchingBracket, &.cm-focused .cm-matchingBracket": {
      backgroundColor: "#f2b54426",
      outline: "1px solid #f2b54466",
    },
    ".cm-foldPlaceholder": { backgroundColor: "#1c2540", border: "none", color: "#9aa4b6" },
    ".cm-tooltip": { backgroundColor: "#121a2e", border: "1px solid #2a3552", color: "#d6deeb" },
    ".cm-tooltip-autocomplete ul li[aria-selected]": { backgroundColor: "#24314f", color: "#fff" },
    ".cm-panels": { backgroundColor: "#121a2e", color: "#d6deeb" },
    ".cm-searchMatch": { backgroundColor: "#f2b54433" },
  },
  { dark: true },
);

const highlight = HighlightStyle.define([
  { tag: [t.keyword, t.controlKeyword, t.moduleKeyword, t.operatorKeyword], color: "#c792ea" },
  { tag: [t.definitionKeyword, t.modifier], color: "#c792ea" },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: "#82aaff" },
  { tag: [t.definition(t.variableName), t.definition(t.propertyName)], color: "#e2e8f5" },
  { tag: [t.string, t.special(t.string)], color: "#c3e88d" },
  { tag: [t.number, t.bool, t.null, t.atom], color: "#f78c6c" },
  {
    tag: [t.comment, t.lineComment, t.blockComment, t.docComment],
    color: "#637394",
    fontStyle: "italic",
  },
  { tag: [t.typeName, t.className, t.namespace], color: "#ffcb6b" },
  { tag: [t.propertyName], color: "#89ddff" },
  { tag: [t.operator, t.punctuation, t.bracket], color: "#a6b3cc" },
  { tag: [t.self, t.special(t.variableName)], color: "#ff5370" },
  { tag: t.variableName, color: "#d6deeb" },
]);

export function CodeMirrorEditor({
  value,
  onChange,
  language,
  onRun,
  onSubmit,
}: {
  value: string;
  onChange: (value: string) => void;
  language: RunnableLanguage;
  onRun?: () => void;
  onSubmit?: () => void;
}) {
  // Keep the latest handlers without rebuilding the editor extensions.
  const handlers = useRef({ onRun, onSubmit });
  handlers.current = { onRun, onSubmit };

  const extensions = useMemo(
    () => [
      language === "python" ? python() : javascript({ typescript: language === "typescript" }),
      indentUnit.of("    "),
      theme,
      syntaxHighlighting(highlight),
      Prec.highest(
        keymap.of([
          { key: "Mod-Enter", run: () => (handlers.current.onRun?.(), true) },
          { key: "Mod-Shift-Enter", run: () => (handlers.current.onSubmit?.(), true) },
          { key: "Mod-'", run: () => (handlers.current.onRun?.(), true) },
        ]),
      ),
      EditorView.lineWrapping,
    ],
    [language],
  );

  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      extensions={extensions}
      theme="none"
      height="100%"
      className="h-full"
      aria-label="Code editor"
      basicSetup={{
        lineNumbers: true,
        foldGutter: true,
        highlightActiveLine: true,
        highlightActiveLineGutter: true,
        bracketMatching: true,
        closeBrackets: true,
        autocompletion: true,
        indentOnInput: true,
        tabSize: 4,
      }}
    />
  );
}
