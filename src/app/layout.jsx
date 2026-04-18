import "../styles/globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Chatbot from "@/components/ui/Chatbot";
import AuthProvider from "@/components/layout/AuthProvider"; // 👈 INJECT THE GUARD

export const metadata = {
  title: "StyleSavvy — AI Personal Stylist",
  description: "Your digital wardrobe and intelligent fashion engine. Powered by AI.",
  openGraph: {
    title: "StyleSavvy — AI Personal Stylist",
    description: "Upload your wardrobe. Let our neural engine curate your fits.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;1,300;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="antialiased"
        style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 400,
          background: "#050505",
          color: "#f0f0f0",
        }}
      >
        {/* 🚨 THE SECURITY WRAPPER 🚨 */}
        <AuthProvider>
          {/* Persistent navbar */}
          <Navbar />

          {/* Page content — pt-28 clears the floating navbar */}
          <main className="relative min-h-screen pt-28 pb-0">
            {children}
          </main>

          {/* Footer on every page */}
          <Footer />

          {/* Floating AI chatbot */}
          <Chatbot />
        </AuthProvider>
      </body>
    </html>
  );
}