import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Lock } from 'lucide-react';

export function LoginPage() {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Простая проверка пароля (в реальном приложении используйте более безопасный подход)
    if (!adminPassword) {
      toast.error('Пароль для админ-панели не настроен');
      return;
    }

    if (password === adminPassword) {
      localStorage.setItem('adminAuth', 'true');
      navigate('/admin');
    } else {
      toast.error('Неверный пароль');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
            <Lock size={32} className="text-teal-600" />
          </div>
          <h1 className="text-2xl text-gray-900">Вход в админ-панель</h1>
          <p className="text-gray-600 mt-2">Введите пароль для продолжения</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm text-gray-700 mb-2">
              Пароль
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Введите пароль"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Войти
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Вернуться на сайт
            </button>
          </div>

          {!adminPassword && (
            <div className="mt-6 p-4 bg-amber-50 rounded-lg">
              <p className="text-xs text-amber-700 text-center">
                Добавьте VITE_ADMIN_PASSWORD в .env, чтобы включить вход.
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
