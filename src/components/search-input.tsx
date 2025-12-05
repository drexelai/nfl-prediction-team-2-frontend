'use client'
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut"
import { useState } from "react"
import { Button } from "./ui/button"
import { NFLGameSearch } from "./nfl-game-search"
import { Search } from "lucide-react"

export const SearchInput = () => {
	const [searchOpen, setSearchOpen] = useState(false)
	useKeyboardShortcut('k', () => setSearchOpen(true), { meta: true })
	useKeyboardShortcut('k', () => setSearchOpen(true), { ctrl: true })

	return (
		<>
			<Button
				onClick={() => setSearchOpen(true)}
				variant="outline"
				size="sm"
				className="gap-2">
				<Search className="size-4" />
				<span>Search games...</span>
				<kbd className="hidden sm:inline-block px-2 py-0.5 text-xs bg-muted/10 rounded border">
					⌘K
				</kbd>
			</Button>
			<NFLGameSearch isOpen={searchOpen} handleClose={() => setSearchOpen(false)} />
		</>
	)
}
