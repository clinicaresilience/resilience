import { useState, useEffect } from 'react';

export function useWelcomeScreen() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user should see welcome screen from database
  useEffect(() => {
    const checkWelcomeStatus = async () => {
      try {
        const response = await fetch('/api/user-preferences');
        const data = await response.json();
        
        if (data.success && data.data.showWelcome) {
          setShowWelcome(true);
        } else {
          setShowWelcome(false);
        }
      } catch (error) {
        console.error('Erro ao carregar preferências de boas-vindas:', error);
        setShowWelcome(false);
      } finally {
        setLoading(false);
      }
    };

    // Small delay to ensure the user is fully loaded
    const timer = setTimeout(checkWelcomeStatus, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const hideWelcome = () => {
    setShowWelcome(false);
  };

  const disableWelcomeForever = async () => {
    try {
      const response = await fetch('/api/user-preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ showWelcome: false }),
      });

      if (response.ok) {
        setShowWelcome(false);
      }
    } catch (error) {
      console.error('Erro ao atualizar preferências:', error);
    }
  };

  const forceShowWelcome = () => {
    setShowWelcome(true);
  };

  return {
    showWelcome,
    hideWelcome,
    disableWelcomeForever,
    forceShowWelcome,
    loading
  };
}
