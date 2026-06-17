import UploadClientPage from './UploadClientPage';

export const metadata = {
  title: 'Data Upload | Dataset Portal',
};

export default function DataUploadPage() {
  return (
    <div className="flex-1 overflow-auto bg-slate-950 p-6">
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Upload Dataset</h1>
            <p className="text-slate-400 mt-1">
              Ingest files up to 500MB, or connect external URLs to feed the AI system.
            </p>
          </div>
        </div>

        <UploadClientPage />
      </div>
    </div>
  );
}
