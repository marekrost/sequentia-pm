interface StatusBarProps {
  children: React.ReactNode
}

function StatusBar({ children }: StatusBarProps): React.JSX.Element {
  return (
    <div className="flex h-[35px] shrink-0 items-center gap-3 border-t border-neutral-700 bg-neutral-800 px-2 text-sm text-neutral-400">
      {children}
    </div>
  )
}

export default StatusBar
