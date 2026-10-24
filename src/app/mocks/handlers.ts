import { http, HttpResponse } from 'msw';

import type { Post } from '@/entities/post';

import { accountHandlers } from './account';
import { clientsHandlers } from './clients';
import { dashboardHandlers } from './dashboard';
import { calculationDateHandlers, settingsHandlers } from './settings';
import { snapshotsHandlers } from './snapshots';
import { usersHandlers } from './users';

// Общие MSW-хэндлеры — используются и в браузере (dev), и в Node (тесты).
// Описывайте здесь форму реального API для точного покрытия тестами.

const MOCK_POSTS: Post[] = [
  { id: 1, userId: 1, title: 'Mock Post One', body: 'Body of mock post one.' },
  { id: 2, userId: 1, title: 'Mock Post Two', body: 'Body of mock post two.' },
  { id: 3, userId: 2, title: 'Mock Post Three', body: 'Body of mock post three.' },
];

export const handlers = [
  ...dashboardHandlers,
  ...clientsHandlers,
  ...settingsHandlers,
  ...calculationDateHandlers,
  ...accountHandlers,
  ...usersHandlers,
  ...snapshotsHandlers,

  // GET /posts
  http.get('*/posts', () => HttpResponse.json(MOCK_POSTS)),

  // GET /posts/:id
  http.get('*/posts/:id', ({ params }) => {
    const post = MOCK_POSTS.find((p) => p.id === Number(params.id));
    if (!post) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    }
    return HttpResponse.json(post);
  }),

  // POST /posts
  http.post('*/posts', async ({ request }) => {
    const body = (await request.json()) as Omit<Post, 'id'>;
    const newPost: Post = { id: Date.now(), ...body };
    return HttpResponse.json(newPost, { status: 201 });
  }),

  // DELETE /posts/:id
  http.delete('*/posts/:id', () => new HttpResponse(null, { status: 204 })),
];
