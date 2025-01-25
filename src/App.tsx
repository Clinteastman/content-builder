import { useState } from 'react'
import {
  AppBar,
  Box,
  Button,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  ThemeProvider,
  Toolbar,
  Typography,
  createTheme
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { TemplateEditor } from './components/TemplateEditor'
import { InputFieldBuilder } from './components/InputFieldBuilder'
import { PreviewPane } from './components/PreviewPane'
import { ImportExportControls } from './components/ImportExportControls'
import { useTemplateInputs } from './hooks/useTemplateInputs'
import useTemplateStore from './store/templateStore'

const drawerWidth = 240
const theme = createTheme()

export default function App() {
  const { templates, activeTemplate, addTemplate, setActiveTemplate } = useTemplateStore()
  const [isNewTemplateDialogOpen, setNewTemplateDialogOpen] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState('')

  const { fields, inputs, updateInput, output, isValid } = useTemplateInputs(
    activeTemplate?.content || ''
  )

  const handleCreateTemplate = () => {
    if (!newTemplateName.trim()) return

    addTemplate({
      name: newTemplateName,
      content: '',
      inputs: []
    })

    setNewTemplateName('')
    setNewTemplateDialogOpen(false)
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              Prompt Builder
            </Typography>
            <ImportExportControls />
          </Toolbar>
        </AppBar>

        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto' }}>
            <List>
              <ListItem disablePadding>
                <ListItemButton onClick={() => setNewTemplateDialogOpen(true)}>
                  <AddIcon sx={{ mr: 1 }} />
                  <ListItemText primary="New Template" />
                </ListItemButton>
              </ListItem>
              {templates.map((template) => (
                <ListItem key={template.id} disablePadding>
                  <ListItemButton
                    selected={template.id === activeTemplate?.id}
                    onClick={() => setActiveTemplate(template)}
                  >
                    <ListItemText primary={template.name} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>

        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar />
          {activeTemplate ? (
            <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: '1fr 1fr' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TemplateEditor />
                <InputFieldBuilder
                  fields={fields}
                  onFieldsChange={(updatedFields) => {
                    if (activeTemplate) {
                      useTemplateStore.getState().updateTemplate(
                        activeTemplate.id,
                        { inputs: updatedFields }
                      )
                    }
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'grid', gap: 2 }}>
                  {fields.map((field) => (
                    <TextField
                      key={field.key}
                      label={field.label}
                      value={inputs[field.key] || ''}
                      onChange={(e) => updateInput(field.key, e.target.value)}
                      required={field.required}
                      type={field.type === 'number' ? 'number' : 'text'}
                      select={field.type === 'select'}
                      SelectProps={{ native: true }}
                    >
                      {field.type === 'select' && (
                        <>
                          <option value="">Select an option</option>
                          {field.options?.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </>
                      )}
                    </TextField>
                  ))}
                </Box>
                <PreviewPane content={output} isValid={isValid} />
              </Box>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 'calc(100vh - 128px)',
              }}
            >
              <Typography color="text.secondary">
                Select a template or create a new one to get started
              </Typography>
            </Box>
          )}
        </Box>

        <Dialog
          open={isNewTemplateDialogOpen}
          onClose={() => setNewTemplateDialogOpen(false)}
        >
          <DialogTitle>Create New Template</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Template Name"
              fullWidth
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setNewTemplateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateTemplate}>Create</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  )
}
