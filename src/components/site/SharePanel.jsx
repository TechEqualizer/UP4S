import React, { useState } from 'react';
import { Check, Facebook, Link2, Linkedin, Mail, MessageCircle, MessageSquare, Share2, Twitter } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { eventUrl, shareMessage, shareTargets } from '@/lib/events';

export async function copyEventLink(event) {
  const url = eventUrl(event);
  try {
    await navigator.clipboard.writeText(url);
    toast.success('Link copied', { description: url });
    return true;
  } catch {
    // Clipboard can be blocked (e.g. insecure context); let people copy it by hand.
    window.prompt('Copy this link:', url);
    return false;
  }
}

// Opens the phone's share sheet when available, otherwise copies the link.
export async function shareEvent(event) {
  const url = eventUrl(event);
  if (navigator.share) {
    try {
      await navigator.share({ title: event.title, text: shareMessage(event), url });
      return;
    } catch (error) {
      if (error?.name === 'AbortError') return; // person closed the sheet
    }
  }
  await copyEventLink(event);
}

const NETWORKS = [
  { key: 'facebook', label: 'Facebook', icon: Facebook },
  { key: 'x', label: 'X', icon: Twitter },
  { key: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { key: 'sms', label: 'Text', icon: MessageSquare, sameTab: true },
  { key: 'email', label: 'Email', icon: Mail, sameTab: true },
];

// Share buttons for an event page. `tone="dark"` for dark backgrounds.
export default function SharePanel({ event, tone = 'light', className }) {
  const [copied, setCopied] = useState(false);
  const targets = shareTargets(event);
  const dark = tone === 'dark';
  const chip = cn(
    'inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2',
    dark
      ? 'bg-white/10 text-white ring-1 ring-white/15 hover:bg-white/20 focus-visible:ring-white'
      : 'bg-white text-gray-800 ring-1 ring-gray-200 hover:bg-gray-50 hover:ring-gray-300 focus-visible:ring-blue-600'
  );

  const onCopy = async () => {
    if (await copyEventLink(event)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2">
        {typeof navigator !== 'undefined' && navigator.share && (
          <button type="button" onClick={() => shareEvent(event)} className={chip}>
            <Share2 className="h-4 w-4" aria-hidden="true" /> Share…
          </button>
        )}
        <button type="button" onClick={onCopy} className={chip} aria-live="polite">
          {copied ? <Check className="h-4 w-4 text-green-500" aria-hidden="true" /> : <Link2 className="h-4 w-4" aria-hidden="true" />}
          {copied ? 'Copied' : 'Copy link'}
        </button>
      </div>
      <ul className="mt-3 flex flex-wrap gap-2" aria-label="Share on">
        {NETWORKS.map(({ key, label, icon: Icon, sameTab }) => (
          <li key={key}>
            <a
              href={targets[key]}
              {...(sameTab ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
              aria-label={`Share on ${label}`}
              title={label}
              className={cn(chip, 'w-10 px-0')}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
