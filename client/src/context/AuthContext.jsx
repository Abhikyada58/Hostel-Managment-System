import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);

  useEffect(() => {
    // Get active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user);
      else setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user);
      else {
        setProfile(null);
        setProfileError(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (authUser) => {
    try {
      setProfileError(null);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          console.log("Profile not found, auto-creating one...");
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert([{ 
              id: authUser.id, 
              name: authUser.user_metadata?.name || 'New User', 
              email: authUser.email, 
              role: authUser.user_metadata?.role || 'student', 
              status: 'active' 
            }])
            .select()
            .single();
            
          if (insertError) throw insertError;
          setProfile(newProfile);
          return;
        }
        throw error;
      }
      setProfile(data);
    } catch (error) {
      console.error('Error fetching/creating profile:', error);
      setProfileError(error.message || JSON.stringify(error));
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = async (email, password, metadata) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata } 
    });
  };

  const signOut = async () => {
    return await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, profileError, signIn, signUp, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
