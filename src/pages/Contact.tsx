import { useRef, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, CheckCircle2, LoaderCircle } from 'lucide-react';
import SEO from '../components/SEO';
import PageHero from '../components/PageHero';

const CONTACT_ENDPOINT = 'https://api.web3forms.com/submit';
// Web3Forms access key for contact@youthtraumainitiative.org (public by design; it only allows sending to that inbox).
const WEB3FORMS_ACCESS_KEY = '0c577ef7-169d-40f6-971d-aa96c0c25d32';
const topics = ['Clinical partnership','Research collaboration','International programs','Supporting YTI','General inquiry','Privacy request'];

export default function Contact() {
  const [searchParams] = useSearchParams();
  const requestedTopic = searchParams.get('topic');
  const initialTopic = requestedTopic && topics.includes(requestedTopic) ? requestedTopic : '';
  const [status, setStatus] = useState<'idle'|'saving'|'success'|'error'>('idle');
  const [error, setError] = useState('');
  const submissionId = useRef('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'saving') return;
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form)) as Record<string, string>;
    if (fields.website) { setStatus('success'); form.reset(); return; }
    submissionId.current ||= crypto.randomUUID();
    setStatus('saving'); setError('');
    try {
      const payload = {
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: `YTI website inquiry: ${fields.topic} — ${fields.name}`,
        from_name: 'YTI Website',
        replyto: fields.email,
        name: fields.name,
        email: fields.email,
        organization: fields.organization || '—',
        topic: fields.topic,
        message: fields.message,
        reference: submissionId.current,
      };
      const response = await fetch(CONTACT_ENDPOINT, {method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(payload)});
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.success !== true) throw new Error('Your message could not be sent. Please try again. Your text is still here.');
      setStatus('success'); form.reset(); submissionId.current = '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Please check your connection and try again. Your text is still here.');
      setStatus('error');
    }
  }
  const fieldClass = 'mt-2 w-full rounded-lg border border-primary/25 bg-white px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary disabled:opacity-60';
  return <div className="pb-24">
    <SEO title="Contact" description="Discuss clinical partnerships, research collaboration, and support for Youth Trauma Initiative."/>
    <PageHero label="Connect with YTI" title="Start a conversation." subtitle="For child-serving organizations, researchers, and people who want to support the mission." layout="text-only"/>
    <div className="mx-auto max-w-3xl px-6 space-y-8 mt-8">
      <aside className="border-l-4 border-rose-700 bg-rose-50 p-6"><h2 className="font-bold text-lg mb-2">Crisis support</h2><p>YTI does not provide emergency or direct clinical services. In the U.S., call or text <a className="underline font-bold" href="tel:988">988</a> for the Suicide &amp; Crisis Lifeline. If someone is in immediate danger, call emergency services. Outside the U.S., use your local crisis or emergency service. This form is not a crisis service.</p></aside>
      <section className="rounded-2xl border border-primary/15 bg-white p-6 sm:p-10 shadow-sm">
        <p className="eyebrow">Organizational inquiries</p><h2 className="font-display text-3xl mb-4">Tell us what you have in mind.</h2>
        <p className="text-text-muted mb-6">Share a question, an idea for collaboration, or your interest in supporting YTI. Fields marked * are required.</p>
        <aside id="privacy-warning" className="border-l-4 border-secondary bg-sky/40 p-5 mb-8"><h3 className="font-bold mb-1">Protect children's privacy</h3><p className="text-sm leading-relaxed">Do not include patient names, identifying details, protected health information (PHI), or confidential clinical records.</p></aside>
        {status === 'success' ? <div role="status" className="rounded-xl bg-secondary/10 p-6"><CheckCircle2 className="text-secondary mb-3" size={30}/><h3 className="font-display text-2xl mb-2">Your message has been received.</h3><p className="text-text-muted">Thank you for reaching out to YTI. We will review your inquiry and reply by email.</p><button type="button" onClick={()=>setStatus('idle')} className="mt-5 font-semibold text-primary underline underline-offset-4">Send another inquiry</button></div> :
        <form onSubmit={submit} aria-describedby="privacy-warning" className="space-y-6">
          <fieldset disabled={status === 'saving'} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block font-semibold">Name *<input name="name" autoComplete="name" required maxLength={120} className={fieldClass}/></label>
              <label className="block font-semibold">Email *<input name="email" type="email" autoComplete="email" required maxLength={254} className={fieldClass}/></label>
            </div>
            <label className="block font-semibold">Organization <span className="font-normal text-text-muted">(optional)</span><input name="organization" autoComplete="organization" maxLength={180} className={fieldClass}/></label>
            <label className="block font-semibold">What would you like to discuss? *<select name="topic" required defaultValue={initialTopic} className={fieldClass}><option value="" disabled>Select an inquiry type</option>{topics.map(topic=><option key={topic}>{topic}</option>)}</select></label>
            <label className="block font-semibold">Message *<textarea name="message" required maxLength={4000} rows={6} className={fieldClass} aria-describedby="message-hint"/><span id="message-hint" className="mt-2 block text-sm font-normal text-text-muted">Up to 4,000 characters. Please keep your message free of confidential health information.</span></label>
            <div hidden aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
            <p className="text-sm text-text-muted">Your message is sent by email to the YTI team so we can review and respond to your inquiry. Read our <Link to="/privacy" className="underline underline-offset-4 text-primary">Privacy Policy</Link>.</p>
            {error && <p role="alert" className="rounded-lg bg-rose-50 p-4 text-rose-900">{error}</p>}
            <button type="submit" className="button-primary inline-flex items-center gap-3 disabled:opacity-60" disabled={status === 'saving'}>{status === 'saving' ? <><LoaderCircle size={18} className="animate-spin motion-reduce:animate-none"/>Sending…</> : <>Send inquiry<ArrowUpRight size={18}/></>}</button>
          </fieldset>
        </form>}
      </section>
    </div>
  </div>;
}
