// firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };

// hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { auth } from '../firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User
} from 'firebase/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  const login = (email: string, password: string) =>
    signInWithEmailAndPassword(auth, email, password);

  const register = (email: string, password: string) =>
    createUserWithEmailAndPassword(auth, email, password);

  const logout = () => signOut(auth);

  return {
    user,
    login,
    register,
    logout,
  };
}

// gebruik in component
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { db } from './firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from './hooks/useAuth';

export default function Home() {
  const { user, login, register, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [talent, setTalent] = useState('');
  const [opportunities, setOpportunities] = useState<string[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [filterTalent, setFilterTalent] = useState('');

  const suggestOpportunities = async () => {
    const suggestions = {
      "planten": ["Help op een plantage", "Verzorg kruidentuin", "Leer plantverzorging"],
      "koken": ["Kook mee in buurtcentrum", "Start je eigen catering", "Vrijwillige kookhulp"],
      "helpen": ["Help ouderen in de wijk", "Doe mee aan buurtproject", "Ondersteun op een zorgboerderij"]
    };

    const matched = suggestions[talent.toLowerCase()] || ["Geen suggesties gevonden. Probeer iets anders."];
    setOpportunities(matched);

    try {
      await addDoc(collection(db, "submissions"), {
        name,
        talent,
        suggestions: matched,
        timestamp: new Date()
      });
      fetchSubmissions();
    } catch (e) {
      console.error("Error saving data: ", e);
    }
  };

  const fetchSubmissions = async () => {
    const querySnapshot = await getDocs(collection(db, "submissions"));
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setSubmissions(data);
  };

  const deleteSubmission = async (id: string) => {
    await deleteDoc(doc(db, "submissions", id));
    fetchSubmissions();
  };

  const exportToCSV = () => {
    const header = "Naam,Talent,Suggesties\n";
    const rows = submissions.map((s) => `${s.name},${s.talent},"${s.suggestions?.join('; ')}"`).join("\n");
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'inzendingen.csv';
    link.click();
  };

  const filteredSubmissions = filterTalent
    ? submissions.filter((s) => s.talent.toLowerCase().includes(filterTalent.toLowerCase()))
    : submissions;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {!user ? (
        <Card>
          <CardContent className="space-y-4">
            <h2 className="text-lg font-semibold">Admin login / registratie</h2>
            <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input placeholder="Wachtwoord" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <div className="flex space-x-2">
              <Button onClick={() => login(email, password)}>Inloggen</Button>
              <Button onClick={() => register(email, password)} variant="outline">Registreren</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Button variant="outline" onClick={logout}>Uitloggen</Button>

          <Card>
            <CardContent className="space-y-4">
              <h1 className="text-xl font-bold">Mi Bun Srefi</h1>
              <p className="text-gray-600">Ontdek je talent en zie wat je kunt doen in je buurt.</p>
              <Input placeholder="Je naam" value={name} onChange={(e) => setName(e.target.value)} />
              <Input placeholder="Waar ben je goed in? (bijv. koken, planten, helpen)" value={talent} onChange={(e) => setTalent(e.target.value)} />
              <Button onClick={suggestOpportunities}>Toon suggesties</Button>
              <div className="space-y-2">
                {opportunities.map((item, idx) => (
                  <div key={idx} className="p-2 bg-gray-100 rounded-xl shadow">
                    {item}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4">
              <h2 className="text-lg font-semibold">Admin: Inzendingen beheren</h2>
              <Input placeholder="Filter op talent (bijv. planten)" value={filterTalent} onChange={(e) => setFilterTalent(e.target.value)} />
              <Button onClick={exportToCSV}>Exporteer naar CSV</Button>
              {filteredSubmissions.map((entry) => (
                <div key={entry.id} className="p-3 border rounded-lg space-y-1 bg-gray-50">
                  <p><strong>Naam:</strong> {entry.name}</p>
                  <p><strong>Talent:</strong> {entry.talent}</p>
                  <p><strong>Suggesties:</strong> {entry.suggestions?.join(", ")}</p>
                  <Button variant="destructive" size="sm" onClick={() => deleteSubmission(entry.id)}>Verwijder</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

