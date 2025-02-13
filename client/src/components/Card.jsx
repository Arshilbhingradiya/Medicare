export function Card({ children }) {
  return <div className="shadow-lg rounded-2xl p-6 bg-white">{children}</div>;
}

export function CardContent({ children }) {
  return <div>{children}</div>;
}
