import React, { useMemo } from "react";
import { css } from "@codemirror/lang-css";
import { githubLight } from "@uiw/codemirror-theme-github";
import CodeMirror, { ViewUpdate } from "@uiw/react-codemirror";
import { styled } from "storybook/theming";
import { object2Css, parseCssToJson } from "../utils";
import { useTheme } from "./context";

const Container = styled.div`
  position: relative;
  max-width: 800px;
  margin: 0 auto;
  column-gap: 8px;
  padding: 20px;
`;

const ToolbarButton = styled.button`
  appearance: none;
  border: 1px solid rgba(0, 0, 0, 0.15);
  background: #f6f8fa;
  color: #1f2328;
  font: inherit;
  font-size: 13px;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: #eaeef2;
  }

  & + & {
    margin-left: 8px;
  }
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
        <ToolbarButton type="button" onClick={copy}>
          Copy
        </ToolbarButton>
        <ToolbarButton type="button" onClick={download}>
          Download
        </ToolbarButton>
      </div>
    </Container>
  );
};
