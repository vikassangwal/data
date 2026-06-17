'use client';

import { useState, useEffect } from 'react';
import { getSkills, updateSkill } from '@/app/actions/cms-editors';
import { Save, Code2 } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';

export default function SkillEditorPage() {
  const [loading, setLoading] = useState(true);
  const [skills, setSkills] = useState<any[]>([]);

  useEffect(() => {
    getSkills().then(data => {
      setSkills(data);
      setLoading(false);
    });
  }, []);

  async function handleSave(id: string, value: number) {
    await updateSkill(id, { value });
  }

  if (loading) return <div className="p-8 text-white">Loading Editor...</div>;

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Code2 className="w-8 h-8 text-primary" />
            Skills Matrix Editor
          </h1>
          <p className="text-muted-foreground mt-1">Manage your technical skills and proficiency levels.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skills.map(skill => (
          <GlassCard key={skill.id} className="p-6 border border-white/10 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">{skill.label}</h3>
              <span className="text-xs font-mono bg-primary/20 text-primary px-2 py-1 rounded-md">
                {skill.value}%
              </span>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Proficiency Level</label>
              <input
                type="range"
                min="0"
                max="100"
                value={skill.value}
                onChange={e => {
                  const newSkills = [...skills];
                  const idx = newSkills.findIndex(s => s.id === skill.id);
                  newSkills[idx].value = parseInt(e.target.value);
                  setSkills(newSkills);
                }}
                onMouseUp={() => handleSave(skill.id, skill.value)}
                onTouchEnd={() => handleSave(skill.id, skill.value)}
                className="w-full accent-primary"
              />
            </div>
          </GlassCard>
        ))}
        {skills.length === 0 && (
          <div className="col-span-full text-center p-12 text-white/40 border border-dashed border-white/20 rounded-2xl">
            No skills found in database.
          </div>
        )}
      </div>
    </div>
  );
}
