import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Lock } from 'lucide-react';

export function LoginPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const resp = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await resp.json().catch(() => ({}));

      if (!resp.ok) {
        toast.error(data?.error || 'Ошибка авторизации');
        return;
      }

      // Сервер выдал токен — храним его
      localStorage.setItem('adminToken', data.token);
      navigate('/admin');
    } catch (err) {
      toast.error('Не удалось подключиться к серверу');
    } finally {
      setLoading(false);
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
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-60"
          >
            {loading ? 'Проверяем…' : 'Войти'}
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
        </form>
      </div>
    </div>
  );
}
