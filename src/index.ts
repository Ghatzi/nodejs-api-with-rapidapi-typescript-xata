import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { getXataClient, Job } from './xata';

dotenv.config();

const xata = getXataClient();

type MyResponse<T> =
  | {
      err: string;
    }
  | {
      data: T;
    };

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/api/jobs', async (req: Request, res: Response<MyResponse<Job[]>>) => {
  try {
    const jobs = await xata.db.job.getAll();
    return res.status(200).json({ data: jobs });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ err: 'Something went wrong' });
  }
});

app.post(
  '/api/jobs',
  async (req: Request<{}, {}, Job>, res: Response<MyResponse<Job>>) => {
    try {
      const job = req.body;
      const createdJob = await xata.db.job.create(job);
      // throw new Error('AGHHHH');
      return res.status(201).json({ data: createdJob });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ err: 'Something went wrong' });
    }
  }
);

app.put(
  '/api/jobs/:id',
  async (
    req: Request<{ id: string }, {}, Job>,
    res: Response<MyResponse<Job>>
  ) => {
    try {
      const id = req.params.id;
      const job = req.body;
      const updatedJob = await xata.db.job.update(id, job);

      if (!updatedJob) {
        return res.status(404).json({ err: 'Job not found.' });
      }

      return res.status(200).json({ data: updatedJob });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ err: 'Something went wrong' });
    }
  }
);

app.delete(
  '/api/jobs/:id',
  async (
    req: Request<{ id: string }, {}, {}>,
    res: Response<MyResponse<Job>>
  ) => {
    try {
      const id = req.params.id;
      const deletedJob = await xata.db.job.delete(id);

      if (!deletedJob) {
        return res.status(404).json({ err: 'Job not found.' });
      }

      return res.status(200).json({ data: deletedJob });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ err: 'Something went wrong' });
    }
  }
);

app.listen(port, () => {
  console.log(`⚡️[server]: Port: ${port}`);
});
