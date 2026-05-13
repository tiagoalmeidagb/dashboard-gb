"use client"

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  KeyboardSensor,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Pencil, Trash2, Plus, Mail, MessageCircle, GalleryHorizontal } from "lucide-react"
import type { ContentTheme, ContentProduct } from "@/types/content"

const PRODUCT_COLORS: Record<ContentProduct, { bg: string; text: string; label: string }> = {
  instructor: { bg: "#EDE9FE", text: "#6D28D9", label: "ICP" },
  integration: { bg: "#F3F4F6", text: "#374151", label: "Integration" },
  "non-icp": { bg: "#FEF3C7", text: "#92400E", label: "Non-ICP" },
}

const FORMAT_PILLS = [
  { key: "email" as const,    icon: <Mail className="w-3 h-3" />,               label: "Email" },
  { key: "whatsapp" as const, icon: <MessageCircle className="w-3 h-3 text-green-600" />, label: "WhatsApp" },
  { key: "carousel" as const, icon: <GalleryHorizontal className="w-3 h-3" />,  label: "Carousel" },
]

function SortableThemeCard({
  theme,
  isSelected,
  onSelect,
  onDelete,
  onEdit,
}: {
  theme: ContentTheme
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  onEdit: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: theme.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const prod = PRODUCT_COLORS[theme.product]
  const activeFormats = FORMAT_PILLS.filter(f => theme.formats[f.key])

  return (
    <div
      ref={setNodeRef}
      style={{ ...style }}
      className="flex items-stretch gap-2 cursor-pointer"
      onClick={onSelect}
    >
      {/* Drag handle — left of card */}
      <button
        className="flex items-center text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing flex-shrink-0 px-0.5"
        {...attributes}
        {...listeners}
        onClick={e => e.stopPropagation()}
        aria-label="Drag"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Card */}
      <div
        className="flex-1 rounded-xl transition-all"
        style={{
          border: isSelected ? "1.5px solid #E2211C" : "1px solid #E5E7EB",
          background: "#FFFFFF",
          padding: "14px 14px 0 14px",
        }}
      >
        {/* Top row: title + action buttons */}
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 leading-snug">{theme.title}</p>
            {theme.angle && (
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                <span className="font-semibold text-gray-600">Angle:</span> {theme.angle}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-1.5 flex-shrink-0 ml-2" onClick={e => e.stopPropagation()}>
            <button
              className="w-7 h-7 flex items-center justify-center rounded-lg border transition-colors hover:bg-gray-50"
              style={{ border: "1px solid #E5E7EB" }}
              onClick={onEdit}
            >
              <Pencil className="w-3.5 h-3.5 text-gray-400" />
            </button>
            <button
              className="w-7 h-7 flex items-center justify-center rounded-lg border transition-colors hover:bg-red-50"
              style={{ border: "1px solid #FECACA" }}
              onClick={onDelete}
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
            </button>
          </div>
        </div>

        {/* Product badge */}
        <div className="mt-2.5">
          <span
            className="inline-block text-xs px-2.5 py-0.5 rounded-full font-medium"
            style={{ background: prod.bg, color: prod.text }}
          >
            {prod.label}
          </span>
        </div>

        {/* Divider */}
        <div className="mt-3 border-t border-gray-100" />

        {/* Format pills */}
        <div className="flex items-center gap-2 py-2.5">
          {activeFormats.map(f => (
            <span
              key={f.key}
              className="flex items-center gap-1.5 text-xs text-gray-600 px-2.5 py-1 rounded-lg"
              style={{ border: "1px solid #E5E7EB", background: "#FAFAFA" }}
            >
              {f.icon}
              {f.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

type Props = {
  themes: ContentTheme[]
  selectedId: string | null
  onSelect: (theme: ContentTheme) => void
  onReorder: (themes: ContentTheme[]) => void
  onDelete: (id: string) => void
  onEdit: (theme: ContentTheme) => void
  onCreateClick: () => void
}

export function ThemeQueue({ themes, selectedId, onSelect, onReorder, onDelete, onEdit, onCreateClick }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = themes.findIndex(t => t.id === active.id)
    const newIdx = themes.findIndex(t => t.id === over.id)
    onReorder(arrayMove(themes, oldIdx, newIdx))
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-sm font-semibold text-gray-900">Theme queue</h2>
        <div className="flex-1" />
        <button
          onClick={onCreateClick}
          className="flex items-center gap-1.5 text-sm text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
          style={{ background: "#E2211C" }}
        >
          <Plus className="w-3.5 h-3.5" />
          New theme
        </button>
      </div>

      {themes.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
          <p className="text-sm">No themes in queue.</p>
          <p className="text-xs mt-1">Click &ldquo;New theme&rdquo; to get started.</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={themes.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {themes.map(theme => (
                <SortableThemeCard
                  key={theme.id}
                  theme={theme}
                  isSelected={selectedId === theme.id}
                  onSelect={() => onSelect(theme)}
                  onDelete={() => onDelete(theme.id)}
                  onEdit={() => onEdit(theme)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}
