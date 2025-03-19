"use client"

import { useState } from "react"
import { executeCode } from "./api"
import { LANGUAGE_VERSIONS } from "./constants"
import { Button } from "@/components/ui/button"
import { Play, Trash2, AlertTriangle, Terminal, FileText, CheckCircle } from 'lucide-react'

const Output = ({ editorRef, language, isFullscreen }) => {
  const [output, setOutput] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [executionTime, setExecutionTime] = useState(null)
  const [consoleTab, setConsoleTab] = useState("output")
  const [userInput, setUserInput] = useState("")
  
  const runCode = async () => {
    const sourceCode = editorRef.current.getValue()
    if (!sourceCode) return
    
    try {
      setIsLoading(true)
      const startTime = performance.now()
      
      // Pass the user input to the execution API
      const { run: result } = await executeCode(language, sourceCode, userInput)
      
      const endTime = performance.now()
      setExecutionTime(((endTime - startTime) / 1000).toFixed(2))
      
      setOutput(result.output.split("\n"))
      result.stderr ? setIsError(true) : setIsError(false)
      
      // Auto-switch to output tab when code runs
      setConsoleTab("output")
      
    } catch (error) {
      console.log(error)
      setIsError(true)
      setOutput([`Error: ${error.message || "Unable to run code"}`])
    } finally {
      setIsLoading(false)
    }
  }

  const clearOutput = () => {
    setOutput(null)
    setExecutionTime(null)
    setIsError(false)
  }

  return (
    <div className="lg:w-1/2 flex flex-col bg-slate-950">
      {/* Output Header */}
      <div className="flex items-center border-b border-slate-800 bg-slate-900">
        <div className="flex">
          {[
            { id: "output", icon: <FileText className="h-4 w-4 mr-1.5" /> },
            { id: "problems", icon: <AlertTriangle className="h-4 w-4 mr-1.5" /> },
            { id: "terminal", icon: <Terminal className="h-4 w-4 mr-1.5" /> },
            { id: "input", icon: <Terminal className="h-4 w-4 mr-1.5" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`px-4 py-3 text-sm font-medium capitalize flex items-center ${
                consoleTab === tab.id 
                  ? "text-blue-400 border-b-2 border-blue-400 bg-slate-900" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
              onClick={() => setConsoleTab(tab.id)}
            >
              {tab.icon}
              {tab.id}
              {tab.id === "problems" && isError && (
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">!</span>
              )}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center mr-3">
          <Button
            variant={isLoading ? "outline" : "default"}
            size="sm"
            className={`mr-2 ${
              isLoading 
                ? "bg-slate-800 text-slate-300 cursor-not-allowed" 
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
            onClick={runCode}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Running...
              </span>
            ) : (
              <span className="flex items-center">
                <Play className="h-4 w-4 mr-1.5" />
                Run Code
              </span>
            )}
          </Button>
          
          {output && (
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white hover:bg-slate-800"
              onClick={clearOutput}
              title="Clear output"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Output Content */}
      <div
        className={`flex-1 font-mono text-sm overflow-auto ${
          isFullscreen ? "h-[calc(100vh-150px)]" : "h-[calc(75vh-40px)]"
        }`}
      >
        {consoleTab === "output" && (
          <div className="p-4 text-sm">
            {output ? (
              <>
                <div className={`${isError ? "text-red-400" : "text-green-400"} mb-3 text-xs flex items-center`}>
                  {isError ? (
                    <>
                      <AlertTriangle className="h-4 w-4 mr-1.5" />
                      Execution failed
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1.5" />
                      Execution complete
                    </>
                  )}
                  {executionTime && <span> in {executionTime}s</span>}
                </div>
                <div className={`${isError ? "text-red-400" : "text-slate-300"} bg-slate-900/50 p-3 rounded-md border border-slate-800`}>
                  {output.map((line, i) => (
                    <div key={i} className="whitespace-pre-wrap font-mono leading-relaxed">
                      {line || <span className="opacity-0">&nbsp;</span>}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <FileText className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-center text-sm">
                  Click "Run Code" to see the output here
                </p>
                <div className="text-xs mt-3 px-2 py-1 rounded bg-slate-800 border border-slate-700">
                  ⌘+Enter to Run
                </div>
              </div>
            )}
          </div>
        )}
        
        {consoleTab === "problems" && (
          <div className="p-4">
            {isError && output ? (
              <div>
                <div className="flex items-center mb-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-red-500 font-medium">Execution Error</span>
                </div>
                <div className="bg-slate-900 p-4 rounded-md border border-red-900/30 text-red-400 overflow-x-auto">
                  {output.map((line, i) => (
                    <div key={i} className="whitespace-pre-wrap font-mono leading-relaxed">
                      {line || <span className="opacity-0">&nbsp;</span>}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <CheckCircle className="w-12 h-12 mb-3 opacity-30 text-green-500" />
                <p>No problems detected</p>
              </div>
            )}
          </div>
        )}
        
        {consoleTab === "terminal" && (
          <div className="p-0 bg-black h-full">
            <div className="text-green-500 font-mono p-4">
              <div className="flex">
                <span className="text-green-400">$</span>
                <input 
                  type="text" 
                  className="bg-transparent border-none outline-none flex-1 ml-2 caret-green-400 text-green-400"
                  placeholder="Enter terminal commands here..."
                  onKeyPress={(e) => e.key === 'Enter' && e.preventDefault()}
                />
              </div>
            </div>
          </div>
        )}
        
        {consoleTab === "input" && (
          <div className="p-4">
            <div className="mb-3 text-sm text-slate-300">
              <h3 className="font-medium mb-1">Program Input</h3>
              <p className="text-slate-400 text-xs">
                Enter input values that will be passed to your program when it runs. 
                For multiple inputs, put each value on a new line.
              </p>
            </div>
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="w-full h-40 bg-slate-900 border border-slate-800 rounded-md p-3 text-slate-300 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter input values here..."
            />
            <div className="mt-2 text-xs text-slate-500">
              Example: For a program that reads multiple values, enter each value on a new line.
            </div>
          </div>
        )}
      </div>
      
      {/* Output Footer */}
      <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
          {language} {LANGUAGE_VERSIONS?.[language] ? `v${LANGUAGE_VERSIONS[language]}` : ''}
        </div>
        <div className="flex items-center">
          <span className="mr-4">Lines: {editorRef?.current?.getModel()?.getLineCount() || 0}</span>
          {executionTime && <span>Last run: {executionTime}s</span>}
        </div>
      </div>
    </div>
  )
}

export default Output
