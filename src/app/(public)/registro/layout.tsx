/** Padding horizontal y safe-area para formularios en móvil. */
export default function RegistroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full min-w-0 flex-1 flex-col px-4 pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6 sm:pt-4 sm:pb-8">
      {children}
    </div>
  );
}
