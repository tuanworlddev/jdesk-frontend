import { Fragment, type ReactNode } from "react";

/**
 * A small, dependency-free syntax highlighter.
 *
 * It scans raw source left-to-right with a set of sticky regexes and emits
 * <span> tokens coloured via the .tok-* classes in globals.css. It is not a
 * full parser — it is tuned to look right for the handful of languages this
 * site shows (Java, TypeScript/JS, JSON, Kotlin, bash) and never emits raw
 * HTML: every token's text is rendered as a React string child, so it is
 * injection-safe by construction.
 */

export type Lang = "java" | "kotlin" | "ts" | "js" | "json" | "bash" | "text";

type Rule = { type: string; re: RegExp };

const JAVA_KEYWORDS =
  "abstract|assert|boolean|break|byte|case|catch|char|class|const|continue|default|do|double|else|enum|extends|final|finally|float|for|goto|if|implements|import|instanceof|int|interface|long|native|new|package|private|protected|public|record|return|sealed|short|static|strictfp|super|switch|synchronized|this|throw|throws|transient|try|var|void|volatile|while|yield|true|false|null";

const TS_KEYWORDS =
  "abstract|any|as|async|await|boolean|break|case|catch|class|const|continue|declare|default|delete|do|else|enum|export|extends|false|finally|for|from|function|get|if|implements|import|in|instanceof|interface|keyof|let|new|null|number|of|private|protected|public|readonly|return|set|static|string|super|switch|this|throw|true|try|type|typeof|undefined|void|while|yield";

const KOTLIN_KEYWORDS =
  "as|break|by|catch|class|companion|const|continue|do|else|enum|false|final|finally|for|fun|if|import|in|infix|init|interface|internal|is|lateinit|null|object|open|operator|override|package|private|protected|public|return|sealed|super|this|throw|true|try|val|var|when|while";

function rulesFor(lang: Lang): Rule[] {
  const common: Rule[] = [];
  if (lang === "bash") {
    return [
      { type: "comment", re: /#[^\n]*/y },
      { type: "string", re: /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/y },
      { type: "number", re: /\$\{?[A-Za-z_][\w]*\}?/y }, // $VARS reuse number colour
      { type: "annotation", re: /(?:^|\s)(?:npm|npx|java|cd|export|sudo|apt-get|open|gradlew|\.\/gradlew|\.\\gradlew\.bat)\b/y },
      { type: "keyword", re: /\s-{1,2}[A-Za-z][\w-]*|\s-D[\w.]+/y },
      { type: "ws", re: /\s+/y },
    ];
  }
  if (lang === "json") {
    return [
      { type: "key", re: /"(?:\\.|[^"\\])*"(?=\s*:)/y },
      { type: "string", re: /"(?:\\.|[^"\\])*"/y },
      { type: "number", re: /-?\b\d[\d.eE+-]*\b/y },
      { type: "keyword", re: /\b(?:true|false|null)\b/y },
      { type: "punct", re: /[{}[\]:,]/y },
      { type: "ws", re: /\s+/y },
    ];
  }
  const kw =
    lang === "java"
      ? JAVA_KEYWORDS
      : lang === "kotlin"
        ? KOTLIN_KEYWORDS
        : TS_KEYWORDS;
  return [
    ...common,
    { type: "comment", re: /\/\/[^\n]*|\/\*[\s\S]*?\*\//y },
    { type: "string", re: /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`/y },
    { type: "annotation", re: /@[A-Za-z_][\w.]*/y },
    { type: "number", re: /\b\d[\d_.xXa-fA-F]*[fFlLdD]?\b/y },
    { type: "keyword", re: new RegExp(`\\b(?:${kw})\\b`, "y") },
    { type: "type", re: /\b[A-Z][A-Za-z0-9_]*\b/y },
    { type: "func", re: /\b[a-z_][A-Za-z0-9_]*(?=\s*\()/y },
    { type: "punct", re: /[{}()[\].,;:<>+\-*/%=&|!?]+/y },
    { type: "ws", re: /\s+/y },
  ];
}

export function highlight(code: string, lang: Lang): ReactNode {
  if (lang === "text") return code;
  const rules = rulesFor(lang);
  const out: ReactNode[] = [];
  let i = 0;
  let key = 0;
  let plain = "";

  const flushPlain = () => {
    if (plain) {
      out.push(<Fragment key={key++}>{plain}</Fragment>);
      plain = "";
    }
  };

  while (i < code.length) {
    let matched = false;
    for (const rule of rules) {
      rule.re.lastIndex = i;
      const m = rule.re.exec(code);
      if (m && m.index === i && m[0].length > 0) {
        if (rule.type === "ws") {
          plain += m[0];
        } else {
          flushPlain();
          out.push(
            <span key={key++} className={`tok-${rule.type}`}>
              {m[0]}
            </span>,
          );
        }
        i += m[0].length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      plain += code[i];
      i += 1;
    }
  }
  flushPlain();
  return out;
}
