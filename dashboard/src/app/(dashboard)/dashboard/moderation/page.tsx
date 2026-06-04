'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Divider, Switch, Input, Select, SelectItem, Button, Textarea } from '@nextui-org/react';
import { Security, Block, Gavel, Delete } from '@mui/icons-material';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface ModerationConfig {
  antiSpam: boolean;
  antiLinks: boolean;
  antiBadWords: boolean;
  maxMessages: number;
  timeWindow: number;
  punishment: string;
  modRoles: string[];
  ignoredChannels: string[];
}

export default function ModerationPage() {
  const { selectedGuild } = useAuthStore();
  const [config, setConfig] = useState<ModerationConfig | null>(null);
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
      const data = await api.getModerationConfig(selectedGuild.id);
      setConfig(data);
    } catch (error) {
      console.error('Failed to load moderation config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedGuild || !config) return;
    setSaving(true);
    try {
      await api.updateModerationConfig(selectedGuild.id, config);
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
        <h1 className="text-3xl font-bold text-white">Moderation Settings</h1>
        <p className="text-zinc-400 mt-1">Configure moderation tools for your server</p>
      </div>

      {/* Anti-Spam */}
      <Card className="bg-[#242424] border border-[#2f2f2f]">
        <CardHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-2">
            <Security className="text-indigo-500" />
            <h2 className="text-xl font-semibold text-white">Anti-Spam</h2>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="px-6 py-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Enable Anti-Spam</p>
              <p className="text-zinc-400 text-sm">Automatically detect and prevent spam messages</p>
            </div>
            <Switch
              isSelected={config?.antiSpam || false}
              onValueChange={(value) => setConfig({ ...config!, antiSpam: value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Max Messages"
              description="Maximum messages allowed in time window"
              type="number"
              value={config?.maxMessages?.toString() || '5'}
              onChange={(e) => setConfig({ ...config!, maxMessages: parseInt(e.target.value) })}
              disabled={!config?.antiSpam}
            />
            <Input
              label="Time Window (seconds)"
              description="Time window to check for spam"
              type="number"
              value={config?.timeWindow?.toString() || '5'}
              onChange={(e) => setConfig({ ...config!, timeWindow: parseInt(e.target.value) })}
              disabled={!config?.antiSpam}
            />
          </div>
        </CardBody>
      </Card>

      {/* Anti-Links */}
      <Card className="bg-[#242424] border border-[#2f2f2f]">
        <CardHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-2">
            <Block className="text-orange-500" />
            <h2 className="text-xl font-semibold text-white">Anti-Links</h2>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Enable Anti-Links</p>
              <p className="text-zinc-400 text-sm">Block all links in messages</p>
            </div>
            <Switch
              isSelected={config?.antiLinks || false}
              onValueChange={(value) => setConfig({ ...config!, antiLinks: value })}
            />
          </div>
        </CardBody>
      </Card>

      {/* Anti-Bad Words */}
      <Card className="bg-[#242424] border border-[#2f2f2f]">
        <CardHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-2">
            <Gavel className="text-red-500" />
            <h2 className="text-xl font-semibold text-white">Auto Moderation</h2>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="px-6 py-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Enable Bad Words Filter</p>
              <p className="text-zinc-400 text-sm">Automatically delete messages with bad words</p>
            </div>
            <Switch
              isSelected={config?.antiBadWords || false}
              onValueChange={(value) => setConfig({ ...config!, antiBadWords: value })}
            />
          </div>

          <Textarea
            label="Punishment"
            description="Action to take when rule is violated (warn, mute, kick, ban)"
            value={config?.punishment || 'warn'}
            onChange={(e) => setConfig({ ...config!, punishment: e.target.value })}
            disabled={!config?.antiBadWords}
          />
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
