import { Github, Instagram, Linkedin } from 'lucide-react';

// Contact cards and footer links must always point to the same profiles.
export const socials = [
  { icon: Linkedin, label: 'LinkedIn', handle: 'in/akashsankar04', href: 'https://www.linkedin.com/in/akashsankar04/', desc: 'Professional profile' },
  { icon: Github, label: 'GitHub', handle: '@akshh04', href: 'https://github.com/akshh04', desc: 'Code & repositories' },
  { icon: Instagram, label: 'Instagram', handle: '@akash_sankar_', href: 'https://www.instagram.com/akash_sankar_/', desc: 'Private personal profile', privateProfile: true },
];
