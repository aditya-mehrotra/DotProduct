import "./globals.scss";
import { AuthProvider } from "../contexts/AuthContext";

export const metadata = {
  title: "DotProduct",
  description: "DotProduct Application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
