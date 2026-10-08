interface Props {
  error?: string;
  ok?: string;
}

export default function Notice({ error, ok }: Props) {
  if (error) return <div className="notice error" role="alert">{error}</div>;
  if (ok) return <div className="notice success" role="status">عملیات با موفقیت انجام شد.</div>;
  return null;
}
