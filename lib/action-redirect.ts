import { redirect } from 'next/navigation';
import { pathError } from '@/lib/forms';

/**
 * Keep Next.js redirects outside the try/catch: redirect() throws by design.
 * The Server Action must check permissions before calling this helper.
 */
export async function executeAction(
  fallbackPath: string,
  operation: () => Promise<string | void>,
): Promise<void> {
  let resultPath = fallbackPath;
  let errorPath: string | null = null;

  try {
    const destination = await operation();
    if (typeof destination === 'string') resultPath = destination;
  } catch (error) {
    console.error('Action failed', error);
    errorPath = pathError(fallbackPath, error);
  }

  if (errorPath) redirect(errorPath);
  redirect(`${resultPath}${resultPath.includes('?') ? '&' : '?'}ok=1`);
}
