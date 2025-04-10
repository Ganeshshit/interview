"use client";

import { useRef, useState, useEffect } from "react";
import { Editor } from "@monaco-editor/react";
import LanguageSelector from "./LanguageSelector";
import { CODE_SNIPPETS } from "./constants";
import Output from "./Output";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Maximize, Minimize } from "lucide-react";
import * as monaco from "monaco-editor";

const CodeEditor = () => {
  const editorRef = useRef();
  const [value, setValue] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [theme, setTheme] = useState("vs-dark");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferred-language");
    if (savedLanguage) {
      setLanguage(savedLanguage);
      setValue(CODE_SNIPPETS[savedLanguage] || CODE_SNIPPETS.javascript);
    } else {
      setValue(CODE_SNIPPETS[language]);
    }
  }, []);

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();

    // Add custom editor commands
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      console.log("Save command triggered");
    });
  };

  const onSelect = (language) => {
    setLanguage(language);
    setValue(CODE_SNIPPETS[language]);
    localStorage.setItem("preferred-language", language);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const toggleTheme = () => {
    setTheme(theme === "vs-dark" ? "light" : "vs-dark");
  };

  return (
    <div
      className={`bg-slate-900 rounded-3xl overflow-hidden shadow-xl transition-all duration-300 border ${
        isFullscreen ? "fixed inset-0 z-50" : "w-full"
      }`}
      style={{
        backdropFilter: "blur(10px)",
        borderColor: theme === "vs-dark" ? "#1e293b" : "#e5e7eb",
      }}
    >
      {/* Editor Header */}
      <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700">
        {/* Status Dots and Language Label */}
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            <span className="h-3 w-3 rounded-full bg-red-500"></span>
            <span className="h-3 w-3 rounded-full bg-yellow-500"></span>
            <span className="h-3 w-3 rounded-full bg-green-500"></span>
          </div>
          <span className="text-sm font-mono text-gray-400">
            {language.toUpperCase()} Editor
          </span>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center space-x-3">
          <Button
            onClick={toggleTheme}
            size="icon"
            className="rounded-full bg-slate-700 hover:bg-slate-600 text-gray-300 hover:text-white transition"
          >
            {theme === "vs-dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          <Button
            onClick={toggleFullscreen}
            size="icon"
            className="rounded-full bg-slate-700 hover:bg-slate-600 text-gray-300 hover:text-white transition"
          >
            {isFullscreen ? (
              <Minimize className="h-5 w-5" />
            ) : (
              <Maximize className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Editor and Output Container */}
      <div className="flex flex-col lg:flex-row w-full">
        {/* Code Editor Section */}
        <div className="lg:w-1/2 border-r border-slate-800">
          <div className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700">
            <LanguageSelector language={language} onSelect={onSelect} />
            <div className="text-xs text-gray-400 font-mono">
              <kbd className="px-2 py-1 bg-slate-700 border border-slate-600 rounded-lg">
                Ctrl + S
              </kbd>
              <span className="ml-1">to Save</span>
            </div>
          </div>

          <Editor
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 14,
              fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
              fontLigatures: true,
              cursorSmoothCaretAnimation: "on",
              cursorBlinking: "smooth",
              scrollbar: {
                vertical: "auto",
                horizontal: "auto",
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8,
                useShadows: true,
              },
              padding: { top: 14, bottom: 14 },
              automaticLayout: true,
              lineNumbers: "on",
              glyphMargin: false,
              folding: true,
              lineHeight: 1.8,
              renderLineHighlight: "all",
              bracketPairColorization: { enabled: true },
              guides: { bracketPairs: true, indentation: true },
            }}
            height={isFullscreen ? "calc(100vh - 130px)" : "75vh"}
            theme={theme}
            language={language}
            onMount={onMount}
            value={value}
            onChange={(value) => setValue(value)}
            className="border-b border-slate-800"
          />
        </div>

        {/* Output Section */}
        <Output
          editorRef={editorRef}
          language={language}
          isFullscreen={isFullscreen}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
