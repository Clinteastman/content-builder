import { useState } from 'react'
import { Edit2, MoreVertical, Star, Trash } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { ApiConfigForm } from './ApiConfigForm'
import { ApiConfig } from '../types/api-config'
import { useApiConfigStore } from '../store/apiConfigStore'

interface ApiConfigCardProps {
  config: ApiConfig
  onEdit: (config: ApiConfig) => void
  onDelete: (id: string) => void
  onSetDefault: (id: string) => void
}

function ApiConfigCard({ config, onEdit, onDelete, onSetDefault }: ApiConfigCardProps) {
  return (
    <Card className="relative">
      {config.isDefault && (
        <div className="absolute -top-2 -right-2 bg-white dark:bg-gray-900 rounded-full p-1 border border-gray-200 dark:border-gray-800">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg truncate pr-6">{config.name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(config)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              {!config.isDefault && (
                <DropdownMenuItem onClick={() => onSetDefault(config.id)}>
                  <Star className="h-4 w-4 mr-2" />
                  Set as Default
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 dark:text-red-400"
                onClick={() => onDelete(config.id)}
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription className="truncate">{config.url}</CardDescription>
      </CardHeader>
      <CardContent className="text-sm">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 dark:text-gray-400">Auth Type:</span>
            <span className="font-medium capitalize">{config.authType}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500 dark:text-gray-400">Headers:</span>
            <span className="font-medium">{config.headers.length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ApiConfigList() {
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingConfig, setEditingConfig] = useState<ApiConfig | undefined>()
  const { configs, addConfig, updateConfig, removeConfig, setDefaultConfig } = useApiConfigStore()

  const handleEdit = (config: ApiConfig) => {
    setEditingConfig(config)
  }

  const handleDelete = async (id: string) => {
    // In a real app, you might want to add a confirmation dialog here
    removeConfig(id)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">API Configurations</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage your API endpoints and authentication settings
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          Add Configuration
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {configs.map((config) => (
          <ApiConfigCard
            key={config.id}
            config={config}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSetDefault={setDefaultConfig}
          />
        ))}
      </div>

      <Dialog 
        open={isCreateDialogOpen || !!editingConfig} 
        onOpenChange={(open) => {
          if (!open) {
            setCreateDialogOpen(false)
            setEditingConfig(undefined)
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {editingConfig ? 'Edit Configuration' : 'Add New Configuration'}
            </DialogTitle>
          </DialogHeader>
          <ApiConfigForm
            config={editingConfig}
            onSubmit={(config) => {
              if ('id' in config) {
                updateConfig(config)
              } else {
                addConfig(config)
              }
              setCreateDialogOpen(false)
              setEditingConfig(undefined)
            }}
            onCancel={() => {
              setCreateDialogOpen(false)
              setEditingConfig(undefined)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}