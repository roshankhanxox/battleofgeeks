import type React from "react"
import { Providers } from './providers';
import Navbar from "@/components/navbar"
import "./globals.css"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  )
}




// import "./globals.css";
// import '@rainbow-me/rainbowkit/styles.css';
// import { Providers } from './providers';

// function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en">
//       <body>
//         <Providers>{children}</Providers>
//       </body>
//     </html>
//   );
// }

// export default RootLayout;
