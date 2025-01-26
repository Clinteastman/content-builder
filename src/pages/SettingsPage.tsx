import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Label } from '../components/ui/label'
import { Switch } from '../components/ui/switch'
import { ApiConfigList } from '../components/ApiConfigList'

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* API Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>API Configurations</CardTitle>
          <CardDescription>
            Manage your API endpoints and authentication settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApiConfigList />
        </CardContent>
      </Card>

      {/* Application Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
          <CardDescription>
            Configure general application behavior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Stream Responses</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Show model responses as they are generated
              </p>
            </div>
            <Switch checked={true} onCheckedChange={() => {}} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}