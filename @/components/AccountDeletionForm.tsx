import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AccountDeletionForm() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSuccess(false);
    setError(null);

    try {
      const response = await fetch('/api/sendEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          subject: 'Account Deletion Request',
          text: `${email} wants to delete their account.`,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        setEmail('');
      } else {
        setError(data.error || 'Failed to submit request. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className='grid items-center gap-4 px-4 py-6 mx-auto max-w-sm rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'>
        <div className='flex flex-col items-center gap-3'>
          <div className='flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/40'>
            <svg
              className='w-6 h-6 text-green-600 dark:text-green-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M5 13l4 4L19 7'
              />
            </svg>
          </div>
          <div className='text-center'>
            <h3 className='text-lg font-semibold text-green-900 dark:text-green-100'>
              Request Submitted Successfully
            </h3>
            <p className='mt-2 text-sm text-green-700 dark:text-green-300'>
              We have received your account deletion request. We will reach out
              to you at the provided email address to confirm your request.
            </p>
          </div>
          <Button
            className='w-full mt-2'
            variant='outline'
            onClick={() => setSuccess(false)}
          >
            Submit Another Request
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='grid items-center gap-4 px-4 py-6 mx-auto max-w-sm rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900'>
      <p className='text-sm text-gray-500 dark:text-gray-400'>
        We need your email address to verify your identity when submitting a
        request to delete your Arkulus account. We will reach out to you
        at this email address to confirm your request. When your account is
        deleted, all information associated with your account will be deleted
        including the following:
        <br />
        <br />
        1. Your email address
        <br />
        2. Your name, if you added one
        <br />
        3. Your profile picture, if you added one
      </p>
      {error && (
        <div className='p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md dark:text-red-400 dark:bg-red-900/20 dark:border-red-800'>
          {error}
        </div>
      )}
      <form className='space-y-4' onSubmit={handleSubmit}>
        <div className='space-y-2'>
          <Label className='text-sm' htmlFor='email'>
            Email Address
          </Label>
          <Input
            id='email'
            placeholder='Email'
            required
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <Button className='w-full' type='submit' disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </form>
    </div>
  );
}
