import type { Metadata } from 'next'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export const metadata: Metadata = { title: 'Settings' }

export default function SettingsPage() {
  return (
    <PageContainer size="narrow">
      <PageHeader
        title="Settings"
        description="Manage your account and preferences."
      />

      <div className="space-y-6">
        {/* Profile section — placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-5">
            <p className="text-sm text-muted-foreground">
              Profile settings will be available in a later phase.
            </p>
          </CardContent>
        </Card>

        {/* Security section — placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-5">
            <p className="text-sm text-muted-foreground">
              Password and two-factor authentication settings will be available here.
            </p>
          </CardContent>
        </Card>

        {/* Notifications section — placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-5">
            <p className="text-sm text-muted-foreground">
              Alert and notification preferences will be available here.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
