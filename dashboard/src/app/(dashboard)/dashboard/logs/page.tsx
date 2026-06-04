'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Divider, Chip, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Select, SelectItem, Switch } from '@nextui-org/react';
import { ReceiptLong, Delete, Edit, Warning, Person } from '@mui/icons-material';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface LogEntry {
  id: string;
  action: string;
  target: string;
  moderator: string;
  reason: string;
  timestamp: string;
  type: 'ban' | 'kick' | 'mute' | 'warn' | 'unban';
}

interface LogsConfig {
  enabled: boolean;
  logChannel: string;
  logEvents: string[];
}

export default function LogsPage() {
  const { selectedGuild } = useAuthStore();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [config, setConfig] = useState<LogsConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (selectedGuild) {
      loadLogs();
      loadConfig();
    }
  }, [selectedGuild]);

  const loadLogs = async () => {
    if (!selectedGuild) return;
    setLoading(true);
    try {
      const data = await api.getLogs(selectedGuild.id);
      setLogs(data);
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConfig = async () => {
    if (!selectedGuild) return;
    try {
      const data = await api.getLogsConfig(selectedGuild.id);
      setConfig(data);
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  };

  const getActionColor = (type: string) => {
    switch (type) {
      case 'ban':
        return 'danger';
      case 'kick':
        return 'warning';
      case 'mute':
        return 'primary';
      case 'warn':
        return 'secondary';
      case 'unban':
        return 'success';
      default:
        return 'default';
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'ban':
        return <Delete className="text-red-500" />;
      case 'kick':
        return <Person className="text-orange-500" />;
      case 'mute':
        return <Warning className="text-blue-500" />;
      case 'warn':
        return <Warning className="text-yellow-500" />;
      case 'unban':
        return <Person className="text-green-500" />;
      default:
        return <Edit className="text-zinc-400" />;
    }
  };

  const filteredLogs = filter === 'all' ? logs : logs.filter(log => log.type === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Logs System</h1>
        <p className="text-zinc-400 mt-1">View and manage moderation logs</p>
      </div>

      {/* Configuration */}
      <Card className="bg-[#242424] border border-[#2f2f2f]">
        <CardHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-2">
            <ReceiptLong className="text-indigo-500" />
            <h2 className="text-xl font-semibold text-white">Log Configuration</h2>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="px-6 py-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Enable Logging</p>
              <p className="text-zinc-400 text-sm">Track all moderation actions</p>
            </div>
            <Switch
              isSelected={config?.enabled || false}
              onValueChange={(value) => setConfig({ ...config!, enabled: value })}
            />
          </div>

          <Select
            label="Log Channel"
            description="Channel to send log messages"
            selectedKeys={config?.logChannel ? [config.logChannel] : []}
            onChange={(e) => setConfig({ ...config!, logChannel: e.target.value })}
          >
            <SelectItem key="channel1" value="channel1">
              #mod-logs
            </SelectItem>
            <SelectItem key="channel2" value="channel2">
              #server-logs
            </SelectItem>
          </Select>
        </CardBody>
      </Card>

      {/* Logs Table */}
      <Card className="bg-[#242424] border border-[#2f2f2f]">
        <CardHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between w-full">
            <h2 className="text-xl font-semibold text-white">Moderation Logs</h2>
            <Select
              label="Filter"
              selectedKeys={[filter]}
              onChange={(e) => setFilter(e.target.value)}
              className="w-40"
            >
              <SelectItem key="all" value="all">All</SelectItem>
              <SelectItem key="ban" value="ban">Bans</SelectItem>
              <SelectItem key="kick" value="kick">Kicks</SelectItem>
              <SelectItem key="mute" value="mute">Mutes</SelectItem>
              <SelectItem key="warn" value="warn">Warnings</SelectItem>
            </Select>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="px-6 py-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <p className="text-zinc-400 text-center py-8">No logs found</p>
          ) : (
            <Table aria-label="Moderation logs" classNames={{
              wrapper: 'bg-transparent shadow-none',
            }}>
              <TableHeader>
                <TableColumn>Action</TableColumn>
                <TableColumn>Target</TableColumn>
                <TableColumn>Moderator</TableColumn>
                <TableColumn>Reason</TableColumn>
                <TableColumn>Date</TableColumn>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.type)}
                        <Chip color={getActionColor(log.type) as any} size="sm" variant="flat">
                          {log.action}
                        </Chip>
                      </div>
                    </TableCell>
                    <TableCell className="text-white">{log.target}</TableCell>
                    <TableCell className="text-zinc-300">{log.moderator}</TableCell>
                    <TableCell className="text-zinc-400 max-w-xs truncate">
                      {log.reason || '-'}
                    </TableCell>
                    <TableCell className="text-zinc-500 text-sm">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
