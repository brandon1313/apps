import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect, useCallback, useRef } from 'react'
import {
  BoldOutlined,
  ItalicOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  LineOutlined,
  LinkOutlined,
  PictureOutlined,
} from '@ant-design/icons'
import { Button, Tooltip } from 'antd'
import type { Editor } from '@tiptap/react'

type RichTextEditorProps = {
  value?: Record<string, unknown>
  onChange?: (value: Record<string, unknown>) => void
  placeholder?: string
  readOnly?: boolean
}

function ToolbarButton({
  label,
  active,
  onClick,
  icon,
}: {
  label: string
  active?: boolean
  onClick: () => void
  icon: React.ReactNode
}) {
  return (
    <Tooltip title={label}>
      <Button
        type={active ? 'primary' : 'text'}
        size="small"
        icon={icon}
        onClick={onClick}
        style={{ minWidth: 32 }}
      />
    </Tooltip>
  )
}

/** Compress an image File/Blob to a base64 JPEG data URL, max 1200px wide */
function compressToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = (e) => {
      const img = new window.Image()
      img.onerror = reject
      img.onload = () => {
        const MAX = 1200
        const scale = img.width > MAX ? MAX / img.width : 1
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      img.src = e.target!.result as string
    }
    reader.readAsDataURL(file)
  })
}

async function embedImage(editor: Editor, file: File | Blob) {
  const src = await compressToBase64(file)
  editor.chain().focus().setImage({ src }).run()
}

export function RichTextEditor({ value, onChange, placeholder, readOnly = false }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  // Keep a stable ref to the editor so DOM listeners can access it
  const editorRef = useRef<Editor | null>(null)
  // Track whether the last value change came from the user typing (internal)
  // so we don't call setContent in response to our own onChange, which resets the cursor.
  const internalChangeRef = useRef(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Link.configure({ openOnClick: false }),
      Image.configure({ allowBase64: true }),
      Placeholder.configure({ placeholder: placeholder ?? 'Escribe el contenido aquí...' }),
    ],
    content: value ?? undefined,
    editable: !readOnly,
    onCreate({ editor: e }) { editorRef.current = e },
    onUpdate({ editor: e }) {
      editorRef.current = e
      internalChangeRef.current = true  // mark: this value change comes from user input
      onChange?.(e.getJSON() as Record<string, unknown>)
    },
  })

  // Attach paste/drop listeners directly to the editor DOM node.
  // We only intercept image files — all text/HTML paste goes through TipTap untouched.
  useEffect(() => {
    if (!editor || readOnly) return
    const dom = editor.view.dom

    function onPaste(event: ClipboardEvent) {
      const items = Array.from(event.clipboardData?.items ?? [])
      const imageItem = items.find((i) => i.kind === 'file' && i.type.startsWith('image/'))
      if (!imageItem) return // let TipTap handle non-image paste normally
      const file = imageItem.getAsFile()
      if (!file || !editorRef.current) return
      event.preventDefault()
      void embedImage(editorRef.current, file)
    }

    function onDrop(event: DragEvent) {
      const files = Array.from(event.dataTransfer?.files ?? [])
      const imageFile = files.find((f) => f.type.startsWith('image/'))
      if (!imageFile) return // let TipTap handle non-image drop normally
      event.preventDefault()
      event.stopPropagation()
      void embedImage(editorRef.current!, imageFile)
    }

    dom.addEventListener('paste', onPaste as EventListener)
    dom.addEventListener('drop', onDrop as EventListener)
    return () => {
      dom.removeEventListener('paste', onPaste as EventListener)
      dom.removeEventListener('drop', onDrop as EventListener)
    }
  }, [editor, readOnly])

  // Sync only EXTERNAL value changes (e.g. form.resetFields() or loading existing content).
  // If the change came from the user typing we skip it — calling setContent would reset the cursor.
  useEffect(() => {
    if (!editor) return
    if (internalChangeRef.current) {
      // Echo of our own onChange — do nothing
      internalChangeRef.current = false
      return
    }
    // External change: load content or clear on reset
    if (value) {
      editor.commands.setContent(value)
    } else {
      editor.commands.clearContent(false)
    }
  }, [editor, value])

  const setLink = useCallback(() => {
    if (!editor) return
    const prev = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('URL del enlace', prev ?? 'https://')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
  }, [editor])

  const handleImageButtonClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileInputChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && editorRef.current) {
      await embedImage(editorRef.current, file)
    }
    e.target.value = ''
  }, [])

  if (!editor) return null

  return (
    <div className="tiptap-editor-wrapper">
      {!readOnly && (
        <div className="tiptap-toolbar">
          <ToolbarButton
            label="Negrita"
            active={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
            icon={<BoldOutlined />}
          />
          <ToolbarButton
            label="Cursiva"
            active={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            icon={<ItalicOutlined />}
          />
          <div className="tiptap-divider" />
          {([1, 2, 3] as const).map((level) => (
            <ToolbarButton
              key={level}
              label={`Título ${level}`}
              active={editor.isActive('heading', { level })}
              onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
              icon={<span style={{ fontWeight: 700, fontSize: 12 }}>H{level}</span>}
            />
          ))}
          <div className="tiptap-divider" />
          <ToolbarButton
            label="Lista con viñetas"
            active={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            icon={<UnorderedListOutlined />}
          />
          <ToolbarButton
            label="Lista numerada"
            active={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            icon={<OrderedListOutlined />}
          />
          <ToolbarButton
            label="Cita"
            active={editor.isActive('blockquote')}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            icon={<span style={{ fontStyle: 'italic', fontSize: 14, fontWeight: 700 }}>"</span>}
          />
          <ToolbarButton
            label="Código"
            active={editor.isActive('codeBlock')}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            icon={<span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700 }}>{'</>'}</span>}
          />
          <div className="tiptap-divider" />
          <ToolbarButton
            label="Línea divisoria"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            icon={<LineOutlined />}
          />
          <ToolbarButton
            label="Enlace"
            active={editor.isActive('link')}
            onClick={setLink}
            icon={<LinkOutlined />}
          />
          <Tooltip title="Imagen — pega, arrastra o selecciona archivo">
            <Button
              type="text"
              size="small"
              icon={<PictureOutlined />}
              onClick={handleImageButtonClick}
              style={{ minWidth: 32 }}
            />
          </Tooltip>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileInputChange}
          />
        </div>
      )}
      <EditorContent editor={editor} className="tiptap-content" />
    </div>
  )
}
