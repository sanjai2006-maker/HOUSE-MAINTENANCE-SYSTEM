import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import { TaskCategory, TaskFrequency } from '../types';
import { X, Calendar as CalendarIcon, Tag, Clock, FileText, Check, Loader2, Timer, MapPin, Phone, Bell, Plus } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { toast } from 'sonner';

export const TaskForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('other');
  const [frequency, setFrequency] = useState<TaskFrequency>('monthly');
  const [nextDue, setNextDue] = useState(format(addDays(new Date(), 7), 'yyyy-MM-dd'));
  const [expiryTime, setExpiryTime] = useState('12:00');
  const [address, setAddress] = useState('');
  const [contactDetails, setContactDetails] = useState('');
  const [reminderTiers, setReminderTiers] = useState<number[]>([7, 3, 1]);
  const [submitting, setSubmitting] = useState(false);
  
  const formEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Small delay to ensure the modal animation is underway
    const timer = setTimeout(() => {
      formEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleAddReminder = () => {
    setReminderTiers([...reminderTiers, 1].sort((a, b) => b - a));
  };

  const handleRemoveReminder = (index: number) => {
    setReminderTiers(reminderTiers.filter((_, i) => i !== index));
  };

  const handleReminderChange = (index: number, value: number) => {
    const newTiers = [...reminderTiers];
    newTiers[index] = value;
    setReminderTiers(newTiers.sort((a, b) => b - a));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setSubmitting(true);
    try {
      await api.tasks.create({
        title,
        description,
        category,
        frequency,
        nextDue: new Date(nextDue).toISOString(),
        expiryTime,
        address,
        contactDetails,
        status: 'pending',
        reminderTiers,
      });
      toast.success('Task scheduled successfully!');
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50 shrink-0">
          <h2 className="text-xl font-bold text-zinc-900">Add New Task</h2>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <FileText className="w-3 h-3" />
              Task Title
            </label>
            <input
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Check Smoke Detectors"
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Tag className="w-3 h-3" />
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all appearance-none"
              >
                <option value="structural">Structural</option>
                <option value="electrical">Electrical</option>
                <option value="plumbing">Plumbing</option>
                <option value="cleaning">Cleaning</option>
                <option value="safety">Safety</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Clock className="w-3 h-3" />
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as TaskFrequency)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all appearance-none"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="one-time">One-time</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <CalendarIcon className="w-3 h-3" />
                Next Due Date
              </label>
              <input
                required
                type="date"
                value={nextDue}
                onChange={(e) => setNextDue(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Timer className="w-3 h-3" />
                Expiry Time
              </label>
              <input
                required
                type="time"
                value={expiryTime}
                onChange={(e) => setExpiryTime(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <MapPin className="w-3 h-3" />
                Address (Optional)
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g., 123 Main St"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Phone className="w-3 h-3" />
                Contact Details (Optional)
              </label>
              <input
                type="text"
                value={contactDetails}
                onChange={(e) => setContactDetails(e.target.value)}
                placeholder="e.g., +1 234 567 890"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Bell className="w-3 h-3" />
                Reminder Tiers (Days Before)
              </label>
              <button 
                type="button"
                onClick={handleAddReminder}
                className="text-[10px] font-bold text-zinc-900 bg-zinc-100 px-2 py-1 rounded-lg hover:bg-zinc-200 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Tier
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {reminderTiers.map((tier, index) => (
                <div key={index} className="flex items-center gap-1 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 group">
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={tier}
                    onChange={(e) => handleReminderChange(index, parseInt(e.target.value) || 1)}
                    className="w-12 bg-transparent text-sm font-bold text-zinc-900 focus:outline-none"
                  />
                  <span className="text-xs text-zinc-400 font-medium mr-1">days</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveReminder(index)}
                    className="p-1 text-zinc-300 hover:text-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {reminderTiers.length === 0 && (
                <p className="text-xs text-zinc-400 italic">No reminders set.</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <FileText className="w-3 h-3" />
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any specific details or tools needed..."
              rows={3}
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all resize-none"
            />
          </div>

          <div ref={formEndRef} className="pt-4">
            <button
              disabled={submitting}
              type="submit"
              className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Create Task
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
