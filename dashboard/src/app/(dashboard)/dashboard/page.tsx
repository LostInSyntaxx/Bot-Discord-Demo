'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Divider, Chip } from '@nextui-org/react';
import {
  People,
  Message,
  EmojiEvents,
  TrendingUp,
  SmartToy,
  Storage,
  Speed,
} from '@mui/icons-material';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface BotStats {
  guilds: number;
  users: number;
  commands: number;
  uptime: string;
  ping: number;
  memory: string;
  cpu: string;
}

interface StatCard {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  color: string;
}

export default function DashboardPage() {
  const { selectedGuild } = useAuthStore();
  const [stats, setStats] = useState<BotStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedGuild) {
      api.getGuildStats(selectedGuild.id)
        .then((data) => {
          setStats(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [selectedGuild]);

  const statCards: StatCard[] = [
    {
      icon: <People className="text-3xl" />,
      title: 'Total Members',
      value: stats?.users || 0,
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: <Message className="text-3xl" />,
      title: 'Messages Today',
      value: stats?.commands || 0,
      color: 'from-green-500 to-green-600',
    },
    {
      icon: <EmojiEvents className="text-3xl" />,
      title: 'Commands Used',
      value: stats?.commands || 0,
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: <TrendingUp className="text-3xl" />,
      title: 'Servers',
      value: stats?.guilds || 0,
      color: 'from-orange-500 to-orange-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-400 mt-1">
          Welcome back! Here's what's happening with your bot.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card
            key={index}
            className="bg-[#242424] border border-[#2f2f2f]"
          >
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">{stat.title}</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {loading ? '...' : stat.value}
                  </p>
                </div>
                <div
                  className={`w-16 h-16 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white`}
                >
                  {stat.icon}
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Bot Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#242424] border border-[#2f2f2f]">
          <CardHeader className="px-6 pt-6 pb-4">
            <h2 className="text-xl font-semibold text-white">Bot Status</h2>
          </CardHeader>
          <Divider />
          <CardBody className="px-6 py-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SmartToy className="text-zinc-400" />
                <span className="text-zinc-400">Status</span>
              </div>
              <Chip color="success" variant="flat">Online</Chip>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Speed className="text-zinc-400" />
                <span className="text-zinc-400">Ping</span>
              </div>
              <span className="text-white font-medium">
                {loading ? '...' : `${stats?.ping || 0}ms`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Storage className="text-zinc-400" />
                <span className="text-zinc-400">Memory</span>
              </div>
              <span className="text-white font-medium">
                {loading ? '...' : stats?.memory || '0 MB'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="text-zinc-400" />
                <span className="text-zinc-400">Uptime</span>
              </div>
              <span className="text-white font-medium">
                {loading ? '...' : stats?.uptime || '0h'}
              </span>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-[#242424] border border-[#2f2f2f]">
          <CardHeader className="px-6 pt-6 pb-4">
            <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
          </CardHeader>
          <Divider />
          <CardBody className="px-6 py-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                <div>
                  <p className="text-white text-sm">New member joined</p>
                  <p className="text-zinc-500 text-xs">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                <div>
                  <p className="text-white text-sm">Music played</p>
                  <p className="text-zinc-500 text-xs">5 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                <div>
                  <p className="text-white text-sm">Command executed</p>
                  <p className="text-zinc-500 text-xs">10 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-orange-500 mt-2"></div>
                <div>
                  <p className="text-white text-sm">Role assigned</p>
                  <p className="text-zinc-500 text-xs">15 minutes ago</p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
