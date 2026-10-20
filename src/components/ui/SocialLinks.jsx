import React from 'react';
import { ExternalLink } from 'lucide-react';
import { socials } from '../../data/socials';

export default function SocialLinks({ compact = false }) {
  return <nav className={compact ? 'social-links social-links-footer' : 'social-links'} aria-label={compact ? 'Footer social profiles' : 'Contact social profiles'}>
    {socials.map(({ icon: Icon, label, handle, href, desc, privateProfile }) => <a key={label} href={href} target="_blank" rel="noopener noreferrer"
      className="social-profile" aria-label={`${label}, ${handle} — ${desc} (opens in a new tab)`}>
      <Icon className="social-profile-icon" size={20} aria-hidden="true" />
      <span className="social-profile-copy"><strong>{label}</strong><span className="social-handle">{handle}</span>{(!compact || privateProfile) && <span className="social-description">{desc}</span>}</span>
      <ExternalLink size={15} className="social-external" aria-hidden="true" />
    </a>)}
  </nav>;
}
