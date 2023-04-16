import { Poppins } from 'next/font/google';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import advancedFormat from 'dayjs/plugin/advancedFormat';

dayjs.extend(duration);
dayjs.extend(advancedFormat);

import './globals.css';

export const metadata = {
    title: 'Audio Trip Sync',
    description: 'Share your custom audio trip coreographies',
};

const poppins = Poppins({ weight: ['400', '500', '600'], variable: '--poppins', subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={poppins.variable}>
            <body>{children}</body>
        </html>
    );
}
