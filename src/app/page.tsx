import { redirect } from 'next/navigation';

export default function RootPage() {
  console.log('RootPage hit, redirecting to /en');
  redirect('/en');
}
