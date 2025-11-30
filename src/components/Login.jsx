import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Activity } from 'lucide-react';

export function Login() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      alert(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md p-8 rounded-2xl border border-border shadow-xl">
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Activity className="text-primary w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-center">Exercícios Físicos</h1>
          <p className="text-muted-foreground text-center">
            Entre com seu email para sincronizar seus dados
          </p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="bg-primary/10 text-primary p-4 rounded-lg">
              <p className="font-medium">Link enviado!</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Verifique sua caixa de entrada (e spam) para acessar o app.
            </p>
            <button 
              onClick={() => setSent(false)}
              className="text-sm text-primary hover:underline"
            >
              Tentar outro email
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-secondary/50 border border-border focus:border-primary rounded-lg p-3 outline-none transition-all"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Entrar com Email'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
