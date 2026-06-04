'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Divider, Button, Slider, Input } from '@nextui-org/react';
import {
  PlayArrow,
  Pause,
  SkipNext,
  SkipPrevious,
  Stop,
  VolumeUp,
  QueueMusic,
  MusicNote,
} from '@mui/icons-material';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface Track {
  title: string;
  author: string;
  duration: number;
  uri: string;
}

interface QueueInfo {
  currentTrack: Track | null;
  queue: Track[];
  volume: number;
  isPlaying: boolean;
}

export default function MusicPage() {
  const { selectedGuild } = useAuthStore();
  const [queueInfo, setQueueInfo] = useState<QueueInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [volume, setVolume] = useState(100);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedGuild) {
      fetchQueueInfo();
      const interval = setInterval(fetchQueueInfo, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedGuild]);

  const fetchQueueInfo = async () => {
    if (!selectedGuild) return;
    try {
      const data = await api.getMusicStatus(selectedGuild.id);
      setQueueInfo(data);
      setVolume(data.volume);
    } catch (error) {
      console.error('Failed to fetch queue info:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !selectedGuild) return;
    setLoading(true);
    try {
      await api.controlMusic(selectedGuild.id, 'search', { query: searchQuery });
      setSearchQuery('');
      fetchQueueInfo();
    } catch (error) {
      console.error('Failed to search:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = async () => {
    if (!selectedGuild) return;
    await api.controlMusic(selectedGuild.id, 'play');
    fetchQueueInfo();
  };

  const handlePause = async () => {
    if (!selectedGuild) return;
    await api.controlMusic(selectedGuild.id, 'pause');
    fetchQueueInfo();
  };

  const handleSkip = async () => {
    if (!selectedGuild) return;
    await api.controlMusic(selectedGuild.id, 'skip');
    fetchQueueInfo();
  };

  const handleStop = async () => {
    if (!selectedGuild) return;
    await api.controlMusic(selectedGuild.id, 'stop');
    fetchQueueInfo();
  };

  const handleVolumeChange = async (value: number | number[]) => {
    const newVolume = Array.isArray(value) ? value[0] : value;
    setVolume(newVolume);
    if (selectedGuild) {
      await api.controlMusic(selectedGuild.id, 'volume', { volume: newVolume });
    }
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Music Control</h1>
        <p className="text-zinc-400 mt-1">Control the music player in your server</p>
      </div>

      {/* Search */}
      <Card className="bg-[#242424] border border-[#2f2f2f]">
        <CardBody className="p-6">
          <div className="flex gap-4">
            <Input
              placeholder="Search for a song or paste URL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              startContent={<MusicNote className="text-zinc-400" />}
              className="flex-1"
            />
            <Button
              onClick={handleSearch}
              isLoading={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Search
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Now Playing */}
      {queueInfo?.currentTrack && (
        <Card className="bg-[#242424] border border-[#2f2f2f]">
          <CardHeader className="px-6 pt-6 pb-4">
            <h2 className="text-xl font-semibold text-white">Now Playing</h2>
          </CardHeader>
          <Divider />
          <CardBody className="px-6 py-6">
            <div className="flex items-center gap-6">
              <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <MusicNote className="text-6xl text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white">
                  {queueInfo.currentTrack.title}
                </h3>
                <p className="text-zinc-400 mt-1">{queueInfo.currentTrack.author}</p>
                <p className="text-zinc-500 mt-2">
                  Duration: {formatDuration(queueInfo.currentTrack.duration)}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Controls */}
      <Card className="bg-[#242424] border border-[#2f2f2f]">
        <CardBody className="p-6">
          <div className="flex items-center justify-center gap-4">
            <Button
              isIconOnly
              onClick={handleStop}
              className="bg-[#2f2f2f] hover:bg-[#3f3f3f] text-white"
            >
              <Stop />
            </Button>
            <Button
              isIconOnly
              className="bg-[#2f2f2f] hover:bg-[#3f3f3f] text-white"
            >
              <SkipPrevious />
            </Button>
            <Button
              isIconOnly
              onClick={queueInfo?.isPlaying ? handlePause : handlePlay}
              className="bg-indigo-600 hover:bg-indigo-700 text-white w-16 h-16"
            >
              {queueInfo?.isPlaying ? (
                <Pause className="text-3xl" />
              ) : (
                <PlayArrow className="text-3xl" />
              )}
            </Button>
            <Button
              isIconOnly
              onClick={handleSkip}
              className="bg-[#2f2f2f] hover:bg-[#3f3f3f] text-white"
            >
              <SkipNext />
            </Button>
          </div>

          <div className="mt-8">
            <div className="flex items-center gap-4">
              <VolumeUp className="text-zinc-400" />
              <Slider
                label="Volume"
                value={volume}
                onChange={handleVolumeChange}
                className="flex-1"
                classNames={{
                  label: 'text-zinc-400',
                }}
              />
              <span className="text-white font-medium w-12">{volume}%</span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Queue */}
      <Card className="bg-[#242424] border border-[#2f2f2f]">
        <CardHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-2">
            <QueueMusic className="text-zinc-400" />
            <h2 className="text-xl font-semibold text-white">Queue</h2>
            <span className="text-zinc-400">
              ({queueInfo?.queue.length || 0} tracks)
            </span>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="px-6 py-4">
          {queueInfo?.queue.length === 0 ? (
            <p className="text-zinc-400 text-center py-8">Queue is empty</p>
          ) : (
            <div className="space-y-2">
              {queueInfo?.queue.slice(0, 10).map((track, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#1a1a1a] hover:bg-[#2f2f2f] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-500 w-6">{index + 1}</span>
                    <div>
                      <p className="text-white font-medium">{track.title}</p>
                      <p className="text-zinc-400 text-sm">{track.author}</p>
                    </div>
                  </div>
                  <span className="text-zinc-400">
                    {formatDuration(track.duration)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
