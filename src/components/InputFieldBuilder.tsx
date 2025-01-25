import { useRef } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { GripVertical } from 'lucide-react'
import type { InputField } from '../types'
import { Card, CardContent } from './ui/card'
import { Input } from './ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { Switch } from './ui/switch'
import {
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from './ui/form'

interface DraggableFieldProps {
  field: InputField
  index: number
  moveField: (dragIndex: number, hoverIndex: number) => void
  onUpdate: (field: InputField) => void
}

const DraggableField: React.FC<DraggableFieldProps> = ({
  field,
  index,
  moveField,
  onUpdate,
}) => {
  const ref = useRef<HTMLDivElement>(null)

  const [{ isDragging }, drag] = useDrag({
    type: 'field',
    item: () => ({ index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
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
    },
  })

  drag(drop(ref))

  return (
    <Card
      ref={ref}
      className={`mb-4 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <CardContent className="flex items-start gap-4 pt-4">
        <div className="mt-3 cursor-move">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1 space-y-4">
          <FormItem>
            <FormLabel>Field Label</FormLabel>
            <FormControl>
              <Input
                value={field.label}
                onChange={(e) => onUpdate({ ...field, label: e.target.value })}
                placeholder="Enter field label"
              />
            </FormControl>
          </FormItem>

          <div className="grid grid-cols-2 gap-4">
            <FormItem>
              <FormLabel>Field Type</FormLabel>
              <Select
                value={field.type}
                onValueChange={(value: 'text' | 'number' | 'select') =>
                  onUpdate({ ...field, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="select">Select</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>

            <FormItem>
              <FormLabel>Required Field</FormLabel>
              <FormControl>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={field.required}
                    onCheckedChange={(checked) =>
                      onUpdate({ ...field, required: checked })
                    }
                  />
                  <span className="text-sm text-muted-foreground">
                    {field.required ? 'Required' : 'Optional'}
                  </span>
                </div>
              </FormControl>
            </FormItem>
          </div>

          {field.type === 'select' && (
            <FormItem>
              <FormLabel>Options</FormLabel>
              <FormControl>
                <Input
                  value={field.options?.join(', ') || ''}
                  onChange={(e) =>
                    onUpdate({
                      ...field,
                      options: e.target.value.split(',').map((opt) => opt.trim()),
                    })
                  }
                  placeholder="Enter options (comma-separated)"
                />
              </FormControl>
              <FormDescription>
                Enter options separated by commas
              </FormDescription>
            </FormItem>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface InputFieldBuilderProps {
  fields: InputField[]
  onFieldsChange: (fields: InputField[]) => void
}

export const InputFieldBuilder: React.FC<InputFieldBuilderProps> = ({
  fields,
  onFieldsChange,
}) => {
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
        {fields.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No input fields defined. Add placeholders in your template using {'{placeholder}'} syntax.
            </CardContent>
          </Card>
        )}
      </div>
    </DndProvider>
  )
}