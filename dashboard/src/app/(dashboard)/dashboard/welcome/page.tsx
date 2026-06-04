'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Divider, Switch, Input, Button, Textarea, Select, SelectItem } from '@nextui-org/react';
import { PersonAdd, Badge, Email, Role } from '@mui/icons-material';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface WelcomeConfig {
  welcomeChannel: string;
  welcomeMessage: string;
  welcomeEnabled: boolean;
  dmWelcome: string;
  dmEnabled: boolean;
  autoRoleId: string;
  autoRoleEnabled: boolean;
}

export default function WelcomePage() {
  const { selectedGuild } = useAuthStore();
  const [welcomeConfig, setWelcomeConfig] = useState<WelcomeConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (selectedGuild) {
      loadConfig();
    }
  }, [selectedGuild]);

  const loadConfig = async () => {
    if (!selectedGuild) return;
    setLoading(true);
    try {
      const data = await api.getWelcomeConfig(selectedGuild.id);
      setWelcomeConfig(data);
    } catch (error) {
      console.error('Failed to load config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedGuild || !welcomeConfig) return;
    setSaving(true);
    try {
      await api.updateWelcomeConfig(selectedGuild.id, welcomeConfig);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save config:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Welcome & Auto Role</h1>
        <p className="text-zinc-400 mt-1">Configure welcome messages and automatic role assignment</p>
      </div>

      {/* Welcome Message */}
      <Card className="bg-[#242424] border border-[#2f2f2f]">
        <CardHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-2">
            <PersonAdd className="text-green-500" />
            <h2 className="text-xl font-semibold text-white">Welcome Message</h2>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="px-6 py-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Enable Welcome Message</p>
              <p className="text-zinc-400 text-sm">Send a welcome message when new members join</p>
            </div>
            <Switch
              isSelected={welcomeConfig?.welcomeEnabled || false}
              onValueChange={(value) => setWelcomeConfig({ ...welcomeConfig!, welcomeEnabled: value })}
            />
          </div>

          <Select
            label="Welcome Channel"
            description="Channel to send welcome messages"
            selectedKeys={welcomeConfig?.welcomeChannel ? [welcomeConfig.welcomeChannel] : []}
            onChange={(e) => setWelcomeConfig({ ...welcomeConfig!, welcomeChannel: e.target.value })}
            isDisabled={!welcomeConfig?.welcomeEnabled}
          >
            <SelectItem key="channel1" value="channel1">
              #welcome
            </SelectItem>
            <SelectItem key="channel2" value="channel2">
              #general
            </SelectItem>
          </Select>

          <Textarea
            label="Welcome Message"
            description="Message to send (Use {user}, {server}, {count} as variables)"
            value={welcomeConfig?.welcomeMessage || 'Welcome {user} to {server}! You are member #{count}.'}
            onChange={(e) => setWelcomeConfig({ ...welcomeConfig!, welcomeMessage: e.target.value })}
            minRows={3}
            isDisabled={!welcomeConfig?.welcomeEnabled}
          />

          <div className="bg-[#1a1a1a] p-4 rounded-lg">
            <p className="text-sm text-zinc-400 mb-2">Available variables:</p>
            <div className="grid grid-cols-3 gap-2">
              <code className="text-xs bg-[#2f2f2f] px-2 py-1 rounded">{`{user}`}</code>
              <code className="text-xs bg-[#2f2f2f] px-2 py-1 rounded">{`{server}`}</code>
              <code className="text-xs bg-[#2f2f2f] px-2 py-1 rounded">{`{count}`}</code>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* DM Welcome */}
      <Card className="bg-[#242424] border border-[#2f2f2f]">
        <CardHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-2">
            <Email className="text-blue-500" />
            <h2 className="text-xl font-semibold text-white">DM Welcome</h2>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="px-6 py-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Enable DM Welcome</p>
              <p className="text-zinc-400 text-sm">Send a direct message to new members</p>
            </div>
            <Switch
              isSelected={welcomeConfig?.dmEnabled || false}
              onValueChange={(value) => setWelcomeConfig({ ...welcomeConfig!, dmEnabled: value })}
            />
          </div>

          <Textarea
            label="DM Welcome Message"
            description="Message to send via DM"
            value={welcomeConfig?.dmWelcome || 'Welcome to {server}! Enjoy your stay!'}
            onChange={(e) => setWelcomeConfig({ ...welcomeConfig!, dmWelcome: e.target.value })}
            minRows={3}
            isDisabled={!welcomeConfig?.dmEnabled}
          />
        </CardBody>
      </Card>

      {/* Auto Role */}
      <Card className="bg-[#242424] border border-[#2f2f2f]">
        <CardHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-2">
            <Badge className="text-purple-500" />
            <h2 className="text-xl font-semibold text-white">Auto Role</h2>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="px-6 py-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Enable Auto Role</p>
              <p className="text-zinc-400 text-sm">Automatically assign a role to new members</p>
            </div>
            <Switch
              isSelected={welcomeConfig?.autoRoleEnabled || false}
              onValueChange={(value) => setWelcomeConfig({ ...welcomeConfig!, autoRoleEnabled: value })}
            />
          </div>

          <Select
            label="Auto Role"
            description="Role to assign to new members"
            selectedKeys={welcomeConfig?.autoRoleId ? [welcomeConfig.autoRoleId] : []}
            onChange={(e) => setWelcomeConfig({ ...welcomeConfig!, autoRoleId: e.target.value })}
            isDisabled={!welcomeConfig?.autoRoleEnabled}
          >
            <SelectItem key="role1" value="role1">
              @Member
            </SelectItem>
            <SelectItem key="role2" value="role2">
              @Verified
            </SelectItem>
          </Select>
        </CardBody>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          isLoading={saving}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8"
        >
          Save Settings
        </Button>
      </div>
    </div>
  );
}
