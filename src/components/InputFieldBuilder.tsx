import { useRef } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { TextField, Select, MenuItem, FormControlLabel, Checkbox } from '@mui/material'
import type { InputField } from '../types'

interface DraggableFieldProps {
  field: InputField
  index: number
  moveField: (dragIndex: number, hoverIndex: number) => void
  onUpdate: (field: InputField) => void
}

const DraggableField: React.FC<DraggableFieldProps> = ({ field, index, moveField, onUpdate }) => {
  const ref = useRef<HTMLDivElement>(null)

  const [{ isDragging }, drag] = useDrag({
    type: 'field',
    item: () => ({ index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  })

  const [, drop] = useDrop({
    accept: 'field',
    hover: (item: { index: number }) => {
      if (!ref.current) return
      const dragIndex = item.index
      const hoverIndex = index
      if (dragIndex === hoverIndex) return

      moveField(dragIndex, hoverIndex)
      item.index = hoverIndex
    }
  })

  drag(drop(ref))

  return (
    <div
      ref={ref}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="flex gap-4 p-4 border rounded-lg mb-2 bg-white cursor-move"
    >
      <TextField
        label="Label"
        value={field.label}
        onChange={(e) => onUpdate({ ...field, label: e.target.value })}
        size="small"
        className="flex-1"
      />
      <Select
        value={field.type}
        onChange={(e) => onUpdate({ ...field, type: e.target.value as InputField['type'] })}
        size="small"
        className="w-32"
      >
        <MenuItem value="text">Text</MenuItem>
        <MenuItem value="number">Number</MenuItem>
        <MenuItem value="select">Select</MenuItem>
      </Select>
      {field.type === 'select' && (
        <TextField
          label="Options (comma-separated)"
          value={field.options?.join(', ') || ''}
          onChange={(e) => onUpdate({
            ...field,
            options: e.target.value.split(',').map(opt => opt.trim())
          })}
          size="small"
          className="flex-1"
        />
      )}
      <FormControlLabel
        control={
          <Checkbox
            checked={field.required}
            onChange={(e) => onUpdate({ ...field, required: e.target.checked })}
            size="small"
          />
        }
        label="Required"
      />
    </div>
  )
}

interface InputFieldBuilderProps {
  fields: InputField[]
  onFieldsChange: (fields: InputField[]) => void
}

export const InputFieldBuilder: React.FC<InputFieldBuilderProps> = ({ fields, onFieldsChange }) => {
  const moveField = (dragIndex: number, hoverIndex: number) => {
    const newFields = [...fields]
    const dragField = newFields[dragIndex]
    newFields.splice(dragIndex, 1)
    newFields.splice(hoverIndex, 0, dragField)
    onFieldsChange(newFields)
  }

  const updateField = (index: number, updatedField: InputField) => {
    const newFields = [...fields]
    newFields[index] = updatedField
    onFieldsChange(newFields)
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-2">
        {fields.map((field, index) => (
          <DraggableField
            key={field.key}
            field={field}
            index={index}
            moveField={moveField}
            onUpdate={(updatedField) => updateField(index, updatedField)}
          />
        ))}
      </div>
    </DndProvider>
  )
}