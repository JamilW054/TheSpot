export default function CarritoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="-mt-6 sm:-mt-8">
      {children}
    </div>
  );
}
