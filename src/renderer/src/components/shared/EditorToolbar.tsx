interface EditorToolbarProps {
  children?: React.ReactNode
}

function EditorToolbar({ children }: EditorToolbarProps): React.JSX.Element {
  return (
    <div className="flex h-[35px] shrink-0 items-center gap-1 border-b border-neutral-700 bg-neutral-800 px-2">
      {children}
    </div>
  )
}

export default EditorToolbar
