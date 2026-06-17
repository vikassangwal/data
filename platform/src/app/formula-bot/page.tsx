import FormulaBotSuite from '@/components/lab/FormulaBotSuite';

export const metadata = {
  title: 'Formula Bot Premium Suite | DevForge',
  description: 'AI-powered spreadsheet formulas, VBA code, SQL queries, and Regex patterns generated and explained instantly by our 21-Agent Cooperative Orchestra.',
};

export default function FormulaBotPage() {
  return (
    <main className="pt-24 min-h-screen bg-[var(--bg-primary)] overflow-hidden">
      <FormulaBotSuite />
    </main>
  );
}
