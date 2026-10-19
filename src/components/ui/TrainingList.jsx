import React from 'react';
import { professionalDevelopment } from '../../data/education';

export default function TrainingList() {
  return <ul className="training-list">
    {professionalDevelopment.map(item => <li key={item.id}>
      <span className="training-date">{item.period}</span>
      <div><h4>{item.title}</h4><p className="training-issuer">{item.issuer}</p><p>{item.detail}</p></div>
    </li>)}
  </ul>;
}
