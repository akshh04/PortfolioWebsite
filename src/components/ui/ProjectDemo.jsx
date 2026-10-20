import React, { useEffect, useRef, useState } from 'react';
import { Play } from 'lucide-react';

export default function ProjectDemo({ demo }) {
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);
  const videoRef = useRef(null);
  useEffect(() => { if (playing) videoRef.current?.focus(); }, [playing]);
  if (!demo) return null;
  return <section className="detail-section project-demo" aria-label="Recorded application demo">
    <h3>Watch the demo</h3>
    <p>A short recording of the live app. Play it here without waiting for the app to start.</p>
    {playing ? <video ref={videoRef} controls playsInline autoPlay preload="metadata" poster={demo.poster} tabIndex={0}
      aria-label="Exoplanet Explorer recorded walkthrough" onError={() => setError(true)}>
      <source src={demo.src} type="video/webm" onError={() => setError(true)} />
      <track kind="captions" src={demo.captions} srcLang="en" label="English" default />
      Your browser cannot play this recording. Read the walkthrough below.
    </video> : <button type="button" className="demo-play" onClick={() => setPlaying(true)} aria-label="Play recorded demo">
      <img src={demo.poster} alt="Discovery chart from Exoplanet Explorer" width="1280" height="900" loading="lazy" />
      <span><Play size={18} aria-hidden="true" />Play recorded demo</span>
    </button>}
    {error && <p role="status">This browser could not play the recording. Download it or read the walkthrough below.</p>}
    <a className="demo-file" href={demo.src} download>Download demo recording (WebM)</a>
    <details className="reading-details"><summary>Read the walkthrough</summary><ol>{demo.steps.map(step => <li key={step}>{step}</li>)}</ol></details>
  </section>;
}
