import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings as SettingsIcon, Bell, Mail, User, Loader2 } from "lucide-react";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export default function Settings() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  
  const { data: preferences, isLoading } = trpc.preferences.get.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const [formData, setFormData] = useState({
    emailNotifications: true,
    newsletterFrequency: "weekly" as "daily" | "weekly" | "monthly" | "never",
    careReminders: true,
    newsAlerts: true,
    experienceLevel: "beginner" as "beginner" | "intermediate" | "advanced",
    measurementUnit: "imperial" as "imperial" | "metric",
  });

  // Update form when preferences load
  useEffect(() => {
    if (preferences) {
      setFormData({
        emailNotifications: preferences.emailNotifications ?? true,
        newsletterFrequency: preferences.newsletterFrequency ?? "weekly",
        careReminders: preferences.careReminders ?? true,
        newsAlerts: preferences.newsAlerts ?? true,
        experienceLevel: preferences.experienceLevel ?? "beginner",
        measurementUnit: preferences.measurementUnit ?? "imperial",
      });
    }
  }, [preferences]);

  const updatePreferences = trpc.preferences.update.useMutation({
    onSuccess: () => {
      toast.success("Settings saved successfully");
      utils.preferences.get.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save settings");
    },
  });

  // Show login prompt if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="container py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <SettingsIcon className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Settings</h1>
          <p className="text-muted-foreground mb-8">
            Sign in to manage your account settings and preferences.
          </p>
          <Button asChild size="lg">
            <a href={getLoginUrl()}>Sign In to Continue</a>
          </Button>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    updatePreferences.mutate(formData);
  };

  return (
    <div className="container py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account preferences and notifications
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-muted-foreground" />
              <CardTitle className="text-lg">Profile</CardTitle>
            </div>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {authLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <div className="grid gap-4">
                <div>
                  <Label className="text-muted-foreground">Name</Label>
                  <p className="font-medium">{user?.name || "Not set"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{user?.email || "Not set"}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Experience Level */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Experience Level</CardTitle>
            <CardDescription>
              This helps us personalize content and recommendations for you
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={formData.experienceLevel}
                onValueChange={(value: typeof formData.experienceLevel) => 
                  setFormData({ ...formData, experienceLevel: value })
                }
              >
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner - New to horses</SelectItem>
                  <SelectItem value="intermediate">Intermediate - Some experience</SelectItem>
                  <SelectItem value="advanced">Advanced - Experienced owner</SelectItem>
                </SelectContent>
              </Select>
            )}
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <CardTitle className="text-lg">Notifications</CardTitle>
            </div>
            <CardDescription>
              Control how and when you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications" className="font-medium">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive important updates via email
                    </p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={formData.emailNotifications}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, emailNotifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="careReminders" className="font-medium">Care Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Get reminders for scheduled horse care activities
                    </p>
                  </div>
                  <Switch
                    id="careReminders"
                    checked={formData.careReminders}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, careReminders: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="newsAlerts" className="font-medium">News Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive news about breeds in your stables
                    </p>
                  </div>
                  <Switch
                    id="newsAlerts"
                    checked={formData.newsAlerts}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, newsAlerts: checked })
                    }
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Newsletter Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <CardTitle className="text-lg">Newsletter</CardTitle>
            </div>
            <CardDescription>
              Receive educational content and tips about horse care
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <div className="space-y-2">
                <Label htmlFor="newsletterFrequency">Newsletter Frequency</Label>
                <Select
                  value={formData.newsletterFrequency}
                  onValueChange={(value: typeof formData.newsletterFrequency) => 
                    setFormData({ ...formData, newsletterFrequency: value })
                  }
                >
                  <SelectTrigger className="w-full md:w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Display Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Display Preferences</CardTitle>
            <CardDescription>
              Customize how information is displayed
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <div className="space-y-2">
                <Label htmlFor="measurementUnit">Measurement Unit</Label>
                <Select
                  value={formData.measurementUnit}
                  onValueChange={(value: typeof formData.measurementUnit) => 
                    setFormData({ ...formData, measurementUnit: value })
                  }
                >
                  <SelectTrigger className="w-full md:w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="imperial">Imperial (hands, lbs)</SelectItem>
                    <SelectItem value="metric">Metric (cm, kg)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSave}
            disabled={updatePreferences.isPending}
            size="lg"
          >
            {updatePreferences.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Settings"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
