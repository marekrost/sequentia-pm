interface ToolbarButtonProps {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  title?: string
  className?: string
}

function ToolbarButton({
  children,
  onClick,
  disabled,
  title,
  className = ''
}: ToolbarButtonProps): React.JSX.Element {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`rounded bg-transparent px-2 py-0.5 text-sm text-neutral-300 transition-colors hover:bg-white/10 disabled:pointer-events-none disabled:opacity-40 ${className}`}
    >
      {children}
    </button>
  )
}

export default ToolbarButton
