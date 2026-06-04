import { useAuthStore } from '@/store/authStore';
import { Avatar, Select, SelectItem } from '@nextui-org/react';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Notifications } from '@mui/icons-material';

interface Guild {
  id: string;
  name: string;
  icon: string | null;
}

export default function Header() {
  const { user, selectedGuild, setSelectedGuild } = useAuthStore();
  const [guilds, setGuilds] = useState<Guild[]>([]);

  useEffect(() => {
    api.getGuilds().then((data) => {
      setGuilds(data);
      if (data.length > 0 && !selectedGuild) {
        setSelectedGuild(data[0]);
      }
    });
  }, [selectedGuild, setSelectedGuild]);

  return (
    <header className="bg-[#242424] border-b border-[#2f2f2f] px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {guilds.length > 0 && (
          <Select
            label="Select Server"
            selectedKeys={selectedGuild ? [selectedGuild.id] : []}
            onChange={(e) => {
              const guild = guilds.find((g) => g.id === e.target.value);
              setSelectedGuild(guild || null);
            }}
            className="min-w-[200px]"
            classNames={{
              label: 'text-zinc-400',
              value: 'text-white',
            }}
          >
            {guilds.map((guild) => (
              <SelectItem key={guild.id} value={guild.id}>
                {guild.name}
              </SelectItem>
            ))}
          </Select>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 rounded-lg hover:bg-[#2f2f2f] transition-colors">
          <Notifications className="text-zinc-400" />
        </button>

        {user && (
          <div className="flex items-center gap-3">
            <Avatar
              src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
              alt={user.username}
              className="w-10 h-10"
            />
            <div>
              <p className="text-sm font-medium text-white">{user.username}</p>
              <p className="text-xs text-zinc-400">Online</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
