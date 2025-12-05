import { cn } from "@/lib/utils"
import Image from "next/image"

export const Logo = ({ className }: { className?: string }) => {
	return (
		<Image src="/assets/nfl-logo.png" alt="Logo" width={100} height={100} className={cn("size-10", className)} priority />
	)
}
