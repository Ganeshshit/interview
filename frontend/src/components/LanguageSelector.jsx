"use client"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChevronDown, Code } from "lucide-react"
import { LANGUAGE_VERSIONS } from "./constants"

const languages = Object.entries(LANGUAGE_VERSIONS)

const LanguageSelector = ({ language, onSelect }) => {
  return (
    <div className="flex items-center">
      <div className="flex items-center mr-2">
        <Code className="h-4 w-4 text-blue-400 mr-1.5" />
        <span className="text-sm font-medium text-slate-300">Language:</span>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200 font-medium"
          >
            {language}
            <ChevronDown className="ml-2 h-4 w-4 text-slate-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-slate-900 border border-slate-800 shadow-xl rounded-md p-1 max-h-60 overflow-y-auto">
          {languages.map(([lang, version]) => (
            <DropdownMenuItem
              key={lang}
              className={`${
                lang === language ? "bg-blue-500/10 text-blue-400" : "text-slate-300"
              } hover:text-blue-400 hover:bg-slate-800 cursor-pointer rounded-sm px-3 py-2 text-sm font-medium transition-colors`}
              onClick={() => onSelect(lang)}
            >
              <div className="flex items-center justify-between w-full">
                <span>{lang}</span>
                <span className="text-slate-500 text-xs ml-2">({version})</span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default LanguageSelector

