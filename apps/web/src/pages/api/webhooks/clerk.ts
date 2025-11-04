import type { NextApiRequest, NextApiResponse } from 'next';
import { Webhook } from 'svix';
import type { WebhookEvent } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(req: NextApiRequest) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get the headers
  const svix_id = req.headers['svix-id'] as string;
  const svix_timestamp = req.headers['svix-timestamp'] as string;
  const svix_signature = req.headers['svix-signature'] as string;

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: 'Missing svix headers' });
  }

  // Get the body
  const body = await buffer(req);
  const bodyString = body.toString();

  // Get the Clerk webhook secret
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET to .env');
  }

  // Create a new Svix instance with the webhook secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the webhook signature
  try {
    evt = wh.verify(bodyString, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return res.status(400).json({ error: 'Webhook verification failed' });
  }

  // Handle the webhook event
  const eventType = evt.type;

  try {
    if (eventType === 'user.created' || eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;

      const primaryEmail = email_addresses.find((email) => email.id === evt.data.primary_email_address_id);

      if (!primaryEmail) {
        return res.status(400).json({ error: 'No primary email found' });
      }

      // Upsert user to database
      await db.insert(users)
        .values({
          id,
          email: primaryEmail.email_address,
          firstName: first_name || null,
          lastName: last_name || null,
          imageUrl: image_url || null,
          updatedAt: new Date().toISOString(),
        })
        .onConflictDoUpdate({
          target: users.id,
          set: {
            email: primaryEmail.email_address,
            firstName: first_name || null,
            lastName: last_name || null,
            imageUrl: image_url || null,
            updatedAt: new Date().toISOString(),
          },
        });

      console.log(`User ${eventType}:`, id);
    } else if (eventType === 'user.deleted') {
      const { id } = evt.data;

      // Delete user from database
      await db.delete(users).where(eq(users.id, id!));

      console.log('User deleted:', id);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
