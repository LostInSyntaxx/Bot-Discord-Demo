import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
  Dashboard as DashboardIcon,
  MusicNote,
  Security,
  PersonAdd,
  ReceiptLong,
  Settings,
  ExitToApp,
} from '@mui/icons-material';

const menuItems = [
  { icon: <DashboardIcon />, label: 'Dashboard', path: '/dashboard' },
  { icon: <MusicNote />, label: 'Music Control', path: '/dashboard/music' },
  { icon: <Security />, label: 'Moderation', path: '/dashboard/moderation' },
  { icon: <PersonAdd />, label: 'Welcome & Auto Role', path: '/dashboard/welcome' },
  { icon: <ReceiptLong />, label: 'Logs', path: '/dashboard/logs' },
  { icon: <Settings />, label: 'Settings', path: '/dashboard/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    localStorage.removeItem('token');
    logout();
    window.location.href = '/login';
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#242424] border-r border-[#2f2f2f] z-50">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white">Bot Dashboard</h1>
        <p className="text-sm text-zinc-400 mt-1">Manage your Discord bot</p>
      </div>

      <nav className="mt-6 px-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-zinc-400 hover:bg-[#2f2f2f] hover:text-white'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-zinc-400 hover:bg-[#2f2f2f] hover:text-white transition-all duration-200"
        >
          <ExitToApp />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
