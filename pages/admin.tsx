// pages/admin.tsx
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { db } from '../firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';

export default function AdminPage() {
  const { user, login, register, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [filterTalent, setFilterTalent] = useState('');

  const fetchSubmissions = async () => {
    const querySnapshot = await getDocs(collection(db, 'submissions'));
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setSubmissions(data);
  };

  const deleteSubmission = async (id: string) => {
    await deleteDoc(doc(db, 'submissions', id));
    fetchSubmissions();
  };

  const exportToCSV = () => {
    const header = 'Naam,Talent,Suggesties\n';
    const rows = submissions.map(s => `${s.name},${s.talent},"${s.suggestions?.join('; ')}"`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'inzendingen.csv';
    link.click();
  };

  const filteredSubmissions = filterTalent
    ? submissions.filter(s => s.talent.toLowerCase().includes(filterTalent.toLowerCase()))
    : submissions;

  useEffect(() => {
    if (user) fetchSubmissions();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto p-6">
        <Card>
          <CardContent className="space-y-4">
            <h2 className="text-lg font-semibold">Beheerder login / registratie</h2>
            <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input placeholder="Wachtwoord" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <div className="flex space-x-2">
              <Button onClick={() => login(email, password)}>Inloggen</Button>
              <Button onClick={() => register(email, password)} variant="outline">Registreren</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <Button variant="outline" onClick={logout}>Uitloggen</Button>
      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-lg font-semibold">Inzendingen beheren</h2>
          <Input placeholder="Filter op talent (bijv. planten)" value={filterTalent} onChange={(e) => setFilterTalent(e.target.value)} />
          <Button onClick={exportToCSV}>Exporteer naar CSV</Button>
          {filteredSubmissions.map(entry => (
            <div key={entry.id} className="p-3 border rounded-lg space-y-1 bg-gray-50">
              <p><strong>Naam:</strong> {entry.name}</p>
              <p><strong>Talent:</strong> {entry.talent}</p>
              <p><strong>Suggesties:</strong> {entry.suggestions?.join(', ')}</p>
              <Button variant="destructive" size="sm" onClick={() => deleteSubmission(entry.id)}>Verwijder</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
