import React from 'react';
import { Users, ShieldCheck } from 'lucide-react';

export function RegisterTrustedContacts({ contacts, setContacts }) {
  const handleChange = (index, field, value) => {
    const updated = [...contacts];
    updated[index][field] = value;
    setContacts(updated);
  };

  return (
    <fieldset className="border border-purple-200 rounded-xl p-4 bg-purple-50/50 space-y-3 high-contrast:bg-slate-800 high-contrast:border-purple-400">
      <legend className="text-xs font-bold uppercase tracking-wider text-purple-900 px-2 bg-white rounded border border-purple-200 flex items-center gap-1 high-contrast:bg-slate-900 high-contrast:text-amber-400">
        <Users className="w-3.5 h-3.5 text-purple-700" /> Pre-Registered Recovery Contacts
      </legend>

      <p className="text-[11px] text-slate-600 high-contrast:text-slate-300">
        Contact 1 is <strong>mandatory</strong>. Contacts 2 & 3 are optional to strengthen recovery.
      </p>

      <div className="space-y-2.5">
        {contacts.map((c, idx) => (
          <div key={idx} className="bg-white p-2.5 rounded-lg border border-purple-100 space-y-1.5 high-contrast:bg-slate-900 high-contrast:border-slate-700">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1 high-contrast:text-amber-400">
                {idx === 0 ? <>Contact 1 (Mandatory Primary) <span className="text-rose-500 font-bold ml-0.5">*</span></> : `Contact ${idx + 1} (Optional)`}
              </span>
              {idx === 0 && (
                <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3 text-amber-700" /> Required *
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <input
                type="text"
                required={idx === 0}
                placeholder={idx === 0 ? "Full Name (Required *)" : `Friend ${idx + 1} Name`}
                value={c.name}
                onChange={(e) => handleChange(idx, 'name', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-400 high-contrast:bg-slate-800 high-contrast:text-white"
              />
              <input
                type="email"
                required={idx === 0}
                placeholder={idx === 0 ? "Primary Email (Required *)" : `friend${idx + 1}@example.com`}
                value={c.email}
                onChange={(e) => handleChange(idx, 'email', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-400 high-contrast:bg-slate-800 high-contrast:text-white"
              />
            </div>
          </div>
        ))}
      </div>
    </fieldset>
  );
}
