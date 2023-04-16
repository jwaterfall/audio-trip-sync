import dayjs from 'dayjs';

import ChoreographiesFetcher from '@/utils/ChoreographiesFetcher';

const fetcher = new ChoreographiesFetcher(process.env.CSV_URL as string);

export default async function Home() {
    const choreographies = await fetcher.fetch();

    return (
        <main className="bg-zinc-950 text-zinc-50 w-full min-h-screen">
            <div className="max-w-7xl p-4 mx-auto">
                <div className="flex flex-col gap-4">
                    {choreographies.map((choreography) => (
                        <div key={choreography.id} className="bg-zinc-900 rounded-lg p-4 flex justify-between items-center">
                            <div>
                                <h2 className="font-medium capitalize">
                                    {choreography.artists.join(', ')} - {choreography.title} [
                                    {dayjs.duration(choreography.length, 'seconds').format('mm:ss')}]
                                </h2>
                                <p className="text-sm text-zinc-400 ">
                                    By {choreography.choreographer}, {dayjs(choreography.date).format('Do MMMM YYYY')} - {choreography.bpm} BPM
                                </p>
                            </div>
                            <button className="bg-gradient-to-r from-orange-500 to-fuchsia-500 text-zinc-50 text-2xl rounded-full aspect-square h-10 flex justify-center items-center active:scale-95 tramsition-transform">
                                +
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
