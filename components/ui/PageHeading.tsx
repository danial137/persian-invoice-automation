import type { ReactNode } from 'react';

interface Props {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}

export default function PageHeading({ eyebrow, title, description, action }: Props) {
  return (
    <header className="page-head">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </header>
  );
}
