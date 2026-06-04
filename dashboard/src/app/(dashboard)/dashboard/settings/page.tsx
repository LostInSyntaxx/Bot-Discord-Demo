'use client';

import { useState } from 'react';
import { Card, CardBody, CardHeader, Divider, Switch, Input, Button, Select, SelectItem } from '@nextui-org/react';
import { Settings, Language, Notifications, Security, Palette } from '@mui/icons-material';
import { useAuthStore } from '@/store/authStore';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [settings, setSettings] = useState({
    language: 'en',
    notifications: true,
    emailNotifications: false,
    twoFactor: false,
    theme: 'dark',
  });

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-zinc-400 mt-1">Manage your dashboard preferences</p>
      </div>

      {/* General Settings */}
      <Card className="bg-[#242424] border border-[#2f2f2f]">
        <CardHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-2">
            <Settings className="text-indigo-500" />
            <h2 className="text-xl font-semibold text-white">General Settings</h2>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="px-6 py-6 space-y-6">
          <Select
            label="Language"
            description="Select your preferred language"
            selectedKeys={[settings.language]}
            onChange={(e) => setSettings({ ...settings, language: e.target.value })}
          >
            <SelectItem key="en" value="en">
              English
            </SelectItem>
            <SelectItem key="th" value="th">
              ไทย
            </SelectItem>
            <SelectItem key="ja" value="ja">
              日本語
            </SelectItem>
          </Select>

          <Select
            label="Theme"
            description="Choose your dashboard theme"
            selectedKeys={[settings.theme]}
            onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
          >
            <SelectItem key="dark" value="dark">
              Dark
            </SelectItem>
            <SelectItem key="light" value="light">
              Light
            </SelectItem>
            <SelectItem key="system" value="system">
              System
            </SelectItem>
          </Select>
        </CardBody>
      </Card>

      {/* Notifications */}
      <Card className="bg-[#242424] border border-[#2f2f2f]">
        <CardHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-2">
            <Notifications className="text-green-500" />
            <h2 className="text-xl font-semibold text-white">Notifications</h2>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="px-6 py-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Push Notifications</p>
              <p className="text-zinc-400 text-sm">Receive notifications in the dashboard</p>
            </div>
            <Switch
              isSelected={settings.notifications}
              onValueChange={(value) => setSettings({ ...settings, notifications: value })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Email Notifications</p>
              <p className="text-zinc-400 text-sm">Receive notifications via email</p>
            </div>
            <Switch
              isSelected={settings.emailNotifications}
              onValueChange={(value) => setSettings({ ...settings, emailNotifications: value })}
            />
          </div>
        </CardBody>
      </Card>

      {/* Security */}
      <Card className="bg-[#242424] border border-[#2f2f2f]">
        <CardHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-2">
            <Security className="text-orange-500" />
            <h2 className="text-xl font-semibold text-white">Security</h2>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="px-6 py-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Two-Factor Authentication</p>
              <p className="text-zinc-400 text-sm">Add an extra layer of security to your account</p>
            </div>
            <Switch
              isSelected={settings.twoFactor}
              onValueChange={(value) => setSettings({ ...settings, twoFactor: value })}
            />
          </div>

          <div className="bg-[#1a1a1a] p-4 rounded-lg">
            <p className="text-sm text-white font-medium mb-2">Account Information</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Username:</span>
                <span className="text-white">{user?.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">User ID:</span>
                <span className="text-white">{user?.id}</span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8"
        >
          Save Settings
        </Button>
      </div>
    </div>
  );
}
