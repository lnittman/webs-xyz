import { database } from '@repo/database';

export const GET = async () => {
  const newWeb = await database.web.create({
    data: {
      url: 'https://cron-temp.example.com',
      title: 'cron-temp',
      userId: 'cron-system',
    },
  });

  await database.web.delete({
    where: {
      id: newWeb.id,
    },
  });

  return new Response('OK', { status: 200 });
};
