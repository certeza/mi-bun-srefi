// pages/deelnemer.tsx
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function DeelnemerPage() {
  const [name, setName] = useState('');
  const [talent, setTalent] = useState('');
  const [opportunities, setOpportunities] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

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
      setSubmitted(true);
    } catch (e) {
      console.error("Error saving data: ", e);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      <Card>
        <CardContent className="space-y-4">
          <h1 className="text-xl font-bold">Welkom deelnemer</h1>
          <p className="text-gray-600">Ontdek waar je goed in bent en ontvang suggesties waar je kunt helpen in jouw buurt.</p>

          {!submitted ? (
            <>
              <Input placeholder="Je naam" value={name} onChange={(e) => setName(e.target.value)} />
              <Input placeholder="Waar ben je goed in? (bijv. koken, planten, helpen)" value={talent} onChange={(e) => setTalent(e.target.value)} />
              <Button onClick={suggestOpportunities}>Toon suggesties</Button>
            </>
          ) : (
            <div className="text-green-700 font-medium">Bedankt, je inzending is opgeslagen!</div>
          )}

          <div className="space-y-2">
            {opportunities.map((item, idx) => (
              <div key={idx} className="p-2 bg-gray-100 rounded-xl shadow">
                {item}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
