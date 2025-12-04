export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="min-h-dvh grid place-items-center bg-white">
      {children}
    </section>
  );
}