"use client"

import { useRef, useState, useEffect } from "react"
import { Editor } from "@monaco-editor/react"
import LanguageSelector from "./LanguageSelector"
import { CODE_SNIPPETS } from "./constants"
import Output from "./Output"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Maximize, Minimize } from 'lucide-react'
import * as monaco from 'monaco-editor';

const CodeEditor = () => {
  const editorRef = useRef()
  const [value, setValue] = useState("")
  const [language, setLanguage] = useState("javascript")
  const [theme, setTheme] = useState("vs-dark")
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferred-language")
    if (savedLanguage) {
      setLanguage(savedLanguage)
      setValue(CODE_SNIPPETS[savedLanguage] || CODE_SNIPPETS.javascript)
    } else {
      setValue(CODE_SNIPPETS[language])
    }
  }, [])

  const onMount = (editor) => {
    editorRef.current = editor
    editor.focus()
    
    // Add custom editor commands
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // Save functionality
      console.log("Save command triggered")
    })
  }

  const onSelect = (language) => {
    setLanguage(language)
    setValue(CODE_SNIPPETS[language])
    localStorage.setItem("preferred-language", language)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const toggleTheme = () => {
    setTheme(theme === "vs-dark" ? "light" : "vs-dark")
  }

  return (
    <div 
      className={`bg-slate-950 rounded-xl overflow-hidden shadow-2xl transition-all duration-300 border border-slate-800 ${
        isFullscreen ? 'fixed inset-0 z-50' : 'w-full'
      }`}
    >
      {/* Editor Header */}
      <div className="flex justify-between items-center px-4 py-3 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-2">
            <span className="flex h-3 w-3 rounded-full bg-red-500"></span>
            <span className="flex h-3 w-3 rounded-full bg-yellow-500"></span>
            <span className="flex h-3 w-3 rounded-full bg-green-500"></span>
          </div>
          <span className="ml-4 text-slate-300 font-mono text-sm font-medium">
            {language.toUpperCase()} Editor
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={toggleTheme}
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {theme === "vs-dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Button 
            onClick={toggleFullscreen}
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      
      {/* Editor Body */}
      <div className="flex flex-col lg:flex-row w-full">
        {/* Code Editor Section */}
        <div className="lg:w-1/2 border-r border-slate-800">
          <div className="flex items-center justify-between p-3 bg-slate-900">
            <LanguageSelector language={language} onSelect={onSelect} />
            <div className="text-xs text-slate-400 font-mono">
              <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 shadow-sm">
                Ctrl+S
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
                vertical: 'auto',
                horizontal: 'auto',
                verticalScrollbarSize: 10,
                horizontalScrollbarSize: 10,
                useShadows: true,
              },
              padding: { top: 16, bottom: 16 },
              automaticLayout: true,
              lineNumbers: 'on',
              glyphMargin: false,
              folding: true,
              lineHeight: 1.6,
              renderLineHighlight: 'all',
              bracketPairColorization: { enabled: true },
              guides: { bracketPairs: true, indentation: true },
            }}
            height={isFullscreen ? "calc(100vh - 110px)" : "75vh"}
            theme={theme}
            language={language}
            onMount={onMount}
            value={value}
            onChange={(value) => setValue(value)}
            className="border-b border-slate-800"
          />
        </div>
        
        {/* Output Section */}
        <Output editorRef={editorRef} language={language} isFullscreen={isFullscreen} />
      </div>
    </div>
  )
}

export default CodeEditor
