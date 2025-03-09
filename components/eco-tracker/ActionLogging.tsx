"use client"

import { useState, useEffect, useMemo } from "react"
import { useUser } from "./UserContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Mic, Search, CalendarIcon, Check, Plus, X, Trash2 } from "lucide-react"
import { format } from "date-fns"
import type { EcoAction } from "@/lib/eco-tracker/types"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { categoryIcons, getCategoryColor } from "@/lib/eco-tracker/utils"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

// Real Speech Recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function ActionLogging() {
  const { userData, onAddAction, onRemoveAction, onAddCustomAction } = useUser()
  const [update, setUpdate] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isListening, setIsListening] = useState(false)
  const [voiceText, setVoiceText] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [customAction, setCustomAction] = useState("")
  const [showAddCustom, setShowAddCustom] = useState(false)
  const [selectedCustomCategory, setSelectedCustomCategory] = useState("transport")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [actionToDelete, setActionToDelete] = useState<EcoAction | null>(null)
  const [customImpact, setCustomImpact] = useState({
    co2Saved: 1.0,
    wasteSaved: 0.2,
    energySaved: 0.5,
    waterSaved: 0.3,
  })
  const [recentlyUsed, setRecentlyUsed] = useState<EcoAction[]>([])

  useEffect(() => {
    setUpdate((prev) => !prev)
  }, [userData.logs.length])

  const recentlyUsedMemo = useMemo(() => {
    const recent = userData.logs.slice(0, 5).map((log) => {
      return (
        userData.availableActions.find((action) => action.id === log.actionId) || {
          id: log.actionId,
          name: log.actionName,
          category: log.category,
          impact: log.impact,
          icon: "✓",
        }
      )
    })
    return recent
  }, [userData.logs, userData.availableActions])

  const handleStartListening = () => {
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition.")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.lang = "en-US"

    recognition.onstart = () => setIsListening(true)
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setVoiceText(transcript)
    }

    recognition.onend = () => setIsListening(false)
    recognition.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error)
      setIsListening(false)
    }

    recognition.start()
  }

  const handleLogAction = (action: EcoAction) => {
    onAddAction(action, new Date())
    const newRecentlyUsed = [
      action,
      ...recentlyUsed.filter((a) => a.id !== action.id)
    ].slice(0, 5)
    setRecentlyUsed(newRecentlyUsed)
  }

  const handleCreateCustomAction = () => {
    if (!customAction.trim()) return

    const newAction: Omit<EcoAction, "id"> = {
      name: customAction,
      category: selectedCustomCategory,
      impact: customImpact,
      icon: categoryIcons[selectedCustomCategory] || "✓",
    }

    onAddCustomAction(newAction)
    setCustomAction("")
    setShowAddCustom(false)

    setCustomImpact({
      co2Saved: 1.0,
      wasteSaved: 0.2,
      energySaved: 0.5,
      waterSaved: 0.3,
    })
  }

  const handleDeleteAction = () => {
    if (actionToDelete) {
      onRemoveAction(actionToDelete.id)
      setActionToDelete(null)
      setShowDeleteDialog(false)
    }
  }

  const confirmDelete = (action: EcoAction) => {
    setActionToDelete(action)
    setShowDeleteDialog(true)
  }

  const filteredActions = userData.availableActions.filter((action) => {
    const matchesSearch = searchQuery === "" || action.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === null || action.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = Array.from(new Set(userData.availableActions.map((action) => action.category)))

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold gradient-text mb-2">Log Your Eco-Actions</h2>
          <p className="text-gray-600 dark:text-gray-300">Track your sustainable activities and see your impact grow</p>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {format(selectedDate, "PPP")}
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              initialFocus
              disabled={(date) => date > new Date()}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center gap-4">
        <Button onClick={handleStartListening}>
          <Mic className="h-5 w-5" />
          {isListening ? "Listening..." : "Start Listening"}
        </Button>
        <p className="text-sm">{voiceText && `You said: "${voiceText}"`}</p>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {filteredActions.map((action) => (
            <motion.li
              key={action.id}
              className="flex items-center justify-between p-4 rounded-lg border hover:border-green-500 hover:shadow-md transition-all duration-200 cursor-pointer"
              onClick={() => handleLogAction(action)}
            >
              <div className="flex items-center gap-3">
                <Badge className={getCategoryColor(action.category)}>
                  {categoryIcons[action.category] || "♻️"}
                </Badge>
                <span>{action.name}</span>
              </div>
              <div className="text-xs text-gray-500">-{action.impact.co2Saved} kg CO₂</div>
            </motion.li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  )
}
