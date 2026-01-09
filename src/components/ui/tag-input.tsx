"use client"

import React, { useState, KeyboardEvent, useRef } from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface TagInputProps {
    name?: string
    placeholder?: string
    defaultValue?: string[]
    className?: string
    onChange?: (tags: string[]) => void
}

export function TagInput({
    name,
    placeholder = "Type and press Enter...",
    defaultValue = [],
    className,
    onChange
}: TagInputProps) {
    const [tags, setTags] = useState<string[]>(defaultValue)
    const [inputValue, setInputValue] = useState("")

    // Hidden input ref to ensure we update the value for form submission
    const hiddenInputRef = useRef<HTMLInputElement>(null)

    const addTag = (tag: string) => {
        const trimmed = tag.trim()
        if (trimmed && !tags.includes(trimmed)) {
            const newTags = [...tags, trimmed]
            setTags(newTags)
            onChange?.(newTags)
        }
        setInputValue("")
    }

    const removeTag = (tagToRemove: string) => {
        const newTags = tags.filter(tag => tag !== tagToRemove)
        setTags(newTags)
        onChange?.(newTags)
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault()
            addTag(inputValue)
        } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
            removeTag(tags[tags.length - 1])
        }
    }

    return (
        <div className={cn("flex flex-wrap gap-2 p-2 border rounded-md bg-white focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ring-offset-background border-input", className)}>
            {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1 pr-1 text-sm font-medium">
                    {tag}
                    <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:bg-secondary-foreground/20 rounded-full p-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                    >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove {tag}</span>
                    </button>
                </Badge>
            ))}
            <input
                type="text"
                className="flex-1 min-w-[120px] bg-transparent outline-none text-sm placeholder:text-muted-foreground ml-1 py-1"
                placeholder={tags.length === 0 ? placeholder : ""}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => inputValue && addTag(inputValue)}
            />
            {name && (
                <input
                    type="hidden"
                    name={name}
                    value={tags.join(",")}
                    ref={hiddenInputRef}
                />
            )}
        </div>
    )
}
