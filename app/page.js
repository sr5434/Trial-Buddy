import TrialBuddyForm from './components/TrialBuddyForm';

export default function Home() {
  return (
    <div className="font-sans min-h-screen p-8 pb-20">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4 mt-8">Trial Buddy</h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
          Understand clinical trials before you decide to enroll
        </p>
        <TrialBuddyForm />
      </main>
    </div>
  );
}
