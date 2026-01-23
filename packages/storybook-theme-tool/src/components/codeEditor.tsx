import React, { useMemo } from "react";
import { css } from "@codemirror/lang-css";
import { githubLight } from "@uiw/codemirror-theme-github";
import CodeMirror, { ViewUpdate } from "@uiw/react-codemirror";
import { styled } from "storybook/theming";
import { MainButton } from "@veltodefi/ui";
import { object2Css, parseCssToJson } from "../utils";
import { useTheme } from "./context";

const Container = styled.div`
  position: relative;
  max-width: 800px;
  margin: 0 auto;
  column-gap: 8px;
  padding: 20px;
`;

export const CodeEditor = () => {
  const { theme, setTheme } = useTheme();
  console.log("theme", theme);

  const code = useMemo(() => object2Css(theme), [theme]);

  const onChange = (val: string, viewUpdate: ViewUpdate) => {
    try {
      const newTheme = parseCssToJson(val);
      console.log("newTheme", newTheme);
      setTheme(newTheme);
    } catch (err) {
      console.log("parseCssToJson", err);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(code);
  };

  const download = () => {
    const blob = new Blob([code], { type: "text/css" });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "theme.css";
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Container>
      <CodeMirror
        value={code}
        theme={githubLight}
        extensions={[css()]}
        onChange={onChange}
      />

      <div style={{ position: "fixed", right: 30, bottom: 30 }}>
        <MainButton size="md" variant="secondary" onClick={copy}>
          Copy
        </MainButton>
        <MainButton
          size="md"
          variant="secondary"
          onClick={download}
          style={{ marginLeft: 8 }}
        >
          Download
        </MainButton>
      </div>
    </Container>
  );
};
