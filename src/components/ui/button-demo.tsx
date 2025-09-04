import Link from "next/link"
import { ChevronRight, Loader2, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"

function ButtonDemo() {
  return <Button>Button</Button>
}

function ButtonSecondary() {
  return <Button variant="secondary">Secondary</Button>
}

function ButtonDestructive() {
  return <Button variant="destructive">Destructive</Button>
}

function ButtonOutline() {
  return <Button variant="outline">Outline</Button>
}

function ButtonGhost() {
  return <Button variant="ghost">Ghost</Button>
}

function ButtonLink() {
  return <Button variant="link">Link</Button>
}

function ButtonIcon() {
  return (
    <Button variant="outline" size="icon">
      <ChevronRight className="h-4 w-4" />
    </Button>
  )
}

function ButtonWithIcon() {
  return (
    <Button>
      <Mail className="mr-2 h-4 w-4" /> Login with Email
    </Button>
  )
}

function ButtonLoading() {
  return (
    <Button disabled>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Please wait
    </Button>
  )
}

function ButtonAsChild() {
  return (
    <Button asChild>
      <Link href="/login">Login</Link>
    </Button>
  )
}

const ButtonComponents = {
  ButtonDemo,
  ButtonSecondary,
  ButtonDestructive,
  ButtonOutline,
  ButtonGhost,
  ButtonLink,
  ButtonIcon,
  ButtonWithIcon,
  ButtonLoading,
  ButtonAsChild,
};

export default ButtonComponents;