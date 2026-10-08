import React, { useState } from 'react';
import { X, Lock, Delete, Check, Users } from 'lucide-react';
import { StaffMember } from '../types';

interface StaffPinModalProps {
  staffList: StaffMember[];
  activeStaff: StaffMember;
  onSelectStaff: (staff: StaffMember) => void;
  onClose: () => void;
}

export const StaffPinModal: React.FC<StaffPinModalProps> = ({
  staffList,
  activeStaff,
  onSelectStaff,
  onClose,
}) => {
  const [selectedStaff, setSelectedStaff] = useState<StaffMember>(activeStaff);
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(null);

      // Auto-validate on 4th digit
      if (nextPin.length === 4) {
        if (nextPin === selectedStaff.pin) {
          onSelectStaff(selectedStaff);
        } else {
          setError('Incorrect PIN code. Try again.');
          setTimeout(() => setPin(''), 600);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-900">Switch Cashier / Server</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Staff Selection Strip */}
        <div className="p-4 bg-slate-50 border-b border-slate-100">
          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
            Select Staff Member:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {staffList.filter(s => s.active).map(staff => {
              const isSelected = selectedStaff.id === staff.id;
              return (
                <button
                  key={staff.id}
                  onClick={() => {
                    setSelectedStaff(staff);
                    setPin('');
                    setError(null);
                  }}
                  className={`p-2.5 rounded-xl text-left border transition-all flex items-center justify-between ${
                    isSelected 
                      ? 'bg-purple-600 border-purple-600 text-white shadow-xs' 
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="truncate">
                    <div className="text-xs font-bold truncate">{staff.name}</div>
                    <div className={`text-[10px] capitalize ${isSelected ? 'text-purple-200' : 'text-slate-400'}`}>
                      {staff.role}
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* PIN Entry Area */}
        <div className="p-5 text-center space-y-4">
          <div>
            <div className="text-xs font-medium text-slate-600">
              Enter 4-digit PIN for <span className="font-bold text-slate-900">{selectedStaff.name}</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              (Demo PIN: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">{selectedStaff.pin}</code>)
            </div>
          </div>

          {/* PIN dots */}
          <div className="flex justify-center items-center gap-3 py-2">
            {[0, 1, 2, 3].map(index => {
              const filled = pin.length > index;
              return (
                <div
                  key={index}
                  className={`w-3.5 h-3.5 rounded-full transition-all ${
                    filled
                      ? 'bg-purple-600 scale-110 shadow-xs'
                      : 'border-2 border-slate-300 bg-white'
                  }`}
                />
              );
            })}
          </div>

          {error && (
            <div className="text-xs font-semibold text-red-600 animate-shake">
              {error}
            </div>
          )}

          {/* Ergonomic Touch Numpad */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => (
              <button
                key={d}
                onClick={() => handleDigit(d)}
                className="h-12 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-900 font-bold text-lg rounded-xl flex items-center justify-center transition-transform"
              >
                {d}
              </button>
            ))}
            <div className="flex items-center justify-center text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <button
              onClick={() => handleDigit('0')}
              className="h-12 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-900 font-bold text-lg rounded-xl flex items-center justify-center transition-transform"
            >
              0
            </button>
            <button
              onClick={handleDelete}
              className="h-12 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-base rounded-xl flex items-center justify-center transition-transform"
              title="Delete"
            >
              <Delete className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
