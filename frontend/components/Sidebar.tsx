import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Users, 
  User, 
  Settings,
  Shield,
  Monitor
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'iso_officer', 'auditor'] },
  { name: 'Risks', href: '/risks', icon: AlertTriangle, roles: ['admin', 'iso_officer', 'auditor'] },
  { name: 'Risk Monitoring', href: '/monitoring', icon: Monitor, roles: ['admin', 'iso_officer', 'auditor'] },
  { name: 'Users', href: '/users', icon: Users, roles: ['admin'] },
  { name: 'Profile', href: '/profile', icon: User, roles: ['admin', 'iso_officer', 'auditor'] },
  { name: 'Settings', href: '/settings', icon: Settings, roles: ['admin'] },
];

export function Sidebar() {
  const { user } = useAuth();

  const filteredNavigation = navigation.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="flex items-center px-6 py-4 border-b">
        <Shield className="h-8 w-8 text-blue-600" />
        <span className="ml-2 text-xl font-bold text-gray-900">RiskGuard</span>
      </div>
      
      <nav className="mt-6">
        <div className="px-3">
          {filteredNavigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 transition-colors',
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )
              }
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
