import React, { useState } from 'react';
import { format } from 'date-fns';
import { Mail, Phone, X, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VolunteerInquiry } from '@/api/entities';
import { StatusBadge, VOLUNTEER_STATUS_TONES, VOLUNTEER_STATUS_LABELS, VOLUNTEER_INTEREST_LABELS } from '@/components/admin/dashboard-ui';

function Detail({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{children}</dd>
    </div>
  );
}

// Mounted per volunteer (keyed by id), so form state starts from that record.
export default function VolunteerDetailModal({ volunteer, onClose, onUpdate }) {
  const [status, setStatus] = useState(volunteer?.status || 'new');
  const [adminNotes, setAdminNotes] = useState(volunteer?.admin_notes || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!volunteer) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await VolunteerInquiry.update(volunteer.id, { status, admin_notes: adminNotes });
      onUpdate();
    } catch (error) {
      console.error('Error updating volunteer:', error);
      toast.error('Could not save changes', { description: error?.message });
      setIsSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <div
        aria-labelledby="volunteer-title"
        className="relative z-50 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 font-semibold uppercase text-blue-700">
              {volunteer.name?.[0] ?? '?'}
            </span>
            <div className="min-w-0">
              <h2 id="volunteer-title" className="truncate font-display text-lg font-semibold text-gray-900">{volunteer.name}</h2>
              <p className="text-sm text-gray-500">Signed up {format(new Date(volunteer.created_date), 'MMM d, yyyy · h:mm a')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge tone={VOLUNTEER_STATUS_TONES[volunteer.status]}>{VOLUNTEER_STATUS_LABELS[volunteer.status] ?? volunteer.status}</StatusBadge>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <dl className="grid grid-cols-1 gap-5 px-6 py-5 sm:grid-cols-2">
          <Detail label="Email">
            <a href={`mailto:${volunteer.email}`} className="inline-flex items-center gap-1.5 break-all text-blue-700 hover:underline">
              <Mail className="h-4 w-4 shrink-0" aria-hidden="true" /> {volunteer.email}
            </a>
          </Detail>
          <Detail label="Phone">
            {volunteer.phone ? (
              <a href={`tel:${volunteer.phone}`} className="inline-flex items-center gap-1.5 text-blue-700 hover:underline">
                <Phone className="h-4 w-4 shrink-0" aria-hidden="true" /> {volunteer.phone}
              </a>
            ) : <span className="text-gray-400">Not given</span>}
          </Detail>
          <Detail label="Area of interest">
            {VOLUNTEER_INTEREST_LABELS[volunteer.interests] ?? <span className="text-gray-400">Not given</span>}
          </Detail>
          <Detail label="Availability">
            {volunteer.availability ? <span className="whitespace-pre-wrap">{volunteer.availability}</span> : <span className="text-gray-400">Not given</span>}
          </Detail>
          <div className="sm:col-span-2">
            <Detail label="Relevant experience">
              {volunteer.experience
                ? <p className="whitespace-pre-wrap rounded-lg bg-gray-50 p-3 leading-relaxed">{volunteer.experience}</p>
                : <span className="text-gray-400">Not given</span>}
            </Detail>
          </div>
        </dl>

        <div className="space-y-4 border-t border-gray-100 bg-gray-50/70 px-6 py-5">
          <div className="space-y-2">
            <Label htmlFor="volunteer-status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="volunteer-status" className="h-10 bg-white sm:w-60"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(VOLUNTEER_STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="volunteer-notes">Admin notes</Label>
            <Textarea
              id="volunteer-notes"
              rows={3}
              className="bg-white"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Internal notes, e.g. when you called and what they can help with"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
              {isSaving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
              Save changes
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
