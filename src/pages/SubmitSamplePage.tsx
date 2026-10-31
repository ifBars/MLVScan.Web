import Seo from '@/components/seo/Seo'
import PrivateReviewForm from '@/components/scan/PrivateReviewForm'

export default function SubmitSamplePage() {
  return <div className="mx-auto max-w-3xl px-4 pb-20 pt-28">
    <Seo page={{ path: '/submit', title: 'Submit a Sample for Private Review | MLVScan',
      description: 'Submit a possible false positive or suspected malicious mod for private MLVScan review.' }} />
    <div className="mb-8">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-teal-300">Private sample review</p>
      <h1 className="text-4xl font-semibold tracking-tight text-white">Help us get detection right.</h1>
      <p className="mt-4 max-w-xl text-gray-400">Report a false positive or send a suspected malicious mod to MLVScan reviewers.</p>
    </div>
    <PrivateReviewForm />
  </div>
}
