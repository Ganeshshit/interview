"use client"

import { useState, useEffect } from "react"
import api from "../services/api"

const CodeEditor = ({
  initialCode = "",
  initialLanguage = "javascript",
  onCodeChange,
  onLanguageChange,
  onSubmit,
  readOnly = false,
  height = "400px",
}) => {
  const [code, setCode] = useState(initialCode)
  const [language, setLanguage] = useState(initialLanguage)
  const [output, setOutput] = useState("")
  const [isExecuting, setIsExecuting] = useState(false)
  const [input, setInput] = useState("")
  const [theme, setTheme] = useState("light")
  const [fontSize, setFontSize] = useState(14)

  useEffect(() => {
    // Check if the user prefers dark mode
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark")
    }

    // Listen for changes in color scheme
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = (e) => {
      setTheme(e.matches ? "dark" : "light")
    }

    mediaQuery.addEventListener("change", handleChange)

    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [])

  useEffect(() => {
    if (initialCode !== code) {
      setCode(initialCode)
    }
  }, [initialCode])

  useEffect(() => {
    if (initialLanguage !== language) {
      setLanguage(initialLanguage)
    }
  }, [initialLanguage])

  const handleCodeChange = (e) => {
    const newCode = e.target.value
    setCode(newCode)
    if (onCodeChange) {
      onCodeChange(newCode)
    }
  }

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value
    setLanguage(newLanguage)
    if (onLanguageChange) {
      onLanguageChange(newLanguage)
    }
  }

  const executeCode = async () => {
    try {
      setIsExecuting(true)
      setOutput("Executing code...")

      const response = await api.post("/execute-code", {
        code,
        language,
        input,
      })

      setOutput(response.data.output)
    } catch (error) {
      console.error("Error executing code:", error)
      setOutput(`Error: ${error.response?.data?.message || error.message || "Failed to execute code"}`)
    } finally {
      setIsExecuting(false)
    }
  }

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(code, language)
    }
  }

  const getLanguageTemplate = () => {
    switch (language) {
      case "java":
        return `public class Main {
    public static void main(String[] args) {
        // Your code here
        System.out.println("Hello, World!");
    }
}`
      case "c":
        return `#include <stdio.h>

int main() {
    // Your code here
    printf("Hello, World!\\n");
    return 0;
}`
      case "cpp":
        return `#include <iostream>
using namespace std;

int main() {
    // Your code here
    cout << "Hello, World!" << endl;
    return 0;
}`
      case "python":
        return `# Your code here
print("Hello, World!")`
      default:
        return `// Your code here
console.log("Hello, World!");`
    }
  }

  const resetCode = () => {
    const template = getLanguageTemplate()
    setCode(template)
    if (onCodeChange) {
      onCodeChange(template)
    }
  }

  const increaseFontSize = () => {
    setFontSize((prev) => Math.min(prev + 2, 24))
  }

  const decreaseFontSize = () => {
    setFontSize((prev) => Math.max(prev - 2, 10))
  }

  return (
    <div
      className={`border rounded-lg overflow-hidden ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-800"}`}
    >
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center space-x-2">
          <select
            value={language}
            onChange={handleLanguageChange}
            disabled={readOnly}
            className={`px-2 py-1 rounded text-sm ${
              theme === "dark" ? "bg-gray-700 text-white border-gray-600" : "bg-gray-100 text-gray-800 border-gray-300"
            }`}
          >
            <option value="javascript">JavaScript</option>
            <option value="java">Java</option>
            <option value="c">C</option>
            <option value="cpp">C++</option>
            <option value="python">Python</option>
          </select>
          <button
            onClick={resetCode}
            disabled={readOnly}
            className={`px-2 py-1 rounded text-sm ${
              theme === "dark"
                ? "bg-gray-700 text-white hover:bg-gray-600"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            Reset
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={decreaseFontSize}
            className={`px-2 py-1 rounded text-sm ${
              theme === "dark"
                ? "bg-gray-700 text-white hover:bg-gray-600"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            A-
          </button>
          <button
            onClick={increaseFontSize}
            className={`px-2 py-1 rounded text-sm ${
              theme === "dark"
                ? "bg-gray-700 text-white hover:bg-gray-600"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            A+
          </button>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`px-2 py-1 rounded text-sm ${
              theme === "dark"
                ? "bg-gray-700 text-white hover:bg-gray-600"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            {theme === "dark" ? "Light" : "Dark"}
          </button>
        </div>
      </div>

      <textarea
        value={code}
        onChange={handleCodeChange}
        readOnly={readOnly}
        style={{
          height,
          fontSize: `${fontSize}px`,
          fontFamily: "monospace",
          lineHeight: 1.5,
          tabSize: 2,
        }}
        className={`w-full p-4 focus:outline-none resize-none ${
          theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
        }`}
        spellCheck="false"
        placeholder={getLanguageTemplate()}
      />

      {!readOnly && (
        <div className="p-2 border-t">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Input (for stdin):</label>
              <div className="flex space-x-2">
                <button
                  onClick={executeCode}
                  disabled={isExecuting}
                  className={`px-3 py-1 rounded text-sm ${
                    isExecuting
                      ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                      : theme === "dark"
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-green-500 text-white hover:bg-green-600"
                  }`}
                >
                  {isExecuting ? "Executing..." : "Run Code"}
                </button>
                <button
                  onClick={handleSubmit}
                  className={`px-3 py-1 rounded text-sm ${
                    theme === "dark"
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "bg-indigo-500 text-white hover:bg-indigo-600"
                  }`}
                >
                  Submit
                </button>
              </div>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className={`w-full p-2 rounded text-sm ${
                theme === "dark"
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-gray-100 text-gray-800 border-gray-300"
              }`}
              rows={2}
              placeholder="Enter input for your program here..."
            />
          </div>
        </div>
      )}

      {output && (
        <div className="p-2 border-t">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Output:</label>
            <pre
              className={`w-full p-2 rounded overflow-auto text-sm ${
                theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-800"
              }`}
              style={{ maxHeight: "150px", fontFamily: "monospace" }}
            >
              {output}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

export default CodeEditor

